// Phone-only (below the `sm` breakpoint) versions of the wide infographics. The pictures themselves are
// 2400px wide with small baked-in text, so on a 390px screen they were either cropped and swiped or
// unreadably tiny. These are plain HTML in the same dark style, same content, and they never scroll.
// From `sm` up the original images are shown instead (see WideImage's `mobile` prop).

const card = "rounded-2xl border border-white/10 bg-neutral-900 p-5 text-white";

/** Search results (old way) vs an AI answer that names two brands (new way). */
export function OldVsNewMobile() {
  const results = [
    ["CRM software India: compare plans", "Pricing, features and free trials for growing teams"],
    ["Top 10 CRM tools for small business", "We tested the most popular CRM tools this year"],
    ["What is CRM software?", "A beginner's guide to customer relationship tools"],
    ["Best CRM for sales teams", "Features that matter for a 10 person team"],
  ];
  return (
    <div className="space-y-3">
      <div className={card}>
        <p className="text-sm font-bold text-neutral-400">The old way</p>
        <p className="mt-3 rounded-full border border-white/25 px-4 py-2 text-sm">CRM software India</p>
        <ul className="mt-4 space-y-3">
          {results.map(([title, sub]) => (
            <li key={title}>
              <p className="text-sm font-medium text-neutral-200">{title}</p>
              <p className="text-xs text-neutral-500">{sub}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-neutral-400">…and a page of links. Rank #7 and you still got clicks.</p>
      </div>
      <div className="text-center text-xl text-neutral-500" aria-hidden>
        ↓
      </div>
      <div className={card}>
        <p className="text-sm font-bold">The new way</p>
        <p className="mt-3 w-fit max-w-[90%] rounded-xl bg-white/10 px-3 py-2 text-sm">
          What&apos;s the best CRM for a 10 person sales team?
        </p>
        <p className="mt-4 text-sm text-neutral-300">✦ Here are two good fits:</p>
        <ul className="mt-2 space-y-2">
          {[1, 2].map((n) => (
            <li key={n} className="rounded-xl bg-neutral-300 px-4 py-2.5 text-base font-bold text-black">
              {n} &nbsp;A named brand
            </li>
          ))}
          <li className="rounded-xl border border-white/30 px-4 py-2.5 text-sm text-neutral-300">
            Not mentioned: everyone else
          </li>
        </ul>
      </div>
    </div>
  );
}

/** The 6 pillars of GEO as a 2-column grid. */
export function SixPillarsMobile() {
  const pillars = [
    "Technical optimization",
    "Answer-first content",
    "Citation authority",
    "AI comprehension",
    "Content freshness",
    "Content depth",
  ];
  return (
    <div className={card}>
      <h3 className="text-xl font-bold">The 6 pillars of GEO</h3>
      <p className="mt-1 text-sm text-neutral-400">Each with a quick win you can apply the same day</p>
      <ul className="mt-5 grid grid-cols-2 gap-3">
        {pillars.map((name, i) => (
          <li key={name} className="rounded-xl border border-white/20 bg-black/40 p-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-xs font-bold">
              {i + 1}
            </span>
            <p className="mt-2 text-sm font-semibold leading-snug">{name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Published → Crawled → Cited → Shows up in AI answers. */
export function TimelineMobile() {
  const steps = ["Published", "Crawled", "Cited", "Shows up in AI answers"];
  return (
    <div className={card}>
      <h3 className="text-lg font-bold">How long before AI shows your content</h3>
      <p className="mt-1 text-sm font-semibold text-accent-light">Weeks to a few months</p>
      <ol className="mt-5">
        {steps.map((s, i) => (
          <li key={s} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  i === 0 ? "border-white" : "border-white/40 text-neutral-300"
                }`}
              >
                {i + 1}
              </span>
              {i < steps.length - 1 && <span className="my-1 w-px grow bg-white/30" />}
            </div>
            <p className={`pt-1 text-base font-medium ${i < steps.length - 1 ? "pb-5" : ""}`}>{s}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Same site scored 5 times: a chatbot wobbles, a fixed rubric doesn't. */
export function ScoreChartMobile() {
  const chatbot = [62, 78, 41, 70, 55];
  const rubric = 72;
  return (
    <div className={card}>
      <h3 className="text-lg font-bold">Same site, scored 5 times</h3>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-300">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-white" /> Asking a chatbot
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-neutral-500" /> Fixed rubric (Litmus)
        </span>
      </div>
      <ul className="mt-5 space-y-4">
        {chatbot.map((score, i) => (
          <li key={i}>
            <p className="mb-1 text-xs text-neutral-400">Run {i + 1}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-3 rounded-sm bg-white" style={{ width: `${score}%` }} />
                <span className="text-xs font-bold">{score}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 rounded-sm bg-neutral-500" style={{ width: `${rubric}%` }} />
                <span className="text-xs text-neutral-400">{rubric}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-right text-[11px] text-neutral-500">Illustration</p>
    </div>
  );
}
