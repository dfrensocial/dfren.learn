"use client";

import { usePathname } from "next/navigation";
import { LEGAL } from "@/content/legal";
import { track } from "@/lib/analytics";

// Owner tools never show it.
const HIDDEN_ON = ["/admin", "/watermark"];

// The number is the one already published on the site (LEGAL.grievancePhone),
// reduced to digits for wa.me. A plain link: nothing loads from WhatsApp until
// someone taps it, so it needs no consent.
const NUMBER = LEGAL.grievancePhone.replace(/\D/g, "");
const MESSAGE = "Hi, I have a question about The GEO Blueprint.";

/** Floating "chat on WhatsApp" button, bottom right of every public page. */
export function WhatsAppButton() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <a
      href={`https://wa.me/${NUMBER}?text=${encodeURIComponent(MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      onClick={() => track("cta_click", { cta_location: "floating", cta_label: "whatsapp" })}
      className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition hover:scale-105 hover:bg-[#1ebe5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.19 1.6 6.02L4 29l8.1-1.57a12 12 0 0 0 3.94.66h.01C22.7 28.1 28 22.7 28 16.06 28 9.4 22.68 3 16.04 3Zm0 22.08h-.01a10 10 0 0 1-5.1-1.4l-.37-.22-3.78.73.76-3.68-.24-.38a9.97 9.97 0 0 1-1.54-5.32c0-5.5 4.48-9.98 9.99-9.98 2.66 0 5.16 1.04 7.04 2.92a9.9 9.9 0 0 1 2.92 7.06c0 5.5-4.47 9.97-9.97 9.97Zm5.47-7.47c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
