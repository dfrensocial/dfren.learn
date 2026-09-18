"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { syncSessionCookie } from "@/lib/firebase/auth-context";

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
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  // Lazy initial state (not a setState-in-effect) so we know synchronously,
  // before the first paint, whether this load is completing an email-link sign-in.
  const [completingLink, setCompletingLink] = useState(
    () => typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)
  );

  // Guest-checkout accounts have no password — this completes the sign-in
  // when the user arrives here from the emailed link.
  useEffect(() => {
    if (!completingLink) return;

    // Deferred to a microtask so every setState below runs from a callback,
    // not directly in the effect body.
    Promise.resolve().then(async () => {
      const storedEmail = window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
      const emailForLink = storedEmail ?? window.prompt("Confirm your email to finish logging in");
      if (!emailForLink) {
        setCompletingLink(false);
        return;
      }

      try {
        const { user } = await signInWithEmailLink(auth, emailForLink, window.location.href);
        window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
        await syncSessionCookie(user);
        router.push(searchParams.get("redirect") ?? "/dashboard");
      } catch {
        setError("That sign-in link is invalid or has expired.");
        setCompletingLink(false);
      }
    });
  }, [completingLink, router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await syncSessionCookie(user);
      router.push(searchParams.get("redirect") ?? "/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
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
      if (redirect) url.searchParams.set("redirect", redirect);

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

  if (completingLink) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
        <p className="text-neutral-600">Signing you in...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Log in</h1>

      {linkSent ? (
        <p className="mt-6 text-sm text-neutral-600">
          Check <span className="font-medium">{email}</span> for a link to log in
          — this is how you sign in if you bought the course as a guest and
          never set a password.
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-neutral-500">
            Bought the course as a guest and never set a password?
          </p>
          <button
            onClick={handleSendLink}
            disabled={submitting}
            className="mt-1 text-sm font-medium underline disabled:opacity-50"
          >
            Email me a sign-in link instead
          </button>
        </>
      )}
    </main>
  );
}
