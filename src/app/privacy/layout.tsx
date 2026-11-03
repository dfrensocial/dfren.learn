import type { Metadata } from "next";

// Description and canonical live here, not in page.tsx, so editing them never
// changes the policy text that the version check hashes.
export const metadata: Metadata = {
  description: "How dfrenLearn handles your data under India's DPDP Act: what we collect, why, optional analytics and replay, and how to reach our Grievance Officer.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "https://learn.dfren.in/privacy", type: "article", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The GEO Blueprint: a 1.5-hour GEO course by dfrenLearn" }] },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
