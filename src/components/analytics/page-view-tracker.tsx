"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track, initClarity, clarityTag, clarityIdentify } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";
import { useAuth } from "@/lib/firebase/auth-context";

// Module-level so they survive React re-running effects (StrictMode does this
// in dev) without sending the same thing twice.
let lastTrackedPath: string | null = null;
let attributionCaptured = false;

/**
 * - Captures first/last-touch attribution once per full page load.
 * - Starts Clarity and tags the session with its traffic source.
 * - Sends a page_view on first load and on every client-side navigation (the
 *   Firebase SDK only counts the initial load by itself). Path only: query
 *   strings can carry redirect targets and "purchased" flags that don't
 *   belong in analytics.
 * - Links Clarity sessions of a signed-in person by their opaque uid.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (attributionCaptured) return;
    attributionCaptured = true;
    const touch = captureAttribution();
    void initClarity();
    void clarityTag("source", touch.source);
    void clarityTag("medium", touch.medium);
    if (touch.campaign) void clarityTag("campaign", touch.campaign);
  }, []);

  useEffect(() => {
    if (user) void clarityIdentify(user.uid);
  }, [user]);

  useEffect(() => {
    if (pathname === lastTrackedPath) return;
    lastTrackedPath = pathname;
    track("page_view", {
      page_path: pathname,
      page_location: window.location.origin + pathname,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
