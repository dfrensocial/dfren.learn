import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { signMuxPlaybackToken } from "@/lib/mux/signing";
import { lessonMuxDataRef } from "@/lib/mux/lesson-doc";
import { checkAndRegisterSession } from "@/lib/session-limit";
import { rateLimit } from "@/lib/rate-limit";

// Issues a short-lived, per-viewer signed token — never expose a raw playback ID to the client.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.replace("Bearer ", "");
  if (!idToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // Per-account (not per-IP — sharing routes through different IPs) cap on
  // how many tokens one account can pull in an hour. Generous: normal use is
  // one call per lesson switch plus reloads, not a tight loop.
  const { allowed: withinRate } = rateLimit(`playback-token:${decoded.uid}`, {
    limit: 60,
    windowMs: 60 * 60_000,
  });
  if (!withinRate) {
    return NextResponse.json(
      { error: "Too many playback requests. Please try again later." },
      { status: 429 }
    );
  }

  const { courseId, lessonId, sessionId } = await req.json();
  if (!courseId || !lessonId || !sessionId) {
    return NextResponse.json({ error: "Missing courseId, lessonId, or sessionId" }, { status: 400 });
  }

  const enrollment = await adminDb
    .collection("users")
    .doc(decoded.uid)
    .collection("enrollments")
    .doc(courseId)
    .get();

  if (!enrollment.exists) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  const { allowed } = await checkAndRegisterSession({ uid: decoded.uid, sessionId, courseId, lessonId });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many devices are streaming this account right now. Close another one and try again." },
      { status: 429 }
    );
  }

  const muxData = await lessonMuxDataRef(adminDb, courseId, lessonId).get();
  const playbackId = muxData.data()?.muxPlaybackId;
  if (!playbackId) {
    return NextResponse.json({ error: "Lesson has no video" }, { status: 404 });
  }

  const token = signMuxPlaybackToken(playbackId, "video");
  const thumbnailToken = signMuxPlaybackToken(playbackId, "thumbnail");
  // Storyboard token unlocks the scrub-preview thumbnails (storyboard.vtt) for
  // this signed asset — same signed-token model as video/thumbnail, just a
  // different JWT audience ("s"). No new Mux feature/plan needed.
  const storyboardToken = signMuxPlaybackToken(playbackId, "storyboard");
  return NextResponse.json({ playbackId, token, thumbnailToken, storyboardToken });
}
