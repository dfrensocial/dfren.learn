import { NextRequest, NextResponse } from "next/server";
import { razorpay, verifyRazorpayWebhookSignature } from "@/lib/razorpay/server";
import { grantCourseAccess } from "@/lib/razorpay/grant-access";
import { isValidPublishedCourse } from "@/lib/razorpay/validate-course";

// Razorpay signs the raw request body, so it must be read as text, not parsed as JSON first.
// This is the idempotent fallback for /api/razorpay/verify — it covers a browser
// tab closing before the client-side verify call completes.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    // payment.notes can be filled in by the browser at checkout, so it can't
    // say which course was bought. The order's notes are written server-side
    // in /api/razorpay/create-order — read those, exactly like /verify does.
    // (Any other payment on this Razorpay account has no such order; ack it
    // so Razorpay doesn't retry and eventually disable the webhook.)
    if (!payment.order_id) return NextResponse.json({ received: true, ignored: true });

    let order;
    try {
      order = await razorpay.orders.fetch(payment.order_id);
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status && status < 500) return NextResponse.json({ received: true, ignored: true });
      return NextResponse.json({ error: "Could not load order" }, { status: 502 }); // let Razorpay retry
    }

    const courseId = order.notes?.courseId as string | undefined;
    const email = order.notes?.email as string | undefined;
    if (!courseId || !email) return NextResponse.json({ received: true, ignored: true });

    if (!(await isValidPublishedCourse(courseId))) {
      return NextResponse.json({ error: "Invalid course" }, { status: 400 });
    }
    await grantCourseAccess({ email, courseId, paymentId: payment.id });
  }

  return NextResponse.json({ received: true });
}
