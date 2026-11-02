"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { syncSessionCookie, refreshSessionCookie, useAuth } from "@/lib/firebase/auth-context";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { track } from "@/lib/analytics";
import { AcceptTerms } from "@/components/legal/accept-terms";
import { PrivacySettingsLink } from "@/components/consent/privacy-settings-link";
import { addAcceptanceParams, adoptAcceptanceFromParams, hasAcceptedCurrent, recordAcceptance } from "@/lib/legal-acceptance";
import { LOGIN_EMAIL_KEY as EMAIL_LINK_STORAGE_KEY, forgetLoginEmail, purgeStaleLoginEmail, rememberLoginEmail } from "@/lib/login-email";

// Politeness + abuse brake: one sign-in email per browser per minute. Kept in
// localStorage so a page refresh doesn't reset it. (Firebase enforces its own
// server-side limits too; this just stops accidental double-sends and
// hammering from the UI.)
const LINK_SENT_AT_KEY = "dfrenlearn:link-sent-at";
const RESEND_COOLDOWN_SECONDS = 60;

function secondsUntilResend(): number {
  try {
    const sentAt = Number(window.localStorage.getItem(LINK_SENT_AT_KEY) ?? 0);
    return Math.max(0, Math.ceil((sentAt + RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

// The one-time sign-in code in the address bar must not stay there (history,
// analytics). Keeps the redirect target.
function stripSignInParams() {
  try {
    const url = new URL(window.location.href);
    for (const k of ["oobCode", "apiKey", "mode", "lang", "continueUrl", "tv", "pv", "ta"]) url.searchParams.delete(k);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  } catch {
    // ignore
  }
}

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
  const { user: signedInUser, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  // The required "18+, agree to Terms, read the Privacy Policy" box (unticked unless already ticked for these versions).
  const [accepted, setAccepted] = useState(false);
  // null until we've looked at the URL after mount. It can't be decided during
  // render: the server has no window, so reading it there makes the server
  // HTML (the form) disagree with the browser's first render ("Signing you
  // in...") whenever the page is opened from an emailed link — a hydration
  // mismatch. Both sides render the same blank shell until this resolves.
  const [linkMode, setLinkMode] = useState<boolean | null>(null);
  const completingLink = linkMode === true;
  // Set when there's no cached email for the link (different browser/device)
  // and we need to ask for it inline instead of a jarring window.prompt().
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  async function finishEmailLinkSignIn(emailForLink: string) {
    try {
      const { user } = await signInWithEmailLink(auth, emailForLink, window.location.href);
      // The link is verified: if it was opened on another device than the one
      // that asked for it, carry over what was agreed there (before the session
      // call below, which records it on the account).
      adoptAcceptanceFromParams(searchParams);
      forgetLoginEmail();
      stripSignInParams();
      await syncSessionCookie(user);
      track("login", { method: "email_link" });
      router.push(safeRedirectPath(searchParams.get("redirect")));
    } catch {
      stripSignInParams();
      track("login_link_invalid");
      setError("That sign-in link is invalid or has expired.");
      setLinkMode(false);
      setNeedsEmailConfirm(false);
    }
  }

  useEffect(() => {
    // Deferred to a microtask so the setState runs from a callback, not
    // directly in the effect body.
    Promise.resolve().then(() => {
      purgeStaleLoginEmail();
      setAccepted(hasAcceptedCurrent());
      setLinkMode(isSignInWithEmailLink(auth, window.location.href));
    });
  }, []);

  // Already signed in (Firebase keeps the login in the browser much longer than
  // our 5-day server cookie): re-issue the cookie and carry on, instead of
  // making the user request another emailed link. If the server refuses (e.g.
  // the session was revoked) drop the stale login so the form works normally.
  useEffect(() => {
    if (authLoading || !signedInUser || linkMode !== false) return;
    let cancelled = false;
    refreshSessionCookie(signedInUser).then(async (ok) => {
      if (cancelled) return;
      if (ok) router.replace(safeRedirectPath(searchParams.get("redirect")));
      else await signOut(auth).catch(() => {});
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, signedInUser, linkMode]);

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

  // Counts the resend cooldown down; also picks it up again after a refresh.
  useEffect(() => {
    const tick = () => setCooldownLeft(secondsUntilResend());
    Promise.resolve().then(tick);
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  async function handleSendLink() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    const wait = secondsUntilResend();
    if (wait > 0) {
      setError(`Please wait ${wait}s before requesting another link.`);
      return;
    }
    if (!accepted) {
      setError("Please tick the box to agree to the Terms and Privacy Policy.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      recordAcceptance();
      const redirect = searchParams.get("redirect");
      const url = new URL("/login", window.location.origin);
      if (redirect) url.searchParams.set("redirect", safeRedirectPath(redirect));
      addAcceptanceParams(url);

      await sendSignInLinkToEmail(auth, email, {
        url: url.toString(),
        handleCodeInApp: true,
      });
      rememberLoginEmail(email);
      window.localStorage.setItem(LINK_SENT_AT_KEY, String(Date.now()));
      setCooldownLeft(RESEND_COOLDOWN_SECONDS);
      setLinkSent(true);
      track("login_link_requested");
    } catch (err) {
      const code = (err as { code?: string } | null)?.code ?? "";
      setError(
        code === "auth/too-many-requests" || code === "auth/quota-exceeded"
          ? "Too many sign-in requests right now. Please wait a few minutes and try again."
          : code === "auth/invalid-email"
            ? "That doesn't look like a valid email address."
            : "Couldn't send a sign-in link to that address."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (linkMode === null || authLoading) {
    return <main className="min-h-screen w-full bg-white" />;
  }

  // Already signed in: the effect above is re-issuing the session cookie and
  // redirecting. Don't flash the form meanwhile.
  if (signedInUser && linkMode === false) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-white px-6 text-black">
        <p className="text-neutral-600">Signing you in...</p>
      </main>
    );
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
              data-clarity-mask="true"
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
        <div className="mt-6 text-sm text-neutral-600">
          <p>
            Check <span className="font-medium" data-clarity-mask="true">{email}</span> for your sign-in
            link. It can take a minute — look in spam if it doesn&apos;t show up.
          </p>
          {error && <p className="mt-3 text-red-600">{error}</p>}
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={handleSendLink}
              disabled={submitting || cooldownLeft > 0}
              className="font-medium text-black underline disabled:text-neutral-400 disabled:no-underline"
            >
              {submitting ? "Sending..." : cooldownLeft > 0 ? `Resend in ${cooldownLeft}s` : "Resend link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkSent(false);
                setError(null);
              }}
              className="font-medium text-black underline"
            >
              Use a different email
            </button>
          </div>
        </div>
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
              data-clarity-mask="true"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-black px-3 py-2"
            />
            <AcceptTerms id="login-accept" checked={accepted} onChange={setAccepted} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting || cooldownLeft > 0 || !accepted}
              className="bg-black px-4 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {submitting ? "Sending..." : cooldownLeft > 0 ? `Wait ${cooldownLeft}s` : "Email me a sign-in link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            New here?{" "}
            <Link href="/#pricing" className="font-medium underline">
              Buy the course
            </Link>{" "}
            — that creates your account automatically.
          </p>
          <p className="mt-3 text-center text-xs text-neutral-400">
            <PrivacySettingsLink className="underline hover:text-neutral-600" />
          </p>
        </>
      )}
      </div>
    </main>
  );
}
