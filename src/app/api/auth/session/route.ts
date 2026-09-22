import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

// Exchanges a client Firebase ID token for an httpOnly session cookie
// middleware.ts checks for on protected routes.
//
// Defense-in-depth against CSRF: this endpoint is only ever meant to be
// called by our own frontend (immediately after Firebase sign-in), never
// cross-site. `sameSite: "lax"` already blocks the cookie being *sent* on a
// cross-site subrequest, but doesn't stop a cross-site POST that carries its
// own attacker-controlled idToken from reaching this handler in the first
// place. Reject when Origin is present and doesn't match this request's own
// host — most browsers send Origin on POST, but some legitimate same-origin
// requests omit it, so absence is not itself rejected.
function isTrustedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    return originHost === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const { idToken } = await req.json();

  const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("session", sessionCookie, {
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("session");
  return response;
}
