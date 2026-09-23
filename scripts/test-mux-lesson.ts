// One-off manual test: uploads a public-domain sample video to Mux as a
// signed-playback asset, wires it to the seeded lesson doc, and grants the
// test account enrollment — so the whole video-protection path (Mux signed
// tokens + Firestore enrollment gate) can be verified before Razorpay exists.
// Run with: npx tsx scripts/test-mux-lesson.ts
// Delete this script once Razorpay is live and checkout does this for real.

export {}; // force module scope so this file's `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

const TEST_VIDEO_URL =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4";
const COURSE_ID = "geo-blueprint";
const LESSON_ID = "lesson-1";
const TEST_EMAIL = "claude-ux-test@example.com";

async function main() {
  const { adminAuth, adminDb } = await import("../src/lib/firebase/admin");
  const { mux } = await import("../src/lib/mux/server");
  const { writeLessonMuxData } = await import("../src/lib/mux/lesson-doc");

  console.log("Creating Mux asset...");
  const asset = await mux.video.assets.create({
    inputs: [
      {
        url: TEST_VIDEO_URL,
        generated_subtitles: [{ language_code: "en", name: "English (auto)" }],
      },
    ],
    playback_policy: ["signed"],
    passthrough: `${COURSE_ID}:${LESSON_ID}`,
  });
  console.log(`Asset created: ${asset.id}, waiting for it to become ready...`);

  let ready = asset;
  while (ready.status !== "ready") {
    if (ready.status === "errored") {
      throw new Error(`Mux asset errored: ${JSON.stringify(ready.errors)}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
    ready = await mux.video.assets.retrieve(asset.id);
    console.log(`  status: ${ready.status}`);
  }

  const playbackId = ready.playback_ids?.[0]?.id;
  if (!playbackId) throw new Error("No playback ID on ready asset");

  await adminDb
    .collection("courses")
    .doc(COURSE_ID)
    .collection("lessons")
    .doc(LESSON_ID)
    .set({ status: "ready" }, { merge: true });
  await writeLessonMuxData(adminDb, COURSE_ID, LESSON_ID, {
    muxPlaybackId: playbackId,
    muxAssetId: ready.id,
  });
  console.log(`Lesson updated with playbackId: ${playbackId}`);

  const user = await adminAuth.getUserByEmail(TEST_EMAIL);
  await adminDb
    .collection("users")
    .doc(user.uid)
    .collection("enrollments")
    .doc(COURSE_ID)
    .set(
      { courseId: COURSE_ID, purchasedAt: new Date().toISOString(), paymentId: "manual-test" },
      { merge: true }
    );
  console.log(`Enrolled ${TEST_EMAIL} in ${COURSE_ID}`);
  console.log("Done — log in as the test account and open the course page.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
