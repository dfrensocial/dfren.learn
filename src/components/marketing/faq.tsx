const FAQS = [
  {
    q: "Do I need existing SEO experience?",
    a: "No. Module 1 builds the foundation from scratch, but if you already do SEO, you'll move faster through the early lessons.",
  },
  {
    q: "Is this just SEO with a new name?",
    a: "No. GEO shares some fundamentals with SEO but optimizes for a different target: what a language model retrieves and cites, not just what a crawler indexes. The course is explicit about where the two overlap and where they don't.",
  },
  {
    q: "How long do I have access?",
    a: "Lifetime, including future module updates as the AI search landscape changes.",
  },
  {
    q: "What if I'm not happy with the course?",
    a: "Full refund within 7 days, no questions asked — see the guarantee above.",
  },
  {
    q: "How is the course delivered?",
    a: "Video lessons streamed directly on this site, accessible from your dashboard after checkout.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-16">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <div className="mt-10 divide-y divide-black border border-black">
          {FAQS.map((item) => (
            <details key={item.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {item.q}
                <span className="ml-4 text-neutral-400 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-neutral-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
