import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { razorpay, verifyRazorpayPaymentSignature } from "@/lib/razorpay/server";
import { grantCourseAccess } from "@/lib/razorpay/grant-access";
import { isValidPublishedCourse } from "@/lib/razorpay/validate-course";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { recordPaid } from "@/lib/orders";

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
  const caller = idToken ? await adminAuth.verifyIdToken(idToken).catch(() => null) : null;

  const { user, claimable } = await grantCourseAccess({ email, courseId, paymentId });

  // Business ledger (best-effort; never affects the buyer's access).
  await recordPaid(orderId, paymentId, "verify", {
    courseId,
    email,
    amount: Number(order?.amount),
    currency: order?.currency,
    createdAt: order?.created_at ? new Date(Number(order.created_at) * 1000) : undefined,
  }).catch((err) => console.error("[orders] could not record paid order", orderId, err));

  // A sign-in token is only handed out for a brand-new, never-signed-in
  // account (see grantCourseAccess) — the email here was typed by whoever
  // paid, so for any other account it proves nothing about who they are.
  const customToken = claimable ? await adminAuth.createCustomToken(user.uid) : undefined;

  // Paid, enrolled, but not signed in and can't be auto-signed-in: the client
  // sends an emailed sign-in link to prove they own the address.
  const signInRequired = !customToken && caller?.uid !== user.uid;

  return NextResponse.json({ ok: true, customToken, signInRequired });
}
