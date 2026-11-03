import type { Metadata } from "next";

// Description and canonical live here, not in page.tsx, so editing them never
// changes the policy text that the version check hashes.
export const metadata: Metadata = {
  description: "dfrenLearn's cancellation and refund policy: no refunds for change of mind, and when we do refund an extra charge or access we can't fix.",
  alternates: { canonical: "/refund-policy" },
  openGraph: { url: "https://learn.dfren.in/refund-policy", type: "article", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The GEO Blueprint: a 1.5-hour GEO course by dfrenLearn" }] },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
