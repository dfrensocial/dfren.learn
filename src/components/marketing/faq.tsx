const FAQS = [
  {
    q: "Do I need existing SEO experience?",
    a: "No. The course starts from how a language model actually predicts an answer, then builds up to the 6 GEO pillars — no prior SEO background assumed.",
  },
  {
    q: "Is this just SEO with a new name?",
    a: "No. SEO and GEO share fundamentals — content quality, structure, authority — but SEO chases rank position and clicks while GEO chases citation and recommendation. The course covers exactly where they overlap and where they diverge.",
  },
  {
    q: "What is Litmus?",
    a: "A GEO audit tool built by the same team, used in the course's live demo. It scores a site against a fixed, repeatable rubric across all 6 pillars instead of the inconsistent scores you get from asking a chatbot directly.",
  },
  {
    q: "Is this a theory course or does it cover making money from it?",
    a: "Both — the second half covers two concrete revenue models: charging to fix what a GEO audit finds, and charging an ongoing retainer for content, including how to onboard and set expectations with a client.",
  },
  {
    q: "How long do I have access?",
    a: "Lifetime, including future updates as the AI search landscape changes.",
  },
  {
    q: "What if I'm not happy with the course?",
    a: "Full refund within 7 days, no questions asked — see the guarantee above.",
  },
  {
    q: "How is the course delivered?",
    a: "Streamed directly on this site, accessible from your dashboard after checkout.",
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
