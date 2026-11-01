import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark checker",
  robots: { index: false, follow: false },
};

export default function WatermarkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
