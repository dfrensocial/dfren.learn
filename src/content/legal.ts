// Shared facts the legal pages quote, kept in one place so the footer, the
// pricing/guarantee copy, the consent UI and the policies can't drift apart.
export const LEGAL = {
  brand: "dfrenLearn",
  website: "learn.dfren.in",
  // Registered business name on the Razorpay account — keep identical to it.
  // (Legal form suffix, e.g. LLP / Pvt Ltd, still to be confirmed by the owner.)
  entity: "DFREN Marketing Agency",
  address: "7/16, Lutheran Church St, Kadaperi, Tambaram, Tamil Nadu 600045, India",
  // One inbox for support, privacy requests and grievances.
  contactEmail: "dfrensocial@gmail.com",
  grievanceEmail: "dfrensocial@gmail.com",
  grievanceAckHours: 48,
  grievanceResolveDays: 30,
  refundWindowDays: 7,
  // Date of the last substantive edit to any of the three policies.
  updated: "2 November 2026",
  // Bump when the Terms / Privacy Policy change in a way users must re-accept.
  // Stored with every acceptance (login + checkout) as proof of what was agreed.
  termsVersion: "2026-11-02",
  privacyVersion: "2026-11-02",
  // Bump when the banner's purposes/wording change, so old choices are re-asked.
  consentVersion: "2026-11-02",
};
