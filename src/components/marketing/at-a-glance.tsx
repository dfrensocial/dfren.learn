import type { CourseContent } from "@/content/courses/geo-blueprint";
import { GST_RATE_PERCENT, rupeesFromPaise, totalWithGstPaise } from "@/lib/gst";

// A plain facts table: easy for people to scan and for AI engines to quote.
export function AtAGlance({ pricing }: { pricing: CourseContent["pricing"] }) {
  const rupees = (pricing.priceInPaise / 100).toLocaleString("en-IN");
  const rows: [string, string][] = [
    ["Course", "The GEO Blueprint by dfrenLearn"],
    ["Topic", "GEO (generative engine optimization), also useful for AEO"],
    ["Length", "About 1.5 hours of video in 6 modules"],
    ["Price", `₹${rupees} plus ${GST_RATE_PERCENT}% GST (₹${rupeesFromPaise(totalWithGstPaise(pricing.priceInPaise))} in total), paid once, no subscription.`],
    ["Language", "Mostly Tamil, with English terms mixed in"],
    ["Format", "Recorded video you stream on this site after checkout"],
    ["Included", "Quick-win checklist, client questionnaire, Claude Code prompt pack"],
    ["Access", "For as long as the course is offered, updates included"],
    ["Not included", "No certificate. No live classes. No promise of rankings, mentions or income"],
    ["Taught by", "K Sai Anirudh, Founder, AiVirex Innovations"],
  ];
  return (
    <section className="border-b border-black">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">The course at a glance</h2>
        <div className="mt-10 overflow-x-auto border border-black">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-black">
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" className="w-1/3 bg-neutral-50 px-4 py-3 font-semibold">
                    {k}
                  </th>
                  <td className="px-4 py-3 text-neutral-700">{v.endsWith(".") ? v : `${v}.`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
