"use client";

import { LEGAL } from "@/content/legal";

// The "I'm 18+ and agree to the Terms / read the Privacy Policy" box shown at
// login and before paying. This is NOT consent to analytics (that is the
// separate, optional banner in consent.ts) -- it covers only what is needed to
// give the service. We keep proof of what was agreed and when: the versions go
// to the server with the session (account) and with every order.

const KEY = "dfrenlearn:terms-accepted";

export type Acceptance = { terms: string; privacy: string; at: string };

function read(): Acceptance | undefined {
  try {
    const a = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Acceptance | null;
    if (a && a.terms === LEGAL.termsVersion && a.privacy === LEGAL.privacyVersion && typeof a.at === "string") return a;
  } catch {
    // ignore
  }
  return undefined;
}

/** The acceptance on this device, only if it is for the current versions of both documents. */
export const getAcceptance = read;
export const hasAcceptedCurrent = () => read() !== undefined;

/** Call at the moment the person acts on a ticked box. */
export function recordAcceptance(at?: string): Acceptance {
  const existing = read();
  if (existing) return existing;
  const a: Acceptance = { terms: LEGAL.termsVersion, privacy: LEGAL.privacyVersion, at: at ?? new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    // storage blocked: still returned, so the request that follows carries it
  }
  return a;
}

/**
 * Sign-in links carry the versions the person agreed to when they asked for
 * the link, so opening the link on another device still records it.
 */
export function addAcceptanceParams(url: URL) {
  url.searchParams.set("tv", LEGAL.termsVersion);
  url.searchParams.set("pv", LEGAL.privacyVersion);
  url.searchParams.set("ta", (read() ?? recordAcceptance()).at);
}

/**
 * ONLY call this once a sign-in link has been verified (the person proved they
 * own the inbox that asked for it). Never on a plain page visit, so a crafted
 * URL can't pre-tick or record anything.
 */
export function adoptAcceptanceFromParams(params: URLSearchParams) {
  if (params.get("tv") !== LEGAL.termsVersion || params.get("pv") !== LEGAL.privacyVersion || read()) return;
  const t = Date.parse(params.get("ta") ?? "");
  const plausible = Number.isFinite(t) && t <= Date.now() + 60_000 && Date.now() - t < 7 * 24 * 3600_000;
  recordAcceptance(plausible ? new Date(t).toISOString() : undefined);
}
