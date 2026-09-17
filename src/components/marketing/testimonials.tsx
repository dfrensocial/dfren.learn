const TESTIMONIALS = [
  {
    quote:
      "[Placeholder] Within a month of applying Module 3 we started showing up as a cited source in Perplexity for our category's main queries.",
    name: "Name Surname",
    role: "Role, Company",
  },
  {
    quote:
      "[Placeholder] Finally a course that skips the theory and gives an actual checklist. Rolled it out on our blog in a weekend.",
    name: "Name Surname",
    role: "Role, Company",
  },
  {
    quote:
      "[Placeholder] The technical GEO module alone paid for the course — our engineering team had this wrong for a year.",
    name: "Name Surname",
    role: "Role, Company",
  },
];

export function Testimonials() {
  return (
    <section className="border-b border-black">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          What students are saying
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col border border-black p-6">
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
