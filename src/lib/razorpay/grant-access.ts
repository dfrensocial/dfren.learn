import { adminAuth, adminDb } from "@/lib/firebase/admin";

/**
 * Looks up (or creates) the Firebase user for this email and grants them
 * access to the course. Called from both /api/razorpay/verify (the
 * synchronous, client-triggered path) and the webhook (the idempotent
 * fallback) — both are signature-verified against Razorpay's secret, so
 * either is a trustworthy place to grant access from.
 */
export async function grantCourseAccess({
  email,
  courseId,
  paymentId,
}: {
  email: string;
  courseId: string;
  paymentId: string;
}) {
  const user = await adminAuth.getUserByEmail(email).catch(async (err) => {
    if (err.code !== "auth/user-not-found") throw err;
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
  });

  await adminDb
    .collection("users")
    .doc(user.uid)
    .collection("enrollments")
    .doc(courseId)
    .set(
      { courseId, purchasedAt: new Date().toISOString(), paymentId },
      { merge: true }
    );

  return user;
}
