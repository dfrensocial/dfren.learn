const BONUSES = [
  {
    title: "Client research questionnaire",
    description:
      "The exact set of questions to send a client before writing a single word — becomes your source of truth for their content.",
  },
  {
    title: "Claude Code prompt pack",
    description:
      "Ready-to-use prompts for brand voice, competitive research, and blog writing — the same prompts used to turn client answers into published content.",
  },
];

export function Bonus() {
  return (
    <section className="border-b border-black bg-neutral-50">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Comes with the material, not just the video
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {BONUSES.map((bonus) => (
            <div key={bonus.title} className="border border-black bg-white p-6">
              <h3 className="font-semibold">{bonus.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{bonus.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
