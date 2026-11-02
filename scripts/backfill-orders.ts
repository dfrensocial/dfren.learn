// Imports real orders created BEFORE the order ledger existed (e.g. your first
// real test payment) from Razorpay into the `orders` ledger, so the Insights
// page includes them. Read-only on Razorpay; writes only new ledger docs
// (existing ones are left alone). Only orders created by this site (their notes
// carry a published courseId + email) are imported -- other payments on the
// shared Razorpay account are ignored.
//
// Source attribution is unknown for these (nothing was captured back then).
//
//   npx tsx scripts/backfill-orders.ts             # preview
//   npx tsx scripts/backfill-orders.ts --confirm   # write

export {}; // force module scope so this file's `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

const CONFIRM = process.argv.includes("--confirm");

async function main() {
  const { razorpay } = await import("../src/lib/razorpay/server");
  const { adminDb } = await import("../src/lib/firebase/admin");
  const { ORDERS_COLLECTION } = await import("../src/lib/orders");
  const { isValidPublishedCourse } = await import("../src/lib/razorpay/validate-course");

  console.log(CONFIRM ? "MODE: WRITE" : "MODE: dry run (pass --confirm to write)", `-> ${ORDERS_COLLECTION}\n`);
  let imported = 0, skipped = 0, foreign = 0;

  for (let skip = 0; ; skip += 100) {
    const page = await razorpay.orders.all({ count: 100, skip });
    const items = page.items ?? [];
    for (const o of items) {
      const courseId = o.notes?.courseId as string | undefined;
      const email = o.notes?.email as string | undefined;
      if (!courseId || !email || !(await isValidPublishedCourse(courseId))) {
        foreign++;
        continue;
      }
      const ref = adminDb.collection(ORDERS_COLLECTION).doc(o.id);
      if ((await ref.get()).exists) {
        skipped++;
        continue;
      }
      const payments = (await razorpay.orders.fetchPayments(o.id)).items ?? [];
      const attempts: Record<string, Record<string, unknown>> = {};
      let captured: (typeof payments)[number] | undefined;
      for (const p of payments) {
        const outcome = p.status === "captured" ? "captured" : p.status === "failed" ? "failed" : p.status;
        if (p.status === "captured" || p.captured) captured ??= p;
        const card = (p.card ?? {}) as Record<string, unknown>;
        attempts[p.id] = Object.fromEntries(
          Object.entries({
            at: new Date(Number(p.created_at) * 1000), outcome, status: p.status, method: p.method, bank: p.bank ?? undefined,
            wallet: p.wallet ?? undefined, network: card.network, cardType: card.type, issuer: card.issuer,
            international: p.international, amount: p.amount,
            errorCode: p.error_code ?? undefined, errorDescription: p.error_description ?? undefined,
            errorReason: p.error_reason ?? undefined, errorStep: p.error_step ?? undefined, errorSource: p.error_source ?? undefined,
          }).filter(([, v]) => v !== undefined && v !== null)
        );
      }
      const status = captured ? "paid" : o.status === "attempted" ? "failed" : "created";
      const doc: Record<string, unknown> = {
        orderId: o.id, courseId, email, amount: Number(o.amount), currency: o.currency, status, backfilled: true,
        createdAt: new Date(Number(o.created_at) * 1000), updatedAt: new Date(),
        paymentIds: payments.map((p) => p.id), attempts,
      };
      if (captured) {
        doc.paidAt = new Date(Number(captured.created_at) * 1000);
        doc.paidVia = "backfill";
        doc.payment = Object.fromEntries(
          Object.entries({
            paymentId: captured.id, method: captured.method, bank: captured.bank ?? undefined, wallet: captured.wallet ?? undefined,
            network: (captured.card as Record<string, unknown> | undefined)?.network, international: captured.international,
            fee: captured.fee ?? undefined, tax: captured.tax ?? undefined,
          }).filter(([, v]) => v !== undefined && v !== null)
        );
        if (captured.amount_refunded) doc.refundedAmount = Number(captured.amount_refunded);
      }
      console.log(`${status.padEnd(8)} ${o.id}  ${email}  ₹${Number(o.amount) / 100}  ${new Date(Number(o.created_at) * 1000).toISOString().slice(0, 10)}`);
      if (CONFIRM) await ref.set(doc);
      imported++;
    }
    if (items.length < 100) break;
  }
  console.log(`\n${imported} to import, ${skipped} already in ledger, ${foreign} not from this site (ignored).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
