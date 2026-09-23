import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/firebase/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dfrenLearn",
  description: "Learn the course, at your own pace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
