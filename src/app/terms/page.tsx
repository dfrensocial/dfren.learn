import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL } from "@/content/legal";

export const metadata: Metadata = { title: "Terms of service — dfrenLearn" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service">
      <section>
        <h2>What you&apos;re buying</h2>
        <p>
          These terms are between you and {LEGAL.entity} (&ldquo;we&rdquo;), which runs dfrenLearn.
        </p>
        <p className="mt-2">
          A single-user licence to stream the course videos on dfrenLearn for as long as the course is offered
          on the platform (&ldquo;lifetime access&rdquo;), including updates we publish to it. The licence is
          personal and non-transferable. You get access, not ownership, of the content.
        </p>
      </section>
      <section>
        <h2>Who can use dfrenLearn</h2>
        <p>
          You must be 18 or older. When you tick the box at sign-in or before paying, you confirm that, agree
          to these terms, and confirm you&apos;ve read the{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>
          . That box doesn&apos;t switch on analytics or session recordings. Those are separate, optional and
          off until you say yes.
        </p>
      </section>
      <section>
        <h2>Your account</h2>
        <p>
          Your account is created from the email you give at checkout and you sign in with a link sent to that
          address. Keep that inbox secure; anyone who can read it can sign in as you. You&apos;re responsible
          for activity on your account.
        </p>
      </section>
      <section>
        <h2>What you can&apos;t do</h2>
        <ul>
          <li>Share your account, or let others watch through it.</li>
          <li>
            Download, screen-record, re-upload, resell or otherwise redistribute the videos or accompanying
            material.
          </li>
          <li>Try to bypass the playback protections, the stream limit, or the watermark described below.</li>
          <li>Use the course material in a way that infringes our rights or anyone else&apos;s.</li>
        </ul>
        <p className="mt-2">We limit each account to 2 simultaneous streams.</p>
      </section>
      <section>
        <h2>If you break these terms</h2>
        <p>
          If we find or reasonably believe you have shared your account, or recorded, copied, leaked, resold or
          redistributed the course, or otherwise breached these terms, we may suspend or end your access straight
          away, without notice and without a refund.
        </p>
        <p className="mt-2">
          The course is our copyright. If it is leaked or sold, and we trace it to your account (including through
          the watermark below) or to something you control, we may take legal action against you. That can include
          a civil claim for damages, a court order to stop you, recovery of our legal costs, and any criminal
          complaint the law allows. This is in addition to ending your access.
        </p>
      </section>
      <section>
        <h2>Watermarking</h2>
        <p>
          Playback carries an invisible, per-viewer mark that ties a copy of the video to your account. If
          content leaks, we can use it to identify the account it came from. See the{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>
          .
        </p>
      </section>
      <section>
        <h2>Payments and refunds</h2>
        <p>
          Payments are processed by Razorpay in Indian rupees. The course is a digital product with instant
          access, so payments are <strong>not refundable</strong> and can&apos;t be cancelled once paid, except
          where we say otherwise in the{" "}
          <Link href="/refund-policy" className="underline">
            cancellation and refund policy
          </Link>
          . That policy is part of these terms.
        </p>
      </section>
      <section>
        <h2>No guarantee of results</h2>
        <p>
          The course teaches methods for improving how AI systems cite and recommend a business. Search and AI
          systems change constantly and are outside our control, so we can&apos;t promise any particular
          ranking, citation, traffic or income. Examples are illustrative, not a forecast.
        </p>
      </section>
      <section>
        <h2>Liability</h2>
        <p>
          To the extent the law allows, our total liability to you for anything arising from the course is
          limited to the amount you paid for it, and we aren&apos;t liable for indirect or consequential
          losses.
        </p>
      </section>
      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms, the privacy policy and the refund policy. The version on these pages, with
          the date at the top, is always the current one, so please check them from time to time. If we make a
          change that matters, you&apos;ll be asked to review and accept it in your dashboard before you can carry
          on using the course.
        </p>
      </section>
      <section>
        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of India, and the courts at Chennai, Tamil Nadu have jurisdiction,
          without affecting your right to bring a consumer complaint before the Consumer Commission that has
          jurisdiction over you.
        </p>
      </section>
    </LegalPage>
  );
}
