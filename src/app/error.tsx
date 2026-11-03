"use client";

import Link from "next/link";

// Shown when a page crashes while rendering. Without this the visitor gets a
// blank screen with no way out.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-white px-6 text-center text-black">
      <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="max-w-xs text-sm text-neutral-600">
        That didn&apos;t load properly. Try again, and if it keeps happening email us.
      </p>
      <div className="mt-2 flex items-center gap-5 text-sm">
        <button type="button" onClick={reset} className="bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-neutral-800">
          Try again
        </button>
        <Link href="/" className="font-medium underline">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
