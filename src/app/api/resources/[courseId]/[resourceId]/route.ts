import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminBucket, adminDb } from "@/lib/firebase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { loginIsTooOld } from "@/lib/session-policy";
import { hasCurrentAcceptance, POLICY_UPDATE_REQUIRED } from "@/lib/legal-acceptance-server";

// Serves a course file to an enrolled student. This is a plain GET so the
// browser can download it from an ordinary link — which can't carry a Bearer
// header — so identity comes from the httpOnly `session` cookie instead
// (verified here with checkRevoked, not merely present like in middleware).
//
// The files live in private Firebase Storage (scripts/upload-resource.ts; the
// bucket rules deny every client read) and are handed out as a 60-second signed
// link after the checks below. Files stored the old way (a private Firestore
// subdoc, 900 KB max) are still streamed from here.
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
  if (!(await hasCurrentAcceptance(decoded.uid))) {
    return NextResponse.json(POLICY_UPDATE_REQUIRED, { status: 403 });
  }

  const resourceRef = adminDb.collection("courses").doc(courseId).collection("resources").doc(resourceId);
  const meta = await resourceRef.get();
  if (!meta.exists) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
  const { filename, contentType, storagePath } = meta.data() as {
    filename: string;
    contentType: string;
    storagePath?: string;
  };
  const disposition = `attachment; filename="${filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(filename)}`;

  // Newer files live in private Firebase Storage; older ones (small) in Firestore.
  let storageUrl: string | null = null;
  let bytes: Buffer | undefined;
  if (storagePath) {
    try {
      // The browser fetches the file straight from Google, so it never passes through
      // our host (no bandwidth there, no size cap). The link works for one minute.
      [storageUrl] = await adminBucket.file(storagePath).getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 60_000,
        responseDisposition: disposition,
        responseType: contentType,
      });
    } catch (err) {
      console.error("resource signed url failed", err);
      return NextResponse.json({ error: "Couldn't prepare that file. Please try again." }, { status: 500 });
    }
  } else {
    const file = await resourceRef.collection("file").doc("data").get();
    bytes = file.data()?.bytes as Buffer | undefined;
    if (!bytes) return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  // Best-effort audit trail (who downloaded what) — never blocks the download.
  adminDb
    .collection("users")
    .doc(decoded.uid)
    .collection("downloads")
    .add({
      courseId,
      resourceId,
      at: new Date(),
      ip: getClientIp(req),
      userAgent: (req.headers.get("user-agent") ?? "unknown").slice(0, 300),
    })
    .catch(() => {});

  if (storageUrl) {
    return new NextResponse(null, {
      status: 302,
      headers: { Location: storageUrl, "Cache-Control": "private, no-store" },
    });
  }

  return new NextResponse(new Uint8Array(bytes!), {
    headers: {
      "Content-Type": contentType,
      // filename* handles non-ASCII names; the plain filename is the fallback.
      "Content-Disposition": disposition,
      "Content-Length": String(bytes!.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
