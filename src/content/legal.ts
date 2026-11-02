// Shared facts the legal pages quote, kept in one place so the footer, the
// pricing/guarantee copy, the consent UI and the policies can't drift apart.
export const LEGAL = {
  brand: "dfrenLearn",
  website: "learn.dfren.in",
  // Registered business name on the Razorpay account — keep identical to it.
  entity: "DFREN Marketing Agency",
  // Confirmed from the Razorpay business details (brand name: Dfren).
  entityType: "a partnership firm",
  address: "7/16, Lutheran Church St, Kadaperi, Tambaram, Tamil Nadu 600045, India",
  // One inbox for support, privacy requests and grievances.
  contactEmail: "dfrensocial@gmail.com",
  grievanceEmail: "dfrensocial@gmail.com",
  grievanceAckHours: 48,
  grievanceResolveDays: 30,
  // No change-of-mind refunds. We refund only an extra charge, or a payment where
  // access could not be given within this many days of the buyer telling us.
  accessFixDays: 30,
  // Date of the last substantive edit to any of the three policies.
  updated: "2 November 2026",
  // BUMP THESE whenever the Terms, the Refund policy (it is part of the Terms) or
  // the Privacy Policy change in a way people must agree to again. The version is
  // stored with every acceptance (login, checkout) as proof of what was agreed,
  // and a different version makes the dashboard block everyone behind the
  // "we've updated our policies" dialog until they accept (src/lib/policy-gate.ts).
  // Run `npm run policy:check` after editing a policy page: it fails if the text
  // changed but these were not bumped.
  termsVersion: "2026-11-02b",
  privacyVersion: "2026-11-02",
  // Bump when the banner's purposes/wording change, so old choices are re-asked.
  consentVersion: "2026-11-02",
};
