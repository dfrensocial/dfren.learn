// One-off Firestore seed for the single course this site sells — run with:
//   npx tsx scripts/seed-course.ts
// Re-run any time src/content/courses/geo-blueprint.ts changes (title/price).
// There's no admin UI yet; when one exists, it should write through the same
// Firestore shape this script does.

export {}; // force module scope so this file's `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

async function main() {
  const { adminDb } = await import("../src/lib/firebase/admin");
  const { geoBlueprintCourse } = await import("../src/content/courses/geo-blueprint");

  const { id, title, hero, pricing } = geoBlueprintCourse;

  await adminDb
    .collection("courses")
    .doc(id)
    .set(
      {
        title,
        slug: id,
        description: hero.subheadline,
        priceInPaise: pricing.priceInPaise,
        thumbnailUrl: "",
        published: true,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

  await adminDb
    .collection("courses")
    .doc(id)
    .collection("lessons")
    .doc("lesson-1")
    .set(
      {
        title: "Lesson 1 — placeholder, replace once video is uploaded to Mux",
        order: 1,
        status: "pending",
      },
      { merge: true }
    );

  console.log(`Seeded course "${title}" (${id}) at ₹${pricing.priceInPaise / 100}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
