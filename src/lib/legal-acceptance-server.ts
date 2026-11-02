import { LEGAL } from "@/content/legal";

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
