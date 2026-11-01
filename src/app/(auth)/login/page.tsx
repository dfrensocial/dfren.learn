"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { syncSessionCookie } from "@/lib/firebase/auth-context";
import { safeRedirectPath } from "@/lib/safe-redirect";

const EMAIL_LINK_STORAGE_KEY = "dfrenlearn:login-email";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  // Lazy initial state (not a setState-in-effect) so we know synchronously,
  // before the first paint, whether this load is completing an email-link sign-in.
  const [completingLink, setCompletingLink] = useState(
    () => typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)
  );
  // Set when there's no cached email for the link (different browser/device)
  // and we need to ask for it inline instead of a jarring window.prompt().
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  async function finishEmailLinkSignIn(emailForLink: string) {
    try {
      const { user } = await signInWithEmailLink(auth, emailForLink, window.location.href);
      window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
      await syncSessionCookie(user);
      router.push(safeRedirectPath(searchParams.get("redirect")));
    } catch {
      setError("That sign-in link is invalid or has expired.");
      setCompletingLink(false);
      setNeedsEmailConfirm(false);
    }
  }

  // Guest-checkout accounts have no password — this completes the sign-in
  // when the user arrives here from the emailed link.
  useEffect(() => {
    if (!completingLink) return;

    // Deferred to a microtask so every setState below runs from a callback,
    // not directly in the effect body.
    Promise.resolve().then(() => {
      const storedEmail = window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
      if (!storedEmail) {
        setNeedsEmailConfirm(true);
        return;
      }
      finishEmailLinkSignIn(storedEmail);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completingLink]);

  function handleConfirmEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmEmail) return;
    finishEmailLinkSignIn(confirmEmail);
  }

  async function handleSendLink() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const redirect = searchParams.get("redirect");
      const url = new URL("/login", window.location.origin);
      if (redirect) url.searchParams.set("redirect", safeRedirectPath(redirect));

      await sendSignInLinkToEmail(auth, email, {
        url: url.toString(),
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email);
      setLinkSent(true);
    } catch {
      setError("Couldn't send a sign-in link to that address.");
    } finally {
      setSubmitting(false);
    }
  }

  if (completingLink && needsEmailConfirm) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-6 text-black">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight">Confirm your email</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Enter the email this sign-in link was sent to.
          </p>
          <form onSubmit={handleConfirmEmailSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              autoFocus
              placeholder="Email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="border border-black px-3 py-2"
            />
            <button
              type="submit"
              className="bg-black px-4 py-3 font-semibold text-white transition hover:bg-neutral-800"
            >
              Continue
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (completingLink) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-white px-6 text-black">
        <p className="text-neutral-600">Signing you in...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white px-6 text-black">
      <div className="w-full max-w-sm">
      <Link href="/" className="mb-8 text-lg font-bold tracking-tight">
        dfren<span className="text-neutral-400">Learn</span>
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Log in</h1>

      {linkSent ? (
        <p className="mt-6 text-sm text-neutral-600">
          Check <span className="font-medium">{email}</span> for your sign-in
          link. It can take a minute — look in spam if it doesn&apos;t show up.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-neutral-600">
            Enter the email you bought the course with and we&apos;ll send you a
            one-click sign-in link. No password needed.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendLink();
            }}
            className="mt-6 flex flex-col gap-3"
          >
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-black px-3 py-2"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="bg-black px-4 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Email me a sign-in link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            New here?{" "}
            <Link href="/#pricing" className="font-medium underline">
              Buy the course
            </Link>{" "}
            — that creates your account automatically.
          </p>
        </>
      )}
      </div>
    </main>
  );
}
