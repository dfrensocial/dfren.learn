"use client";

import Script from "next/script";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth, syncSessionCookie } from "@/lib/firebase/auth-context";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutButton({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [guestEmail, setGuestEmail] = useState("");
  const [showEmailField, setShowEmailField] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    // Guest checkout: capture an email inline instead of forcing signup first.
    if (!user && !showEmailField) {
      setShowEmailField(true);
      return;
    }

    const email = user?.email ?? guestEmail.trim();
    if (!email) return;

    setLoading(true);
    const idToken = await user?.getIdToken();
    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ courseId, guestEmail: idToken ? undefined : email }),
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
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({ ...response, courseId, email }),
        });
        const { customToken } = await verifyRes.json();

        // Guest buyers get signed in immediately via the token the server just
        // minted — no password/email-link step needed for first access.
        if (customToken) {
          const { user: signedInUser } = await signInWithCustomToken(auth, customToken);
          await syncSessionCookie(signedInUser);
        }

        router.push(`/dashboard/courses/${courseId}?purchased=1`);
      },
      prefill: { email },
    });
    razorpay.open();
  }

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {showEmailField && !user && (
        <input
          type="email"
          required
          autoFocus
          placeholder="Your email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          className="mb-3 block w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      )}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-md bg-neutral-900 px-6 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Preparing checkout..." : "Enroll now"}
      </button>
    </div>
  );
}
