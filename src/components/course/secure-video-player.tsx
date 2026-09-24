"use client";

import { useEffect, useRef, useState } from "react";
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
  // One random ID per player mount — reloading the page is a new "session"
  // (correct: this caps simultaneous playing streams, not devices over time).
  // useState's lazy initializer (not useRef's plain initial value) is the
  // sanctioned way to compute a one-time random value — calling an impure
  // function directly during render is otherwise disallowed.
  const [sessionId] = useState<string>(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36)
  );

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

  // mux-player's built-in fullscreen button fullscreens the <mux-player>
  // element itself -- but this canvas is a DOM sibling of it, not a child,
  // and the Fullscreen API only renders elements INSIDE the fullscreened
  // element. Left alone, that means fullscreen playback would escape the
  // watermark entirely. Fix: whenever mux-player becomes the fullscreen
  // element, immediately swap to fullscreening our own wrapper (which
  // contains both the player and the canvas) instead.
  useEffect(() => {
    function handleFullscreenChange() {
      const wrapper = wrapperRef.current;
      const player = playerRef.current;
      setIsFullscreen(document.fullscreenElement === wrapper);
      if (document.fullscreenElement && document.fullscreenElement === player && wrapper) {
        document
          .exitFullscreen()
          .then(() => wrapper.requestFullscreen())
          .catch(() => {});
      }
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
  // this also covers the fullscreen transition above, since that's a resize
  // of the wrapper.
  useEffect(() => {
    const watermarkId = playback?.watermarkId;
    if (!watermarkId) return;
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    function repaint() {
      if (!canvas || !wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width === 0 || height === 0) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      paintWatermarkOverlay(ctx, width, height, watermarkId!);
    }

    repaint();
    const observer = new ResizeObserver(repaint);
    observer.observe(wrapper);
    return () => observer.disconnect();
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
    </div>
  );
}
