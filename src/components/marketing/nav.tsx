import Link from "next/link";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-black bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold tracking-tight">
          dfren<span className="text-neutral-400">Learn</span>
        </span>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="#curriculum" className="hidden sm:inline hover:underline">
            Curriculum
          </Link>
          <Link href="#faq" className="hidden sm:inline hover:underline">
            FAQ
          </Link>
          <Link href="/login" className="hidden sm:inline hover:underline">
            Log in
          </Link>
          <Link
            href="#pricing"
            className="rounded-full bg-black px-5 py-2 text-white transition hover:bg-neutral-800"
          >
            Enroll now
          </Link>
        </nav>
      </div>
    </header>
  );
}
