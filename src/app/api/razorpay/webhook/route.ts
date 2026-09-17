import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay/server";
import { adminDb } from "@/lib/firebase/admin";

// Razorpay signs the raw request body, so it must be read as text, not parsed as JSON first.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const { courseId, userId } = event.payload.payment.entity.notes;
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("enrollments")
      .doc(courseId)
      .set({
        courseId,
        purchasedAt: new Date().toISOString(),
        paymentId: event.payload.payment.entity.id,
      });
  }

  return NextResponse.json({ received: true });
}
