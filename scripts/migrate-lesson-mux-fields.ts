// One-off migration: moves muxPlaybackId/muxAssetId off the (publicly
// listable) lesson doc into the private lessons/{id}/mux/data subdoc, per
// the 2026-09-23 Firestore rules restructure. Safe to re-run — no-ops on
// lessons already migrated. Delete this script once run against every
// environment that has lessons predating the restructure.
// Usage: npx tsx scripts/migrate-lesson-mux-fields.ts [courseId]

export {};

process.loadEnvFile(".env.local");

async function main() {
  const courseId = process.argv[2] ?? "geo-blueprint";

  const { adminDb } = await import("../src/lib/firebase/admin");
  const { writeLessonMuxData } = await import("../src/lib/mux/lesson-doc");
  const { FieldValue } = await import("firebase-admin/firestore");

  const lessonsRef = adminDb.collection("courses").doc(courseId).collection("lessons");
  const snap = await lessonsRef.get();

  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.muxPlaybackId) {
      console.log(`${doc.id}: no flat muxPlaybackId, skipping`);
      continue;
    }

    await writeLessonMuxData(adminDb, courseId, doc.id, {
      muxPlaybackId: data.muxPlaybackId,
      muxAssetId: data.muxAssetId,
    });
    await lessonsRef.doc(doc.id).update({
      muxPlaybackId: FieldValue.delete(),
      muxAssetId: FieldValue.delete(),
    });
    console.log(`${doc.id}: migrated to mux/data subdoc`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
