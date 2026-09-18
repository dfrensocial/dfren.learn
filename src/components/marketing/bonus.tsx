import type { CourseContent } from "@/content/courses/geo-blueprint";

export function Bonus({ bonus }: { bonus: CourseContent["bonus"] }) {
  return (
    <section className="border-b border-black bg-neutral-50">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          {bonus.heading}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {bonus.items.map((item) => (
            <div key={item.title} className="border border-black bg-white p-6">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
