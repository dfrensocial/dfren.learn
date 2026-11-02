import jwt from "jsonwebtoken";

type PlaybackTokenType = "video" | "thumbnail" | "storyboard";

// Mux requires the JWT `aud` claim as these single-letter codes, not the full word.
const AUDIENCE_CODE: Record<PlaybackTokenType, string> = {
  video: "v",
  thumbnail: "t",
  storyboard: "s",
};

/**
 * Mux signed URLs are what make playback un-guessable: without this token
 * the playback ID alone is not enough to stream the asset (assets must be
 * created with playback_policy: "signed").
 */
// 2 hours: comfortably above the ~1.5h lesson. The player refreshes the token
// itself before it expires (and recovers if one is rejected), so a long pause
// or a very long sitting doesn't break playback.
export const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60 * 2;

export function signMuxPlaybackToken(
  playbackId: string,
  type: PlaybackTokenType = "video",
  expiresInSeconds = DEFAULT_TOKEN_TTL_SECONDS,
  // Mux playback restriction (domain lock) to enforce for this token.
  restrictionId?: string
): string {
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  const privateKey = process.env.MUX_SIGNING_KEY_PRIVATE?.replace(/\\n/g, "\n");

  if (!keyId || !privateKey) {
    throw new Error("Mux signing key env vars are not configured");
  }

  return jwt.sign(
    {
      sub: playbackId,
      aud: AUDIENCE_CODE[type],
      ...(restrictionId ? { playback_restriction_id: restrictionId } : {}),
    },
    Buffer.from(privateKey, "base64").toString("utf-8"),
    {
      algorithm: "RS256",
      expiresIn: expiresInSeconds,
      keyid: keyId,
    }
  );
}
