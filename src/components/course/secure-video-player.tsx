"use client";

import { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { useAuth } from "@/lib/firebase/auth-context";

// Playback speeds surfaced in the player's settings menu — useful for
// students re-watching a dense lesson slower, or skimming a familiar one fast.
const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];

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
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const lastSaveRef = useRef(0);

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
          body: JSON.stringify({ courseId, lessonId }),
        });

        if (!res.ok) {
          if (!cancelled) setError("You don't have access to this lesson.");
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
  }, [user, courseId, lessonId]);

  if (error) {
    return (
      <div className="flex aspect-video items-center justify-center border border-black bg-neutral-50">
        <p className="text-sm text-neutral-600">{error}</p>
      </div>
    );
  }
  if (!playback) return <div className="aspect-video animate-pulse bg-neutral-100" />;

  const resumeAt = readSavedProgress(courseId, lessonId);

  return (
    // Discourages casual right-click download attempts; determined users can
    // still capture output — real protection is the signed, short-lived token.
    <div onContextMenu={(e) => e.preventDefault()}>
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
        style={{ aspectRatio: "16/9", width: "100%" }}
        onTimeUpdate={() => {
          const current = playerRef.current?.currentTime;
          if (current == null) return;
          // Throttle localStorage writes to roughly once every 5s of playback
          // instead of on every timeupdate tick (which fires several times/sec).
          if (current - lastSaveRef.current >= 5) {
            lastSaveRef.current = current;
            saveProgress(courseId, lessonId, current);
          }
        }}
        onEnded={() => clearProgress(courseId, lessonId)}
      />
    </div>
  );
}
