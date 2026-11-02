"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithCustomToken, sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth, syncSessionCookie } from "@/lib/firebase/auth-context";
import { useEnrollment } from "@/lib/firebase/use-enrollment";
import { analyticsAllowed, clarityTag, courseItem, getGaIds, track } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";
import { AcceptTerms } from "@/components/legal/accept-terms";
import { addAcceptanceParams, hasAcceptedCurrent, recordAcceptance } from "@/lib/legal-acceptance";
import { rememberLoginEmail } from "@/lib/login-email";

// What Razorpay's checkout reports when a payment attempt fails (no card data).
interface RazorpayFailure {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    step?: string;
    source?: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: "payment.failed", handler: (response: RazorpayFailure) => void) => void;
    };
  }
}

// Auto-detects whether Razorpay is actually configured. Flips to the real
// checkout the moment NEXT_PUBLIC_RAZORPAY_KEY_ID is set — no code change needed.
const TEST_MODE = !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

// Razorpay's script is fetched only when someone actually starts to pay, so
// Razorpay (an independent company) sees nothing from visitors who just browse.
let razorpayScript: Promise<void> | null = null;
function loadRazorpay(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  if (!razorpayScript) {
    razorpayScript = new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = "https://checkout.razorpay.com/v1/checkout.js";
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () => {
        razorpayScript = null; // allow a retry
        el.remove();
        reject(new Error("razorpay script failed to load"));
      };
      document.head.appendChild(el);
    });
  }
  return razorpayScript;
}

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
  // The required "18+, agree to Terms, read the Privacy Policy" box.
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    Promise.resolve().then(() => setAccepted(hasAcceptedCurrent()));
  }, []);

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
      addAcceptanceParams(url);
      try {
        await sendSignInLinkToEmail(auth, email, { url: url.toString(), handleCodeInApp: true });
        rememberLoginEmail(email);
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
      track("checkout_email_prompt");
      return;
    }

    const email = resolveEmail();
    if (!email) return;

    setStatusMessage(null);
    setInfoMessage(null);

    if (!accepted) {
      setStatusMessage("Please tick the box to agree to the Terms and Privacy Policy before paying.");
      return;
    }
    const terms = recordAcceptance();

    if (TEST_MODE) {
      setShowTestModal(true);
      return;
    }

    setLoading(true);
    try {
      const idToken = await user?.getIdToken();
      // Load Razorpay first: if it is blocked or slow we stop before creating an order nobody can pay.
      await Promise.race([
        loadRazorpay(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("razorpay load timeout")), 10_000)),
      ]);
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        // terms = what they just agreed to (the server refuses to create the
        // order without it). attribution / ga are sent only if they allowed
        // analytics; the server saves nothing optional otherwise.
        body: JSON.stringify({
          courseId,
          guestEmail: idToken ? undefined : email,
          terms,
          analytics: analyticsAllowed(),
          attribution: getAttribution(),
          ga: getGaIds(),
        }),
      });
      if (res.status === 409) {
        setInfoMessage("You already have this course. Open it from your dashboard.");
        return;
      }
      if (!res.ok) throw new Error("create-order failed");
      const { order } = await res.json();
      const value = order.amount / 100;
      const items = [courseItem(courseId, courseTitle, value)];
      const openedAt = Date.now();
      track("begin_checkout", { currency: order.currency, value, items, is_logged_in: Boolean(user) });

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
            // transaction_id is Razorpay's order id (not personal data); GA4
            // dedupes purchases on it.
            track("purchase", {
              transaction_id: response.razorpay_order_id,
              currency: order.currency,
              value,
              items,
              seconds_to_pay: Math.round((Date.now() - openedAt) / 1000),
            });
            void clarityTag("buyer", "yes");
            await completeSignIn(await verifyRes.json(), email);
          } catch {
            track("checkout_error", { stage: "verify" });
            setStatusMessage(
              "Payment succeeded but we couldn't confirm it — contact support with your payment ID."
            );
          }
        },
        modal: {
          ondismiss: () => {
            // How long they sat in the payment window before leaving: a few
            // seconds = bounced at the price; minutes = got stuck paying.
            track("checkout_dismissed", { value, seconds_open: Math.round((Date.now() - openedAt) / 1000) });
            setStatusMessage("Checkout cancelled.");
          },
        },
        prefill: { email },
      });
      // Razorpay tells us *why* an attempt failed (cancelled at the bank page,
      // card declined, UPI timeout...). The server webhook records the same
      // thing authoritatively; this puts it in GA4/Clarity next to the session.
      razorpay.on("payment.failed", (response) => {
        const e = response?.error ?? {};
        track("payment_failed", {
          error_code: e.code?.slice(0, 60),
          error_reason: e.reason?.slice(0, 60),
          error_step: e.step?.slice(0, 60),
          error_source: e.source?.slice(0, 40),
          error_description: e.description?.slice(0, 100),
          value,
        });
        void clarityTag("payment_failed", e.reason?.slice(0, 40) || "yes");
      });
      razorpay.open();
    } catch {
      track("checkout_error", { stage: "create_order" });
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
      <form onSubmit={handleCheckout}>
        {showEmailField && !user && (
          <div className="mb-3">
            <label htmlFor="guest-email" className="sr-only">
              Your email
            </label>
            <input
              id="guest-email"
              type="email"
              data-clarity-mask="true"
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
          <p data-clarity-mask="true" className="mb-3 border border-black bg-neutral-50 px-3 py-2 text-sm">{infoMessage}</p>
        )}

        <AcceptTerms id="checkout-accept" checked={accepted} onChange={setAccepted} className="mb-3" refunds />

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
