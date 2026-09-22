/**
 * Best-effort in-memory rate limiter for guest-facing API routes
 * (Razorpay order creation/verification, test-payment simulation) that are
 * keyed only by a client-supplied email with no auth in front of them —
 * without this, they're spammable for Firebase account creation and
 * Razorpay order spam.
 *
 * Sliding-window counter keyed by client IP, stored in a plain `Map`.
 *
 * Limitations (acceptable here, not for high-scale production):
 * - State is per-process: resets on cold start and is NOT shared across
 *   concurrent serverless instances, so the effective limit multiplies with
 *   however many instances are warm. Fine for this app's current traffic;
 *   a real deployment at scale would want a shared store (Redis/Upstash)
 *   so all instances see the same counters.
 * - IP-based keying can be shared by many users behind NAT/corporate
 *   proxies/CGNAT, and is trivially bypassed by an attacker who rotates
 *   IPs — this is defense-in-depth against casual abuse, not a hard
 *   security boundary.
 */

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

// Prune old buckets periodically so the Map doesn't grow unbounded over the
// life of a warm serverless instance.
const PRUNE_INTERVAL_MS = 10 * 60 * 1000;
let lastPrune = Date.now();

function pruneIfNeeded(now: number) {
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [key, bucket] of buckets) {
    if (bucket.timestamps.length === 0 || now - bucket.timestamps[bucket.timestamps.length - 1] > PRUNE_INTERVAL_MS) {
      buckets.delete(key);
    }
  }
}

/** Extracts a best-effort client IP from standard proxy headers. */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the caller may retry. */
  retryAfterSeconds: number;
};

/**
 * Sliding-window rate limit check. Call once per request with a key that
 * identifies both the caller (IP) and the route/action, e.g.
 * `rateLimit(\`create-order:${ip}\`, { limit: 10, windowMs: 60_000 })`.
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  pruneIfNeeded(now);

  const bucket = buckets.get(key) ?? { timestamps: [] };
  const windowStart = now - windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    buckets.set(key, bucket);
    return { allowed: false, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}
