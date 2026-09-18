import type { CourseContent } from "@/content/courses/geo-blueprint";

export function Testimonials({
  testimonials,
}: {
  testimonials: CourseContent["testimonials"];
}) {
  return (
    <section className="border-b border-black">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          What students are saying
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure key={i} className="flex flex-col border border-black p-6">
              <blockquote className="flex-1 text-sm text-neutral-800">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold">
                {t.name}
                <span className="block font-normal text-neutral-500">
                  {t.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
