import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";
import { ORDERS_COLLECTION } from "@/lib/orders";
import { computeInsights, type LedgerOrder } from "@/lib/insights";

// Admin-only business insights computed from the order ledger. The ledger
// holds buyer emails, so this is gated by requireAdmin() (verified email in
// ADMIN_EMAILS) exactly like the watermark tool -- never by a client check.

const toDate = (v: unknown): Date | undefined =>
  v && typeof (v as { toDate?: unknown }).toDate === "function" ? (v as { toDate: () => Date }).toDate() : undefined;

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { allowed } = rateLimit(`admin-insights:${admin.email}`, { limit: 60, windowMs: 60 * 60_000 });
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const daysParam = req.nextUrl.searchParams.get("days") ?? "30";
  const days = daysParam === "all" ? null : Math.min(Math.max(parseInt(daysParam, 10) || 30, 1), 3650);

  let query = adminDb.collection(ORDERS_COLLECTION).orderBy("createdAt", "desc").limit(3000);
  if (days) query = query.where("createdAt", ">=", new Date(Date.now() - days * 86_400_000));
  const snap = await query.get();

  const orders: LedgerOrder[] = snap.docs.map((d) => {
    const x = d.data();
    return { ...x, orderId: d.id, createdAt: toDate(x.createdAt), paidAt: toDate(x.paidAt) } as LedgerOrder;
  });

  return NextResponse.json({ days: days ?? "all", generatedAt: new Date().toISOString(), ...computeInsights(orders) });
}
