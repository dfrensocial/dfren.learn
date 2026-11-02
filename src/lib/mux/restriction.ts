import { adminDb } from "@/lib/firebase/admin";

// The Mux playback restriction (domain lock) id lives in Firestore
// (config/mux, written by scripts/setup-mux-restriction.ts) so it needs no
// extra deploy-time env var. Cached briefly per server instance.
const CACHE_MS = 10 * 60_000;
let cached: { id: string | undefined; at: number } | null = null;

/** Returns the restriction id, or undefined if none is configured (tokens are then unrestricted, as before). */
export async function getPlaybackRestrictionId(): Promise<string | undefined> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.id;
  try {
    const snap = await adminDb.collection("config").doc("mux").get();
    const id = snap.data()?.playbackRestrictionId;
    cached = { id: typeof id === "string" && id ? id : undefined, at: Date.now() };
  } catch {
    // Never block playback because the lookup failed; try again next time.
    return cached?.id;
  }
  return cached.id;
}
