import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Whether real Razorpay credentials are actually configured. This is the
 * server-side source of truth for disabling test-payment mode — checked
 * against all three secrets (not just one) so a partial/misconfigured env
 * can't leave the no-payment-verification test endpoint reachable in prod.
 */
export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.trim() &&
      process.env.RAZORPAY_KEY_SECRET?.trim() &&
      process.env.RAZORPAY_WEBHOOK_SECRET?.trim()
  );
}

// The Razorpay SDK throws at construction time if key_id/key_secret are
// missing — guarded so merely importing this module (e.g. for
// isRazorpayConfigured from the test-payment route) never crashes when
// Razorpay isn't configured yet. Anything that actually calls `razorpay.*`
// without real keys will still fail, which is correct: those routes require
// live credentials to function.
export const razorpay: Razorpay = isRazorpayConfigured()
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  : (null as unknown as Razorpay);

// timingSafeEqual throws (rather than returning false) when the two buffers
// differ in length, which a malformed/short attacker-supplied signature will
// trigger — treat that the same as "doesn't match" instead of letting it 500.
function safeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Verifies the checkout handler payload (order_id|payment_id signed with the key secret). */
export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return safeEqual(Buffer.from(expected), Buffer.from(params.signature));
}

/** Verifies an incoming Razorpay webhook request body against its signature header. */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  return safeEqual(Buffer.from(expected), Buffer.from(signature));
}
