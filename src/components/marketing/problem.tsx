const PAIN_POINTS = [
  "Customers now ask full questions, like \"What's the best CRM for a 10 person sales team?\", and the assistant hands back a short list. Sometimes it's one name.",
  "Asking ChatGPT to grade your site gives you a different score each time. It improvises a judgment. It doesn't apply a fixed rubric.",
  "Many \"AI visibility\" scanners work the same way: your URL goes into a prompt, the model answers, and a dashboard wraps the result. The score still can't be repeated.",
  "Knowing GEO matters isn't a method. You need a repeatable way to audit a site, decide what to fix first and charge for the work.",
];

const link = "underline underline-offset-2 hover:text-black";

export function Problem() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Your customers are asking AI for a shortlist. Is your business on it?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-neutral-600">
          <strong className="text-black">GEO, or generative engine optimization,</strong> is the work of making your
          site easy for these assistants to find, understand and recommend. The term comes from a{" "}
          <a href="https://arxiv.org/abs/2311.09735" target="_blank" rel="noopener noreferrer" className={link}>
            2023 research paper
          </a>
          .
        </p>

        {/* The numbers */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Stat
            big="~100M"
            label="weekly ChatGPT users in India"
            source="February 2026 TechCrunch report"
            href="https://www.techcrunch.com/2026/02/15/india-has-100m-weekly-active-chatgpt-users-sam-altman-says/"
          />
          <Stat
            big="2B"
            label="monthly users reached by Google's AI Overviews by July 2025"
            source="2 billion monthly users"
            href="https://techcrunch.com/2025/07/23/googles-ai-overviews-have-2b-monthly-users-ai-mode-100m-in-the-us-and-india"
          />
          <Stat
            big="8% vs 15%"
            label="of US visits ended in a click on a result, with an AI summary vs without one"
            source="Pew Research study"
            href="https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/"
          />
        </div>

        {/* Old way vs new way */}
        <div aria-hidden className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">The old way</p>
            <p className="mt-3 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-600">
              CRM software India
            </p>
            <div className="mt-5 space-y-3">
              {[70, 62, 66].map((w) => (
                <div key={w}>
                  <div className="h-2 rounded bg-neutral-400" style={{ width: `${w}%` }} />
                  <div className="mt-1.5 h-1.5 w-[90%] rounded bg-neutral-200" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-black p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">The new way</p>
            <p className="ml-auto mt-3 w-fit max-w-full rounded-xl bg-white/10 px-4 py-2 text-sm">
              What&apos;s the best CRM for a 10 person sales team?
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <p className="rounded-lg bg-white px-3 py-2 font-semibold text-black">1. A named brand</p>
              <p className="rounded-lg bg-white/10 px-3 py-2">2. A named brand</p>
              <p className="rounded-lg border border-dashed border-white/25 px-3 py-2 text-neutral-400">
                Not mentioned: everyone else
              </p>
            </div>
          </div>
        </div>

        {/* The problems */}
        <ul className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {PAIN_POINTS.map((point, i) => (
            <li key={point} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="pt-0.5 text-neutral-700">{point}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Stat({ big, label, source, href }: { big: string; label: string; source: string; href: string }) {
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
      <p className="text-4xl font-bold tracking-tight sm:text-5xl">{big}</p>
      <p className="mt-3 flex-1 text-sm text-neutral-700">{label}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-xs text-neutral-500 underline underline-offset-2 hover:text-black"
      >
        Source: {source} ↗
      </a>
    </div>
  );
}
