import Link from "next/link";

export function Hero() {
  return (
    <section className="border-b border-black">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          The GEO Course
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Get your content cited by ChatGPT, Perplexity, and Google AI&nbsp;Overviews
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-center text-lg text-neutral-600">
          A step-by-step system for Generative Engine Optimization — built for
          creators and marketers who are done chasing rankings that AI
          answers have already made invisible.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="#pricing"
            className="rounded-full bg-black px-8 py-4 text-base font-semibold text-white transition hover:bg-neutral-800"
          >
            Enroll now — lifetime access
          </Link>
          <p className="text-xs text-neutral-500">
            One-time payment. No subscription.
          </p>
        </div>

        {/* Placeholder for sales/intro video — swap for a Mux player once recorded */}
        <div className="mx-auto mt-14 flex aspect-video max-w-3xl items-center justify-center border border-black bg-neutral-100">
          <span className="text-sm font-medium text-neutral-400">
            Intro video placeholder — 16:9
          </span>
        </div>
      </div>
    </section>
  );
}
