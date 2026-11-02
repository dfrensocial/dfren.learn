"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-context";
import type { computeInsights } from "@/lib/insights";

type Insights = ReturnType<typeof computeInsights> & { days: number | "all"; generatedAt: string };
type Table = Insights["byChannel"];

const RANGES: { label: string; value: string }[] = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "All time", value: "all" },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const mins = (s: number | null) => (s === null ? "—" : s < 90 ? `${s}s` : `${Math.round(s / 60)} min`);

export default function AdminInsightsPage() {
  const { user, loading } = useAuth();
  const [range, setRange] = useState("30");
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/admin/insights?days=${range}`, { headers: { Authorization: `Bearer ${idToken}` } });
      if (res.status === 403) {
        setError("This page is for admins only.");
        setData(null);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
    } catch {
      setError("Couldn't load insights. Try again.");
    } finally {
      setBusy(false);
    }
  }, [user, range]);

  useEffect(() => {
    if (!loading && user) Promise.resolve().then(load);
  }, [loading, user, load]);

  if (loading) return <main className="min-h-screen bg-white" />;
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <p className="text-sm text-neutral-600">
          <Link href="/login?redirect=/admin" className="font-medium underline">Log in</Link> with an admin account to see insights.
        </p>
      </main>
    );
  }

  const t = data?.totals;

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-black">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black pb-4">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              dfren<span className="text-neutral-400">Learn</span>
            </Link>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Business insights</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border border-black bg-white px-3 py-2"
              aria-label="Date range"
            >
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <button onClick={load} disabled={busy} className="border border-black px-3 py-2 font-medium disabled:opacity-50">
              {busy ? "Loading…" : "Refresh"}
            </button>
          </div>
        </header>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {t && data && (
          <>
            <p className="mt-3 text-xs text-neutral-500">
              Our own order records (every checkout started on the site), so ad blockers can&apos;t hide anything. Visitors and
              page-level behaviour live in{" "}
              <a className="underline" href="https://analytics.google.com/" target="_blank" rel="noreferrer">Google Analytics</a> and{" "}
              <a className="underline" href="https://clarity.microsoft.com/projects/view/z7b92h65ey/dashboard" target="_blank" rel="noreferrer">Clarity</a>.
            </p>

            <section className="mt-6 grid grid-cols-2 gap-px border border-black bg-black sm:grid-cols-4">
              <Kpi label="Checkouts started" value={t.checkoutsStarted} />
              <Kpi label="Paid" value={t.paid} />
              <Kpi label="Checkout → paid" value={`${t.conversionRate}%`} />
              <Kpi label="Revenue" value={inr(t.gross)} sub={`net ${inr(t.net)} after fees & refunds`} />
              <Kpi label="Left without paying" value={t.abandoned} sub={`${t.stillPending} still in progress`} />
              <Kpi label="Recovered after a failure" value={t.recoveredAfterFailure} sub="failed first, then paid" />
              <Kpi label="Median time to pay" value={mins(t.medianSecondsToPay)} sub="from checkout start" />
              <Kpi label="Avg order value" value={inr(t.averageOrderValue)} sub={t.refunded ? `${inr(t.refunded)} refunded` : undefined} />
            </section>

            <Section title="Where checkouts end">
              <Funnel
                started={t.checkoutsStarted}
                steps={[
                  { label: "Paid", n: t.paid, tone: "black" },
                  { label: "Left after a failed payment", n: t.abandonedAfterFailedPayment, tone: "grey" },
                  { label: "Left without trying to pay", n: t.abandonedWithoutTryingToPay, tone: "grey" },
                  { label: "Still in progress", n: t.stillPending, tone: "light" },
                ]}
              />
              <p className="mt-3 text-xs text-neutral-500">
                &quot;Left without trying to pay&quot; means the payment window opened but no payment was attempted, usually
                price or trust. &quot;After a failed payment&quot; points at card, bank or UPI problems; see the reasons below.
              </p>
            </Section>

            <div className="grid gap-8 lg:grid-cols-2">
              <Section title="Where buyers first came from">
                <DataTable rows={data.byChannel} head="Source / medium" />
              </Section>
              <Section title="…and the visit that brought them back">
                <DataTable rows={data.byLastTouchChannel} head="Source / medium" />
              </Section>
              <Section title="Campaigns">
                {data.byCampaign.length ? <DataTable rows={data.byCampaign} head="Campaign" /> : <Empty>No UTM campaigns yet. Add ?utm_source=…&amp;utm_campaign=… to your links.</Empty>}
              </Section>
              <Section title="Landing pages">
                <DataTable rows={data.byLandingPage} head="First page seen" />
              </Section>
              <Section title="How people pay">
                <DataTable rows={data.byMethod} head="Method" />
              </Section>
              <Section title="Why payments fail">
                {data.failureReasons.length ? (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-black text-left text-xs uppercase tracking-wide text-neutral-500"><th className="py-2">Reason</th><th>Count</th><th>Usually at</th></tr></thead>
                    <tbody>
                      {data.failureReasons.map((r) => (
                        <tr key={r.reason} className="border-b border-neutral-200"><td className="py-2">{r.reason.replace(/_/g, " ")}</td><td>{r.count}</td><td className="text-neutral-500">{r.topStep?.replace(/_/g, " ") ?? "—"}</td></tr>
                      ))}
                    </tbody>
                  </table>
                ) : <Empty>No failed payments in this range.</Empty>}
              </Section>
              <Section title="Devices">
                <DataTable rows={data.byDevice} head="Device" />
              </Section>
              <Section title="Locations">
                <DataTable rows={data.byLocation} head="Country / region" />
              </Section>
            </div>

            <Section title="By day">
              <DayBars days={data.byDay} />
            </Section>

            <Section title={`Left without paying (${data.abandonedOrders.length}) — follow-up list`}>
              <p className="mb-3 text-xs text-neutral-500">
                People who started checkout but never paid. Reach out personally; don&apos;t bulk-email without their consent.
              </p>
              <OrdersTable orders={data.abandonedOrders} />
            </Section>

            <Section title="Recent orders">
              <OrdersTable orders={data.recentOrders} />
            </Section>

            <p className="mt-10 border-t border-black pt-4 text-xs text-neutral-500">
              Updated {new Date(data.generatedAt).toLocaleString("en-IN")}. Failure reasons and payment methods come from
              Razorpay&apos;s signed webhook.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 border-b border-black pb-2 text-sm font-semibold uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-neutral-500">{children}</p>;
}

function Funnel({ started, steps }: { started: number; steps: { label: string; n: number; tone: "black" | "grey" | "light" }[] }) {
  const tone = { black: "bg-black", grey: "bg-neutral-500", light: "bg-neutral-300" } as const;
  return (
    <div className="space-y-2">
      {steps.map((s) => (
        <div key={s.label} className="flex items-center gap-3 text-sm">
          <span className="w-56 shrink-0">{s.label}</span>
          <div className="h-5 flex-1 bg-neutral-100">
            <div className={`h-5 ${tone[s.tone]}`} style={{ width: `${started ? (s.n / started) * 100 : 0}%` }} />
          </div>
          <span className="w-24 shrink-0 text-right tabular-nums">
            {s.n} <span className="text-neutral-500">({started ? Math.round((s.n / started) * 100) : 0}%)</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function DataTable({ rows, head }: { rows: Table; head: string }) {
  if (!rows.length) return <Empty>No data yet.</Empty>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-black text-left text-xs uppercase tracking-wide text-neutral-500">
          <th className="py-2">{head}</th><th>Started</th><th>Paid</th><th>Conv.</th><th className="text-right">Revenue</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} className="border-b border-neutral-200">
            <td className="max-w-[16rem] truncate py-2" title={r.key}>{r.key}</td>
            <td className="tabular-nums">{r.created}</td>
            <td className="tabular-nums">{r.paid}</td>
            <td className="tabular-nums">{r.conversion}%</td>
            <td className="text-right tabular-nums">{inr(r.revenue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DayBars({ days }: { days: Insights["byDay"] }) {
  if (!days.length) return <Empty>No orders in this range.</Empty>;
  const max = Math.max(...days.map((d) => d.created), 1);
  return (
    <div className="flex h-32 items-end gap-1 border-b border-black">
      {days.map((d) => (
        <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.date}: ${d.created} started, ${d.paid} paid, ${inr(d.revenue)}`}>
          <div className="bg-neutral-300" style={{ height: `${(d.created / max) * 100}%` }}>
            <div className="bg-black" style={{ height: d.created ? `${(d.paid / d.created) * 100}%` : 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersTable({ orders }: { orders: Insights["recentOrders"] }) {
  if (!orders.length) return <Empty>Nothing here yet.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[56rem] text-sm">
        <thead>
          <tr className="border-b border-black text-left text-xs uppercase tracking-wide text-neutral-500">
            <th className="py-2">When</th><th>Who</th><th>Status</th><th>Paid with</th><th>Came from</th><th>Device</th><th>Where</th><th>Note</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderId} className="border-b border-neutral-200 align-top">
              <td className="whitespace-nowrap py-2">{o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}</td>
              <td className="max-w-[14rem] truncate" title={o.email}>{o.email ?? "—"}</td>
              <td>
                <span className={`border px-1.5 py-0.5 text-xs ${o.status === "paid" ? "border-black bg-black text-white" : "border-neutral-400"}`}>{o.status}</span>{" "}
                <span className="text-neutral-500">{inr(o.amount)}</span>
              </td>
              <td>{o.method ? [o.method, o.bank ?? o.network].filter(Boolean).join(" · ") : "—"}</td>
              <td>{o.source ? `${o.source}${o.medium ? " / " + o.medium : ""}` : "—"}{o.campaign ? <span className="text-neutral-500"> · {o.campaign}</span> : null}</td>
              <td>{o.device ?? "—"}</td>
              <td>{[o.country, o.region].filter(Boolean).join(" / ") || "—"}</td>
              <td className="text-neutral-500">
                {o.failedAttempts ? `${o.failedAttempts} failed${o.lastError ? `: ${o.lastError.replace(/_/g, " ")}` : ""}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
