// The public origin used for canonical links, sitemap, robots and structured data.
// Production leaves NEXT_PUBLIC_SITE_URL unset, so it is always https://learn.dfren.in.
// A temporary preview host can set it at build time so audits of the preview see
// consistent URLs instead of pages that only exist on the live domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://learn.dfren.in").replace(/\/+$/, "");
