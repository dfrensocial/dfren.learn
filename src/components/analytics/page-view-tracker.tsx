"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track, initClarity, clarityTag } from "@/lib/analytics";
import { captureAttribution, getAttribution } from "@/lib/attribution";
import { useConsent } from "@/lib/consent";

// Module-level so they survive React re-running effects (StrictMode does this
// in dev) without sending the same thing twice.
let lastTrackedPath: string | null = null;
let attributionCaptured = false;

/**
 * Everything here waits for the visitor's choice (see consent.ts):
 * - analytics yes: remembers where they came from (first/last touch) and sends
 *   a page_view on first load and on every client-side navigation. Path only:
 *   query strings can carry redirect targets and one-time codes.
 * - recordings yes: starts Clarity and tags the session with its traffic
 *   source when we know it. Clarity is never given an account id or email.
 * - no / undecided: does nothing at all.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const { analytics, replay } = useConsent();

  useEffect(() => {
    if (!analytics) {
      // Withdrawn (or never given): allow a fresh start if they opt in later.
      attributionCaptured = false;
      lastTrackedPath = null;
      return;
    }
    if (!attributionCaptured) {
      attributionCaptured = true;
      captureAttribution();
    }
  }, [analytics]);

  useEffect(() => {
    if (!replay) return;
    void initClarity();
    const touch = getAttribution().last;
    if (touch) {
      void clarityTag("source", touch.source);
      void clarityTag("medium", touch.medium);
      if (touch.campaign) void clarityTag("campaign", touch.campaign);
    }
    // pathname: a visit that began on an excluded URL (sign-in callback) starts recording once it moves on
  }, [replay, analytics, pathname]);

  useEffect(() => {
    if (!analytics || pathname === lastTrackedPath) return;
    lastTrackedPath = pathname;
    track("page_view", {
      page_path: pathname,
      page_location: window.location.origin + pathname,
      page_title: document.title,
    });
  }, [pathname, analytics]);

  return null;
}
