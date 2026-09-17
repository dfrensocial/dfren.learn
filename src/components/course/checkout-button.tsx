"use client";

import Script from "next/script";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutButton({
  courseId,
  amountInPaise,
  courseTitle,
}: {
  courseId: string;
  amountInPaise: number;
  courseTitle: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!user) {
      router.push(`/login?redirect=/dashboard/courses/${courseId}`);
      return;
    }

    setLoading(true);
    const idToken = await user.getIdToken();
    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ courseId, amountInPaise }),
    });
    const { order } = await res.json();
    setLoading(false);

    const razorpay = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: "dfrenLearn",
      description: courseTitle,
      // Enrollment is granted from the verified webhook, not this callback —
      // this just gives the user immediate feedback.
      handler: () => router.push(`/dashboard/courses/${courseId}?purchased=1`),
      prefill: { email: user.email ?? undefined },
    });
    razorpay.open();
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="rounded-md bg-neutral-900 px-6 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Preparing checkout..." : "Enroll now"}
      </button>
    </>
  );
}
