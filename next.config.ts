import type { NextConfig } from "next";

// Verified against this app's actual traffic: Firebase Auth/Firestore,
// Mux video delivery + Data beacon, and Razorpay's checkout widget.
//
// Razorpay directives are deliberately generous (bare razorpay.com and
// rzp.io, not just subdomains — checkout can redirect/frame through either)
// since real Razorpay checkout can't be tested yet (account pending KYC).
// Re-verify against the browser console once a real payment flow runs end
// to end — a CSP violation there fails silently from the user's side, it
// just won't collect payment.
//
// Mux's CDN edges use multi-level subdomains (e.g.
// manifest-oci-us-phoenix-1-vop1.fastly.mux.com) that a single-level
// `*.mux.com` wildcard cannot match per the CSP spec, so media-src stays
// broader (https: blob:) rather than risk silently breaking video delivery
// on some edges and not others.
// Next.js dev mode (Turbopack) needs eval() for its own debugging/hot-reload
// machinery — "React will never use eval() in production mode" per its own
// warning, so this is scoped to dev only rather than weakening the real CSP.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "https://checkout.razorpay.com",
  "https://*.razorpay.com",
  ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : []),
].join(" ");

const CSP = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  // blob: is needed for client-side file-preview <img> tags (e.g. the
  // watermark checker's upload preview) that read a local File via
  // URL.createObjectURL -- it can only ever point at same-context objects
  // this page itself created, not a remote resource, so it's not a
  // meaningful CSP loosening.
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.mux.com https://inferred.litix.io https://*.razorpay.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com https://razorpay.com https://rzp.io",
  "form-action 'self' https://razorpay.com https://rzp.io https://*.razorpay.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // No-op over plain http (local dev); real once deployed behind HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
