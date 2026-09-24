import crypto from "node:crypto";
import { adminDb } from "@/lib/firebase/admin";

// Deterministic per (uid, courseId, lessonId) -- reloading the page or
// resuming later issues the SAME id rather than a fresh one each time, so
// the watermarks collection doesn't grow unbounded and a leak can still be
// traced even if it's stitched together from multiple sessions. 6 hex chars
// (24 bits) keeps the payload short, which matters more than uniqueness
// margin here: the decoder gets more repeats of a shorter payload per
// frame, which is what actually buys invisibility at low delta.
export function watermarkIdFor(uid: string, courseId: string, lessonId: string): string {
  return crypto.createHash("sha256").update(`${uid}:${courseId}:${lessonId}`).digest("hex").slice(0, 6);
}

export async function issueWatermark({
  uid,
  email,
  courseId,
  lessonId,
}: {
  uid: string;
  email: string;
  courseId: string;
  lessonId: string;
}): Promise<string> {
  const id = watermarkIdFor(uid, courseId, lessonId);
  await adminDb
    .collection("watermarks")
    .doc(id)
    .set({ email, uid, courseId, lessonId, issuedAt: new Date() }, { merge: true });
  return id;
}
