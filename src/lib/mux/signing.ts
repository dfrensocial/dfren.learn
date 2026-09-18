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
export function signMuxPlaybackToken(
  playbackId: string,
  type: PlaybackTokenType = "video",
  expiresInSeconds = 60 * 60 * 4
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
    },
    Buffer.from(privateKey, "base64").toString("utf-8"),
    {
      algorithm: "RS256",
      expiresIn: expiresInSeconds,
      keyid: keyId,
    }
  );
}
