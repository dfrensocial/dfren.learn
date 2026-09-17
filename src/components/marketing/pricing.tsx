import Link from "next/link";

const INCLUDES = [
  "6 modules, 40+ lessons, 12+ hours of video",
  "Downloadable GEO audit checklist & templates",
  "Lifetime access, including future updates",
  "Private community access",
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-black scroll-mt-16">
      <div className="mx-auto max-w-md px-6 py-16 text-center sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          One price. Lifetime access.
        </h2>

        <div className="mt-10 border border-black p-8">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            The GEO Course
          </p>
          <p className="mt-2 text-5xl font-bold">₹—</p>
          <p className="mt-1 text-sm text-neutral-500">One-time payment</p>

          <ul className="mt-6 space-y-2 text-left text-sm text-neutral-700">
            {INCLUDES.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden>—</span>
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="mt-8 block rounded-full bg-black px-6 py-4 font-semibold text-white transition hover:bg-neutral-800"
          >
            Enroll now
          </Link>
          <p className="mt-3 text-xs text-neutral-500">
            Secure checkout via Razorpay.
          </p>
        </div>
      </div>
    </section>
  );
}
