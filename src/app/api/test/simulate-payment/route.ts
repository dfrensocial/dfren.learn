import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { grantCourseAccess } from "@/lib/razorpay/grant-access";
import { isRazorpayConfigured } from "@/lib/razorpay/server";
import { isValidPublishedCourse } from "@/lib/razorpay/validate-course";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

// Lets the UI (checkout flow, dashboard, video playback) be fully tested
// before Razorpay exists — hard-disabled the moment real Razorpay keys are
// configured, since it grants access with no payment verification at all.
export async function POST(req: NextRequest) {
  // Public deploys must never expose this just because Razorpay keys haven't
  // been added yet — production requires an explicit opt-in.
  const testAllowed =
    process.env.NODE_ENV !== "production" || process.env.ENABLE_TEST_PAYMENTS === "true";
  if (!testAllowed || isRazorpayConfigured()) {
    return NextResponse.json({ error: "Test mode is disabled" }, { status: 404 });
  }

  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = rateLimit(`simulate-payment:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const { courseId, email } = await req.json();
  if (!courseId || !email) {
    return NextResponse.json({ error: "Missing courseId or email" }, { status: 400 });
  }

  if (!(await isValidPublishedCourse(courseId))) {
    return NextResponse.json({ error: "Course not found" }, { status: 400 });
  }

  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.replace("Bearer ", "");
  const caller = idToken ? await adminAuth.verifyIdToken(idToken).catch(() => null) : null;

  const { user, claimable } = await grantCourseAccess({
    email,
    courseId,
    paymentId: `test-${Date.now()}`,
  });

  const customToken = claimable ? await adminAuth.createCustomToken(user.uid) : undefined;
  const signInRequired = !customToken && caller?.uid !== user.uid;

  return NextResponse.json({ ok: true, customToken, signInRequired });
}
