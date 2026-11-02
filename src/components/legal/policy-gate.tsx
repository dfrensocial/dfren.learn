"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "firebase/auth";
import { LEGAL } from "@/content/legal";
import { recordAcceptance } from "@/lib/legal-acceptance";
import { endExpiredSession } from "@/lib/firebase/auth-context";
import { AcceptTerms } from "@/components/legal/accept-terms";

// "We've updated our policies" gate for the dashboard.
//
// When LEGAL.termsVersion or LEGAL.privacyVersion changes, nobody has an
// acceptance doc for the new pair yet, so /api/legal/status says `accepted:
// false` and the dashboard shows the dialog below instead of the courses. It
// can't be dismissed: only accepting (or logging out) gets past it. The server
// enforces the same rule on playback and downloads, so hiding the UI is not the
// only thing standing in the way.

export type PolicyStatus = "checking" | "ok" | "needed" | "error";

/** Reloads to pick up newer policy text, but never in a loop (e.g. a stale cache). False = didn't reload. */
function reloadOnce(): boolean {
  const key = "dfrenlearn:policy-reload";
  try {
    const last = Number(window.sessionStorage.getItem(key) ?? 0);
    if (Date.now() - last < 60_000) return false;
    window.sessionStorage.setItem(key, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

export function usePolicyGate(user: User | null) {
  const [status, setStatus] = useState<PolicyStatus>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // Deferred so every setState runs from a callback, not directly in the effect body.
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setStatus("checking");
      try {
        const res = await fetch("/api/legal/status", {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` },
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 401) {
          const body = await res.json().catch(() => null);
          if (body?.code === "session-expired") await endExpiredSession();
          setStatus("error");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const body = (await res.json()) as { accepted?: boolean; terms?: string; privacy?: string };
        // The server's idea of "current" must match this page's. If a newer deploy
        // changed the versions under an open tab, reload to pick up the new text.
        if (body.terms !== LEGAL.termsVersion || body.privacy !== LEGAL.privacyVersion) {
          if (!reloadOnce()) setStatus("error");
          return;
        }
        setStatus(body.accepted ? "ok" : "needed");
      } catch {
        if (!cancelled) setStatus("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user, attempt]);

  return {
    status,
    retry: () => setAttempt((n) => n + 1),
    accepted: () => setStatus("ok"),
  };
}

export function PolicyUpdateDialog({
  user,
  onAccepted,
  onLogout,
}: {
  user: User;
  onAccepted: () => void;
  onLogout: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function accept() {
    if (!checked || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/legal/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ terms: LEGAL.termsVersion, privacy: LEGAL.privacyVersion }),
      });
      if (res.status === 409) {
        // The policies changed again: show the new text.
        if (reloadOnce()) return;
        throw new Error("stale");
      }
      if (!res.ok) throw new Error("accept failed");
      recordAcceptance(); // remembered on this device, so later sign-ins carry it too
      onAccepted();
    } catch {
      setError("Couldn't save that. Please check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-update-heading"
        className="max-h-full w-full max-w-md overflow-y-auto border border-black bg-white p-6 text-sm text-black shadow-xl"
      >
        <h2 id="policy-update-heading" ref={headingRef} tabIndex={-1} className="text-lg font-bold outline-none">
          We&apos;ve updated our policies
        </h2>
        <p className="mt-3 leading-relaxed text-neutral-700">
          Our policies changed (last updated {LEGAL.updated}). Please read them and accept to keep using your
          courses.
        </p>
        <ul className="mt-3 space-y-1 underline">
          <li>
            <Link href="/terms" target="_blank">
              Terms of service
            </Link>
          </li>
          <li>
            <Link href="/privacy" target="_blank">
              Privacy policy
            </Link>
          </li>
          <li>
            <Link href="/refund-policy" target="_blank">
              Cancellation and refund policy
            </Link>
          </li>
        </ul>

        <AcceptTerms id="policy-update-accept" checked={checked} onChange={setChecked} className="mt-5" />

        {error && (
          <p role="alert" className="mt-3 text-red-600">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={accept}
            disabled={!checked || busy}
            className="border border-black bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Saving…" : "Accept and continue"}
          </button>
          <button type="button" onClick={onLogout} className="underline">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
