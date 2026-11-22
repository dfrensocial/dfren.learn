import Image from "next/image";
import { HeroPlayer } from "@/components/marketing/hero-player";
import type { CourseContent } from "@/content/courses/geo-blueprint";
import { CourseCta } from "@/components/marketing/course-cta";

const STAT_IMAGES = [
  "/images/geo/stat-card-1-5hrs-video.webp",
  "/images/geo/stat-card-6-geo-pillars.webp",
  "/images/geo/stat-card-2-ways-to-charge.webp",
  "/images/geo/stat-card-599-one-time.webp",
];

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
            <p className="inline-block rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300">
              {hero.kicker}
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-300">{hero.tagline}</p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <CourseCta
                courseId={courseId}
                label={hero.ctaLabel}
                location="hero"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-7 py-4 text-base font-semibold text-white transition hover:bg-accent-dark"
              />
            </div>
            <p className="mt-4 text-xs text-neutral-400">{hero.ctaNote}</p>
          </div>

          <HeroPlayer videoId="4X45cANnE28" title="The GEO Blueprint" />
        </div>

        <div className="mt-16 grid grid-cols-2 gap-3 border-t border-white/15 pt-10 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <Image
              key={stat.label}
              src={STAT_IMAGES[i]}
              alt={`${stat.value} ${stat.label}`}
              width={1200}
              height={800}
              sizes="(min-width: 1152px) 270px, (min-width: 640px) 22vw, 46vw"
              className="h-auto w-full rounded-2xl"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
