import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <span className="text-lg font-semibold">dfrenLearn</span>
        <nav className="flex gap-4 text-sm">
          <Link href="/login">Log in</Link>
          <Link
            href="/signup"
            className="rounded-md bg-neutral-900 px-4 py-2 text-white"
          >
            Get the course
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Course title goes here
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          One-line pitch: who this course is for and the outcome it delivers.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-md bg-neutral-900 px-6 py-3 text-white"
        >
          Enroll now
        </Link>
      </section>
    </main>
  );
}
