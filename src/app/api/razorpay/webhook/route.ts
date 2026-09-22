import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay/server";
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
    const { courseId, email } = payment.notes;
    if (!courseId || !email || !(await isValidPublishedCourse(courseId))) {
      return NextResponse.json({ error: "Invalid course" }, { status: 400 });
    }
    await grantCourseAccess({ email, courseId, paymentId: payment.id });
  }

  return NextResponse.json({ received: true });
}
