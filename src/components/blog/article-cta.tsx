import Link from "next/link";
import { geoBlueprintCourse } from "@/content/courses/geo-blueprint";

/**
 * The call to action at the end of every article. Facts come from the course
 * file (price, modules) so it cannot drift from the landing page. No income,
 * ranking or job promises here, and the refund rule is stated next to the price.
 */
export function ArticleCta() {
  const price = geoBlueprintCourse.pricing.priceInPaise / 100;
  return (
    <aside className="my-12 border border-black p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">The GEO Blueprint</p>
      <h2 className="mt-2 text-xl font-bold tracking-tight">Get the course and learn the full GEO method for your site</h2>
      <p className="mt-3 text-sm leading-relaxed text-neutral-700">
        {geoBlueprintCourse.curriculum.modules.length} short modules, about 1.5 hours: how AI assistants pick answers, the 6 pillars of GEO to fix on your site, a live audit
        and how to track the results. It also comes with a client questionnaire and a prompt pack. It is taught mostly in
        Tamil, with English terms mixed in.
      </p>
      <p className="mt-3 text-sm font-medium">₹{price.toLocaleString("en-IN")} + GST, one time. No subscription.</p>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
        <Link
          href="/#pricing"
          className="bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-neutral-800"
        >
          Get the course
        </Link>
        <Link href="/#curriculum" className="font-medium underline">
          See what is inside
        </Link>
      </div>
      <p className="mt-4 text-xs text-neutral-500">
        There are no refunds for a change of mind, only for an extra charge or access we can&apos;t fix. Read the{" "}
        <Link href="/refund-policy" className="underline">
          refund policy
        </Link>{" "}
        first.
      </p>
    </aside>
  );
}
