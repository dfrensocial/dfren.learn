import type { CourseContent } from "@/content/courses/geo-blueprint";
import { CourseCta } from "@/components/marketing/course-cta";

/**
 * Split hero: pitch on the left, an illustration of an AI shortlist on the
 * right, and the course numbers along the bottom.
 */
export function Hero({
  hero,
  stats,
  courseId,
}: {
  hero: CourseContent["hero"];
  stats: CourseContent["stats"];
  courseId: string;
}) {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-10 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="inline-block rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300">
              {hero.kicker}
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-300">{hero.subheadline}</p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <CourseCta
                courseId={courseId}
                label={hero.ctaLabel}
                location="hero"
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-4 text-base font-semibold text-black transition hover:bg-neutral-200"
              />
              <a href="#promo" className="text-sm font-medium text-neutral-300 underline underline-offset-4 hover:text-white">
                Watch the short promo ↓
              </a>
            </div>
            <p className="mt-4 text-xs text-neutral-400">{hero.ctaNote}</p>
            <p className="mt-2 max-w-md text-xs leading-snug text-neutral-400">
              Results vary. We don&apos;t promise any ranking, citation or income. The revenue models are methods, not
              promised earnings.
            </p>
          </div>

          <AnswerMock />
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-x-4 gap-y-8 border-t border-white/15 pt-10 text-center sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-3xl font-bold sm:text-4xl">{stat.value}</dd>
              <dd className="mt-1 text-sm text-neutral-400">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Illustration only: what "being on the AI shortlist" looks like. */
function AnswerMock() {
  return (
    <figure aria-label="Illustration: an AI assistant answering with a shortlist of businesses" className="relative">
      <div className="rounded-2xl bg-white p-5 text-black shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">AI assistant</span>
          <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-[11px] text-neutral-500">
            ChatGPT · Gemini · Claude
          </span>
        </div>
        <p className="mt-4 ml-auto w-fit max-w-[85%] rounded-xl bg-neutral-100 px-4 py-2 text-sm">
          Who is the best skin clinic in Chennai?
        </p>
        <p className="mt-4 text-xs text-neutral-500">
          Based on reviews, expertise and recent mentions, here are the top options:
        </p>
        <ol className="mt-3 space-y-2 text-sm">
          <li className="flex items-center justify-between rounded-lg border-2 border-black px-3 py-2 font-semibold">
            1. Your business
            <span className="rounded-full bg-black px-2 py-0.5 text-[11px] font-semibold text-white">Recommended</span>
          </li>
          <li className="rounded-lg border border-neutral-200 px-3 py-2 text-neutral-500">2. A competitor</li>
          <li className="rounded-lg border border-neutral-200 px-3 py-2 text-neutral-500">3. A competitor</li>
        </ol>
      </div>
      <figcaption className="mt-3 text-center text-xs text-neutral-500">Illustration</figcaption>
    </figure>
  );
}
