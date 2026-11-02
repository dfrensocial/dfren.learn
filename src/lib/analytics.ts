"use client";

import { getFirebaseAnalytics } from "@/lib/firebase/client";

// ---------------------------------------------------------------------------
// Consent. The cookie banner (to be added last) calls setAnalyticsConsent().
// Until it ships, REQUIRE_EXPLICIT_CONSENT stays false and analytics runs by
// default (the privacy policy discloses it). Flipping that one constant to
// true makes every event wait for an explicit "Accept" -- nothing else changes.
// ---------------------------------------------------------------------------
const REQUIRE_EXPLICIT_CONSENT = false;
const CONSENT_KEY = "dfrenlearn:analytics-consent"; // "granted" | "denied"

export function setAnalyticsConsent(granted: boolean) {
  try {
    window.localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  } catch {
    // Storage unavailable: treated as "no choice made".
  }
}

function browserOptedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  // Honour the browser-level signals people set to say "don't track me".
  return nav.globalPrivacyControl === true || navigator.doNotTrack === "1";
}

export function analyticsAllowed(): boolean {
  if (typeof window === "undefined" || browserOptedOut()) return false;
  let choice: string | null = null;
  try {
    choice = window.localStorage.getItem(CONSENT_KEY);
  } catch {
    // ignore
  }
  if (choice === "denied") return false;
  return REQUIRE_EXPLICIT_CONSENT ? choice === "granted" : true;
}

const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * Sends a GA4 event via Firebase Analytics. Never throws and never blocks the
 * UI. Events must NOT carry personal data (no emails, names or payment details):
 * only ids, counts and the course price.
 *
 * Outside production, events are flagged debug_mode so they show in GA4's
 * DebugView but stay out of the real reports.
 */
export async function track(name: string, params: Record<string, unknown> = {}): Promise<void> {
  try {
    if (!analyticsAllowed()) return;
    const analytics = await getFirebaseAnalytics();
    if (!analytics) return;
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, name, IS_DEV ? { ...params, debug_mode: true } : params);
  } catch {
    // Analytics must never break the page (ad blockers, offline, etc.).
  }
}

/** GA4 ecommerce item for the course. Price is in rupees. */
export function courseItem(courseId: string, courseTitle: string, priceInRupees: number) {
  return { item_id: courseId, item_name: courseTitle, price: priceInRupees, quantity: 1 };
}
