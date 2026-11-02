"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithCustomToken, sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth, syncSessionCookie } from "@/lib/firebase/auth-context";
import { useEnrollment } from "@/lib/firebase/use-enrollment";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

// Auto-detects whether Razorpay is actually configured. Flips to the real
// checkout the moment NEXT_PUBLIC_RAZORPAY_KEY_ID is set — no code change needed.
const TEST_MODE = !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

// Same key the login page reads to finish an emailed-link sign-in.
const EMAIL_LINK_STORAGE_KEY = "dfrenlearn:login-email";

export function CheckoutButton({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const { user } = useAuth();
  const { enrolled } = useEnrollment(courseId);
  const router = useRouter();
  const [guestEmail, setGuestEmail] = useState("");
  const [showEmailField, setShowEmailField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const firstModalButtonRef = useRef<HTMLButtonElement>(null);

  // Basic focus trap + Escape-to-close for the test-mode modal.
  useEffect(() => {
    if (!showTestModal) return;
    firstModalButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowTestModal(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showTestModal]);

  function resolveEmail() {
    return user?.email ?? guestEmail.trim();
  }

  async function completeSignIn(
    result: { customToken?: string; signInRequired?: boolean },
    email: string
  ) {
    // Brand-new buyers get signed in immediately via the token the server
    // just minted — no password/email-link step needed for first access.
    if (result.customToken) {
      const { user: signedInUser } = await signInWithCustomToken(auth, result.customToken);
      await syncSessionCookie(signedInUser);
    } else if (result.signInRequired) {
      // The email already belongs to an account, so the server won't vouch
      // for whoever typed it — they prove ownership through the inbox.
      const url = new URL("/login", window.location.origin);
      url.searchParams.set("redirect", `/dashboard/courses/${courseId}?purchased=1`);
      try {
        await sendSignInLinkToEmail(auth, email, { url: url.toString(), handleCodeInApp: true });
        window.localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email);
        setInfoMessage(
          `Payment received — you're enrolled. We emailed a sign-in link to ${email}; open it to start watching.`
        );
      } catch {
        setInfoMessage(
          `Payment received — you're enrolled. Go to the login page and request a sign-in link for ${email}.`
        );
      }
      return;
    }
    router.push(`/dashboard/courses/${courseId}?purchased=1`);
  }

  async function handleCheckout(e?: React.FormEvent) {
    e?.preventDefault();

    // Guest checkout: capture an email inline instead of forcing signup first.
    if (!user && !showEmailField) {
      setShowEmailField(true);
      return;
    }

    const email = resolveEmail();
    if (!email) return;

    setStatusMessage(null);
    setInfoMessage(null);

    if (TEST_MODE) {
      setShowTestModal(true);
      return;
    }

    setLoading(true);
    try {
      const idToken = await user?.getIdToken();
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ courseId, guestEmail: idToken ? undefined : email }),
      });
      if (res.status === 409) {
        setInfoMessage("You already have this course. Open it from your dashboard.");
        return;
      }
      if (!res.ok) throw new Error("create-order failed");
      const { order } = await res.json();

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
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
              },
              body: JSON.stringify({ ...response, courseId, email }),
            });
            if (!verifyRes.ok) throw new Error("verify failed");
            await completeSignIn(await verifyRes.json(), email);
          } catch {
            setStatusMessage(
              "Payment succeeded but we couldn't confirm it — contact support with your payment ID."
            );
          }
        },
        modal: {
          ondismiss: () => setStatusMessage("Checkout cancelled."),
        },
        prefill: { email },
      });
      razorpay.open();
    } catch {
      setStatusMessage("Couldn't start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulateSuccess() {
    setShowTestModal(false);
    setLoading(true);
    try {
      const idToken = await user?.getIdToken();
      const res = await fetch("/api/test/simulate-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ courseId, email: resolveEmail() }),
      });
      if (!res.ok) throw new Error("simulate-payment failed");
      await completeSignIn(await res.json(), resolveEmail());
    } catch {
      setStatusMessage("Something went wrong simulating the payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSimulateFailure() {
    setShowTestModal(false);
    setStatusMessage("Payment failed. Please try again.");
  }

  // Already owns it: no second purchase, just a way in.
  if (enrolled) {
    return (
      <Link
        href={`/dashboard/courses/${courseId}`}
        className="block w-full bg-black px-6 py-3 text-center font-semibold text-white transition hover:bg-neutral-800"
      >
        You own this course — continue learning
      </Link>
    );
  }

  return (
    <div>
      {!TEST_MODE && (
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      )}

      <form onSubmit={handleCheckout}>
        {showEmailField && !user && (
          <div className="mb-3">
            <label htmlFor="guest-email" className="sr-only">
              Your email
            </label>
            <input
              id="guest-email"
              type="email"
              required
              autoFocus
              placeholder="Your email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="block w-full border border-black px-3 py-2"
            />
          </div>
        )}

        {statusMessage && <p className="mb-3 text-sm text-red-600">{statusMessage}</p>}
        {infoMessage && (
          <p className="mb-3 border border-black bg-neutral-50 px-3 py-2 text-sm">{infoMessage}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Preparing checkout..." : "Enroll now"}
        </button>
      </form>

      {TEST_MODE && (
        <p className="mt-2 text-center text-xs text-neutral-400">
          Test mode — Razorpay isn&apos;t connected yet
        </p>
      )}

      {showTestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowTestModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="test-mode-heading"
            className="w-full max-w-sm border border-black bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Test mode
            </p>
            <h3 id="test-mode-heading" className="mt-1 text-lg font-bold">
              Razorpay isn&apos;t connected yet
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              This simulates checkout for {courseTitle} so the rest of the app
              can be tested end to end. No real payment happens.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                ref={firstModalButtonRef}
                onClick={handleSimulateSuccess}
                className="bg-black px-4 py-3 font-semibold text-white transition hover:bg-neutral-800"
              >
                Simulate successful payment
              </button>
              <button
                onClick={handleSimulateFailure}
                className="border border-black px-4 py-3 font-semibold transition hover:bg-neutral-100"
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
