// Turns the order ledger (see orders.ts) into the numbers the owner actually
// acts on. Pure functions over plain data, so they can be tested without
// Firestore.

export type LedgerOrder = {
  orderId: string;
  courseId?: string;
  email?: string;
  amount?: number; // paise
  status?: "created" | "failed" | "paid";
  createdAt?: Date;
  paidAt?: Date;
  device?: string;
  country?: string;
  region?: string;
  attribution?: {
    first?: { source?: string; medium?: string; campaign?: string; landingPath?: string; at?: string };
    last?: { source?: string; medium?: string; campaign?: string };
    visits?: number;
  };
  attempts?: Record<
    string,
    { outcome?: string; method?: string; errorCode?: string; errorReason?: string; errorStep?: string; errorSource?: string; errorDescription?: string }
  >;
  payment?: { method?: string; bank?: string; wallet?: string; network?: string; cardType?: string; international?: boolean; fee?: number; tax?: number };
  refundedAmount?: number;
  disputeStatus?: string;
};

// A "created" order younger than this may still be in the payment window.
export const ABANDONED_AFTER_MS = 30 * 60_000;

type Row = { key: string; created: number; paid: number; revenue: number; conversion: number };

const rupees = (paise = 0) => Math.round(paise) / 100;
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);

function bump(map: Map<string, { created: number; paid: number; revenue: number }>, key: string, o: LedgerOrder, paid: boolean) {
  const row = map.get(key) ?? { created: 0, paid: 0, revenue: 0 };
  row.created += 1;
  if (paid) {
    row.paid += 1;
    row.revenue += o.amount ?? 0;
  }
  map.set(key, row);
}

function rows(map: Map<string, { created: number; paid: number; revenue: number }>, limit = 15): Row[] {
  return [...map.entries()]
    .map(([key, v]) => ({ key, created: v.created, paid: v.paid, revenue: rupees(v.revenue), conversion: pct(v.paid, v.created) }))
    .sort((a, b) => b.paid - a.paid || b.created - a.created)
    .slice(0, limit);
}

export function failedAttempts(o: LedgerOrder) {
  return Object.values(o.attempts ?? {}).filter((a) => a.outcome === "failed");
}

export function lastError(o: LedgerOrder): string | undefined {
  const f = failedAttempts(o);
  const last = f[f.length - 1];
  return last ? last.errorReason || last.errorCode || last.errorDescription : undefined;
}

export function computeInsights(orders: LedgerOrder[], now = new Date()) {
  const nowMs = now.getTime();
  const isPaid = (o: LedgerOrder) => o.status === "paid";
  const isAbandoned = (o: LedgerOrder) =>
    !isPaid(o) && !!o.createdAt && nowMs - o.createdAt.getTime() > ABANDONED_AFTER_MS;

  const paid = orders.filter(isPaid);
  const abandoned = orders.filter(isAbandoned);
  const abandonedAfterFailure = abandoned.filter((o) => failedAttempts(o).length > 0);
  const abandonedNoAttempt = abandoned.filter((o) => failedAttempts(o).length === 0);
  const pending = orders.length - paid.length - abandoned.length;
  const gross = paid.reduce((n, o) => n + (o.amount ?? 0), 0);
  const fees = paid.reduce((n, o) => n + (o.payment?.fee ?? 0), 0);
  const refunded = paid.reduce((n, o) => n + (o.refundedAmount ?? 0), 0);
  const recovered = paid.filter((o) => failedAttempts(o).length > 0).length; // failed first, paid after

  const secondsToPay = paid
    .filter((o) => o.createdAt && o.paidAt)
    .map((o) => (o.paidAt!.getTime() - o.createdAt!.getTime()) / 1000)
    .filter((s) => s >= 0)
    .sort((a, b) => a - b);
  const median = secondsToPay.length ? secondsToPay[Math.floor(secondsToPay.length / 2)] : null;

  const daysToBuy = paid
    .map((o) => (o.createdAt && o.attribution?.first?.at ? (o.createdAt.getTime() - Date.parse(o.attribution.first.at)) / 86_400_000 : NaN))
    .filter((d) => Number.isFinite(d) && d >= 0);
  const visits = paid.map((o) => o.attribution?.visits).filter((v): v is number => typeof v === "number" && v > 0);

  const channel = new Map<string, { created: number; paid: number; revenue: number }>();
  const lastChannel = new Map<string, { created: number; paid: number; revenue: number }>();
  const campaign = new Map<string, { created: number; paid: number; revenue: number }>();
  const landing = new Map<string, { created: number; paid: number; revenue: number }>();
  const method = new Map<string, { created: number; paid: number; revenue: number }>();
  const device = new Map<string, { created: number; paid: number; revenue: number }>();
  const place = new Map<string, { created: number; paid: number; revenue: number }>();
  const day = new Map<string, { created: number; paid: number; revenue: number }>();
  const reasons = new Map<string, { count: number; steps: Map<string, number> }>();

  for (const o of orders) {
    const p = isPaid(o);
    const f = o.attribution?.first;
    const l = o.attribution?.last;
    // Case-folded here as well as at write time, so older rows group correctly.
    bump(channel, f?.source ? `${f.source} / ${f.medium ?? "?"}`.toLowerCase() : "unknown", o, p);
    bump(lastChannel, l?.source ? `${l.source} / ${l.medium ?? "?"}`.toLowerCase() : "unknown", o, p);
    if (f?.campaign) bump(campaign, f.campaign.toLowerCase(), o, p);
    bump(landing, f?.landingPath ?? "unknown", o, p);
    // Payment method is only known once a payment was attempted.
    const attemptMethod = o.payment?.method ?? Object.values(o.attempts ?? {})[0]?.method;
    bump(method, attemptMethod ? (o.payment?.bank && o.payment.method === "netbanking" ? `netbanking (${o.payment.bank})` : attemptMethod) : "no attempt", o, p);
    bump(device, o.device ?? "unknown", o, p);
    bump(place, o.country ? `${o.country}${o.region ? " / " + o.region : ""}` : "unknown", o, p);
    if (o.createdAt) bump(day, o.createdAt.toISOString().slice(0, 10), o, p);

    for (const a of failedAttempts(o)) {
      const key = a.errorReason || a.errorCode || a.errorDescription || "unknown";
      const r = reasons.get(key) ?? { count: 0, steps: new Map() };
      r.count += 1;
      if (a.errorStep) r.steps.set(a.errorStep, (r.steps.get(a.errorStep) ?? 0) + 1);
      reasons.set(key, r);
    }
  }

  const byDay = [...day.entries()]
    .map(([date, v]) => ({ date, created: v.created, paid: v.paid, revenue: rupees(v.revenue) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const failureReasons = [...reasons.entries()]
    .map(([reason, v]) => ({
      reason,
      count: v.count,
      topStep: [...v.steps.entries()].sort((a, b) => b[1] - a[1])[0]?.[0],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const shape = (o: LedgerOrder) => ({
    orderId: o.orderId,
    createdAt: o.createdAt?.toISOString(),
    paidAt: o.paidAt?.toISOString(),
    email: o.email,
    courseId: o.courseId,
    amount: rupees(o.amount),
    status: isPaid(o) ? (o.refundedAmount ? "refunded" : "paid") : isAbandoned(o) ? "abandoned" : "pending",
    method: o.payment?.method ?? Object.values(o.attempts ?? {})[0]?.method,
    bank: o.payment?.bank,
    network: o.payment?.network,
    source: o.attribution?.first?.source,
    medium: o.attribution?.first?.medium,
    campaign: o.attribution?.first?.campaign,
    device: o.device,
    country: o.country,
    region: o.region,
    failedAttempts: failedAttempts(o).length,
    lastError: lastError(o),
    visits: o.attribution?.visits,
  });

  const sorted = [...orders].sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));

  return {
    totals: {
      checkoutsStarted: orders.length,
      paid: paid.length,
      abandoned: abandoned.length,
      abandonedAfterFailedPayment: abandonedAfterFailure.length,
      abandonedWithoutTryingToPay: abandonedNoAttempt.length,
      stillPending: pending,
      recoveredAfterFailure: recovered,
      conversionRate: pct(paid.length, orders.length),
      gross: rupees(gross),
      fees: rupees(fees),
      net: rupees(gross - fees - refunded),
      refunded: rupees(refunded),
      averageOrderValue: paid.length ? rupees(gross / paid.length) : 0,
      medianSecondsToPay: median === null ? null : Math.round(median),
      averageDaysFirstVisitToPurchase: daysToBuy.length ? Math.round((daysToBuy.reduce((a, b) => a + b, 0) / daysToBuy.length) * 10) / 10 : null,
      averageVisitsBeforePurchase: visits.length ? Math.round((visits.reduce((a, b) => a + b, 0) / visits.length) * 10) / 10 : null,
    },
    byChannel: rows(channel),
    byLastTouchChannel: rows(lastChannel),
    byCampaign: rows(campaign),
    byLandingPage: rows(landing),
    byMethod: rows(method),
    byDevice: rows(device),
    byLocation: rows(place),
    byDay,
    failureReasons,
    recentOrders: sorted.slice(0, 100).map(shape),
    // Orders that never paid, newest first: a manual follow-up list.
    abandonedOrders: sorted.filter(isAbandoned).slice(0, 50).map(shape),
  };
}
