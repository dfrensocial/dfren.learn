"use client";

import { useEffect, useId, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { useAuth } from "@/lib/firebase/auth-context";
import { paintWatermarkOverlay } from "@/lib/watermark/paint-overlay";

// Playback speeds surfaced in the player's settings menu — useful for
// students re-watching a dense lesson slower, or skimming a familiar one fast.
const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];

// How often to ping /api/mux/heartbeat while actually playing, so this
// session keeps counting as "active" for the concurrent-stream cap.
const HEARTBEAT_INTERVAL_MS = 20_000;

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
function findMuxFullscreenButton(root: Element): HTMLElement | null {
  const shadow = (root as HTMLElement).shadowRoot;
  if (!shadow) return null;
  const direct = shadow.querySelector("media-fullscreen-button");
  if (direct) return direct as HTMLElement;
  for (const child of shadow.querySelectorAll("*")) {
    const found = findMuxFullscreenButton(child);
    if (found) return found;
  }
  return null;
}

export function SecureVideoPlayer({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const { user } = useAuth();
  const [playback, setPlayback] = useState<{
    playbackId: string;
    token: string;
    thumbnailToken: string;
    storyboardToken: string;
    watermarkId: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastSaveRef = useRef(0);
  const lastHeartbeatRef = useRef(0);
  const repaintRef = useRef<() => void>(() => {});
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
          setError(
            res.status === 429
              ? (body?.error ?? "Too many devices are streaming this account right now.")
              : "You don't have access to this lesson."
          );
          return;
        }

        const data = await res.json();
        if (!cancelled) setPlayback(data);
      } catch {
        if (!cancelled) setError("Couldn't load this lesson. Please try again.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, courseId, lessonId, sessionId]);

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

  // Hides mux-player's own fullscreen button by finding and directly
  // hiding it in its (multiply-nested) shadow DOM -- see
  // findMuxFullscreenButton for why a CSS custom property didn't work.
  // Retries briefly since the button's shadow subtree may not exist yet
  // the instant MuxPlayer itself mounts.
  useEffect(() => {
    if (!playback) return;
    let cancelled = false;
    function tryHide(retriesLeft = 10) {
      if (cancelled || !playerRef.current) return;
      const btn = findMuxFullscreenButton(playerRef.current);
      if (btn) {
        btn.style.display = "none";
      } else if (retriesLeft > 0) {
        requestAnimationFrame(() => tryHide(retriesLeft - 1));
      }
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

  const resumeAt = readSavedProgress(courseId, lessonId);

  async function sendHeartbeat() {
    try {
      const idToken = await user?.getIdToken();
      if (!idToken) return;
      const res = await fetch("/api/mux/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ courseId, lessonId, sessionId }),
      });
      const data = await res.json().catch(() => null);
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
    // Discourages casual right-click download attempts; determined users can
    // still capture output — real protection is the signed, short-lived token.
    // When this wrapper itself is the fullscreen element (see the
    // fullscreenchange handler above), it fills the screen and centers the
    // player -- letterboxing top/bottom or side-to-side is expected and
    // correct when the video's own aspect ratio doesn't match the screen's.
    <div
      id={wrapperId}
      ref={wrapperRef}
      className={isFullscreen ? "relative flex h-full w-full items-center justify-center bg-black" : "relative"}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MuxPlayer
        ref={playerRef}
        playbackId={playback.playbackId}
        tokens={{
          playback: playback.token,
          thumbnail: playback.thumbnailToken,
          storyboard: playback.storyboardToken,
        }}
        streamType="on-demand"
        startTime={resumeAt || undefined}
        playbackRates={PLAYBACK_RATES}
        style={isFullscreen ? { maxHeight: "100%", maxWidth: "100%" } : { aspectRatio: "16/9", width: "100%" }}
        onTimeUpdate={() => {
          const current = playerRef.current?.currentTime;
          if (current == null) return;
          // Throttle localStorage writes to roughly once every 5s of playback
          // instead of on every timeupdate tick (which fires several times/sec).
          if (current - lastSaveRef.current >= 5) {
            lastSaveRef.current = current;
            saveProgress(courseId, lessonId, current);
          }
          if ((current - lastHeartbeatRef.current) * 1000 >= HEARTBEAT_INTERVAL_MS) {
            lastHeartbeatRef.current = current;
            sendHeartbeat();
          }
        }}
        onEnded={() => clearProgress(courseId, lessonId)}
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
  );
}
