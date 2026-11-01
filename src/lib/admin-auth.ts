import { adminAuth } from "@/lib/firebase/admin";

/**
 * Admin = a signed-in user whose *verified* email is in ADMIN_EMAILS
 * (comma-separated, server-only env var). Unset/empty means nobody is an
 * admin, so the admin-only routes fail closed. Email-link sign-in marks the
 * address verified, which is what makes the email a safe identity here.
 */
export async function requireAdmin(req: Request): Promise<{ email: string } | null> {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) return null;

  const decoded = await adminAuth.verifyIdToken(idToken, true).catch(() => null);
  if (!decoded?.email || !decoded.email_verified) return null;

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(decoded.email.toLowerCase()) ? { email: decoded.email } : null;
}
