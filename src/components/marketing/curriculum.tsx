const MODULES = [
  {
    title: "Module 1 — How Generative Engines Actually Retrieve Answers",
    description:
      "RAG pipelines, embeddings, and citation selection — the mental model everything else builds on.",
  },
  {
    title: "Module 2 — Entity & Authority Foundations",
    description:
      "Structuring your brand and content as a citable entity across Google, Bing, and LLM training/retrieval data.",
  },
  {
    title: "Module 3 — Content Structure for AI Citation",
    description:
      "Formatting, answer-first writing, schema markup, and the patterns that get pulled into AI Overviews and chat answers.",
  },
  {
    title: "Module 4 — Technical GEO for Next.js / Modern Stacks",
    description:
      "llms.txt, structured data, Core Web Vitals, and crawler access — the technical checklist, done once.",
  },
  {
    title: "Module 5 — Measuring What Actually Matters",
    description:
      "Tracking citations and AI referral traffic when traditional rank tracking stops telling the full story.",
  },
  {
    title: "Module 6 — The 30-Day GEO Rollout Plan",
    description:
      "A week-by-week plan to apply everything to a real site, in order, without getting stuck planning forever.",
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
          Six modules, in the order you actually need them — foundation
          first, execution second, measurement last.
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
