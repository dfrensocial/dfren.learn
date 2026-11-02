import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL } from "@/content/legal";

export const metadata: Metadata = { title: "Cancellation and refund policy — dfrenLearn" };

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Cancellation and refund policy">
      <section>
        <h2>The short version</h2>
        <p>
          The course is a digital product. You get access the moment your payment is confirmed, and you can
          watch it and download the course materials straight away. So <strong>payments are not refundable and orders can&apos;t be
          cancelled once paid</strong>, including if you change your mind, haven&apos;t watched it, or don&apos;t
          find it useful. The only exceptions are the two below.
        </p>
      </section>

      <section>
        <h2>Delivery</h2>
        <p>
          Nothing is shipped. Right after payment you&apos;re signed in and the course appears in your dashboard at{" "}
          {LEGAL.website}. We can also email you a sign-in link whenever you need one, so you can open the course
          on any device.
        </p>
      </section>

      <section>
        <h2>When we do refund</h2>
        <ul>
          <li>
            <strong>You were charged extra.</strong> If you were charged more than the price shown (for example a
            duplicate payment for the same order), we refund the extra amount.
          </li>
          <li>
            <strong>You paid but can&apos;t get access, and we can&apos;t fix it.</strong> If you tell us you
            can&apos;t access the course and we haven&apos;t been able to fix it within {LEGAL.accessFixDays} days
            of your email, we refund what you paid for it.
          </li>
        </ul>
        <p className="mt-2">
          We always try to fix access first, because that&apos;s what you bought. If we refund the whole payment,
          your access to the course ends.
        </p>
      </section>

      <section>
        <h2>How to ask</h2>
        <ul>
          <li>
            Email{" "}
            <a className="underline" href={`mailto:${LEGAL.contactEmail}`}>
              {LEGAL.contactEmail}
            </a>{" "}
            from the address you used at checkout, and include your payment ID if you have it. The day we receive
            your email is the day the {LEGAL.accessFixDays} days start.
          </li>
          <li>
            We reply within {LEGAL.grievanceAckHours} hours and settle the matter within {LEGAL.grievanceResolveDays}{" "}
            days.
          </li>
          <li>An approved refund goes back to the original payment method through Razorpay.</li>
          <li>
            It usually reaches your account in 5–7 business days. Your bank&apos;s own processing time is outside
            our control.
          </li>
        </ul>
      </section>

      <section>
        <h2>If your payment failed but money left your account</h2>
        <p>
          When a payment fails after your bank has debited you, the money normally goes back to you automatically
          within about 5–7 working days. If it hasn&apos;t come back after that, email us with the payment details
          and we&apos;ll help sort it out.
        </p>
      </section>

      <section>
        <h2>No refund when access is withdrawn</h2>
        <p>
          If we end your access because you broke the{" "}
          <Link href="/terms" className="underline">
            terms
          </Link>{" "}
          (for example sharing your account, or recording, leaking or reselling the course), you don&apos;t get a
          refund. Deleting your account at your own request also doesn&apos;t entitle you to one.
        </p>
      </section>

      <section>
        <h2>Disputes with your bank</h2>
        <p>
          Please write to us first. It&apos;s faster than a card dispute. If a payment is disputed with your bank,
          we may pause access to the course while the dispute is open, and we&apos;ll send the bank our records of
          the order, your acceptance of the terms, and how the course was accessed.
        </p>
      </section>

      <section>
        <h2>Your legal rights</h2>
        <p>
          Nothing here takes away any right you have under Indian consumer law, including the right to approach a
          Consumer Commission.
        </p>
      </section>
    </LegalPage>
  );
}
