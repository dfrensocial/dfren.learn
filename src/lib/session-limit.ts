import { adminDb } from "@/lib/firebase/admin";
import type { Firestore, QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

/**
 * Caps how many devices/tabs can be actively streaming under one account at
 * once. Real ceiling worth knowing: once a signed Mux token is issued, the
 * actual video segments stream from Mux's CDN, not through our server — so
 * this can only govern *who gets a token*, not enforce anything once one is
 * out in the wild. It's the closest thing to Netflix's "too many screens"
 * limit available without full DRM (which would do per-session enforcement
 * at the decrypt layer instead).
 *
 * A "session" is one player mount, identified by a random ID the client
 * generates once per mount (not persisted — reloading the page is a new
 * session, which is correct: we're capping simultaneous *playing* streams,
 * not counting devices over time). It's kept "active" by a heartbeat while
 * playing; sessions with no heartbeat in STALE_AFTER_MS are ignored, so this
 * self-heals without needing a cleanup job. Doc count grows unboundedly over
 * the life of the app since stale sessions are never deleted, only ignored —
 * fine at today's scale, worth revisiting (e.g. a Firestore TTL policy on
 * `lastSeen`) if this collection ever gets large enough to matter.
 */
const MAX_CONCURRENT_STREAMS = 2;
const STALE_AFTER_MS = 45_000;

function sessionsRef(db: Firestore, uid: string) {
  return db.collection("users").doc(uid).collection("activeSessions");
}

export async function checkAndRegisterSession({
  uid,
  sessionId,
  courseId,
  lessonId,
}: {
  uid: string;
  sessionId: string;
  courseId: string;
  lessonId: string;
}): Promise<{ allowed: boolean }> {
  const ref = sessionsRef(adminDb, uid);
  const snap = await ref.get();
  const now = Date.now();

  const activeOthers = snap.docs.filter((doc: QueryDocumentSnapshot<DocumentData>) => {
    if (doc.id === sessionId) return false;
    const lastSeen = doc.data().lastSeen?.toMillis?.() ?? 0;
    return now - lastSeen < STALE_AFTER_MS;
  });

  if (activeOthers.length >= MAX_CONCURRENT_STREAMS) {
    return { allowed: false };
  }

  await ref.doc(sessionId).set(
    {
      courseId,
      lessonId,
      lastSeen: new Date(),
    },
    { merge: true }
  );

  return { allowed: true };
}
