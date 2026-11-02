import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { LEGAL } from "@/content/legal";

// Proof of consent. The browser reports a "yes" (and a later withdrawal of it)
// so we can show, if ever asked, who agreed to what and when -- by random id.
// Deliberately minimal: no IP, no user agent, no email, no account id. A "no"
// from someone who never said yes is never sent here at all.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIONS = new Set(["accept", "update", "withdraw"]);

function isTrustedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const { allowed } = rateLimit(`consent:${getClientIp(req)}`, { limit: 30, windowMs: 60_000 });
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const b = await req.json().catch(() => null);
  if (
    !b ||
    typeof b.id !== "string" ||
    !UUID.test(b.id) ||
    typeof b.analytics !== "boolean" ||
    typeof b.replay !== "boolean" ||
    typeof b.version !== "string" ||
    b.version !== LEGAL.consentVersion ||
    !ACTIONS.has(b.action)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await adminDb.collection("consentEvents").add({
    consentId: b.id.toLowerCase(),
    analytics: b.analytics,
    replay: b.replay,
    version: b.version,
    action: b.action,
    at: new Date(),
  });
  return NextResponse.json({ ok: true });
}
