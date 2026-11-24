import { WideImage } from "@/components/ui/wide-image";
import Image from "next/image";
import type { CourseContent } from "@/content/courses/geo-blueprint";
import { rupeesFromPaise } from "@/lib/gst";

// A plain facts table: easy for people to scan and for AI engines to quote.
export function AtAGlance({ pricing }: { pricing: CourseContent["pricing"] }) {
  const rupees = rupeesFromPaise(pricing.priceInPaise);
  const rows: [string, string][] = [
    ["Course", "The GEO Blueprint by dfrenLearn"],
    ["Topic", "GEO (generative engine optimization), also useful for AEO"],
    ["Length", "About 1.5 hours of video in 6 modules"],
    ["Price", `₹${rupees} inclusive of GST, paid once, no subscription.`],
    ["Language", "Mostly Tamil, with English terms mixed in"],
    ["Format", "Recorded video you stream on this site after checkout"],
    ["Included", "Quick-win checklist, client questionnaire, Claude Code prompt pack"],
    ["Access", "For as long as the course is offered, updates included"],
    ["Not included", "No certificate. No live classes. No promise of rankings, mentions or income"],
    ["Taught by", "K Sai Anirudh, Founder, AiVirex Innovations"],
  ];
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">The course at a glance</h2>
        <WideImage
          src="/images/geo/banner-at-a-glance-desk.webp"
          hideOnMobile
          alt="Course at a glance: 1.5 hours of video, 6 GEO pillars, 2 ways to charge, quick-win checklist and prompt pack, mostly Tamil, ₹599 including GST."
          width={2400}
          height={960}
          sizes="(min-width: 896px) 832px, 100vw"
          className="mx-auto mt-10 h-auto w-full rounded-2xl"
        />
        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-neutral-200">
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" className="w-1/3 px-5 py-3.5 font-semibold">
                    {k}
                  </th>
                  <td className="px-5 py-3.5 text-neutral-700">{v.endsWith(".") ? v : `${v}.`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
