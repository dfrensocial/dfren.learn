import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { grantCourseAccess } from "@/lib/razorpay/grant-access";
import { isRazorpayConfigured } from "@/lib/razorpay/server";

// Lets the UI (checkout flow, dashboard, video playback) be fully tested
// before Razorpay exists — hard-disabled the moment real Razorpay keys are
// configured, since it grants access with no payment verification at all.
export async function POST(req: NextRequest) {
  if (isRazorpayConfigured()) {
    return NextResponse.json({ error: "Test mode is disabled" }, { status: 404 });
  }

  const { courseId, email } = await req.json();
  if (!courseId || !email) {
    return NextResponse.json({ error: "Missing courseId or email" }, { status: 400 });
  }

  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.replace("Bearer ", "");
  const isGuest = !idToken || !(await adminAuth.verifyIdToken(idToken).catch(() => null));

  const user = await grantCourseAccess({
    email,
    courseId,
    paymentId: `test-${Date.now()}`,
  });

  const customToken = isGuest ? await adminAuth.createCustomToken(user.uid) : undefined;

  return NextResponse.json({ ok: true, customToken });
}
