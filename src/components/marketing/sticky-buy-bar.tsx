"use client";

import { useEffect, useState } from "react";
import { CourseCta } from "@/components/marketing/course-cta";
import { geoBlueprintCourse } from "@/content/courses/geo-blueprint";
import { rupeesFromPaise } from "@/lib/gst";

/**
 * Sticky buy bar pinned to the bottom of the screen. Appears once the visitor scrolls past the hero,
 * hides while the pricing card (or the footer) is on screen so it never sits on top of the real checkout.
 */
export function StickyBuyBar() {
  const [pastHero, setPastHero] = useState(false);
  const [covered, setCovered] = useState(false);
  const price = rupeesFromPaise(geoBlueprintCourse.pricing.priceInPaise);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const targets = ["pricing"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!targets.length) return;
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target));
      setCovered(seen.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const visible = pastHero && !covered;

  // Lets the floating WhatsApp button move up out of the bar's way.
  useEffect(() => {
    if (visible) document.body.setAttribute("data-sticky-bar", "1");
    else document.body.removeAttribute("data-sticky-bar");
    return () => document.body.removeAttribute("data-sticky-bar");
  }, [visible]);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.35)] backdrop-blur transition-transform duration-300 ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 pr-16 sm:pr-0">
        <div className="min-w-0 text-white">
          <p className="truncate text-sm font-semibold sm:text-base">The GEO Blueprint</p>
          <p className="text-xs text-neutral-400">
            <span className="text-base font-bold text-accent-light sm:text-lg">₹{price}</span> incl. GST · one time
          </p>
        </div>
        <CourseCta
          courseId={geoBlueprintCourse.id}
          label="Enroll now"
          location="sticky_bar"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark sm:px-8"
        />
      </div>
    </div>
  );
}
