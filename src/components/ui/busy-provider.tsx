"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BusyOverlay } from "@/components/ui/busy-overlay";

// One app-wide "please wait" overlay. Start it before an action that leaves the
// screen looking frozen (e.g. signing out); it goes away by itself when the
// page changes, and after MAX_MS no matter what, so it can never get stuck.

const MAX_MS = 20_000;

type Busy = { label: string; hint?: string } | null;
type Ctx = { start: (label: string, hint?: string) => void; stop: () => void };

const BusyContext = createContext<Ctx>({ start: () => {}, stop: () => {} });

export function BusyProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [busy, setBusy] = useState<Busy>(null);
  const startedOn = useRef<string | null>(null);
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    startedOn.current = null;
    setBusy(null);
  }, []);

  const start = useCallback(
    (label: string, hint?: string) => {
      startedOn.current = window.location.pathname;
      setBusy({ label, hint });
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(stop, MAX_MS);
    },
    [stop]
  );

  // The page changed: whatever we were waiting for has arrived.
  useEffect(() => {
    if (startedOn.current !== null && startedOn.current !== pathname) {
      Promise.resolve().then(stop);
    }
  }, [pathname, stop]);

  const value = useMemo(() => ({ start, stop }), [start, stop]);

  return (
    <BusyContext.Provider value={value}>
      {children}
      {busy && <BusyOverlay label={busy.label} hint={busy.hint} />}
    </BusyContext.Provider>
  );
}

export function useBusy() {
  return useContext(BusyContext);
}
