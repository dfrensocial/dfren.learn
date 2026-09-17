import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="border-t border-black bg-black text-white">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Stop optimizing for a search engine that&apos;s losing the clicks.
        </h2>
        <Link
          href="#pricing"
          className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:bg-neutral-200"
        >
          Enroll in the GEO Course
        </Link>
      </div>
    </section>
  );
}
