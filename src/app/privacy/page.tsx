import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL } from "@/content/legal";

export const metadata: Metadata = { title: "Privacy policy — dfrenLearn" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Your email address</strong>, given at checkout. It&apos;s your account identifier and where
            we send your sign-in link and any support replies.
          </li>
          <li>
            <strong>Purchase record:</strong> which course you bought, when, and the Razorpay payment ID. Card,
            UPI and bank details go straight to Razorpay; we never see or store them.
          </li>
          <li>
            <strong>Sign-in and playback records:</strong> when you sign in, your IP address and browser
            details, and which lesson you&apos;re streaming from which session (used to enforce the 2-stream
            limit and to investigate account sharing).
          </li>
          <li>
            <strong>Usage analytics</strong> through Google Analytics for Firebase, such as pages viewed and
            device type.
          </li>
          <li>
            <strong>On your device only:</strong> a sign-in session cookie, and your place in each lesson so
            playback can resume. The resume position never leaves your browser.
          </li>
        </ul>
      </section>
      <section>
        <h2>Invisible watermark</h2>
        <p>
          While you watch, the video player overlays an imperceptible code that maps back to your account
          (your email, course and lesson). It exists only to trace a leaked copy of the course to its source.
          We don&apos;t use it for anything else.
        </p>
      </section>
      <section>
        <h2>Who handles your data</h2>
        <ul>
          <li>Razorpay: payment processing.</li>
          <li>Google Firebase: accounts, database, sign-in emails and analytics.</li>
          <li>Mux: video storage and streaming.</li>
          <li>Netlify: website hosting.</li>
        </ul>
        <p className="mt-2">
          They process data on our behalf, some outside India. We don&apos;t sell your data or use it for
          advertising.
        </p>
      </section>
      <section>
        <h2>How long we keep it</h2>
        <p>
          Account and purchase records are kept while your account exists and as long as needed for tax,
          accounting and fraud-prevention obligations. Stream-session records are short-lived.
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>
          You can ask to see, correct or delete your data by emailing{" "}
          <a className="underline" href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </a>{" "}
          from your account address. Deleting your account ends your access; see the{" "}
          <Link href="/refund-policy" className="underline">
            refund policy
          </Link>{" "}
          if you&apos;re within the guarantee window.
        </p>
      </section>
    </LegalPage>
  );
}
