import { LEGAL } from "@/content/legal";
import { adminDb } from "@/lib/firebase/admin";

export type ServerAcceptance = { termsVersion: string; privacyVersion: string; acceptedAt: string };

/**
 * Validates an acceptance record sent by the browser: it must be for the
 * CURRENT versions of both documents (an old one means "re-accept"), and the
 * timestamp must be a real date. Anything else is ignored.
 */
export function parseAcceptance(input: unknown): ServerAcceptance | undefined {
  if (!input || typeof input !== "object") return undefined;
  const a = input as Record<string, unknown>;
  if (a.terms !== LEGAL.termsVersion || a.privacy !== LEGAL.privacyVersion) return undefined;
  const at = typeof a.at === "string" ? Date.parse(a.at) : NaN;
  if (!Number.isFinite(at)) return undefined;
  return {
    termsVersion: LEGAL.termsVersion,
    privacyVersion: LEGAL.privacyVersion,
    acceptedAt: new Date(at).toISOString(),
  };
}

// One immutable doc per version pair, in a server-only subcollection. The same
// doc is written at login/checkout and by the "we've updated our policies" dialog.
function currentAcceptanceRef(uid: string) {
  return adminDb
    .collection("users")
    .doc(uid)
    .collection("legalAcceptances")
    .doc(`${LEGAL.termsVersion}_${LEGAL.privacyVersion}`);
}

/** Has this account accepted the CURRENT Terms + Privacy Policy? */
export async function hasCurrentAcceptance(uid: string): Promise<boolean> {
  return (await currentAcceptanceRef(uid).get()).exists;
}

/**
 * Records acceptance of the current versions from the policy-update dialog.
 * The browser says which versions it showed; if those are no longer current
 * (the policies changed again, or the page is stale) nothing is recorded.
 */
export async function acceptCurrentFromDialog(uid: string, input: unknown): Promise<"ok" | "stale"> {
  const a = (input ?? {}) as Record<string, unknown>;
  if (a.terms !== LEGAL.termsVersion || a.privacy !== LEGAL.privacyVersion) return "stale";
  await currentAcceptanceRef(uid)
    .create({
      termsVersion: LEGAL.termsVersion,
      privacyVersion: LEGAL.privacyVersion,
      acceptedAt: new Date().toISOString(),
      recordedAt: new Date(),
      via: "policy-update-dialog",
    })
    .catch((err: { code?: number }) => {
      if (err?.code !== 6) throw err; // 6 = ALREADY_EXISTS: accepted in another tab, fine
    });
  return "ok";
}

export const POLICY_UPDATE_REQUIRED = {
  error: "We've updated our policies. Please review and accept them in your dashboard to continue.",
  code: "policy-update-required",
} as const;
