"use client";

import { adsConsented } from "@/lib/consent";

// ---------------------------------------------------------------------------
// Meta Pixel (ad measurement for Facebook/Instagram campaigns). Third optional
// purpose, "ads": never loads, sets no cookie and sends nothing until the
// visitor switches it on. No advanced matching -- no email, name, phone or
// account id is ever passed to fbq. The <noscript> image from Meta's snippet is
// left out on purpose: it would fire without any consent check.
//
// Events (all from the same call sites as the GA4 ones, see track() in analytics.ts):
//   view_item      -> ViewContent      (pricing card seen)
//   begin_checkout -> InitiateCheckout (payment window opened)
//   purchase       -> Purchase         (payment verified; eventID = Razorpay order id)
//   generate_lead  -> Lead             (tapped Enroll and reached the email step; no email is sent)
//   cta_click on the WhatsApp button -> Contact
// ---------------------------------------------------------------------------

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "4420891844840936";
const IS_DEV = process.env.NODE_ENV !== "production";
const EXCLUDED_PATHS = ["/admin", "/watermark"];

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};
type MetaWindow = Window & { fbq?: Fbq; _fbq?: Fbq };

let started = false;

function wanted(): boolean {
  if (typeof window === "undefined" || !adsConsented()) return false;
  if (IS_DEV && process.env.NEXT_PUBLIC_META_PIXEL_IN_DEV !== "true") return false;
  // The sign-in callback URL carries a one-time code: never let it reach Meta.
  if (/[?&](oobCode|apiKey)=/.test(window.location.search)) return false;
  return !EXCLUDED_PATHS.some((p) => window.location.pathname.startsWith(p));
}

/** Meta's loader stub, typed. Queues calls until fbevents.js arrives. */
function installStub(w: MetaWindow) {
  if (w.fbq) return;
  const n = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  } as Fbq;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  w.fbq = n;
  if (!w._fbq) w._fbq = n;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
}

function start(): boolean {
  if (!wanted()) return false;
  const w = window as MetaWindow;
  if (!started) {
    started = true;
    installStub(w);
    w.fbq!("consent", "grant");
    w.fbq!("init", PIXEL_ID);
  } else {
    w.fbq?.("consent", "grant"); // re-granted after a withdrawal in this page view
  }
  return true;
}

/** Sends a PageView (call on first load and every client-side navigation). */
export function metaPageView() {
  try {
    if (start()) (window as MetaWindow).fbq?.("track", "PageView");
  } catch {
    // ad measurement must never break the page
  }
}

type Item = { item_id?: unknown; item_name?: unknown };

/**
 * Sends the Meta equivalent of a GA4 event, if there is one. Only ids, the
 * product name, the value and the currency are sent -- never an email, name or
 * phone number. Safe to call for any event name: unmapped ones are ignored.
 */
export function metaEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    const metaName =
      name === "view_item"
        ? "ViewContent"
        : name === "begin_checkout"
          ? "InitiateCheckout"
          : name === "purchase"
            ? "Purchase"
            : name === "generate_lead"
              ? "Lead"
              : name === "cta_click" && params.cta_label === "whatsapp"
                ? "Contact"
                : null;
    if (!metaName || !start()) return;
    const items = Array.isArray(params.items) ? (params.items as Item[]) : [];
    const data: Record<string, unknown> = {
      content_type: "product",
      content_ids: items.map((i) => String(i.item_id ?? "")).filter(Boolean),
      content_name: items[0]?.item_name ? String(items[0].item_name) : undefined,
      value: typeof params.value === "number" ? params.value : undefined,
      currency: typeof params.currency === "string" ? params.currency : "INR",
    };
    if (metaName === "InitiateCheckout") data.num_items = 1;
    if (metaName === "Contact") {
      delete data.content_ids; // a chat tap is not a product event
      delete data.content_type;
    }
    // Purchase carries the order id as the event id, so a repeat never double-counts.
    const options = metaName === "Purchase" && typeof params.transaction_id === "string" ? { eventID: params.transaction_id } : undefined;
    const fbq = (window as MetaWindow).fbq;
    if (options) fbq?.("track", metaName, data, options);
    else fbq?.("track", metaName, data);
  } catch {
    // ad measurement must never break the page
  }
}

/**
 * Meta's own browser ids (_fbp, _fbc), read from their first-party cookies, so the server can tie the
 * paid order back to the ad click when it reports the purchase. Only returned when the visitor said
 * yes to ad measurement AND the Pixel actually set them; otherwise nothing is sent anywhere.
 */
export function getMetaIds(): { fbp?: string; fbc?: string } | undefined {
  try {
    if (!adsConsented()) return undefined;
    const cookies = Object.fromEntries(
      document.cookie.split("; ").map((c) => {
        const i = c.indexOf("=");
        return [c.slice(0, i), c.slice(i + 1)];
      })
    );
    const fbp = /^fb\.\d\.\d{10,14}\.\d{1,20}$/.test(cookies["_fbp"] ?? "") ? cookies["_fbp"] : undefined;
    const fbc = /^fb\.\d\.\d{10,14}\.[\w-]{1,300}$/.test(cookies["_fbc"] ?? "") ? cookies["_fbc"] : undefined;
    return fbp || fbc ? { fbp, fbc } : undefined;
  } catch {
    return undefined;
  }
}

function deleteMetaCookies() {
  try {
    const host = window.location.hostname;
    const parts = host.split(".");
    const domains = [undefined, host, ...parts.slice(1, -1).map((_, i) => "." + parts.slice(i + 1).join("."))];
    for (const name of ["_fbp", "_fbc"]) {
      for (const d of domains) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
      }
    }
  } catch {
    // best effort
  }
}

/** Withdrawn (or never given): stop sending and remove the first-party cookies we can reach. */
export function metaRevoke() {
  try {
    (window as MetaWindow).fbq?.("consent", "revoke");
  } catch {
    // ignore
  }
  deleteMetaCookies();
}
