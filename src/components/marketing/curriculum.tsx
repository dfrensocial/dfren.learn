import type { CourseContent } from "@/content/courses/geo-blueprint";
import { CourseCta } from "@/components/marketing/course-cta";

/** Dark band: a course card on the left, the modules as open accordions on the right. */
export function Curriculum({
  curriculum,
  courseTitle,
  instructorName,
  courseId,
}: {
  curriculum: CourseContent["curriculum"];
  courseTitle: string;
  instructorName: string;
  courseId: string;
}) {
  return (
    <section id="curriculum" className="scroll-mt-16 bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{curriculum.heading}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-400">{curriculum.subheading}</p>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white p-6 text-black shadow-[10px_10px_0_0_rgba(255,255,255,0.15)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{courseTitle}</p>
              <p className="mt-3 text-xl font-bold leading-snug">
                {curriculum.modules.length} modules, in the order you need them
              </p>
              <p className="mt-4 text-sm text-neutral-600">{instructorName}</p>
            </div>
          </div>

          <ol className="space-y-3">
            {curriculum.modules.map((module, i) => (
              <li key={module.title}>
                <details open className="group rounded-2xl border border-white/15 bg-white/[0.04] p-5">
                  <summary className="flex cursor-pointer list-none items-start gap-3">
                    <span className="mt-0.5 shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-black">
                      Module {i + 1}
                    </span>
                    <h3 className="flex-1 font-semibold">{module.title.replace(/^\d+\.\s*/, "")}</h3>
                    <span aria-hidden className="text-neutral-400 transition-transform group-open:rotate-180">
                      ⌃
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-300">{module.description}</p>
                </details>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex justify-center lg:justify-end">
          <CourseCta
            courseId={courseId}
            label="Get the course"
            location="curriculum"
            className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 font-semibold text-black transition hover:bg-neutral-200"
          />
        </div>
      </div>
    </section>
  );
}
