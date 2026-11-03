import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-white px-6 text-center text-black">
      <p className="text-sm font-semibold text-neutral-500">404</p>
      <h1 className="text-2xl font-bold tracking-tight">We can&apos;t find that page</h1>
      <p className="max-w-xs text-sm text-neutral-600">The link may be old, or the address mistyped.</p>
      <div className="mt-2 flex items-center gap-5 text-sm">
        <Link href="/" className="bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-neutral-800">
          Go to the home page
        </Link>
        <Link href="/dashboard" className="font-medium underline">
          My courses
        </Link>
      </div>
    </main>
  );
}
