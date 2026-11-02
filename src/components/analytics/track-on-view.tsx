"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { useConsent } from "@/lib/consent";

/**
 * Fires an analytics event once, the first time the wrapped content is at
 * least half on screen (e.g. the pricing card -> GA4 "view_item").
 */
export function TrackOnView({
  event,
  params,
  children,
}: {
  event: string;
  params?: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const firedRef = useRef(false);
  const { analytics } = useConsent();
  // Params only matter at fire time; keep the latest without re-subscribing.
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  });

  useEffect(() => {
    // Waits for a yes: if they accept later while this is on screen, it fires then.
    if (!analytics) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (firedRef.current || !entries.some((e) => e.isIntersecting)) return;
        firedRef.current = true;
        track(event, paramsRef.current);
        observer.disconnect();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [event, analytics]);

  return <div ref={ref}>{children}</div>;
}
