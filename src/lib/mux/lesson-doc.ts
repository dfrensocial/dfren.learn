import type { Firestore } from "firebase-admin/firestore";

/**
 * muxPlaybackId/muxAssetId live in a private subdoc, not the lesson doc
 * itself — the lesson doc is publicly listable (course page shows titles to
 * everyone), and Firestore can't field-filter a list query, so anything
 * placed directly on the lesson doc would be readable by any unauthenticated
 * client via a collection query. The subdoc has no `list` rule and `get`
 * requires enrollment, so this data never gets returned that way. It's still
 * safe either way (Mux assets are signed-policy — an ID alone doesn't unlock
 * playback), but this closes the gap properly instead of relying on that as
 * the only backstop.
 */
export function lessonMuxDataRef(
  db: Firestore,
  courseId: string,
  lessonId: string
) {
  return db
    .collection("courses")
    .doc(courseId)
    .collection("lessons")
    .doc(lessonId)
    .collection("mux")
    .doc("data");
}

export async function writeLessonMuxData(
  db: Firestore,
  courseId: string,
  lessonId: string,
  data: { muxPlaybackId: string; muxAssetId: string }
) {
  await lessonMuxDataRef(db, courseId, lessonId).set(data, { merge: true });
}
