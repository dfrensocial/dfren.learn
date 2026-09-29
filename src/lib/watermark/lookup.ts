import { adminDb } from "@/lib/firebase/admin";
import type { Timestamp } from "firebase-admin/firestore";

// Populated once real per-viewer watermarking is wired into the player (each
// issued id gets written here, keyed by the id itself). Until then this
// just returns null for every id -- the decode side works standalone.
export type WatermarkRecord = {
  email: string;
  uid: string;
  courseId: string;
  lessonId: string;
  issuedAt?: Timestamp;
};

export async function lookupWatermark(id: string): Promise<WatermarkRecord | null> {
  const snap = await adminDb.collection("watermarks").doc(id).get();
  if (!snap.exists) return null;
  return snap.data() as WatermarkRecord;
}
