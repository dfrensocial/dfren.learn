import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms of service — dfrenLearn" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service">
      <section>
        <h2>What you&apos;re buying</h2>
        <p>
          A single-user licence to stream the course videos on dfrenLearn for as long as the course is offered
          on the platform (&ldquo;lifetime access&rdquo;), including updates we publish to it. The licence is
          personal and non-transferable. You get access, not ownership, of the content.
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
        </ul>
        <p className="mt-2">
          We limit each account to 2 simultaneous streams. We may suspend or end access, without refund, for
          breaches of these terms.
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
          Payments are processed by Razorpay in Indian rupees. Refunds are covered by the{" "}
          <Link href="/refund-policy" className="underline">
            refund policy
          </Link>
          .
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
        <h2>Changes and governing law</h2>
        <p>
          We may update these terms; the version on this page is the current one. These terms are governed by
          the laws of India.
        </p>
      </section>
    </LegalPage>
  );
}
