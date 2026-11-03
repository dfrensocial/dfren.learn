// Stores a downloadable file for a course (worksheet, slides, templates…).
//
// The file goes into private Firebase Storage (storage.rules denies every client
// read) and /api/resources hands out a 60-second signed link after a session +
// enrollment check, so downloads don't pass through the web host. The Firestore
// doc holds only the metadata and the `storagePath`.
//
// Source files must NOT go in the repo — the production repo is public.
//
// Usage: npx tsx scripts/upload-resource.ts <file> <resourceId> <order> "<title>" "<description>" [courseId]
// Re-running with the same resourceId replaces the file.

export {}; // force module scope so this file's `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

const MAX_BYTES = 500 * 1024 * 1024; // sanity cap

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  zip: "application/zip",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  md: "text/markdown",
};

async function main() {
  const [, , filePath, resourceId, orderStr, title, description = "", courseId = "geo-blueprint"] = process.argv;
  if (!filePath || !resourceId || !orderStr || !title) {
    console.error('Usage: npx tsx scripts/upload-resource.ts <file> <resourceId> <order> "<title>" "<description>" [courseId]');
    process.exit(1);
  }

  const fs = await import("fs");
  const path = await import("path");
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  const bytes = fs.readFileSync(filePath);
  if (bytes.length > MAX_BYTES) {
    throw new Error(`File is ${(bytes.length / 1024 / 1024).toFixed(0)} MB; the limit here is ${MAX_BYTES / 1024 / 1024} MB.`);
  }
  const filename = path.basename(filePath);
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) throw new Error(`Unsupported file type ".${ext}" (add it to CONTENT_TYPES).`);

  const { adminDb, adminBucket } = await import("../src/lib/firebase/admin");
  const ref = adminDb.collection("courses").doc(courseId).collection("resources").doc(resourceId);
  const storagePath = `courses/${courseId}/resources/${resourceId}/${filename}`;
  await adminBucket.file(storagePath).save(bytes, { contentType, resumable: false });
  await ref.set({ title, description, filename, contentType, size: bytes.length, order: Number(orderStr), storagePath });
  await ref.collection("file").doc("data").delete(); // drop the old Firestore copy, if any
  console.log(`Stored "${title}" (${filename}, ${(bytes.length / 1024).toFixed(0)} KB) as ${courseId}/${resourceId}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
