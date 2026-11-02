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
          <li>Use scrapers, downloaders or other automated tools on the course, or use it to train an AI model.</li>
          <li>Use the course material in a way that infringes our rights or anyone else&apos;s.</li>
        </ul>
        <p className="mt-2">
          We limit each account to 2 simultaneous streams. One email address is one account, and the licence is
          for one person.
        </p>
        <p className="mt-2">
          The course, its videos, slides, templates and prompts, and the dfrenLearn and DFREN names belong to us.
          You may use the templates and prompts in your own work for your own clients. You may not resell, share
          or publish them as templates, courses or downloads of your own.
        </p>
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
          Playback carries an invisible, per-viewer mark linked to your account. If a recording or copy of the
          course leaks, it may help us identify the account it came from. It&apos;s a deterrent and an aid, not a
          promise that we can trace every copy. See the{" "}
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
          losses. This doesn&apos;t limit liability for fraud or wilful wrongdoing, or anything else the law
          doesn&apos;t let us limit.
        </p>
      </section>
      <section>
        <h2>Educational content only</h2>
        <p>
          The course is for education. It isn&apos;t legal, financial, tax or other professional advice, and you
          should check anything that matters to your business with a qualified person. The course may mention
          third-party tools and sites. They have their own terms, and we aren&apos;t responsible for them.
        </p>
      </section>
      <section>
        <h2>Prices</h2>
        <p>
          The price shown at checkout is the price you pay. We may change prices or run offers at any time, and a
          change never affects a purchase you&apos;ve already made.
        </p>
      </section>
      <section>
        <h2>Things outside our control</h2>
        <p>
          We aren&apos;t liable for a delay or failure caused by something beyond our reasonable control, such as
          an outage at a payment, hosting, video or internet provider, or a change in law.
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
        <h2>The rest</h2>
        <ul>
          <li>We send notices to the email address on your account. Please keep it working.</li>
          <li>If any part of these terms can&apos;t be enforced, the rest still applies.</li>
          <li>If we don&apos;t enforce a right straight away, we haven&apos;t given it up.</li>
          <li>
            These terms, the privacy policy and the refund policy are the whole agreement between you and us about
            the course.
          </li>
          <li>You can&apos;t transfer your account to anyone. We may transfer these terms if the business changes hands.</li>
          <li>The limits on use, ownership, liability and legal action in these terms stay in force after your access ends.</li>
        </ul>
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
