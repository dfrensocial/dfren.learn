"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

/**
 * A centred spinner with a short message, for places that wait on a check
 * (signing in, checking the account, opening a page). If it takes longer than
 * `slowAfterMs`, `slowContent` appears under it (a hint plus a way out), so
 * nobody is ever left staring at a spinner that may never finish.
 */
export function PageLoader({
  label,
  hint,
  fullScreen = false,
  slowAfterMs,
  slowContent,
  className = "",
}: {
  label: string;
  hint?: string;
  /** Fill the whole screen (login page) instead of just the area it sits in. */
  fullScreen?: boolean;
  slowAfterMs?: number;
  slowContent?: React.ReactNode;
  className?: string;
}) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!slowAfterMs || !slowContent) return;
    const id = window.setTimeout(() => setSlow(true), slowAfterMs);
    return () => window.clearTimeout(id);
  }, [slowAfterMs, slowContent]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 px-6 text-center text-black ${
        fullScreen ? "min-h-screen w-full bg-white" : "min-h-[40vh]"
      } ${className}`}
    >
      <Spinner className="h-7 w-7" />
      <p className="text-sm font-medium text-neutral-800">{label}</p>
      {hint && <p className="max-w-xs text-xs text-neutral-500">{hint}</p>}
      {slow && slowContent && <div className="mt-2 max-w-xs text-sm text-neutral-600">{slowContent}</div>}
    </div>
  );
}

/** A grey placeholder block for content that is still loading, with a screen-reader label. */
export function Skeleton({ label, className = "h-40" }: { label: string; className?: string }) {
  return (
    <div role="status" aria-label={label} className={`animate-pulse bg-neutral-100 ${className}`}>
      <span className="sr-only">{label}</span>
    </div>
  );
}
