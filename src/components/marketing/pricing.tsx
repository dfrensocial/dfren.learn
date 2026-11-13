import Link from "next/link";
import { CheckoutButton } from "@/components/course/checkout-button";
import { TrackOnView } from "@/components/analytics/track-on-view";
import type { CourseContent } from "@/content/courses/geo-blueprint";

/** Closing band: the final pitch on the left, the price card (real checkout) on the right. */
export function Pricing({
  courseId,
  pricing,
  subheadline,
}: {
  courseId: string;
  pricing: CourseContent["pricing"];
  subheadline: string;
}) {
  const rupees = (pricing.priceInPaise / 100).toLocaleString("en-IN");

  return (
    <section id="pricing" className="scroll-mt-16 bg-black text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Learn the full method for getting found by AI assistants, for ₹{rupees} + GST.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-neutral-300">{subheadline}</p>
          <p className="mt-8 text-2xl font-bold">One price. No subscription.</p>
        </div>

        <TrackOnView
          event="view_item"
          params={{
            currency: "INR",
            value: pricing.priceInPaise / 100,
            items: [
              { item_id: courseId, item_name: pricing.productLabel, price: pricing.priceInPaise / 100, quantity: 1 },
            ],
          }}
        >
          <div className="rounded-2xl bg-white p-7 text-black shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] sm:p-8">
            <p className="font-semibold">{pricing.productLabel}</p>
            <p className="mt-3 text-5xl font-bold">
              ₹{rupees}
              <span className="ml-2 text-2xl font-semibold text-neutral-600">+ GST</span>
            </p>
            <p className="mt-1 text-sm text-neutral-600">One-time payment. GST is added at checkout.</p>

            <ul className="mt-6 space-y-2.5 text-sm text-neutral-700">
              {pricing.includes.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span aria-hidden className="font-bold text-black">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <CheckoutButton courseId={courseId} courseTitle={pricing.productLabel} priceInPaise={pricing.priceInPaise} />
            </div>
            <p className="mt-3 text-center text-xs text-neutral-500">
              Secure checkout via Razorpay. Instant digital access, so payments are non-refundable except as in the{" "}
              <Link href="/refund-policy" className="underline">
                refund policy
              </Link>
              .
            </p>
          </div>
        </TrackOnView>
      </div>
    </section>
  );
}
