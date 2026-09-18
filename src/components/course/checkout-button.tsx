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

// Auto-detects whether Razorpay is actually configured. Flips to the real
// checkout the moment NEXT_PUBLIC_RAZORPAY_KEY_ID is set — no code change needed.
const TEST_MODE = !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

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
  const [showTestModal, setShowTestModal] = useState(false);
  const [testFailedMessage, setTestFailedMessage] = useState<string | null>(null);

  function resolveEmail() {
    return user?.email ?? guestEmail.trim();
  }

  async function completeSignIn(customToken: string | undefined) {
    // Guest buyers get signed in immediately via the token the server just
    // minted — no password/email-link step needed for first access.
    if (customToken) {
      const { user: signedInUser } = await signInWithCustomToken(auth, customToken);
      await syncSessionCookie(signedInUser);
    }
    router.push(`/dashboard/courses/${courseId}?purchased=1`);
  }

  async function handleCheckout() {
    // Guest checkout: capture an email inline instead of forcing signup first.
    if (!user && !showEmailField) {
      setShowEmailField(true);
      return;
    }

    const email = resolveEmail();
    if (!email) return;

    setTestFailedMessage(null);

    if (TEST_MODE) {
      setShowTestModal(true);
      return;
    }

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
        await completeSignIn(customToken);
      },
      prefill: { email },
    });
    razorpay.open();
  }

  async function handleSimulateSuccess() {
    setShowTestModal(false);
    setLoading(true);
    const idToken = await user?.getIdToken();
    const res = await fetch("/api/test/simulate-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ courseId, email: resolveEmail() }),
    });
    setLoading(false);
    const { customToken } = await res.json();
    await completeSignIn(customToken);
  }

  function handleSimulateFailure() {
    setShowTestModal(false);
    setTestFailedMessage("Payment failed. Please try again.");
  }

  return (
    <div>
      {!TEST_MODE && (
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      )}

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

      {testFailedMessage && (
        <p className="mb-3 text-sm text-red-600">{testFailedMessage}</p>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-md bg-neutral-900 px-6 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Preparing checkout..." : "Enroll now"}
      </button>

      {TEST_MODE && (
        <p className="mt-2 text-center text-xs text-neutral-400">
          Test mode — Razorpay isn&apos;t connected yet
        </p>
      )}

      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm border border-black bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Test mode
            </p>
            <h3 className="mt-1 text-lg font-bold">Razorpay isn&apos;t connected yet</h3>
            <p className="mt-2 text-sm text-neutral-600">
              This simulates checkout for {courseTitle} so the rest of the app
              can be tested end to end. No real payment happens.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleSimulateSuccess}
                className="rounded-md bg-black px-4 py-3 font-semibold text-white transition hover:bg-neutral-800"
              >
                Simulate successful payment
              </button>
              <button
                onClick={handleSimulateFailure}
                className="rounded-md border border-black px-4 py-3 font-semibold transition hover:bg-neutral-100"
              >
                Simulate failed payment
              </button>
              <button
                onClick={() => setShowTestModal(false)}
                className="mt-1 text-sm text-neutral-500 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
