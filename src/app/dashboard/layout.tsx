"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { clearSessionCookie, useAuth } from "@/lib/firebase/auth-context";
import { LEGAL } from "@/content/legal";

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

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
