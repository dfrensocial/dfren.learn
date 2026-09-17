import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { signMuxPlaybackToken } from "@/lib/mux/signing";

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

  const { courseId, lessonId } = await req.json();

  const enrollment = await adminDb
    .collection("users")
    .doc(decoded.uid)
    .collection("enrollments")
    .doc(courseId)
    .get();

  if (!enrollment.exists) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  const lesson = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .doc(lessonId)
    .get();

  const playbackId = lesson.data()?.muxPlaybackId;
  if (!playbackId) {
    return NextResponse.json({ error: "Lesson has no video" }, { status: 404 });
  }

  const token = signMuxPlaybackToken(playbackId, "video");
  return NextResponse.json({ playbackId, token });
}
