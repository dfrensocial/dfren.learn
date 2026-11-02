import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { loginIsTooOld } from "@/lib/session-policy";
import { sessionExpiredResponse } from "@/lib/session-expired-response";
import { hasCurrentAcceptance } from "@/lib/legal-acceptance-server";
import { LEGAL } from "@/content/legal";

// Has the signed-in person accepted the CURRENT Terms + Privacy Policy?
// Drives the "we've updated our policies" dialog in the dashboard.
export async function GET(req: NextRequest) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = idToken ? await adminAuth.verifyIdToken(idToken, true).catch(() => null) : null;
  if (!decoded) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  if (loginIsTooOld(decoded.auth_time)) return sessionExpiredResponse();

  const { allowed } = rateLimit(`legal-status:${decoded.uid}`, { limit: 120, windowMs: 60 * 60_000 });
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const accepted = await hasCurrentAcceptance(decoded.uid);
  return NextResponse.json(
    { accepted, terms: LEGAL.termsVersion, privacy: LEGAL.privacyVersion },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
