// Creates the Mux playback restriction that locks video playback to our own
// site (stops the stream being embedded in someone else's page), and records
// its id in Firestore (config/mux) where /api/mux/playback-token reads it.
//
// A restriction does nothing until a signed token carries its id, so running
// this is inert on its own. Safe to re-run: reuses an existing restriction with
// the same settings instead of creating a duplicate.
//
// allow_no_referrer is deliberately TRUE: some privacy browsers/extensions send
// no Referer at all, and blocking them would break legitimate students. The
// lock still stops any *other website* from playing our stream, which is the
// hotlinking case a referrer check can actually cover.
//
// Usage: npx tsx scripts/setup-mux-restriction.ts

export {}; // force module scope so this file's `main` doesn't collide with other scripts

process.loadEnvFile(".env.local");

const ALLOWED_DOMAINS = ["learn.dfren.in", "localhost"];

async function main() {
  const { muxVideo } = await import("../src/lib/mux/server");
  const { adminDb } = await import("../src/lib/firebase/admin");

  let id: string | undefined;
  for await (const r of muxVideo.playbackRestrictions.list()) {
    const domains = r.referrer?.allowed_domains ?? [];
    if (
      r.referrer?.allow_no_referrer === true &&
      domains.length === ALLOWED_DOMAINS.length &&
      ALLOWED_DOMAINS.every((d) => domains.includes(d))
    ) {
      id = r.id;
      console.log(`Reusing existing restriction ${id}`);
      break;
    }
  }

  if (!id) {
    const created = await muxVideo.playbackRestrictions.create({
      referrer: { allowed_domains: ALLOWED_DOMAINS, allow_no_referrer: true },
      // Not restricting by user agent: only the referrer lock is wanted.
      user_agent: { allow_no_user_agent: true, allow_high_risk_user_agent: true },
    });
    id = created.id;
    console.log(`Created restriction ${id}`);
  }

  await adminDb.collection("config").doc("mux").set({ playbackRestrictionId: id }, { merge: true });
  console.log("Saved to Firestore config/mux.playbackRestrictionId");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
