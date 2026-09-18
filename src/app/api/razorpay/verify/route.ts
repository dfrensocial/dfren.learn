import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay/server";
import { grantCourseAccess } from "@/lib/razorpay/grant-access";

// Called by the client right after Razorpay's checkout handler fires. The
// signature check below is what makes this trustworthy — without it, this
// would just be a client saying "trust me, I paid."
export async function POST(req: NextRequest) {
  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    courseId,
    email,
  } = await req.json();

  if (!orderId || !paymentId || !signature || !courseId || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!verifyRazorpayPaymentSignature({ orderId, paymentId, signature })) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.replace("Bearer ", "");
  const isGuest = !idToken || !(await adminAuth.verifyIdToken(idToken).catch(() => null));

  const user = await grantCourseAccess({ email, courseId, paymentId });

  // Guests aren't signed in yet — hand back a token the client can use to
  // sign in immediately, no password or emailed link needed for first access.
  const customToken = isGuest ? await adminAuth.createCustomToken(user.uid) : undefined;

  return NextResponse.json({ ok: true, customToken });
}
