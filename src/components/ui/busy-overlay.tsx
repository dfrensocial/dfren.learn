"use client";

import { useEffect, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";

/**
 * A full-screen "please wait" layer that blocks clicks while something
 * important finishes (confirming a payment, signing out). Keyboard focus is
 * parked on the message so nobody tabs into the page underneath.
 */
export function BusyOverlay({ label, hint }: { label: string; hint?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-white/85 px-6 backdrop-blur-sm"
      aria-busy="true"
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="status"
        aria-live="assertive"
        className="flex max-w-sm flex-col items-center gap-3 border border-black bg-white px-8 py-7 text-center text-black shadow-lg outline-none"
      >
        <Spinner className="h-8 w-8" />
        <p className="text-base font-semibold">{label}</p>
        {hint && <p className="text-sm text-neutral-600">{hint}</p>}
      </div>
    </div>
  );
}
