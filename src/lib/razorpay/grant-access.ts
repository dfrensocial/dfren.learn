import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { UserRecord } from "firebase-admin/auth";

async function getOrCreateUser(email: string): Promise<UserRecord> {
  try {
    return await adminAuth.getUserByEmail(email);
  } catch (err) {
    if ((err as { code?: string }).code !== "auth/user-not-found") throw err;
  }
  try {
    return await adminAuth.createUser({ email });
  } catch (createErr) {
    // Race with the other grant path (verify vs. webhook) creating the
    // same user concurrently — the loser here just re-fetches.
    if ((createErr as { code?: string }).code === "auth/email-already-exists") {
      return adminAuth.getUserByEmail(email);
    }
    throw createErr;
  }
}

/**
 * Looks up (or creates) the Firebase user for this email and grants them
 * access to the course. Called from both /api/razorpay/verify (the
 * synchronous, client-triggered path) and the webhook (the idempotent
 * fallback) — both are signature-verified against Razorpay's secret, so
 * either is a trustworthy place to grant access from.
 *
 * `claimable` says whether the caller may hand the buyer a sign-in token
 * right now. The buyer typed the email themselves and nothing has proven
 * they own it, so a token is only safe for an account nobody has ever
 * signed into: no provider linked, no sign-in on record (admin-created
 * accounts have `lastSignInTime: null` until the first sign-in — verified
 * against the live project). Anything else (a returning customer, or a
 * stranger paying with someone else's email) must prove ownership through
 * the emailed sign-in link instead — otherwise paying with a victim's email
 * would sign you in as them.
 */
export async function grantCourseAccess({
  email,
  courseId,
  paymentId,
}: {
  email: string;
  courseId: string;
  paymentId: string;
}): Promise<{ user: UserRecord; claimable: boolean }> {
  let user = await getOrCreateUser(email);
  let neutralized = false;

  // Password sign-up is open on the Firebase project (anyone can hit the
  // public REST endpoint) and never verifies email ownership, so an attacker
  // can pre-register a victim's email with a password of their own and then
  // share the victim's purchase. A password on an unverified email is never
  // legitimate here — real accounts are created by checkout and signed into
  // by emailed link, which marks the email verified. Strip it and kill any
  // sessions the squatter already holds.
  const hasPassword = user.providerData.some((p) => p.providerId === "password");
  if (hasPassword && !user.emailVerified) {
    await adminAuth.updateUser(user.uid, { providersToUnlink: ["password"] });
    await adminAuth.revokeRefreshTokens(user.uid);
    user = await adminAuth.getUser(user.uid);
    neutralized = true;
  }

  const claimable =
    !neutralized && user.providerData.length === 0 && !user.metadata.lastSignInTime;

  // create() (not set) so a duplicate webhook delivery or verify+webhook
  // double-grant keeps the original purchase record instead of rewriting it.
  await adminDb
    .collection("users")
    .doc(user.uid)
    .collection("enrollments")
    .doc(courseId)
    .create({ courseId, purchasedAt: new Date().toISOString(), paymentId })
    .catch((err) => {
      // 6 = ALREADY_EXISTS
      if ((err as { code?: number }).code !== 6) throw err;
    });

  return { user, claimable };
}
