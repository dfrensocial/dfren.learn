import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// Description and canonical live here, not in page.tsx, so editing them never
// changes the policy text that the version check hashes.
export const metadata: Metadata = {
  description: "The terms for buying and using dfrenLearn courses: what the licence covers, who can use it, payments and access.",
  alternates: { canonical: "/terms" },
  openGraph: { url: `${SITE_URL}/terms`, type: "article", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The GEO Blueprint: a 1.5-hour GEO course by dfrenLearn" }] },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
