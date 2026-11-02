import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { loginIsTooOld } from "@/lib/session-policy";
import { sessionExpiredResponse } from "@/lib/session-expired-response";
import { acceptCurrentFromDialog } from "@/lib/legal-acceptance-server";

// Records that the signed-in person accepted the current Terms + Privacy Policy
// from the dashboard's "we've updated our policies" dialog. The body names the
// versions the dialog showed; if they are no longer current we refuse (409) and
// the page reloads to show the newer text.
export async function POST(req: NextRequest) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = idToken ? await adminAuth.verifyIdToken(idToken, true).catch(() => null) : null;
  if (!decoded) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  if (loginIsTooOld(decoded.auth_time)) return sessionExpiredResponse();

  const { allowed } = rateLimit(`legal-accept:${decoded.uid}`, { limit: 20, windowMs: 60 * 60_000 });
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const result = await acceptCurrentFromDialog(decoded.uid, body);
  if (result === "stale") {
    return NextResponse.json({ error: "The policies changed. Please reload.", code: "stale-policy" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
