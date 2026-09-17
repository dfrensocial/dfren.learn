const MODULES = [
  {
    title: "1 — How AI Actually Picks the Next Word",
    description:
      "The plain-terms mental model of how a transformer predicts an answer — no equations, just what every GEO tactic is actually influencing.",
  },
  {
    title: "2 — SEO vs GEO: What Changed and Why",
    description:
      "Google Search → Voice → AI Search. Where SEO and GEO overlap, where they diverge, and why ranking well doesn't guarantee an AI citation.",
  },
  {
    title: "3 — The 6 Pillars of GEO",
    description:
      "Technical Optimization, Answer-First Content, Citation Authority, AI Comprehension, Content Freshness, and Content Depth — plus the quick win for each.",
  },
  {
    title: "4 — Why Manual Audits Don't Work (and the Fix)",
    description:
      "Why asking ChatGPT to grade your site gives a different score every time, and a live demo of Litmus running a fixed, repeatable 6-pillar audit.",
  },
  {
    title: "5 — Two Ways to Turn GEO Into Revenue",
    description:
      "Charging to fix what an audit finds, and charging on an ongoing basis for content — both laid out as a step-by-step client workflow.",
  },
  {
    title: "6 — Client Onboarding & Proving It Worked",
    description:
      "Setting up tracking before you start, setting timeline expectations, and turning a before/after into the case study that wins your next client.",
  },
];

export function Curriculum() {
  return (
    <section id="curriculum" className="border-b border-black scroll-mt-16">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          What&apos;s inside
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
          One 1.5-hour sitting, in the order you actually need it —
          foundation first, the 6 pillars second, monetization last.
        </p>

        <ol className="mt-10 divide-y divide-black border border-black">
          {MODULES.map((module, i) => (
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
