export function Instructor() {
  return (
    <section className="border-b border-black">
      <div className="mx-auto grid max-w-4xl gap-8 px-6 py-16 sm:grid-cols-[200px_1fr] sm:py-20">
        {/* Placeholder headshot */}
        <div className="mx-auto aspect-square w-40 border border-black bg-neutral-100 sm:mx-0 sm:w-full">
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
            Photo
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your instructor</h2>
          <p className="mt-3 text-neutral-700">
            [One paragraph on who you are, why you're credible on GEO
            specifically — results you've gotten, sites you've worked on,
            years doing SEO/content before this, anything that proves this
            isn't theory.]
          </p>
        </div>
      </div>
    </section>
  );
}
