"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { clearSessionCookie, useAuth } from "@/lib/firebase/auth-context";

/** Signed-in state for the public pages' headers. Renders nothing until auth resolves. */
export function useAccountActions() {
  const router = useRouter();
  const { user, loading } = useAuth();

  async function logout() {
    await clearSessionCookie();
    await signOut(auth);
    router.push("/");
    router.refresh();
  }

  return { user, loading, logout };
}

/**
 * Right-hand side of the header on pages outside the dashboard.
 * Signed out: "Log in" (+ optional "Enroll now").  Signed in: "Dashboard" + "Log out".
 */
export function AccountLinks({ showEnroll = false }: { showEnroll?: boolean }) {
  const { user, loading, logout } = useAccountActions();

  if (loading) return <span className="h-9 w-24" aria-hidden />;

  if (user) {
    return (
      <>
        <button onClick={logout} className="hidden text-sm font-medium hover:underline sm:inline">
          Log out
        </button>
        <Link
          href="/dashboard"
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Dashboard
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="hidden text-sm font-medium hover:underline sm:inline">
        Log in
      </Link>
      {showEnroll && (
        <Link
          href="/#pricing"
          className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Enroll now
        </Link>
      )}
    </>
  );
}
