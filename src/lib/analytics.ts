"use client";

import { getFirebaseAnalytics } from "@/lib/firebase/client";

// ---------------------------------------------------------------------------
// Consent. The cookie banner (to be added last) calls setAnalyticsConsent().
// Until it ships, REQUIRE_EXPLICIT_CONSENT stays false and analytics runs by
// default (the privacy policy discloses it). Flipping that one constant to
// true makes every event -- GA4 and Clarity -- wait for an explicit "Accept".
// ---------------------------------------------------------------------------
const REQUIRE_EXPLICIT_CONSENT = false;
const CONSENT_KEY = "dfrenlearn:analytics-consent"; // "granted" | "denied"

export function setAnalyticsConsent(granted: boolean) {
  try {
    window.localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  } catch {
    // Storage unavailable: treated as "no choice made".
  }
  // Clarity may already be running (e.g. consent withdrawn later): tell it.
  void applyClarityConsent();
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

// ---------------------------------------------------------------------------
// Microsoft Clarity (session replays + heatmaps). Public project id; override
// with NEXT_PUBLIC_CLARITY_PROJECT_ID if it ever changes. Never runs on the
// admin tools, and in dev only when explicitly enabled so local testing
// doesn't land in the real project.
// ---------------------------------------------------------------------------
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "z7b92h65ey";
// Owner/admin tools: never sent to GA4 or recorded by Clarity.
const EXCLUDED_PATHS = ["/admin", "/watermark"];
const onExcludedPath = () => EXCLUDED_PATHS.some((p) => window.location.pathname.startsWith(p));
// A few high-signal moments become named Clarity events, so recordings can be
// filtered ("show me sessions where payment_failed happened").
const CLARITY_EVENTS = new Set([
  "cta_click",
  "checkout_email_prompt",
  "begin_checkout",
  "payment_failed",
  "checkout_dismissed",
  "checkout_error",
  "purchase",
  "login",
  "lesson_start",
  "lesson_complete",
]);

type ClarityApi = typeof import("@microsoft/clarity").default;
let clarityPromise: Promise<ClarityApi | null> | null = null;

function clarityWanted(): boolean {
  if (typeof window === "undefined" || !analyticsAllowed()) return false;
  if (IS_DEV && process.env.NEXT_PUBLIC_CLARITY_IN_DEV !== "true") return false;
  return !onExcludedPath();
}

/** Starts Clarity once (if allowed). Safe to call repeatedly. */
export function initClarity(): Promise<ClarityApi | null> {
  if (!clarityWanted()) return Promise.resolve(null);
  if (!clarityPromise) {
    clarityPromise = import("@microsoft/clarity")
      .then((m) => {
        m.default.init(CLARITY_PROJECT_ID);
        return m.default;
      })
      .catch(() => null);
    void applyClarityConsent();
  }
  return clarityPromise;
}

async function applyClarityConsent() {
  if (!clarityPromise) return;
  const clarity = await clarityPromise;
  if (!clarity) return;
  const granted = analyticsAllowed();
  try {
    clarity.consentV2({ ad_Storage: granted ? "granted" : "denied", analytics_Storage: granted ? "granted" : "denied" });
  } catch {
    // ignore
  }
}

/** Tags the current Clarity session (e.g. channel, buyer) for filtering. No personal data. */
export async function clarityTag(key: string, value: string) {
  const clarity = await initClarity();
  try {
    clarity?.setTag(key, value);
  } catch {
    // ignore
  }
}

/** Links Clarity sessions of one signed-in person together via their opaque Firebase uid (Clarity hashes it). */
export async function clarityIdentify(uid: string) {
  const clarity = await initClarity();
  try {
    clarity?.identify(uid);
  } catch {
    // ignore
  }
}

/**
 * Sends an event to GA4 (via Firebase) and, for key moments, Clarity. Never
 * throws and never blocks the UI. Events must NOT carry personal data (no
 * emails, names or payment details): only ids, counts and the course price.
 *
 * Outside production, GA events are flagged debug_mode so they show in GA4's
 * DebugView but stay out of the real reports.
 */
export async function track(name: string, params: Record<string, unknown> = {}): Promise<void> {
  try {
    if (!analyticsAllowed() || onExcludedPath()) return;
    if (CLARITY_EVENTS.has(name)) {
      void initClarity().then((c) => {
        try {
          c?.event(name);
        } catch {
          // ignore
        }
      });
    }
    const analytics = await getFirebaseAnalytics();
    if (!analytics) return;
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, name, IS_DEV ? { ...params, debug_mode: true } : params);
  } catch {
    // Analytics must never break the page (ad blockers, offline, etc.).
  }
}

/**
 * The visitor's GA4 client/session ids, read from GA's own first-party cookies.
 * Sent with the order so the server can attach the purchase to the right GA
 * session. Returns undefined when analytics is off or GA never ran (blocked,
 * opted out): then nothing is sent server-side either.
 */
export function getGaIds(): { clientId: string; sessionId?: string } | undefined {
  try {
    if (!analyticsAllowed() || onExcludedPath()) return undefined;
    const cookies = Object.fromEntries(
      document.cookie.split("; ").map((c) => {
        const i = c.indexOf("=");
        return [c.slice(0, i), c.slice(i + 1)];
      })
    );
    // _ga = GA1.<n>.<random>.<firstVisitTs>
    const m = /^GA\d\.\d+\.(\d+)\.(\d+)$/.exec(cookies["_ga"] ?? "");
    if (!m) return undefined;
    const clientId = `${m[1]}.${m[2]}`;
    // _ga_<ID> = GS2.1.s<sessionTs>$o... (newer) or GS1.1.<sessionTs>.<n>... (older)
    const stream = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.replace(/^G-/, "") ?? "9F466RVWND";
    const raw = cookies[`_ga_${stream}`] ?? "";
    const s = /^GS2\.\d+\.s(\d+)/.exec(raw) ?? /^GS1\.\d+\.(\d+)\./.exec(raw);
    return { clientId, sessionId: s?.[1] };
  } catch {
    return undefined;
  }
}

/** GA4 ecommerce item for the course. Price is in rupees. */
export function courseItem(courseId: string, courseTitle: string, priceInRupees: number) {
  return { item_id: courseId, item_name: courseTitle, price: priceInRupees, quantity: 1 };
}
