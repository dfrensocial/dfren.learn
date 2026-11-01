// Stores a downloadable file for a course (worksheet, slides, templates…).
//
// The file's bytes go into a private Firestore subdoc that no client can read
// (see firestore.rules) and are served only by /api/resources after a session
// + enrollment check. Firestore caps a document at 1 MiB, so this is for small
// files; anything bigger needs real object storage (Firebase Storage / GCS,
// which requires the Blaze plan).
//
// Source files must NOT go in the repo — the production repo is public.
//
// Usage: npx tsx scripts/upload-resource.ts <file> <resourceId> <order> "<title>" "<description>" [courseId]
// Re-running with the same resourceId replaces the file.

export {}; // force module scope so this file's `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

const MAX_BYTES = 900 * 1024; // headroom under Firestore's 1 MiB document limit

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
    throw new Error(`File is ${(bytes.length / 1024).toFixed(0)} KB; the limit here is ${MAX_BYTES / 1024} KB. Use Firebase Storage for larger files.`);
  }
  const filename = path.basename(filePath);
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) throw new Error(`Unsupported file type ".${ext}" (add it to CONTENT_TYPES).`);

  const { adminDb } = await import("../src/lib/firebase/admin");
  const ref = adminDb.collection("courses").doc(courseId).collection("resources").doc(resourceId);
  await ref.set({ title, description, filename, contentType, size: bytes.length, order: Number(orderStr) });
  await ref.collection("file").doc("data").set({ bytes });
  console.log(`Stored "${title}" (${filename}, ${(bytes.length / 1024).toFixed(0)} KB) as ${courseId}/${resourceId}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
