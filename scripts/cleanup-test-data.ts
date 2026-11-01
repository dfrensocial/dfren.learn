// Removes leftover test data from the live Firebase project and Mux:
//   - every Auth user whose email is NOT in ADMIN_EMAILS (plus their whole
//     users/{uid} tree: enrollments, loginEvents, activeSessions)
//   - watermark records belonging to those users
//   - Mux assets tagged for lesson-1 that the lesson no longer points at
//
// DRY RUN by default — prints what it would delete and touches nothing.
//   npx tsx scripts/cleanup-test-data.ts             # preview
//   npx tsx scripts/cleanup-test-data.ts --confirm   # actually delete
//
// Only safe while there are no real buyers: it deletes anyone not an admin.

export {}; // force module scope so this file's `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

const CONFIRM = process.argv.includes("--confirm");

async function main() {
  const { adminAuth, adminDb } = await import("../src/lib/firebase/admin");
  const { mux } = await import("../src/lib/mux/server");
  const { lessonMuxDataRef } = await import("../src/lib/mux/lesson-doc");

  const keep = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (keep.length === 0) throw new Error("ADMIN_EMAILS is empty — refusing to run (it would delete everyone).");
  console.log(CONFIRM ? "MODE: DELETE\n" : "MODE: dry run (pass --confirm to delete)\n");
  console.log("Keeping:", keep.join(", "), "\n");

  // Auth users + their Firestore trees
  const { users } = await adminAuth.listUsers(1000);
  const doomed = users.filter((u) => !keep.includes((u.email ?? "").toLowerCase()));
  const doomedUids = new Set(doomed.map((u) => u.uid));
  for (const u of doomed) {
    console.log(`user   ${u.email ?? u.uid}`);
    if (CONFIRM) {
      await adminDb.recursiveDelete(adminDb.collection("users").doc(u.uid));
      await adminAuth.deleteUser(u.uid);
    }
  }

  // Watermark records pointing at deleted users
  const marks = await adminDb.collection("watermarks").get();
  for (const m of marks.docs) {
    if (!doomedUids.has(m.data().uid)) continue;
    console.log(`mark   ${m.id} (${m.data().email})`);
    if (CONFIRM) await m.ref.delete();
  }

  // Stale Mux assets for lesson-1 (never the one currently wired in)
  const liveAssetId = (await lessonMuxDataRef(adminDb, "geo-blueprint", "lesson-1").get()).data()?.muxAssetId;
  if (!liveAssetId) throw new Error("lesson-1 has no live Mux asset recorded — refusing to touch Mux assets.");
  const assets = await mux.video.assets.list({ limit: 100 });
  for (const a of assets.data) {
    if (a.passthrough !== "geo-blueprint:lesson-1" || a.id === liveAssetId) continue;
    console.log(`asset  ${a.id} (${a.status}, ${Math.round(a.duration ?? 0)}s)`);
    if (CONFIRM) await mux.video.assets.delete(a.id);
  }

  console.log(CONFIRM ? "\nDone." : "\nNothing deleted. Re-run with --confirm to apply.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
