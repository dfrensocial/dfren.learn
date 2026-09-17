"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { clearSessionCookie } from "@/lib/firebase/auth-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await clearSessionCookie();
    await signOut(auth);
    router.push("/");
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <Link href="/dashboard" className="text-lg font-semibold">
          dfrenLearn
        </Link>
        <button onClick={handleLogout} className="text-sm text-neutral-600">
          Log out
        </button>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
