"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { clearSessionCookie, useAuth } from "@/lib/firebase/auth-context";
import { LEGAL } from "@/content/legal";
import { PrivacySettingsLink } from "@/components/consent/privacy-settings-link";
import { PolicyUpdateDialog, usePolicyGate } from "@/components/legal/policy-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  async function handleLogout() {
    await clearSessionCookie();
    await signOut(auth);
    router.push("/");
  }

  const onCourses = pathname === "/dashboard" || pathname.startsWith("/dashboard/courses");

  // Updated Terms/Privacy: nothing but the dialog is usable until accepted.
  const gate = usePolicyGate(user);
  const gated = !!user && gate.status !== "ok";

  return (
    <>
    <div inert={gate.status === "needed" && !!user} className="flex min-h-screen flex-col bg-white text-black">
      <header className="border-b border-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight">
              dfren<span className="text-neutral-400">Learn</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link
                href="/dashboard"
                aria-current={onCourses ? "page" : undefined}
                className={onCourses ? "font-semibold underline underline-offset-8" : "text-neutral-500 hover:text-black"}
              >
                My courses
              </Link>
              <a href={`mailto:${LEGAL.contactEmail}`} className="text-neutral-500 hover:text-black">
                Support
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {user?.email && <span data-clarity-mask="true" className="hidden text-neutral-500 sm:inline">{user.email}</span>}
            <button onClick={handleLogout} className="font-medium underline">
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {!gated ? (
          children
        ) : gate.status === "error" ? (
          <p className="text-sm text-neutral-600">
            Couldn&apos;t check your account.{" "}
            <button type="button" onClick={gate.retry} className="underline">
              Try again
            </button>
          </p>
        ) : (
          <p className="text-sm text-neutral-500">Loading…</p>
        )}
      </main>
      <footer className="border-t border-neutral-200 px-6 py-4 text-xs text-neutral-500">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-1">
          <Link href="/terms" className="hover:text-black">Terms</Link>
          <Link href="/privacy" className="hover:text-black">Privacy</Link>
          <Link href="/refund-policy" className="hover:text-black">Refunds</Link>
          <PrivacySettingsLink className="hover:text-black" />
        </div>
      </footer>
    </div>
    {user && gate.status === "needed" && (
      <PolicyUpdateDialog user={user} onAccepted={gate.accepted} onLogout={handleLogout} />
    )}
    </>
  );
}
