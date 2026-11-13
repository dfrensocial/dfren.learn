import type { CourseContent } from "@/content/courses/geo-blueprint";
import { GST_RATE_PERCENT, rupeesFromPaise, splitInclusivePaise } from "@/lib/gst";

// A plain facts table: easy for people to scan and for AI engines to quote.
export function AtAGlance({ pricing }: { pricing: CourseContent["pricing"] }) {
  const rupees = rupeesFromPaise(pricing.priceInPaise);
  const split = splitInclusivePaise(pricing.priceInPaise);
  const rows: [string, string][] = [
    ["Course", "The GEO Blueprint by dfrenLearn"],
    ["Topic", "GEO (generative engine optimization), also useful for AEO"],
    ["Length", "About 1.5 hours of video in 6 modules"],
    ["Price", `₹${rupees} including ${GST_RATE_PERCENT}% GST (₹${rupeesFromPaise(split.basePaise)} + ₹${rupeesFromPaise(split.gstPaise)}), paid once, no subscription.`],
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
        <div className="mt-10 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
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
