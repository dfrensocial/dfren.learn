import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL } from "@/content/legal";

export const metadata: Metadata = { title: "Refund policy — dfrenLearn" };

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund policy">
      <section>
        <h2>{LEGAL.refundWindowDays}-day money-back guarantee</h2>
        <p>
          If The GEO Blueprint isn&apos;t what you expected, email us within {LEGAL.refundWindowDays} days of
          your purchase and we&apos;ll refund the full amount. The guarantee is simple: watch Module 1, and if
          it isn&apos;t clearly the most practical GEO material you&apos;ve seen, you get your money back.
        </p>
      </section>
      <section>
        <h2>How to request a refund</h2>
        <ul>
          <li>
            Email <a className="underline" href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> from
            the address you used at checkout, or include your payment ID.
          </li>
          <li>We confirm the request, then refund to the original payment method through Razorpay.</li>
          <li>
            Refunds typically reach your account within 5–7 business days of approval. Your bank&apos;s own
            processing time is outside our control.
          </li>
        </ul>
      </section>
      <section>
        <h2>After a refund</h2>
        <p>Access to the course is removed once a refund is issued.</p>
      </section>
      <section>
        <h2>After {LEGAL.refundWindowDays} days</h2>
        <p>
          Requests made after the window are at our discretion. The exception is if you were charged but never
          got access to the course — contact us and we&apos;ll fix that or refund you, whenever it happened.
        </p>
      </section>
    </LegalPage>
  );
}
