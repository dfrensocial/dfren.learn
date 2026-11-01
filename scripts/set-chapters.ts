// Writes the chapter markers in src/content/courses/geo-blueprint-chapters.ts
// onto each lesson doc in Firestore (lessons/{id}.chapters). Safe to re-run.
//
// Usage: npx tsx scripts/set-chapters.ts [courseId]   (or: npm run set-chapters)

export {}; // force module scope so this file's `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

async function main() {
  const courseId = process.argv[2] ?? "geo-blueprint";
  const { adminDb } = await import("../src/lib/firebase/admin");
  const { lessonChapters } = await import("../src/content/courses/geo-blueprint-chapters");

  for (const [lessonId, chapters] of Object.entries(lessonChapters)) {
    const sorted = [...chapters].sort((a, b) => a.start - b.start);
    if (sorted[0]?.start !== 0) throw new Error(`${lessonId}: first chapter must start at 0:00`);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start === sorted[i - 1].start) throw new Error(`${lessonId}: duplicate start ${sorted[i].start}`);
    }
    const ref = adminDb.collection("courses").doc(courseId).collection("lessons").doc(lessonId);
    if (!(await ref.get()).exists) throw new Error(`Lesson ${courseId}/${lessonId} doesn't exist.`);
    await ref.set({ chapters: sorted }, { merge: true });
    console.log(`${lessonId}: wrote ${sorted.length} chapters`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
