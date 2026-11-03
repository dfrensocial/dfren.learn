import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { ConsentBanner } from "@/components/consent/consent-banner";
import { BusyProvider } from "@/components/ui/busy-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE = "https://learn.dfren.in";
const SITE_DESCRIPTION =
  "dfrenLearn teaches GEO (generative engine optimization): how to get a business named by ChatGPT, Gemini and Claude. Short practical courses and plain guides.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "dfrenLearn: learn GEO, get found by AI assistants",
  description: SITE_DESCRIPTION,
  applicationName: "dfrenLearn",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "dfrenLearn",
    locale: "en_IN",
    url: SITE,
    title: "dfrenLearn: learn GEO, get found by AI assistants",
    description: SITE_DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The GEO Blueprint: a 1.5-hour GEO course by dfrenLearn" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "dfrenLearn: learn GEO, get found by AI assistants",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The className here is fully deterministic (static font-variable
      // classes, no client-only branches) -- the recurring hydration
      // mismatch on this exact tag is a browser extension injecting
      // attributes into <html> before React hydrates, which is the case
      // React's own docs point to suppressHydrationWarning for. It only
      // silences a mismatch on this element's own attributes, not children,
      // so a real hydration bug elsewhere in the tree still surfaces.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <BusyProvider>
          <AuthProvider>
            <PageViewTracker />
            {children}
            <ConsentBanner />
          </AuthProvider>
        </BusyProvider>
      </body>
    </html>
  );
}
