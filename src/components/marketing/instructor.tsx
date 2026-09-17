import Link from "next/link";

export function Instructor() {
  return (
    <section className="border-b border-black">
      <div className="mx-auto grid max-w-4xl gap-8 px-6 py-16 sm:grid-cols-[200px_1fr] sm:py-20">
        {/* Placeholder headshot — swap for a real photo */}
        <div className="mx-auto aspect-square w-40 border border-black bg-neutral-100 sm:mx-0 sm:w-full">
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
            Photo
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your instructor</h2>
          <p className="mt-1 text-sm text-neutral-500">
            K Sai Anirudh — Founder, AiVirex Innovations
          </p>
          <p className="mt-3 text-neutral-700">
            Before writing a single slide of this course, Sai and the AiVirex
            team spent time researching GEO properly — papers, testing, real
            iteration — because most tools marketed as &ldquo;AI visibility
            scanners&rdquo; turned out to be a URL wrapped in a ChatGPT prompt,
            giving a different score every time you ran it. That research
            became <span className="font-medium">Litmus</span>, a GEO audit
            tool that scores a site against a fixed, repeatable rubric instead
            of guessing — and this course teaches the same six-pillar
            framework it&apos;s built on, plus how to charge for it.
          </p>
          <Link
            href="https://www.linkedin.com/in/sai-anirudh-415001168/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium underline"
          >
            LinkedIn ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
