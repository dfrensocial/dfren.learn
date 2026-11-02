import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

// The order ledger: one Firestore doc per Razorpay order, server-side only
// (no client rules exist for it, so it is denied to every browser). It answers
// the business questions a browser-side tracker can't answer reliably:
// who bought, through which channel, did they pay or abandon, and why a
// payment failed. Written from create-order, verify and the signed webhook.
//
// EVERYTHING here is best-effort bookkeeping: callers wrap it so a failure can
// never block a payment, an enrollment, or a webhook acknowledgement.
//
// What is deliberately NOT stored: card numbers, last4, UPI ids, phone numbers.
// Only the payment method, bank/wallet/network names and amounts.

// Overridable so tests can write to a scratch collection instead of real data.
export const ORDERS_COLLECTION = process.env.ORDERS_COLLECTION || "orders";
const col = () => adminDb.collection(ORDERS_COLLECTION);

type Json = Record<string, unknown>;

/** Firestore rejects `undefined` values; drop them (recursively for plain objects). */
function compact<T extends Json>(obj: T): T {
  const out: Json = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = v && typeof v === "object" && !(v instanceof Date) && !Array.isArray(v) && !isSentinel(v)
      ? compact(v as Json)
      : v;
  }
  return out as T;
}
function isSentinel(v: object) {
  // FieldValue sentinels expose a method-bearing prototype; plain data does not.
  return v.constructor !== Object && v.constructor?.name !== "Object";
}

const str = (v: unknown, max = 100): string | undefined => {
  if (typeof v !== "string") return undefined;
  const s = v.trim().slice(0, max);
  return s || undefined;
};

// --- Attribution (comes from the browser, so it is untrusted: allow-list + clamp) ---

type Touch = {
  source?: string; medium?: string; campaign?: string; term?: string; content?: string;
  referrerHost?: string; landingPath?: string; at?: string;
};

function sanitizeTouch(input: unknown): Touch | undefined {
  if (!input || typeof input !== "object") return undefined;
  const t = input as Json;
  // Lowercased so "Instagram" and "instagram" are one channel in the reports.
  const lc = (v: unknown, max: number) => str(v, max)?.toLowerCase();
  const out: Touch = compact({
    source: lc(t.source, 60), medium: lc(t.medium, 60), campaign: lc(t.campaign, 80),
    term: lc(t.term, 80), content: lc(t.content, 80), referrerHost: lc(t.referrerHost, 80),
    landingPath: str(t.landingPath, 120), at: str(t.at, 40),
  });
  return Object.keys(out).length ? out : undefined;
}

export function sanitizeAttribution(input: unknown): { first?: Touch; last?: Touch; visits?: number } | undefined {
  if (!input || typeof input !== "object") return undefined;
  const a = input as Json;
  const visits = typeof a.visits === "number" && Number.isFinite(a.visits) ? Math.min(Math.max(Math.floor(a.visits), 0), 10_000) : undefined;
  const out = compact({ first: sanitizeTouch(a.first), last: sanitizeTouch(a.last), visits });
  return Object.keys(out).length ? out : undefined;
}

/**
 * GA4 client/session ids from the buyer's own _ga cookies, used to attach the
 * server-side purchase to their GA session. Untrusted: strict format only.
 */
export function sanitizeGa(input: unknown): { clientId: string; sessionId?: string } | undefined {
  if (!input || typeof input !== "object") return undefined;
  const g = input as Json;
  const clientId = typeof g.clientId === "string" && /^\d{1,12}\.\d{1,12}$/.test(g.clientId) ? g.clientId : undefined;
  if (!clientId) return undefined;
  const sessionId = typeof g.sessionId === "string" && /^\d{6,12}$/.test(g.sessionId) ? g.sessionId : undefined;
  return compact({ clientId, sessionId });
}

// --- Request context (server-derived, not trusted from the client) ---

export function parseDevice(userAgent: string | null): "mobile" | "tablet" | "desktop" | "bot" {
  const ua = (userAgent ?? "").toLowerCase();
  if (/bot|crawl|spider|headless/.test(ua)) return "bot";
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android/.test(ua)) return "mobile";
  return "desktop";
}

/** Country/region from Netlify's edge geo header. Coarse on purpose (no city). */
export function parseGeo(headers: Headers): { country?: string; region?: string } {
  try {
    const raw = headers.get("x-nf-geo");
    if (!raw) return {};
    const g = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    return compact({ country: str(g?.country?.code, 4), region: str(g?.subdivision?.name ?? g?.subdivision?.code, 60) });
  } catch {
    return {};
  }
}

// --- Writes ---

export async function recordOrderCreated(o: {
  orderId: string;
  courseId: string;
  email: string;
  uid?: string;
  amount: number;
  currency: string;
  /** The visitor allowed analytics: only then are source / device / location kept with the order. */
  analytics: boolean;
  /** What they agreed to at checkout (Terms + Privacy Policy versions). */
  legal: { termsVersion: string; privacyVersion: string; acceptedAt: string };
  attribution?: unknown;
  ga?: unknown;
  userAgent: string | null;
  headers: Headers;
}): Promise<void> {
  const geo = o.analytics ? parseGeo(o.headers) : {};
  await col()
    .doc(o.orderId)
    .create(
      compact({
        orderId: o.orderId,
        courseId: o.courseId,
        email: o.email.trim().toLowerCase(),
        uid: o.uid,
        amount: o.amount,
        currency: o.currency,
        status: "created",
        createdAt: new Date(),
        updatedAt: new Date(),
        legal: o.legal,
        // Optional extras: kept only when the visitor said yes to analytics.
        ...(o.analytics
          ? {
              attribution: sanitizeAttribution(o.attribution),
              ga: sanitizeGa(o.ga),
              device: parseDevice(o.userAgent),
              country: geo.country,
              region: geo.region,
            }
          : {}),
      })
    )
    .catch((err) => {
      if ((err as { code?: number }).code !== 6) throw err; // 6 = ALREADY_EXISTS
    });
}

/**
 * The signed client-side verify succeeded: the order is paid. The webhook adds
 * the payment details (method, fee...). `base` is only used when the order has
 * no ledger doc yet (it predates the ledger), so the row still has its basics.
 */
export async function recordPaid(
  orderId: string,
  paymentId: string,
  via: "verify" | "webhook",
  base?: { courseId: string; email: string; amount?: number; currency?: string; createdAt?: Date }
) {
  const ref = col().doc(orderId);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const cur = (snap.data() ?? {}) as Json;
    const now = new Date();
    const update: Json = {
      status: "paid",
      updatedAt: now,
      paymentIds: FieldValue.arrayUnion(paymentId),
      payment: { paymentId },
      paidVia: cur.paidVia ?? via,
    };
    if (!cur.paidAt) update.paidAt = now;
    if (!snap.exists && base) Object.assign(update, { orderId, backfilled: true, ...base, createdAt: base.createdAt ?? now });
    tx.set(ref, compact(update), { merge: true });
  });
}

type RzpPayment = Json & { id?: string; order_id?: string };

function attemptFields(p: RzpPayment) {
  const card = (p.card ?? {}) as Json;
  return compact({
    at: new Date(),
    status: str(p.status, 20),
    method: str(p.method, 20),
    bank: str(p.bank, 40),
    wallet: str(p.wallet, 40),
    network: str(card.network, 20),
    cardType: str(card.type, 20),
    issuer: str(card.issuer, 40),
    international: typeof p.international === "boolean" ? p.international : undefined,
    amount: typeof p.amount === "number" ? p.amount : undefined,
    // Why a payment failed (Razorpay's own classification).
    errorCode: str(p.error_code, 60),
    errorDescription: str(p.error_description, 200),
    errorReason: str(p.error_reason, 80),
    errorStep: str(p.error_step, 60),
    errorSource: str(p.error_source, 40),
  });
}

/**
 * Records a Razorpay webhook event on the order. Idempotent (events can be
 * delivered more than once): attempts are keyed by payment id, and a paid order
 * never goes backwards to failed when an earlier attempt's failure arrives late.
 */
export async function recordWebhookEvent(eventName: string, payload: Json): Promise<void> {
  const payment = ((payload.payment as Json | undefined)?.entity ?? undefined) as RzpPayment | undefined;
  const refund = ((payload.refund as Json | undefined)?.entity ?? undefined) as Json | undefined;
  const orderId = str(payment?.order_id, 60);
  if (!payment?.id || !orderId) return; // not one of our orders

  const paymentId = String(payment.id);
  const ref = col().doc(orderId);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const cur = (snap.data() ?? {}) as Json;
    const now = new Date();
    const update: Json = { updatedAt: now };

    // Only orders our own create-order wrote. This Razorpay account also
    // takes payments for other things; those must never land in this ledger
    // (they'd bring strangers' emails with them). Orders from before the
    // ledger existed are added by scripts/backfill-orders.ts instead.
    if (!snap.exists) return;

    update.paymentIds = FieldValue.arrayUnion(paymentId);

    if (eventName === "payment.failed") {
      update.attempts = { [paymentId]: { ...attemptFields(payment), outcome: "failed" } };
      update.status = cur.status === "paid" ? "paid" : "failed";
      // (Failed-attempt counts are derived from the attempts map, which is keyed
      // by payment id -- a counter here would double-count redelivered events.)
    } else if (eventName === "payment.authorized") {
      update.attempts = { [paymentId]: { ...attemptFields(payment), outcome: "authorized" } };
      update.status = cur.status ?? "created";
    } else if (eventName === "payment.captured" || eventName === "order.paid") {
      update.attempts = { [paymentId]: { ...attemptFields(payment), outcome: "captured" } };
      update.status = "paid";
      if (!cur.paidAt) update.paidAt = now;
      update.payment = compact({
        paymentId,
        ...attemptFields(payment),
        fee: typeof payment.fee === "number" ? payment.fee : undefined,
        tax: typeof payment.tax === "number" ? payment.tax : undefined,
      });
      update.paidVia = cur.paidVia ?? "webhook";
    } else if (eventName.startsWith("refund.") && refund?.id) {
      const rid = String(refund.id);
      update.refunds = {
        [rid]: compact({
          amount: typeof refund.amount === "number" ? refund.amount : undefined,
          status: eventName.replace("refund.", ""),
          at: now,
        }),
      };
      if (eventName === "refund.processed" && typeof payment.amount_refunded === "number") {
        update.refundedAmount = payment.amount_refunded;
      }
    } else if (eventName.startsWith("payment.dispute.")) {
      update.disputeStatus = eventName.replace("payment.dispute.", "");
    } else {
      return; // not an event the ledger tracks
    }

    tx.set(ref, compact(update), { merge: true });
  });
}
