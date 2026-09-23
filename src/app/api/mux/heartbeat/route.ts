import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { checkAndRegisterSession } from "@/lib/session-limit";

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

  const { courseId, lessonId, sessionId } = await req.json();
  if (!courseId || !lessonId || !sessionId) {
    return NextResponse.json({ error: "Missing courseId, lessonId, or sessionId" }, { status: 400 });
  }

  const { allowed } = await checkAndRegisterSession({ uid: decoded.uid, sessionId, courseId, lessonId });
  return NextResponse.json({ allowed });
}
