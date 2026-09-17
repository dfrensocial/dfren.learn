const PAIN_POINTS = [
  "Your customer's question changed shape — from a keyword typed into Google to a full question asked of ChatGPT, Gemini, or Claude, which just hands back a shortlist, sometimes one name.",
  "You've asked ChatGPT to \"grade\" your site's AI-optimization and gotten a different score every time — because it's improvising a judgment, not applying a fixed rubric.",
  "Most \"GEO audit\" tools are the same trick with a dashboard on top: your URL gets wrapped in a prompt and sent to a model, so the score still isn't reproducible.",
  "You know GEO matters but have no repeatable way to audit a site, prioritize fixes, or charge for the work.",
];

export function Problem() {
  return (
    <section className="border-b border-black">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Search has changed direction twice already.
        </h2>
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
