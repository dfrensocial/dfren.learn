import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { razorpay, verifyRazorpayPaymentSignature } from "@/lib/razorpay/server";
import { grantCourseAccess } from "@/lib/razorpay/grant-access";
import { isValidPublishedCourse } from "@/lib/razorpay/validate-course";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

// Called by the client right after Razorpay's checkout handler fires. The
// signature check only proves orderId+paymentId are a genuine pair from
// Razorpay — it says nothing about who paid or for what course. courseId and
// email must therefore come from the order's own `notes` (set server-side at
// creation in /api/razorpay/create-order), never from this request body —
// otherwise anyone who ever completed one checkout could replay their valid
// signature with a different email and grant themselves (or take over)
// an arbitrary account. Same authoritative-source pattern the webhook uses.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = rateLimit(`verify:${ip}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = await req.json();

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!verifyRazorpayPaymentSignature({ orderId, paymentId, signature })) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const order = await razorpay.orders.fetch(orderId).catch(() => null);
  const courseId = order?.notes?.courseId as string | undefined;
  const email = order?.notes?.email as string | undefined;

  if (!courseId || !email) {
    return NextResponse.json({ error: "Order not found or missing notes" }, { status: 400 });
  }

  if (!(await isValidPublishedCourse(courseId))) {
    return NextResponse.json({ error: "Course not found" }, { status: 400 });
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
