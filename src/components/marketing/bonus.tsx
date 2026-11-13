import type { CourseContent } from "@/content/courses/geo-blueprint";

export function Bonus({ bonus }: { bonus: CourseContent["bonus"] }) {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-4xl px-6 pb-16 sm:pb-24">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{bonus.heading}</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {bonus.items.map((item, i) => (
            <div key={item.title} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div aria-hidden className="flex h-28 items-center justify-center gap-3 bg-black">
                <div className="w-14 rotate-[-6deg] space-y-1.5 rounded-md bg-white p-2.5 shadow-lg">
                  <div className="h-1 w-2/3 rounded bg-neutral-800" />
                  <div className="h-1 rounded bg-neutral-300" />
                  <div className="h-1 rounded bg-neutral-300" />
                  <div className="h-1 w-4/5 rounded bg-neutral-300" />
                </div>
                <span className="text-3xl font-bold text-white">{i + 1}</span>
              </div>
              <div className="p-6">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
