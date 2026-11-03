const PAIN_POINTS = [
  "Customers now ask full questions, like \"What's the best CRM for a 10 person sales team?\", and the assistant hands back a short list. Sometimes it's one name.",
  "Asking ChatGPT to grade your site gives you a different score each time. It improvises a judgment. It doesn't apply a fixed rubric.",
  "Many \"AI visibility\" scanners work the same way: your URL goes into a prompt, the model answers, and a dashboard wraps the result. The score still can't be repeated.",
  "Knowing GEO matters isn't a method. You need a repeatable way to audit a site, decide what to fix first and charge for the work.",
];

export function Problem() {
  return (
    <section className="border-b border-black">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Your customers are asking AI for a shortlist. Is your business on it?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-neutral-600">
          India has about 100 million weekly ChatGPT users, according to a{" "}
          <a
            href="https://www.techcrunch.com/2026/02/15/india-has-100m-weekly-active-chatgpt-users-sam-altman-says/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            February 2026 TechCrunch report
          </a>
          . Google&apos;s AI Overviews reached{" "}
          <a
            href="https://techcrunch.com/2025/07/23/googles-ai-overviews-have-2b-monthly-users-ai-mode-100m-in-the-us-and-india"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            2 billion monthly users
          </a>{" "}
          by July 2025. GEO, or generative engine optimization, is the work of making your site easy for these
          assistants to find, understand and recommend. The term comes from a{" "}
          <a
            href="https://arxiv.org/abs/2311.09735"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            2023 research paper
          </a>
          , and in a{" "}
          <a
            href="https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Pew Research study
          </a>{" "}
          US users clicked a result in 8% of visits with an AI summary, against 15% without.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {PAIN_POINTS.map((point) => (
            <div key={point} className="border border-black p-5">
              <p className="text-neutral-800">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
