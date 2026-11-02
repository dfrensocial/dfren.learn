"use client";

// First-touch / last-touch traffic attribution, kept in the visitor's own
// browser and attached to the order when checkout starts -- so the order
// ledger can answer "which channel/campaign produced this buyer?" with our own
// data, independent of ad blockers on the analytics side.
//
// Holds marketing parameters and a referrer *host* only: no email, no full
// URLs with query strings, nothing personal.

export type Touch = {
  source: string; // e.g. google, instagram, newsletter, direct
  medium: string; // organic, cpc, social, referral, email, none, ...
  campaign?: string;
  term?: string;
  content?: string;
  referrerHost?: string;
  landingPath: string;
  at: string; // ISO time of that visit
};

export type Attribution = {
  first?: Touch;
  last?: Touch;
  visits: number; // sessions seen in this browser
};

const FIRST_KEY = "dfrenlearn:first-touch";
const LAST_KEY = "dfrenlearn:last-touch";
const VISITS_KEY = "dfrenlearn:visit-count";
const SESSION_FLAG = "dfrenlearn:session-counted";

const SEARCH = [
  "google", "bing", "duckduckgo", "yahoo", "baidu", "yandex", "ecosia", "brave", "startpage",
];
const SOCIAL: Record<string, string> = {
  "facebook.com": "facebook", "l.facebook.com": "facebook", "m.facebook.com": "facebook",
  "instagram.com": "instagram", "l.instagram.com": "instagram",
  "t.co": "twitter", "twitter.com": "twitter", "x.com": "twitter",
  "linkedin.com": "linkedin", "lnkd.in": "linkedin",
  "youtube.com": "youtube", "m.youtube.com": "youtube", "youtu.be": "youtube",
  "reddit.com": "reddit", "pinterest.com": "pinterest",
  "wa.me": "whatsapp", "web.whatsapp.com": "whatsapp", "t.me": "telegram", "telegram.org": "telegram",
};

function clean(v: string | null | undefined, max = 80): string | undefined {
  const s = (v ?? "").trim().toLowerCase().slice(0, max);
  return s || undefined;
}

/** Works out where the current page load came from. */
export function classifyVisit(href: string, referrer: string, ownHost: string): Touch {
  const url = new URL(href);
  const p = url.searchParams;
  const base = {
    campaign: clean(p.get("utm_campaign")),
    term: clean(p.get("utm_term")),
    content: clean(p.get("utm_content")),
    landingPath: url.pathname.slice(0, 120),
    at: new Date().toISOString(),
  };

  let refHost: string | undefined;
  try {
    refHost = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : undefined;
  } catch {
    refHost = undefined;
  }
  if (refHost === ownHost.replace(/^www\./, "")) refHost = undefined; // internal, not a source

  const utmSource = clean(p.get("utm_source"));
  if (utmSource) {
    return { ...base, source: utmSource, medium: clean(p.get("utm_medium")) ?? "campaign", referrerHost: refHost };
  }
  // Ad-click ids appended by the ad platforms themselves.
  if (p.get("gclid") || p.get("gbraid") || p.get("wbraid")) return { ...base, source: "google", medium: "cpc", referrerHost: refHost };
  if (p.get("msclkid")) return { ...base, source: "bing", medium: "cpc", referrerHost: refHost };
  if (p.get("fbclid")) return { ...base, source: refHost && SOCIAL[refHost] ? SOCIAL[refHost] : "facebook", medium: "social", referrerHost: refHost };

  if (refHost) {
    const searchHit = SEARCH.find((s) => refHost!.split(".").includes(s));
    if (searchHit) return { ...base, source: searchHit, medium: "organic", referrerHost: refHost };
    if (SOCIAL[refHost]) return { ...base, source: SOCIAL[refHost], medium: "social", referrerHost: refHost };
    return { ...base, source: refHost, medium: "referral", referrerHost: refHost };
  }
  return { ...base, source: "direct", medium: "none" };
}

function read(key: string): Touch | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Touch) : undefined;
  } catch {
    return undefined;
  }
}

function write(key: string, value: Touch) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode): attribution just isn't kept.
  }
}

/** Call once per full page load. First touch is set once; last touch follows any non-direct visit. */
export function captureAttribution(): Touch {
  const current = classifyVisit(window.location.href, document.referrer, window.location.hostname);
  if (!read(FIRST_KEY)) write(FIRST_KEY, current);
  if (current.source !== "direct" || !read(LAST_KEY)) write(LAST_KEY, current);
  try {
    if (!window.sessionStorage.getItem(SESSION_FLAG)) {
      window.sessionStorage.setItem(SESSION_FLAG, "1");
      window.localStorage.setItem(VISITS_KEY, String(Number(window.localStorage.getItem(VISITS_KEY) ?? 0) + 1));
    }
  } catch {
    // ignore
  }
  return current;
}

export function getAttribution(): Attribution {
  let visits = 0;
  try {
    visits = Number(window.localStorage.getItem(VISITS_KEY) ?? 0) || 0;
  } catch {
    // ignore
  }
  return { first: read(FIRST_KEY), last: read(LAST_KEY), visits };
}
