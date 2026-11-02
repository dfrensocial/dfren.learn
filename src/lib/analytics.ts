"use client";

import { getFirebaseAnalytics, peekFirebaseAnalytics } from "@/lib/firebase/client";
import { CONSENT_EVENT, CONSENT_KEY, analyticsConsented, currentChoices, replayConsented } from "@/lib/consent";
import { clearAttribution } from "@/lib/attribution";

// ---------------------------------------------------------------------------
// Consent. Nothing in this file runs for a visitor who hasn't said yes:
//   analytics -> GA4 events, GA ids on orders
//   replay    -> Microsoft Clarity
// The choices live in consent.ts (banner + "Privacy settings" write them).
// When someone withdraws, collection stops straight away and the cookies and
// stored attribution we can reach on their device are removed.
// ---------------------------------------------------------------------------

export const analyticsAllowed = analyticsConsented;
export const replayAllowed = replayConsented;

const IS_DEV = process.env.NODE_ENV !== "production";

// Owner/admin tools never send anything: /admin, /watermark, and the sign-in
// callback URL (its query string holds a one-time sign-in code).
const EXCLUDED_PATHS = ["/admin", "/watermark"];
const onExcludedPath = () =>
  EXCLUDED_PATHS.some((p) => window.location.pathname.startsWith(p)) ||
  /[?&](oobCode|apiKey)=/.test(window.location.search);

/** Deletes cookies we can reach (first-party) whose names match, on every parent domain they may sit on. */
function deleteCookies(match: RegExp) {
  try {
    const host = window.location.hostname;
    const parts = host.split(".");
    const domains = [undefined, host, ...parts.slice(1, -1).map((_, i) => "." + parts.slice(i + 1).join("."))];
    for (const pair of document.cookie.split("; ")) {
      const name = pair.split("=")[0];
      if (!name || !match.test(name)) continue;
      for (const d of domains) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
      }
    }
  } catch {
    // best effort
  }
}

// ---------------------------------------------------------------------------
// Microsoft Clarity (session replays + heatmaps). Public project id; override
// with NEXT_PUBLIC_CLARITY_PROJECT_ID if it ever changes. In dev only when
// explicitly enabled so local testing doesn't land in the real project.
// Never identifies the visitor: no account id, email or name is sent to it.
// ---------------------------------------------------------------------------
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "z7b92h65ey";
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
  if (typeof window === "undefined" || !replayAllowed()) return false;
  if (IS_DEV && process.env.NEXT_PUBLIC_CLARITY_IN_DEV !== "true") return false;
  return !onExcludedPath();
}

/** Starts Clarity once (if the visitor allowed recordings). Safe to call repeatedly. */
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
  const granted = replayAllowed();
  try {
    // Analytics storage only -- no advertising storage, ever.
    clarity.consentV2({ ad_Storage: "denied", analytics_Storage: granted ? "granted" : "denied" });
    clarity.consent(granted);
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

// ---------------------------------------------------------------------------
// React to the visitor changing their mind.
// ---------------------------------------------------------------------------
let applied = { analytics: false, replay: false };

async function setGoogleEnabled(enabled: boolean) {
  const pending = peekFirebaseAnalytics();
  if (!pending) return;
  try {
    const analytics = await pending;
    if (!analytics) return;
    const { setAnalyticsCollectionEnabled, setConsent } = await import("firebase/analytics");
    setAnalyticsCollectionEnabled(analytics, enabled);
    setConsent({ analytics_storage: enabled ? "granted" : "denied" });
  } catch {
    // ignore
  }
}

/**
 * Removes everything analytics may have left on this device. Safe to run any
 * time analytics is off -- it also cleans up after visitors from before the
 * consent banner existed, who had these set by default.
 */
function purgeAnalyticsLeftovers() {
  clearAttribution();
  deleteCookies(/^_ga(_.*)?$/);
  try {
    if (indexedDB.databases) {
      // The id Google Analytics keeps. (Only deleted if it exists.)
      void indexedDB
        .databases()
        .then((dbs) => {
          if (dbs.some((d) => d.name === "firebase-installations-database")) {
            indexedDB.deleteDatabase("firebase-installations-database");
          }
        })
        .catch(() => {});
    }
  } catch {
    // ignore
  }
}

function purgeReplayLeftovers() {
  deleteCookies(/^(_clck|_clsk|CLID|ANONCHK|MR|MUID|SM)$/);
}

function onConsentChange() {
  const now = currentChoices();
  if (applied.analytics && !now.analytics) void setGoogleEnabled(false);
  else if (!applied.analytics && now.analytics) void setGoogleEnabled(true);
  if (!now.analytics) purgeAnalyticsLeftovers();
  if (applied.replay !== now.replay) void applyClarityConsent();
  if (!now.replay) purgeReplayLeftovers();
  applied = now;
}

if (typeof window !== "undefined") {
  applied = currentChoices();
  window.addEventListener(CONSENT_EVENT, onConsentChange);
  // The choice was changed in another tab: stop here too, straight away.
  window.addEventListener("storage", (e) => {
    if (e.key === CONSENT_KEY || e.key === null) onConsentChange();
  });
  if (!applied.analytics) purgeAnalyticsLeftovers();
  if (!applied.replay) purgeReplayLeftovers();
}

/**
 * Sends an event to GA4 (via Firebase) and, for key moments, Clarity. Never
 * throws and never blocks the UI. Does nothing for visitors who haven't opted
 * in. Events must NOT carry personal data (no emails, names or payment
 * details): only ids, counts and the course price.
 *
 * Outside production, GA events are flagged debug_mode so they show in GA4's
 * DebugView but stay out of the real reports.
 */
export async function track(name: string, params: Record<string, unknown> = {}): Promise<void> {
  try {
    if (typeof window === "undefined" || onExcludedPath()) return;
    if (CLARITY_EVENTS.has(name) && replayAllowed()) {
      void initClarity().then((c) => {
        try {
          c?.event(name);
        } catch {
          // ignore
        }
      });
    }
    if (!analyticsAllowed()) return;
    const analytics = await getFirebaseAnalytics();
    if (!analytics) return;
    const { logEvent } = await import("firebase/analytics");
    // page_location is pinned to origin + path so a query string (one-time
    // sign-in codes, redirect targets) never reaches Google.
    const base = { page_location: window.location.origin + window.location.pathname, ...params };
    logEvent(analytics, name, IS_DEV ? { ...base, debug_mode: true } : base);
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
