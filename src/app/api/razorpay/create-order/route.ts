import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { razorpay } from "@/lib/razorpay/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.replace("Bearer ", "");
  if (!idToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { courseId, amountInPaise } = await req.json();
  if (!courseId || !amountInPaise) {
    return NextResponse.json({ error: "Missing courseId or amount" }, { status: 400 });
  }

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    notes: { courseId, userId: decoded.uid },
  });

  return NextResponse.json({ order });
}
