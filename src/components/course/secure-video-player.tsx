"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { endExpiredSession, useAuth } from "@/lib/firebase/auth-context";
import { track } from "@/lib/analytics";
import { paintWatermarkOverlay } from "@/lib/watermark/paint-overlay";
import { ChapterList } from "@/components/course/chapter-list";
import type { Chapter, CourseProgress } from "@/types/course";

// Playback speeds surfaced in the player's settings menu — useful for
// students re-watching a dense lesson slower, or skimming a familiar one fast.
const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];

// How often to ping /api/mux/heartbeat while actually playing, so this
// session keeps counting as "active" for the concurrent-stream cap.
const HEARTBEAT_INTERVAL_MS = 20_000;

// Playback tokens are renewed this long before they expire, so a long sitting
// or a long pause never hits a rejected token.
const TOKEN_REFRESH_LEAD_MS = 10 * 60_000;
// After a playback error we re-request a token and reload the source, but never
// more than this many times in a row (reset once playback actually starts).
const MAX_ERROR_RECOVERIES = 3;

// Resume-from-last-position is purely a per-viewer convenience: it reads and
// writes localStorage on the viewer's own device only, never sent to a server
// or shared between viewers, and never used to decide access — enrollment
// checks stay entirely server-side via the playback-token route.
function progressKey(courseId: string, lessonId: string) {
  return `mux-progress:${courseId}:${lessonId}`;
}

function readSavedProgress(courseId: string, lessonId: string): number {
  try {
    const raw = window.localStorage.getItem(progressKey(courseId, lessonId));
    const seconds = raw ? Number(raw) : 0;
    // Ignore near-zero or nonsensical saves — no point "resuming" at 0:03.
    return Number.isFinite(seconds) && seconds > 5 ? seconds : 0;
  } catch {
    return 0;
  }
}

function saveProgress(courseId: string, lessonId: string, seconds: number) {
  try {
    window.localStorage.setItem(progressKey(courseId, lessonId), String(Math.floor(seconds)));
  } catch {
    // Private browsing / storage disabled — resume is a nicety, fail silently.
  }
}

function clearProgress(courseId: string, lessonId: string) {
  try {
    window.localStorage.removeItem(progressKey(courseId, lessonId));
  } catch {
    // Ignore — see saveProgress.
  }
}

// mux-player nests its controls several shadow roots deep (its own shadow
// root, then a theme's, then media-chrome's control bar), and the
// `--media-fullscreen-button-display` CSS custom property documented for
// this doesn't actually inherit that far in practice (confirmed live: set
// on the player element itself, but reads back empty at the button) --
// direct DOM removal is what actually works, verified the same way.
function findMuxControl(root: Element, selector: string): HTMLElement | null {
  const shadow = (root as HTMLElement).shadowRoot;
  if (!shadow) return null;
  const direct = shadow.querySelector(selector);
  if (direct) return direct as HTMLElement;
  for (const child of shadow.querySelectorAll("*")) {
    const found = findMuxControl(child, selector);
    if (found) return found;
  }
  return null;
}

// Picture-in-Picture and casting/AirPlay play the video outside the page,
// which drops the canvas watermark layered over it. mux-player does NOT pass
// these attributes from its own element down to the real <video> (confirmed in
// a live browser), so they must be set on the native element itself. Doing so
// also makes the player's own PiP/cast buttons disappear. Safe to call
// repeatedly -- e.g. after the source reloads on a token refresh.
function lockOutOfPip(player: MuxPlayerElement | null) {
  const video = player?.media?.nativeEl as HTMLVideoElement | undefined;
  if (!video) return;
  video.disablePictureInPicture = true;
  video.disableRemotePlayback = true;
  video.setAttribute("x-webkit-airplay", "deny");
}

// The server says this login has outlived its allowed lifetime: sign out and
// send the viewer to the email sign-in, coming back to this lesson afterwards.
async function sendToLoginExpired() {
  await endExpiredSession();
  // Deliberate full page load: resets all client-side auth state after sign-out.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
}

export function SecureVideoPlayer({
  courseId,
  lessonId,
  chapters = [],
  sidebar,
}: {
  courseId: string;
  lessonId: string;
  chapters?: Chapter[];
  /** Extra panels (e.g. downloads) shown under the chapter list, beside the video. */
  sidebar?: ReactNode;
}) {
  const { user } = useAuth();
  const [playback, setPlayback] = useState<{
    playbackId: string;
    token: string;
    thumbnailToken: string;
    storyboardToken: string;
    watermarkId: string | null;
    expiresAt?: number;
  } | null>(null);
  // Set only when the token was renewed mid-session: carry on from the same
  // spot (and keep playing if it was playing) instead of the saved position.
  const [resumeAfterRefresh, setResumeAfterRefresh] = useState<{ at: number; autoplay: boolean } | null>(null);
  // Bumped to rebuild the player from scratch after a playback error: a player
  // that has already failed (e.g. on a rejected token) does not restart just
  // because it is handed a new token (confirmed in a live browser).
  const [playerKey, setPlayerKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  // Where to resume, from the server-side progress record (follows the
  // student across devices); falls back to this device's localStorage copy.
  const [serverStart, setServerStart] = useState<number | null>(null);
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastSaveRef = useRef(0);
  const lastHeartbeatRef = useRef(0); // wall-clock ms, not media time — seeking must not stall it
  const repaintRef = useRef<() => void>(() => {});
  const refreshingRef = useRef(false);
  // Which lesson events have already fired for this lesson (each fires once),
  // and the last playhead position, so a seek past a milestone isn't counted
  // as having watched it.
  const lessonEventsRef = useRef<{
    lessonId: string;
    started: boolean;
    marks: Set<number>;
    lastTime: number;
    watched: number; // seconds actually played (continuous playback only)
  }>({ lessonId, started: false, marks: new Set(), lastTime: 0, watched: 0 });
  const errorRecoveriesRef = useRef(0);
  // One random ID per player mount — reloading the page is a new "session"
  // (correct: this caps simultaneous playing streams, not devices over time).
  // useState's lazy initializer (not useRef's plain initial value) is the
  // sanctioned way to compute a one-time random value — calling an impure
  // function directly during render is otherwise disallowed.
  const [sessionId] = useState<string>(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36)
  );
  // Stable, SSR-safe id (unlike crypto.randomUUID()) so mux-player's
  // `fullscreenElement` prop can point at the wrapper below by id.
  const wrapperId = useId();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    // Deferred to a microtask so every setState here runs from a callback,
    // not directly in the effect body.
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setError(null);
      setPlayback(null);

      try {
        const idToken = await user.getIdToken();
        // Resume point; any failure just means "start from the local copy".
        const progressPromise = getDoc(doc(db, "users", user.uid, "progress", courseId))
          .then((snap) => (snap.data() as CourseProgress | undefined)?.lessons?.[lessonId])
          .catch(() => undefined);
        const res = await fetch("/api/mux/playback-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ courseId, lessonId, sessionId }),
        });

        if (!res.ok) {
          if (cancelled) return;
          const body = await res.json().catch(() => null);
          if (res.status === 401 && body?.code === "session-expired") {
            await sendToLoginExpired();
            return;
          }
          setError(
            res.status === 429
              ? (body?.error ?? "Too many devices are streaming this account right now.")
              : "You don't have access to this lesson."
          );
          return;
        }

        const data = await res.json();
        const saved = await progressPromise;
        if (!cancelled) {
          // A finished lesson restarts from the top instead of resuming at the very end.
          setServerStart(saved && !saved.completed && saved.position > 5 ? saved.position : 0);
          setPlayback(data);
        }
      } catch {
        if (!cancelled) setError("Couldn't load this lesson. Please try again.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, courseId, lessonId, sessionId]);

  // Fetches a fresh playback token and swaps it in without losing the
  // viewer's place. Used on a timer before expiry, when the tab wakes up, and
  // to recover from a rejected token. A failure is silent: the old token may
  // still be valid, and the next trigger simply tries again.
  const refreshPlayback = useCallback(async (remount = false) => {
    if (!user || refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const player = playerRef.current;
      const position = player?.currentTime ?? 0;
      const wasPlaying = player ? !player.paused && !player.ended : false;
      const idToken = await user.getIdToken();
      const res = await fetch("/api/mux/playback-token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ courseId, lessonId, sessionId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 401 && body?.code === "session-expired") await sendToLoginExpired();
        return;
      }
      const data = await res.json();
      setResumeAfterRefresh({ at: position, autoplay: wasPlaying });
      if (remount) setPlayerKey((k) => k + 1);
      setPlayback(data);
    } catch {
      // See above.
    } finally {
      refreshingRef.current = false;
    }
  }, [user, courseId, lessonId, sessionId]);

  const expiresAt = playback?.expiresAt;
  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setTimeout(
      () => refreshPlayback(),
      Math.max(expiresAt - Date.now() - TOKEN_REFRESH_LEAD_MS, 0)
    );
    // Timers are throttled/suspended in background tabs and during sleep, so
    // also check as soon as the tab is visible again.
    function onVisible() {
      if (document.visibilityState === "visible" && expiresAt! - Date.now() < TOKEN_REFRESH_LEAD_MS) {
        refreshPlayback();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [expiresAt, refreshPlayback]);

  // Picture-in-Picture and casting/AirPlay would pull the video out of the
  // page, taking the canvas watermark with it. See lockOutOfPip.
  useEffect(() => {
    lockOutOfPip(playerRef.current);
  }, [playback]);

  // Belt-and-suspenders: also tells mux-player (via the id-referencing
  // `fullscreenelement` attribute it supports -- note no hyphen, unlike the
  // `fullscreen-element` mux-player-react's own prop converter would
  // produce, which the custom element doesn't actually listen for) which
  // element it should consider "fullscreen" for its own internal state
  // (e.g. so mediaIsFullscreen / its icon stay accurate) and for any path
  // that isn't the visible button, like a keyboard shortcut. The button
  // itself is hidden and replaced below with one we control directly,
  // since this attribute alone didn't reliably redirect an actual click.
  useEffect(() => {
    playerRef.current?.setAttribute("fullscreenelement", wrapperId);
    // `playback` is the dependency that actually matters here: MuxPlayer
    // only renders (and playerRef.current only becomes non-null) once
    // playback finishes loading -- without depending on it, this effect's
    // one-time run (wrapperId never changes) fires before that, while
    // playerRef.current is still null, and never runs again.
  }, [wrapperId, playback]);

  // Hides mux-player's own fullscreen and Picture-in-Picture buttons by
  // finding and directly hiding them in its (multiply-nested) shadow DOM --
  // see findMuxControl for why a CSS custom property didn't work. (We
  // provide our own fullscreen button, and PiP would take the video, and its
  // watermark overlay, out of the page.) Retries briefly since the button's
  // shadow subtree may not exist yet the instant MuxPlayer itself mounts.
  useEffect(() => {
    if (!playback) return;
    let cancelled = false;
    function tryHide(retriesLeft = 20) {
      if (cancelled || !playerRef.current) return;
      let missing = false;
      for (const selector of ["media-fullscreen-button", "media-pip-button"]) {
        const btn = findMuxControl(playerRef.current, selector);
        if (btn) btn.style.display = "none";
        else missing = true;
      }
      if (missing && retriesLeft > 0) requestAnimationFrame(() => tryHide(retriesLeft - 1));
    }
    tryHide();
    return () => {
      cancelled = true;
    };
  }, [playback]);

  // Tracks whether the wrapper is currently the fullscreen element, for the
  // layout branch below. Also explicitly re-triggers the watermark repaint
  // (see repaintRef below) right on this event -- observed live that the
  // watermark can go missing entirely in fullscreen, most likely because
  // the ResizeObserver-driven repaint reads the wrapper's size mid-
  // transition (before the browser's fullscreen layout has settled), gets
  // 0x0, and skips painting with nothing to trigger a retry. Double rAF
  // waits for the transition's layout + paint to actually land first.
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
      requestAnimationFrame(() => requestAnimationFrame(() => repaintRef.current()));
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Paints the invisible per-viewer watermark on a transparent canvas
  // layered over the video (see paint-overlay.ts) -- sized to match the
  // player's CSS-pixel dimensions 1:1 (deliberately NOT scaled by
  // devicePixelRatio). A screenshot tool captures at CSS-pixel resolution,
  // not the canvas's backing-store resolution -- painting at devicePixelRatio
  // (e.g. 1.25x) made every cell boundary land at a fractional, misaligned
  // position once downscaled back into the screenshot, which silently broke
  // decoding entirely. Painting 1:1 with CSS pixels keeps cell boundaries
  // exactly where a same-resolution capture will see them.
  // Repaints on resize since the canvas backing store clears when resized --
  // this also covers the fullscreen transition, since that's a resize of
  // the wrapper (backed up by an explicit repaint on fullscreenchange
  // itself -- see above). Retries a few times on a 0x0 read instead of
  // silently giving up, since that read can race a layout transition
  // (fullscreen entry/exit) settling.
  useEffect(() => {
    const watermarkId = playback?.watermarkId;
    if (!watermarkId) return;
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    function repaint(retriesLeft = 4) {
      if (!canvas || !wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width === 0 || height === 0) {
        if (retriesLeft > 0) requestAnimationFrame(() => repaint(retriesLeft - 1));
        return;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      paintWatermarkOverlay(ctx, width, height, watermarkId!);
    }

    repaintRef.current = () => repaint();
    repaint();
    const observer = new ResizeObserver(() => repaint());
    observer.observe(wrapper);
    return () => {
      observer.disconnect();
      repaintRef.current = () => {};
    };
  }, [playback?.watermarkId]);

  if (error) {
    return (
      <div className="flex aspect-video items-center justify-center border border-black bg-neutral-50 px-6 text-center">
        <p className="text-sm text-neutral-600">{error}</p>
      </div>
    );
  }
  if (!playback) return <div className="aspect-video animate-pulse bg-neutral-100" />;

  // Server-side position wins (it follows the student across devices); this
  // device's localStorage copy covers the case where the server has nothing.
  const resumeAt = resumeAfterRefresh && resumeAfterRefresh.at > 5
    ? resumeAfterRefresh.at
    : serverStart && serverStart > 5
      ? serverStart
      : readSavedProgress(courseId, lessonId);

  function seekToChapter(startSeconds: number) {
    const player = playerRef.current;
    if (!player) return;
    player.currentTime = startSeconds;
    player.play().catch(() => {});
  }

  // Doubles as the progress report: the same request keeps the stream-cap
  // session alive and records where the student is (see heartbeat route).
  async function sendHeartbeat() {
    lastHeartbeatRef.current = Date.now();
    try {
      const idToken = await user?.getIdToken();
      if (!idToken) return;
      const player = playerRef.current;
      const res = await fetch("/api/mux/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          courseId,
          lessonId,
          sessionId,
          position: player?.currentTime,
          duration: player?.duration,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401 && data?.code === "session-expired") {
        playerRef.current?.pause();
        await sendToLoginExpired();
        return;
      }
      if (data && data.allowed === false) {
        playerRef.current?.pause();
        setError("Too many devices are streaming this account right now.");
      }
    } catch {
      // Best-effort — a missed heartbeat just means the session ages out
      // slightly early elsewhere; not worth surfacing to the viewer.
    }
  }

  return (
    <div
      className={`grid gap-6 lg:items-start ${
        chapters.length > 0 || sidebar ? "lg:grid-cols-[minmax(0,1fr)_340px]" : ""
      }`}
    >
    {/* Discourages casual right-click download attempts; determined users can
        still capture output — real protection is the signed, short-lived token.
        When this wrapper itself is the fullscreen element (see the
        fullscreenchange handler above), it fills the screen and centers the
        player -- letterboxing top/bottom or side-to-side is expected and
        correct when the video's own aspect ratio doesn't match the screen's.
        The chapter list sits outside it on purpose: it must not go fullscreen. */}
    <div
      id={wrapperId}
      ref={wrapperRef}
      className={isFullscreen ? "relative flex h-full w-full items-center justify-center bg-black" : "relative"}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MuxPlayer
        key={playerKey}
        ref={playerRef}
        playbackId={playback.playbackId}
        tokens={{
          playback: playback.token,
          thumbnail: playback.thumbnailToken,
          storyboard: playback.storyboardToken,
        }}
        streamType="on-demand"
        startTime={resumeAt || undefined}
        autoPlay={resumeAfterRefresh?.autoplay || undefined}
        disablePictureInPicture
        onPlaying={() => {
          errorRecoveriesRef.current = 0;
        }}
        onError={() => {
          // Most often an expired/rejected token (or a dropped connection):
          // get a fresh token and reload at the same spot, a few times at most.
          if (refreshingRef.current || errorRecoveriesRef.current >= MAX_ERROR_RECOVERIES) return;
          errorRecoveriesRef.current += 1;
          refreshPlayback(true);
        }}
        playbackRates={PLAYBACK_RATES}
        style={isFullscreen ? { maxHeight: "100%", maxWidth: "100%" } : { aspectRatio: "16/9", width: "100%" }}
        onLoadedMetadata={() => {
          const player = playerRef.current;
          lockOutOfPip(player);
          if (!player || chapters.length === 0 || player.chapters.length > 0) return;
          // Puts the chapter ticks on the timeline and chapter names in the
          // seek tooltip. Each chapter ends where the next begins.
          player.addChapters(
            chapters.map((c, i) => ({
              startTime: c.start,
              endTime: chapters[i + 1]?.start ?? Math.max(player.duration || c.start + 1, c.start + 1),
              value: c.title,
            }))
          );
        }}
        onPlay={() => {
          const ev = lessonEventsRef.current;
          if (ev.lessonId !== lessonId) Object.assign(ev, { lessonId, started: false, marks: new Set(), lastTime: 0, watched: 0 });
          if (ev.started) return;
          ev.started = true;
          track("lesson_start", { course_id: courseId, lesson_id: lessonId });
        }}
        onPause={() => {
          // Pin the exact stopping point (progress is otherwise sampled every 20s).
          if (Date.now() - lastHeartbeatRef.current > 2000) sendHeartbeat();
        }}
        onTimeUpdate={() => {
          const current = playerRef.current?.currentTime;
          if (current == null) return;
          {
            // 25/50/75% milestones, counted only on continuous playback.
            const ev = lessonEventsRef.current;
            const duration = playerRef.current?.duration;
            const continuous = current >= ev.lastTime && current - ev.lastTime < 3;
            if (continuous) ev.watched += current - ev.lastTime;
            ev.lastTime = current;
            if (continuous && duration && Number.isFinite(duration)) {
              for (const mark of [25, 50, 75]) {
                // Credit a milestone only while the playhead is passing through it
                // (within 15s after it), never because the viewer seeked beyond it.
                const markTime = (duration * mark) / 100;
                if (current >= markTime && current < markTime + 15 && !ev.marks.has(mark)) {
                  ev.marks.add(mark);
                  track("lesson_progress", { course_id: courseId, lesson_id: lessonId, percent: mark });
                }
              }
            }
          }
          if (chapters.length > 0) {
            let idx = 0;
            for (let i = 0; i < chapters.length; i++) if (chapters[i].start <= current) idx = i;
            setActiveChapter((prev) => (prev === idx ? prev : idx));
          }
          // Throttle localStorage writes to roughly once every 5s of playback
          // instead of on every timeupdate tick (which fires several times/sec).
          if (current - lastSaveRef.current >= 5) {
            lastSaveRef.current = current;
            saveProgress(courseId, lessonId, current);
          }
          if (Date.now() - lastHeartbeatRef.current >= HEARTBEAT_INTERVAL_MS) {
            sendHeartbeat();
          }
        }}
        onEnded={() => {
          // "Complete" means the lesson was really watched (>= 80% of its runtime
          // played), not just that the viewer scrubbed to the end.
          const ev = lessonEventsRef.current;
          const duration = playerRef.current?.duration;
          if (duration && ev.watched >= duration * 0.8) {
            track("lesson_complete", { course_id: courseId, lesson_id: lessonId });
          }
          clearProgress(courseId, lessonId);
          sendHeartbeat();
        }}
      />
      {playback.watermarkId && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-50 h-full w-full"
        />
      )}
      <button
        type="button"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        onClick={() => {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          } else {
            wrapperRef.current?.requestFullscreen().catch(() => {});
          }
        }}
        className="absolute bottom-3 right-3 z-[60] flex h-8 w-8 items-center justify-center rounded bg-black/60 text-white hover:bg-black/80"
      >
        {isFullscreen ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
            <path d="M9 3H3v6h2V5h4V3zm6 0v2h4v4h2V3h-6zM5 15H3v6h6v-2H5v-4zm14 4h-4v2h6v-6h-2v4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
            <path d="M3 3h6v2H5v4H3V3zm12 0h6v6h-2V5h-4V3zM3 15h2v4h4v2H3v-6zm16 4v-4h2v6h-6v-2h4z" />
          </svg>
        )}
      </button>
    </div>
    {(chapters.length > 0 || sidebar) && (
      <aside className="space-y-6">
        {chapters.length > 0 && (
          <ChapterList chapters={chapters} activeIndex={activeChapter} onSelect={seekToChapter} />
        )}
        {sidebar}
      </aside>
    )}
    </div>
  );
}
