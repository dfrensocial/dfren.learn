import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { razorpay } from "@/lib/razorpay/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { recordOrderCreated } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = rateLimit(`create-order:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const authHeader = req.headers.get("authorization");
  const idToken = authHeader?.replace("Bearer ", "");
  const decoded = idToken ? await adminAuth.verifyIdToken(idToken).catch(() => null) : null;

  const { courseId, guestEmail, attribution, ga } = await req.json();
  const email = decoded?.email ?? guestEmail;

  if (!courseId || !email) {
    return NextResponse.json({ error: "Missing courseId or email" }, { status: 400 });
  }

  const courseSnap = await adminDb.collection("courses").doc(courseId).get();
  const course = courseSnap.data();
  const priceInPaise = course?.priceInPaise;
  if (!courseSnap.exists || course?.published !== true || !priceInPaise) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // A logged-in buyer who already owns the course would just be charged twice.
  if (decoded) {
    const owned = await adminDb
      .collection("users")
      .doc(decoded.uid)
      .collection("enrollments")
      .doc(courseId)
      .get();
    if (owned.exists) {
      return NextResponse.json({ error: "You already have access to this course." }, { status: 409 });
    }
  }

  const order = await razorpay.orders.create({
    amount: priceInPaise,
    currency: "INR",
    notes: { courseId, email },
  });

  // Business ledger: who started checkout, from which channel. Best-effort --
  // bookkeeping must never stop someone from paying.
  await recordOrderCreated({
    orderId: order.id,
    courseId,
    email,
    uid: decoded?.uid,
    amount: Number(order.amount),
    currency: order.currency,
    attribution,
    ga,
    userAgent: req.headers.get("user-agent"),
    headers: req.headers,
  }).catch((err) => console.error("[orders] could not record created order", order.id, err));

  return NextResponse.json({ order });
}
