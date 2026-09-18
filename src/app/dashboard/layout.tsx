"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { clearSessionCookie, useAuth } from "@/lib/firebase/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await clearSessionCookie();
    await signOut(auth);
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-black px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          dfren<span className="text-neutral-400">Learn</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user?.email && <span className="hidden text-neutral-500 sm:inline">{user.email}</span>}
          <button onClick={handleLogout} className="font-medium underline">
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
