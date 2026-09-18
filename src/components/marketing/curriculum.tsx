import type { CourseContent } from "@/content/courses/geo-blueprint";

export function Curriculum({
  curriculum,
}: {
  curriculum: CourseContent["curriculum"];
}) {
  return (
    <section id="curriculum" className="border-b border-black scroll-mt-16">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {curriculum.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
          {curriculum.subheading}
        </p>

        <ol className="mt-10 divide-y divide-black border border-black">
          {curriculum.modules.map((module, i) => (
            <li key={module.title} className="flex gap-4 p-5 sm:gap-6 sm:p-6">
              <span className="text-2xl font-bold text-neutral-300">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-semibold">{module.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  {module.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
