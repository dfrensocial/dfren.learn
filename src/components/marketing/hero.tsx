import { HeroPlayer } from "@/components/marketing/hero-player";
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
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p
              className="hero-rise inline-block rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300"
              style={{ animationDelay: "0ms" }}
            >
              {hero.kicker}
            </p>
            {/* Headline: each word slides up out of a mask. Pure CSS, runs at first paint. */}
            <h1
              aria-label={hero.headline}
              className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
            >
              {hero.headline.split(" ").map((word, i, all) => (
                <span key={i} aria-hidden>
                  <span className="split-word">
                    <span className="hero-word" style={{ ["--i" as string]: i } as React.CSSProperties}>
                      {word}
                    </span>
                  </span>
                  {i < all.length - 1 ? " " : null}
                </span>
              ))}
            </h1>
            <p
              className="hero-rise mt-6 max-w-xl text-lg text-neutral-300"
              style={{ animationDelay: `${hero.headline.split(" ").length * 60 + 250}ms` }}
            >
              {hero.tagline}
            </p>

            <div
              className="hero-rise mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
              style={{ animationDelay: `${hero.headline.split(" ").length * 60 + 400}ms` }}
            >
              <CourseCta
                courseId={courseId}
                label={hero.ctaLabel}
                location="hero"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-7 py-4 text-base font-semibold text-white transition hover:bg-accent-dark"
              />
            </div>
            <ul className="mt-5 space-y-2 text-sm text-neutral-300">
              {hero.ctaPoints.map((point, i) => (
                <li
                  key={point}
                  className="hero-rise flex items-start gap-2.5"
                  style={{ animationDelay: `${hero.headline.split(" ").length * 60 + 550 + i * 90}ms` }}
                >
                  <span aria-hidden className="mt-0.5 font-bold text-accent-light">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Drifts up a little slower than the page as you scroll past (CSS scroll-driven, no JS). */}
          <div className="parallax-soft">
            <HeroPlayer videoId="4X45cANnE28" title="The GEO Blueprint" />
          </div>
        </div>

        {/* No boxes: big light numerals separated by hairlines. */}
        <dl className="mt-16 grid grid-cols-2 gap-y-10 border-t border-white/15 pt-10 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.title}
              className={`px-1 text-center sm:text-left ${
                i === 0 ? "" : "sm:border-l sm:border-white/15 sm:pl-8"
              }`}
            >
              <dd data-count={stat.value} className="order-first bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-6xl font-extralight leading-none tracking-tighter text-transparent tabular-nums sm:text-7xl">
                {stat.value}
              </dd>
              <dt className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-white">{stat.title}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
