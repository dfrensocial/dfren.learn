const STATS = [
  { value: "1.5 hrs", label: "runtime, no filler" },
  { value: "6", label: "GEO pillars covered" },
  { value: "2", label: "revenue models" },
  { value: "Lifetime", label: "access & updates" },
];

export function StatsBar() {
  return (
    <section className="border-b border-black">
      <div className="mx-auto grid max-w-5xl grid-cols-2 divide-y divide-black sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
        {STATS.map((stat) => (
          <div key={stat.label} className="px-6 py-8 text-center">
            <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
