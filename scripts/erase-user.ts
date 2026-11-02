// Handles ONE person's erasure request (privacy policy: "ask us to delete your
// data"). Dry run by default -- nothing is changed without --confirm.
//
//   npx tsx scripts/erase-user.ts person@example.com             # preview
//   npx tsx scripts/erase-user.ts person@example.com --confirm   # do it
//
// Verify the request came from the account's own inbox BEFORE running this.
//
// What it does
//   DELETES  the Firebase Auth account, users/{uid}/* (enrollments, progress,
//            downloads, active sessions, acceptance records), the watermark
//            lookup docs for that uid.
//   KEEPS    (a) payment/order records -- invoice id, amount, dates, status,
//            payment method, email -- because tax/accounting law requires
//            them; their analytics details (uid, source, GA id, device,
//            country/region, failed-payment detail) are removed.
//            (b) sign-in security logs (users/{uid}/loginEvents), which we hold
//            for security; each gets an expireAt so a Firestore TTL policy can
//            clear it after a year.
//   PRINTS   what has to be done by hand in other services (GA4, Clarity) --
//            BEFORE anything is changed, so the Google ids can't be lost.
//
// Refuses admin emails. This is NOT scripts/cleanup-test-data.ts (that wipes
// every non-admin user).

export {}; // module scope, so `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

const typed = process.argv[2]?.trim();
const email = typed?.toLowerCase();
const CONFIRM = process.argv.includes("--confirm");
const KEEP_SUBCOLLECTIONS = new Set(["loginEvents"]);
const LOG_RETENTION_MS = 366 * 24 * 60 * 60 * 1000;

async function main() {
  if (!typed || !email || !email.includes("@") || typed.startsWith("--")) {
    console.error("Usage: npx tsx scripts/erase-user.ts person@example.com [--confirm]");
    process.exit(1);
  }
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase());
  if (admins.includes(email)) {
    console.error("Refusing: that is an admin email.");
    process.exit(1);
  }

  const { FieldValue } = await import("firebase-admin/firestore");
  const { adminAuth, adminDb } = await import("../src/lib/firebase/admin");
  const { ORDERS_COLLECTION } = await import("../src/lib/orders");

  console.log(CONFIRM ? "MODE: ERASE (--confirm)" : "MODE: dry run (pass --confirm to erase)");
  console.log(`Person: ${email}   Orders collection: ${ORDERS_COLLECTION}\n`);

  // ---------- 1. READ everything first (no changes yet) ----------
  const user = await adminAuth.getUserByEmail(email).catch(() => null);
  const uid = user?.uid;
  console.log(uid ? `Auth account: ${uid}` : "Auth account: none found");

  // Orders: by account, by the lowercase email, and by the email as typed
  // (older rows may hold mixed case).
  const orderDocs = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  const queries = [adminDb.collection(ORDERS_COLLECTION).where("email", "==", email).get()];
  if (typed !== email) queries.push(adminDb.collection(ORDERS_COLLECTION).where("email", "==", typed).get());
  if (uid) queries.push(adminDb.collection(ORDERS_COLLECTION).where("uid", "==", uid).get());
  for (const snap of await Promise.all(queries)) snap.docs.forEach((d) => orderDocs.set(d.id, d));

  const gaIds = new Set<string>();
  for (const o of orderDocs.values()) if (o.data().ga?.clientId) gaIds.add(o.data().ga.clientId);

  const userRef = uid ? adminDb.collection("users").doc(uid) : null;
  const subs = userRef ? await userRef.listCollections() : [];
  const marks = uid ? await adminDb.collection("watermarks").where("uid", "==", uid).get() : null;

  // ---------- 2. PRINT the plan and the by-hand list (before any change) ----------
  for (const sub of subs) {
    const n = (await sub.count().get()).data().count;
    const keep = KEEP_SUBCOLLECTIONS.has(sub.id);
    console.log(`  users/${uid}/${sub.id}: ${n} docs -> ${keep ? "KEEP (security log), set expireAt" : "delete"}`);
  }
  if (uid) console.log(`  users/${uid} (profile) -> delete`);
  if (marks) console.log(`  watermarks: ${marks.size} docs -> delete`);
  console.log(`\nOrders found: ${orderDocs.size} (kept for tax/accounting; analytics details removed)`);
  for (const o of orderDocs.values()) console.log(`  ${o.id}  status=${o.data().status}  amount=${o.data().amount}`);

  console.log("\nDo by hand:");
  if (gaIds.size) {
    console.log("  - GA4: delete this person's analytics data (Admin -> Data deletion / User deletion API) for client id(s):");
    for (const id of gaIds) console.log(`      ${id}`);
  } else {
    console.log("  - GA4: no client id was stored for this person, so there is nothing to look up.");
  }
  console.log("  - Clarity: individual recordings can't be deleted; they expire on Clarity's schedule. Tell the person.");
  console.log("  - Razorpay: independent controller of payment data. Point the person to Razorpay for that.");
  console.log("  - Reply to the person within the promised time, saying what was deleted and what is kept by law.");

  if (!CONFIRM) return;

  // ---------- 3. CHANGE things (Auth last, so a failure can be re-run by email) ----------
  for (const sub of subs) {
    if (KEEP_SUBCOLLECTIONS.has(sub.id)) {
      for (const d of (await sub.get()).docs) {
        if (!d.data().expireAt) {
          const at = d.data().at?.toDate?.() ?? new Date();
          await d.ref.update({ expireAt: new Date(at.getTime() + LOG_RETENTION_MS) });
        }
      }
    } else {
      await adminDb.recursiveDelete(sub);
    }
  }
  if (userRef) await userRef.delete();
  if (marks) await Promise.all(marks.docs.map((d) => d.ref.delete()));

  for (const o of orderDocs.values()) {
    await o.ref.update({
      uid: FieldValue.delete(),
      attribution: FieldValue.delete(),
      ga: FieldValue.delete(),
      ga4PurchaseSentAt: FieldValue.delete(),
      device: FieldValue.delete(),
      country: FieldValue.delete(),
      region: FieldValue.delete(),
      attempts: FieldValue.delete(),
      erasedAt: new Date(),
    });
  }

  if (uid) {
    await adminAuth.deleteUser(uid);
    console.log("\nDone. Auth account deleted; the person has lost access to the course.");
  } else {
    console.log("\nDone.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
