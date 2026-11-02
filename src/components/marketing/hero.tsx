import type { CourseContent } from "@/content/courses/geo-blueprint";
import { CourseCta } from "@/components/marketing/course-cta";
import { HeroVideo } from "@/components/marketing/hero-video";

export function Hero({ hero, courseId }: { hero: CourseContent["hero"]; courseId: string }) {
  return (
    <section className="border-b border-black">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          {hero.kicker}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          {hero.headline}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-center text-lg text-neutral-600">
          {hero.subheadline}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <CourseCta
            courseId={courseId}
            label={hero.ctaLabel}
            className="rounded-full bg-black px-8 py-4 text-base font-semibold text-white transition hover:bg-neutral-800"
          />
          <p className="text-xs text-neutral-500">{hero.ctaNote}</p>
        </div>

        <HeroVideo />
      </div>
    </section>
  );
}
