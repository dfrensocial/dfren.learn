"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { useAuth } from "@/lib/firebase/auth-context";

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
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    // Discourages casual right-click download attempts; determined users can
    // still capture output — real protection is the signed, short-lived token.
    <div onContextMenu={(e) => e.preventDefault()}>
      <MuxPlayer
        playbackId={playback.playbackId}
        tokens={{ playback: playback.token, thumbnail: playback.thumbnailToken }}
        streamType="on-demand"
        style={{ aspectRatio: "16/9", width: "100%" }}
      />
    </div>
  );
}
