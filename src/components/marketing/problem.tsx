const PAIN_POINTS = [
  "Your traffic is flat even though your rankings haven't moved — because AI Overviews and chat answers are absorbing the clicks.",
  "You've read ten blog posts about GEO and still don't have an actual process to follow.",
  "You don't know what makes an AI model cite one source over another, so you're guessing at structure and formatting.",
  "Every 'AI SEO' course you've seen is either recycled SEO advice with a new name, or too theoretical to act on this week.",
];

export function Problem() {
  return (
    <section className="border-b border-black">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Search changed. Most people&apos;s strategy didn&apos;t.
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
