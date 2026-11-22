import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { ORDERS_COLLECTION } from "@/lib/orders";
import { SITE_URL } from "@/lib/site";

// Server-side Meta event (Conversions API) for the one money moment: a verified purchase.
//
// Why: the browser Pixel `Purchase` is lost when the tab closes right after paying, or an ad blocker
// is on. The signed Razorpay webhook is not. Both use the Razorpay order id as the event id, so Meta
// de-duplicates them and a purchase is never counted twice.
//
// Consent: this only runs for an order whose buyer said YES to "ad measurement" at checkout
// (`adsConsent` on the order, written by create-order). Everyone else is never reported to Meta,
// exactly like the browser Pixel. It never sends an email, name, phone number, account id or any
// payment detail. What Meta receives: the event name and time, the order id, the price, the product
// id, Meta's own browser ids (_fbp/_fbc) if the Pixel set them, and the buyer's IP address and
// browser string (the minimum Meta needs to match the purchase to an ad click; the same two things
// the browser Pixel already sends).
//
// Inert until META_CAPI_ACCESS_TOKEN is set. Best-effort: callers catch, and a failure here can never
// affect payment or access.

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "979958740686067";
const GRAPH = "https://graph.facebook.com/v21.0";

type OrderDoc = {
  status?: string;
  courseId?: string;
  amount?: number;
  currency?: string;
  adsConsent?: boolean;
  meta?: { fbp?: string; fbc?: string };
  evidence?: { ip?: string; userAgent?: string };
  paidAt?: { toDate?: () => Date };
  metaPurchaseSentAt?: unknown;
};

/** Sends Meta `Purchase` for a paid order, once, only if the buyer allowed ad measurement. */
export async function reportPurchaseToMeta(orderId: string): Promise<void> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) return;
  const ref = adminDb.collection(ORDERS_COLLECTION).doc(orderId);

  // Claim first so a duplicate webhook delivery can't send a second one.
  const claimed = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const o = snap.data() as OrderDoc | undefined;
    if (!o || o.status !== "paid" || o.adsConsent !== true || o.metaPurchaseSentAt) return null;
    tx.update(ref, { metaPurchaseSentAt: new Date() });
    return o;
  });
  if (!claimed) return;

  try {
    const userData: Record<string, string> = {};
    if (claimed.evidence?.ip) userData.client_ip_address = claimed.evidence.ip;
    if (claimed.evidence?.userAgent) userData.client_user_agent = claimed.evidence.userAgent;
    if (claimed.meta?.fbp) userData.fbp = claimed.meta.fbp;
    if (claimed.meta?.fbc) userData.fbc = claimed.meta.fbc;

    const paidAtMs = claimed.paidAt?.toDate?.().getTime() ?? Date.now();
    const body: Record<string, unknown> = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(paidAtMs / 1000),
          event_id: orderId, // same as the browser Pixel's eventID -> Meta de-duplicates
          action_source: "website",
          event_source_url: SITE_URL,
          user_data: userData,
          custom_data: {
            currency: claimed.currency || "INR",
            value: (claimed.amount ?? 0) / 100,
            content_type: "product",
            content_ids: [claimed.courseId ?? "unknown"],
          },
        },
      ],
    };
    if (process.env.META_CAPI_TEST_EVENT_CODE) body.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE;

    const res = await fetch(`${GRAPH}/${encodeURIComponent(PIXEL_ID)}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`Meta rejected the event (${res.status})`);
  } catch (err) {
    // Release the claim so the next webhook retry can try again.
    await ref.update({ metaPurchaseSentAt: FieldValue.delete() }).catch(() => {});
    throw err;
  }
}
