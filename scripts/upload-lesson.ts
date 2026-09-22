// Uploads a local video file as a lesson's Mux asset and wires it into
// Firestore. This is the intended way to add real lesson videos — it
// guarantees playback_policy: "signed" (a manual Mux dashboard upload
// defaults to "public", which would bypass the whole protection scheme)
// and there's no admin UI yet to do this any other way.
//
// Usage: npx tsx scripts/upload-lesson.ts <videoFilePath> <lessonId> <order> "<title>" [courseId]
// Example: npx tsx scripts/upload-lesson.ts ./videos/lesson1.mp4 lesson-1 1 "How AI Actually Picks the Next Word"

export {}; // force module scope so this file's `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

async function main() {
  const [, , filePath, lessonId, orderStr, title, courseId = "geo-blueprint"] = process.argv;

  if (!filePath || !lessonId || !orderStr || !title) {
    console.error(
      'Usage: npx tsx scripts/upload-lesson.ts <videoFilePath> <lessonId> <order> "<title>" [courseId]'
    );
    process.exit(1);
  }

  const fs = await import("fs");
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const { adminDb } = await import("../src/lib/firebase/admin");
  const { mux } = await import("../src/lib/mux/server");

  console.log("Creating Mux direct upload...");
  const upload = await mux.video.uploads.create({
    cors_origin: "*",
    new_asset_settings: {
      playback_policy: ["signed"],
      passthrough: `${courseId}:${lessonId}`,
      // Auto-generate English subtitles from the lesson audio (Mux's built-in
      // speech-to-text, included on standard plans — no separate captioning
      // service). The main input is the direct-upload file itself, so this
      // entry omits `url` per Mux's docs for that case. Tracks land in the
      // `preparing` state and flip to `ready` shortly after the asset itself
      // does; they're then served inside the same signed HLS manifest, so no
      // extra signed-token plumbing is needed to expose them in the player.
      inputs: [
        {
          generated_subtitles: [{ language_code: "en", name: "English (auto)" }],
        },
      ],
    },
  });

  if (!upload.url) throw new Error("Mux did not return an upload URL");

  console.log(`Uploading ${filePath}...`);
  const fileBuffer = fs.readFileSync(filePath);
  const putRes = await fetch(upload.url, { method: "PUT", body: fileBuffer });
  if (!putRes.ok) {
    throw new Error(`Upload PUT failed: ${putRes.status} ${await putRes.text()}`);
  }

  console.log("Waiting for Mux to link the asset...");
  let current = await mux.video.uploads.retrieve(upload.id);
  while (!current.asset_id) {
    await new Promise((r) => setTimeout(r, 2000));
    current = await mux.video.uploads.retrieve(upload.id);
  }

  console.log(`Asset ${current.asset_id} created, waiting for processing...`);
  let asset = await mux.video.assets.retrieve(current.asset_id);
  while (asset.status !== "ready") {
    if (asset.status === "errored") {
      throw new Error(`Mux asset errored: ${JSON.stringify(asset.errors)}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
    asset = await mux.video.assets.retrieve(current.asset_id!);
    console.log(`  status: ${asset.status}`);
  }

  const playbackId = asset.playback_ids?.[0]?.id;
  if (!playbackId) throw new Error("No playback ID on ready asset");

  const subtitleTrack = asset.tracks?.find((t) => t.type === "text");
  if (subtitleTrack) {
    console.log(
      `Auto-generated subtitles: track ${subtitleTrack.id} is "${subtitleTrack.status}" (usually finishes shortly after the asset itself).`
    );
  }

  await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .doc(lessonId)
    .set(
      {
        title,
        order: Number(orderStr),
        muxPlaybackId: playbackId,
        muxAssetId: asset.id,
        status: "ready",
      },
      { merge: true }
    );

  console.log(`Done. Lesson "${title}" (${lessonId}) is live with playbackId ${playbackId}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
