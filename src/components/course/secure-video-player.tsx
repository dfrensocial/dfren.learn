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
  const [playback, setPlayback] = useState<{ playbackId: string; token: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    (async () => {
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
    })();

    return () => {
      cancelled = true;
    };
  }, [user, courseId, lessonId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!playback) return <div className="aspect-video animate-pulse bg-neutral-200" />;

  return (
    // Discourages casual right-click download attempts; determined users can
    // still capture output — real protection is the signed, short-lived token.
    <div onContextMenu={(e) => e.preventDefault()}>
      <MuxPlayer
        playbackId={playback.playbackId}
        tokens={{ playback: playback.token }}
        streamType="on-demand"
        style={{ aspectRatio: "16/9", width: "100%" }}
      />
    </div>
  );
}
