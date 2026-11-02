import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { loginIsTooOld } from "@/lib/session-policy";

// Serves a course file to an enrolled student. This is a plain GET so the
// browser can download it from an ordinary link — which can't carry a Bearer
// header — so identity comes from the httpOnly `session` cookie instead
// (verified here with checkRevoked, not merely present like in middleware).
//
// The bytes live in a private Firestore subdoc (see scripts/upload-resource.ts
// and firestore.rules); this route is the only way to reach them.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ courseId: string; resourceId: string }> }
) {
  const { courseId, resourceId } = await ctx.params;

  const cookie = req.cookies.get("session")?.value;
  const decoded = cookie ? await adminAuth.verifySessionCookie(cookie, true).catch(() => null) : null;
  if (!decoded || loginIsTooOld(decoded.auth_time)) {
    return NextResponse.json({ error: "Please log in to download this file." }, { status: 401 });
  }

  const { allowed, retryAfterSeconds } = rateLimit(`resource:${decoded.uid}`, { limit: 30, windowMs: 60 * 60_000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many downloads. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const enrollment = await adminDb
    .collection("users")
    .doc(decoded.uid)
    .collection("enrollments")
    .doc(courseId)
    .get();
  if (!enrollment.exists) {
    return NextResponse.json({ error: "Not enrolled in this course." }, { status: 403 });
  }

  const resourceRef = adminDb.collection("courses").doc(courseId).collection("resources").doc(resourceId);
  const [meta, file] = await Promise.all([resourceRef.get(), resourceRef.collection("file").doc("data").get()]);
  const bytes = file.data()?.bytes as Buffer | undefined;
  if (!meta.exists || !bytes) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
  const { filename, contentType } = meta.data() as { filename: string; contentType: string };

  // Best-effort audit trail (who downloaded what) — never blocks the download.
  adminDb
    .collection("users")
    .doc(decoded.uid)
    .collection("downloads")
    .add({ courseId, resourceId, at: new Date() })
    .catch(() => {});

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      // filename* handles non-ASCII names; the plain filename is the fallback.
      "Content-Disposition": `attachment; filename="${filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Content-Length": String(bytes.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
