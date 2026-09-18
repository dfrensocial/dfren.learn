import { CheckoutButton } from "@/components/course/checkout-button";
import type { CourseContent } from "@/content/courses/geo-blueprint";

export function Pricing({
  courseId,
  pricing,
}: {
  courseId: string;
  pricing: CourseContent["pricing"];
}) {
  const rupees = (pricing.priceInPaise / 100).toLocaleString("en-IN");

  return (
    <section id="pricing" className="border-b border-black scroll-mt-16">
      <div className="mx-auto max-w-md px-6 py-16 text-center sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          One price. Lifetime access.
        </h2>

        <div className="mt-10 border border-black p-8">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            {pricing.productLabel}
          </p>
          <p className="mt-2 text-5xl font-bold">₹{rupees}</p>
          <p className="mt-1 text-sm text-neutral-500">One-time payment</p>

          <ul className="mt-6 space-y-2 text-left text-sm text-neutral-700">
            {pricing.includes.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden>—</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <CheckoutButton courseId={courseId} courseTitle={pricing.productLabel} />
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Secure checkout via Razorpay.
          </p>
        </div>
      </div>
    </section>
  );
}
