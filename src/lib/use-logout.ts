"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { clearSessionCookie } from "@/lib/firebase/auth-context";
import { useBusy } from "@/components/ui/busy-provider";

/**
 * The one way to log out. Shows a "Signing you out…" overlay straight away (the
 * steps below take a moment), then lands on the home page. Always finishes:
 * if clearing the cookie or Firebase fails, the person is still sent home.
 */
export function useLogout() {
  const router = useRouter();
  const pathname = usePathname();
  const { start, stop } = useBusy();

  return useCallback(async () => {
    start("Signing you out…");
    try {
      await clearSessionCookie();
    } catch {
      // the cookie expires on its own; carry on
    }
    try {
      await signOut(auth);
    } catch {
      // ignore: the next screen reflects the real state
    }
    if (pathname === "/") {
      // Already on the home page: no navigation will clear the overlay, so refresh and stop it here.
      router.refresh();
      stop();
    } else {
      router.push("/");
      router.refresh();
    }
  }, [router, pathname, start, stop]);
}
