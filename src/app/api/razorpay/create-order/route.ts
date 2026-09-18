import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { razorpay } from "@/lib/razorpay/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.replace("Bearer ", "");
  const decoded = idToken ? await adminAuth.verifyIdToken(idToken).catch(() => null) : null;

  const { courseId, guestEmail } = await req.json();
  const email = decoded?.email ?? guestEmail;

  if (!courseId || !email) {
    return NextResponse.json({ error: "Missing courseId or email" }, { status: 400 });
  }

  const courseSnap = await adminDb.collection("courses").doc(courseId).get();
  const priceInPaise = courseSnap.data()?.priceInPaise;
  if (!courseSnap.exists || !priceInPaise) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const order = await razorpay.orders.create({
    amount: priceInPaise,
    currency: "INR",
    notes: { courseId, email },
  });

  return NextResponse.json({ order });
}
