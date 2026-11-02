"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

// Module-level so it survives React re-running the effect (StrictMode does
// this in dev) without sending the same page twice in a row.
let lastTrackedPath: string | null = null;

/**
 * Sends a page_view on first load and on every client-side navigation (the
 * Firebase SDK only counts the initial load by itself). Path only -- query
 * strings are left out on purpose: they can carry redirect targets and
 * "purchased" flags that don't belong in analytics.
 */
export function PageViewTracker() {
  const pathname = usePathname();

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
