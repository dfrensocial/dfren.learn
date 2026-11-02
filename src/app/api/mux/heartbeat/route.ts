import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { checkAndRegisterSession } from "@/lib/session-limit";
import { loginIsTooOld } from "@/lib/session-policy";
import { sessionExpiredResponse } from "@/lib/session-expired-response";

// Called periodically while a lesson is actually playing (see
// secure-video-player.tsx) so this session counts as "active" for the
// concurrent-stream cap in playback-token/route.ts. If the cap is already
// exceeded by other sessions by the time a heartbeat lands, the player is
// told to stop rather than keep silently counting toward the limit forever.
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
  if (loginIsTooOld(decoded.auth_time)) return sessionExpiredResponse();

  const { courseId, lessonId, sessionId, position, duration } = await req.json();
  if (!courseId || !lessonId || !sessionId) {
    return NextResponse.json({ error: "Missing courseId, lessonId, or sessionId" }, { status: 400 });
  }

  // Without this any signed-in account could write session docs for a course
  // it never bought.
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

  // The same call carries watch progress, so the dashboard can show
  // "continue watching" and % watched without a second request. Best-effort:
  // a bad or missing position never affects the stream-cap answer above.
  if (allowed && Number.isFinite(position) && Number.isFinite(duration) && duration > 0) {
    const pos = Math.max(0, Math.min(position, duration));
    await adminDb
      .collection("users")
      .doc(decoded.uid)
      .collection("progress")
      .doc(courseId)
      .set(
        {
          lastLessonId: lessonId,
          updatedAt: new Date(),
          lessons: {
            [lessonId]: {
              position: Math.floor(pos),
              duration: Math.floor(duration),
              // Sticky: once finished it stays finished, even if they rewatch the start.
              ...(pos / duration >= 0.95 ? { completed: true } : {}),
            },
          },
        },
        { merge: true }
      )
      .catch(() => {});
  }

  return NextResponse.json({ allowed });
}
