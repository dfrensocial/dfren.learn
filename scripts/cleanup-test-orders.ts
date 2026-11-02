// Deletes ONLY the scratch collection used while testing the order ledger
// (`_orders_test`). Never touches the real `orders` collection, users, or Mux.
//
//   npx tsx scripts/cleanup-test-orders.ts             # preview
//   npx tsx scripts/cleanup-test-orders.ts --confirm   # delete

export {}; // force module scope so this file's `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

const SCRATCH = "_orders_test";
const CONFIRM = process.argv.includes("--confirm");

async function main() {
  const { adminDb } = await import("../src/lib/firebase/admin");
  const snap = await adminDb.collection(SCRATCH).get();
  console.log(`${CONFIRM ? "MODE: DELETE" : "MODE: dry run (pass --confirm to delete)"} -- ${snap.size} docs in ${SCRATCH}`);
  if (CONFIRM) {
    await adminDb.recursiveDelete(adminDb.collection(SCRATCH));
    console.log("Deleted.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
