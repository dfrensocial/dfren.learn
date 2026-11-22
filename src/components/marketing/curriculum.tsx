import { WideImage } from "@/components/ui/wide-image";
import Image from "next/image";
import type { CourseContent } from "@/content/courses/geo-blueprint";
import { CourseCta } from "@/components/marketing/course-cta";

const MODULE_IMAGES = [
  "m1-how-ai-picks-next-word",
  "m2-seo-vs-geo",
  "m3-six-pillars-of-geo",
  "m4-live-audit-litmus",
  "m5-two-ways-to-charge",
  "m6-onboarding-and-proof",
];

/** Dark band: the roadmap, then each module as an image card with its text, then the 6 pillars diagram. */
export function Curriculum({
  curriculum,
  courseId,
}: {
  curriculum: CourseContent["curriculum"];
  courseId: string;
}) {
  return (
    <section id="curriculum" className="scroll-mt-16 bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{curriculum.heading}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-400">{curriculum.subheading}</p>

        <WideImage
          src="/images/geo/course-roadmap-6-modules.webp" dark
          alt="The GEO Blueprint roadmap: six modules from how AI picks its next word to onboarding clients and proving the work."
          width={2400}
          height={880}
          sizes="(min-width: 1152px) 1104px, 100vw"
          className="mt-10 h-auto w-full rounded-2xl border border-white/10"
        />

        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {curriculum.modules.map((module, i) => (
            <li key={module.title} className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04]">
              <Image
                src={`/images/geo/${MODULE_IMAGES[i] ?? MODULE_IMAGES[0]}.webp`}
                alt=""
                width={960}
                height={600}
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw"
                className="h-auto w-full"
              />
              <div className="p-5">
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  Module {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{module.title.replace(/^\d+\.\s*/, "")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-300">{module.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <WideImage
          src="/images/geo/six-pillars-hexagon.webp" dark
          alt="The 6 pillars of GEO: technical optimization, answer-first content, citation authority, AI comprehension, content freshness and content depth. Each has a quick win you can apply the same day."
          width={2400}
          height={1400}
          sizes="(min-width: 1152px) 1104px, 100vw"
          className="mt-8 h-auto w-full rounded-2xl border border-white/10"
        />

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <CourseCta
            courseId={courseId}
            label="Start learning for ₹599"
            location="curriculum"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-4 text-base font-semibold text-white transition hover:bg-accent-dark"
          />
          <p className="text-xs text-neutral-400">6 modules · about 1.5 hours · instant access</p>
        </div>
      </div>
    </section>
  );
}
