import { adminDb } from "@/lib/firebase/admin";

/**
 * Confirms courseId corresponds to a real, published course before any
 * order/verify/webhook/test-payment flow acts on it. Mirrors the check
 * originally in /api/razorpay/create-order — every route that grants access
 * or creates a charge for a courseId (even one sourced from an
 * already-authoritative place, like a Razorpay order's own notes) must not
 * assume that courseId still exists or is still on sale.
 */
export async function isValidPublishedCourse(courseId: string): Promise<boolean> {
  const courseSnap = await adminDb.collection("courses").doc(courseId).get();
  const course = courseSnap.data();
  return courseSnap.exists && course?.published === true;
}
