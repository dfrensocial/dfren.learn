// Who the course is for, as cards. Same facts as the "Who is this course for?" FAQ.
const AUDIENCE = [
  {
    label: "Business owners",
    title: "Get your own site into AI answers",
    body: "Apply the 6 pillars to your own website, or brief your developer on exactly what to fix.",
  },
  {
    label: "Marketers and freelancers",
    title: "Offer GEO audits and content to clients",
    body: "A repeatable audit and two ways to charge for the work: fixing what it finds, and monthly content.",
  },
  {
    label: "Agencies",
    title: "Add GEO to what you already sell",
    body: "Run the same audit on every client site and turn the findings into fix projects and content work.",
  },
  {
    label: "New to SEO",
    title: "No SEO background needed",
    body: "It starts from how an AI model produces an answer and builds up to the 6 pillars.",
  },
];

export function Audience() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Who the course is for
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE.map((a) => (
            <div key={a.label} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{a.label}</p>
              <h3 className="mt-2 font-semibold leading-snug">{a.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{a.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-2xl border border-neutral-300 bg-white p-5 text-sm text-neutral-700">
          <strong className="text-black">Not for you if</strong> you want overnight results. Content has to be
          published, crawled and cited before it shows up, and that takes weeks to a few months.
        </p>
      </div>
    </section>
  );
}
