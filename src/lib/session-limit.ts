import { adminDb } from "@/lib/firebase/admin";
import type { Firestore } from "firebase-admin/firestore";

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
 * self-heals without needing a cleanup job. Sessions long dead are deleted
 * opportunistically as part of the same transaction, so the collection stays
 * small without a scheduled job.
 */
const MAX_CONCURRENT_STREAMS = 2;
const STALE_AFTER_MS = 45_000;
const PURGE_AFTER_MS = 24 * 60 * 60_000;

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

  // Transaction, not read-then-write: otherwise N parallel requests all read
  // "1 active session" before any of them writes, and every one is allowed.
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    let activeOthers = 0;

    for (const doc of snap.docs) {
      const lastSeen = doc.data().lastSeen?.toMillis?.() ?? 0;
      const age = now - lastSeen;
      if (age >= PURGE_AFTER_MS) tx.delete(doc.ref);
      if (doc.id === sessionId || age >= STALE_AFTER_MS) continue;
      activeOthers++;
    }

    if (activeOthers >= MAX_CONCURRENT_STREAMS) return { allowed: false };

    tx.set(ref.doc(sessionId), { courseId, lessonId, lastSeen: new Date() }, { merge: true });
    return { allowed: true };
  });
}
