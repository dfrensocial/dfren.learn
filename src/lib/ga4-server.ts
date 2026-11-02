import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { ORDERS_COLLECTION } from "@/lib/orders";

// Server-side GA4 events (Measurement Protocol) for money moments.
//
// Why: the browser `purchase` event is lost if the tab closes right after
// paying. The signed Razorpay webhook is not. Both carry the same
// transaction_id (the Razorpay order id), and GA4 de-duplicates purchases on it,
// so sending from here never double-counts.
//
// Attribution: the event is stitched to the visitor's GA session using the
// client_id / session_id captured in the browser at checkout (see ga in
// orders.ts). No client_id means analytics was off or blocked for that visitor,
// so we send nothing rather than invent a fake "user". The order ledger stays
// the source of truth for revenue either way.
//
// No personal data is sent: no email, no uid, no payment details.
//
// Inert until GA4_API_SECRET is set. Best-effort: callers catch, and a failure
// here can never affect payment or access.

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9F466RVWND";
const COLLECT = "https://www.google-analytics.com";

type Json = Record<string, unknown>;

async function send(clientId: string, event: Json, tsMs?: number): Promise<boolean> {
  const secret = process.env.GA4_API_SECRET;
  if (!secret) return false;
  // GA4_MP_DEBUG=true hits Google's validator instead: it returns problems with
  // the payload but records nothing.
  const debug = process.env.GA4_MP_DEBUG === "true";
  const url = `${COLLECT}${debug ? "/debug" : ""}/mp/collect?measurement_id=${encodeURIComponent(MEASUREMENT_ID)}&api_secret=${encodeURIComponent(secret)}`;
  const body: Json = { client_id: clientId, events: [event] };
  // Events may be back-dated up to 72h; keep the true time when a webhook retry is late.
  if (tsMs && Date.now() - tsMs < 70 * 3600_000) body.timestamp_micros = tsMs * 1000;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(3000),
  });
  if (debug) console.log("[ga4] validation", JSON.stringify(await res.json().catch(() => ({}))));
  return res.ok;
}

type OrderDoc = {
  status?: string;
  courseId?: string;
  amount?: number;
  currency?: string;
  paidAt?: { toDate?: () => Date };
  ga?: { clientId?: string; sessionId?: string };
  ga4PurchaseSentAt?: unknown;
  refunds?: Record<string, { ga4SentAt?: unknown }>;
};

async function courseName(courseId: string): Promise<string> {
  const snap = await adminDb.collection("courses").doc(courseId).get().catch(() => null);
  const title = snap?.data()?.title;
  return typeof title === "string" && title ? title : courseId;
}

function baseParams(orderId: string, o: OrderDoc) {
  return {
    transaction_id: orderId,
    currency: o.currency || "INR",
    ...(o.ga?.sessionId ? { session_id: Number(o.ga.sessionId) } : {}),
    engagement_time_msec: 100,
  };
}

/** Sends GA4 `purchase` for a paid order, once. Safe to call from every paid path. */
export async function reportPurchaseToGa4(orderId: string): Promise<void> {
  if (!process.env.GA4_API_SECRET) return;
  const ref = adminDb.collection(ORDERS_COLLECTION).doc(orderId);

  // Claim first so a duplicate webhook delivery can't send a second one.
  const claimed = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const o = snap.data() as OrderDoc | undefined;
    if (!o || o.status !== "paid" || !o.ga?.clientId || o.ga4PurchaseSentAt) return null;
    tx.update(ref, { ga4PurchaseSentAt: new Date() });
    return o;
  });
  if (!claimed) return;

  try {
    const value = (claimed.amount ?? 0) / 100;
    const courseId = claimed.courseId ?? "unknown";
    const ok = await send(
      claimed.ga!.clientId!,
      {
        name: "purchase",
        params: {
          ...baseParams(orderId, claimed),
          value,
          items: [{ item_id: courseId, item_name: await courseName(courseId), price: value, quantity: 1 }],
        },
      },
      claimed.paidAt?.toDate?.().getTime()
    );
    if (!ok) throw new Error("GA4 rejected the request");
  } catch (err) {
    // Release the claim so the next webhook retry can try again.
    await ref.update({ ga4PurchaseSentAt: FieldValue.delete() }).catch(() => {});
    throw err;
  }
}

/** Sends GA4 `refund` once per Razorpay refund id, so revenue in GA4 nets out. */
export async function reportRefundToGa4(orderId: string, refundId: string, amountPaise: number): Promise<void> {
  if (!process.env.GA4_API_SECRET || !refundId || !(amountPaise > 0)) return;
  const ref = adminDb.collection(ORDERS_COLLECTION).doc(orderId);

  const claimed = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const o = snap.data() as OrderDoc | undefined;
    // Only refund what GA4 actually saw as a purchase.
    if (!o?.ga?.clientId || !o.ga4PurchaseSentAt || o.refunds?.[refundId]?.ga4SentAt) return null;
    tx.update(ref, { [`refunds.${refundId}.ga4SentAt`]: new Date() });
    return o;
  });
  if (!claimed) return;

  try {
    const courseId = claimed.courseId ?? "unknown";
    const ok = await send(claimed.ga!.clientId!, {
      name: "refund",
      params: {
        ...baseParams(orderId, claimed),
        value: amountPaise / 100,
        items: [{ item_id: courseId, item_name: await courseName(courseId), price: amountPaise / 100, quantity: 1 }],
      },
    });
    if (!ok) throw new Error("GA4 rejected the request");
  } catch (err) {
    await ref.update({ [`refunds.${refundId}.ga4SentAt`]: FieldValue.delete() }).catch(() => {});
    throw err;
  }
}
