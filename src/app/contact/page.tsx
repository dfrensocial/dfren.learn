import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL } from "@/content/legal";

export const metadata: Metadata = {
  title: "Contact dfrenLearn | dfrenLearn",
  description:
    "How to reach dfrenLearn: email, postal address in Tambaram, Chennai, and our Grievance Officer. We reply within 48 hours.",
  alternates: { canonical: "/contact" },
  openGraph: { url: `${SITE_URL}/contact`, type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
};

const SITE = SITE_URL;

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE}/contact`,
    name: "Contact dfrenLearn",
    dateModified: LEGAL.siteUpdatedISO,
    mainEntity: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: LEGAL.entity,
      email: LEGAL.contactEmail,
      contactPoint: [
        { "@type": "ContactPoint", contactType: "customer support", email: LEGAL.contactEmail, availableLanguage: ["en", "ta"] },
        { "@type": "ContactPoint", contactType: "grievance officer", name: LEGAL.grievanceOfficer, telephone: LEGAL.grievancePhone, email: LEGAL.grievanceEmail },
      ],
    },
  };

  return (
    <LegalPage title="Contact dfrenLearn">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section>
        <h2>Support and questions</h2>
        <p>
          Email{" "}
          <a className="underline" href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </a>
          . We acknowledge messages within {LEGAL.grievanceAckHours} hours. If you paid, write from the email you used at
          checkout and include your payment ID.
        </p>
      </section>
      <section>
        <h2>What to include in your email</h2>
        <ul>
          <li>The email address you used at checkout, so we can find your order.</li>
          <li>Your payment ID from Razorpay, if you have it.</li>
          <li>What went wrong, and a screenshot if it helps.</li>
          <li>For a privacy request, say what you want: a copy of your data, a correction or erasure.</li>
        </ul>
        <p className="mt-2">
          We read every message. We reply within {LEGAL.grievanceAckHours} hours and aim to settle the matter within{" "}
          {LEGAL.grievanceResolveDays} days.
        </p>
      </section>
      <section>
        <h2>Common reasons to write</h2>
        <ul>
          <li>You paid but cannot open the course. We will fix access, and the refund policy explains what happens if we cannot.</li>
          <li>You were charged twice. An extra charge is refunded through Razorpay.</li>
          <li>You want to know what the course covers. See the curriculum and FAQ on the home page.</li>
          <li>You are a business and want to talk about GEO for your own site. Tell us a little about it.</li>
        </ul>
        <p className="mt-2">
          Payments are handled by{" "}
          <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="underline">
            Razorpay
          </a>
          . We never see your card details.
        </p>
      </section>
      <section>
        <h2>Business details</h2>
        <p>
          {LEGAL.entity} ({LEGAL.entityType}; brand name Dfren)
          <br />
          {LEGAL.address}
        </p>
      </section>
      <section>
        <h2>Grievance Officer</h2>
        <p>
          {LEGAL.grievanceOfficer}
          <br />
          Phone: {LEGAL.grievancePhone}
          <br />
          Email:{" "}
          <a className="underline" href={`mailto:${LEGAL.grievanceEmail}`}>
            {LEGAL.grievanceEmail}
          </a>
        </p>
        <p className="mt-2">
          We aim to resolve complaints within {LEGAL.grievanceResolveDays} days. More in the{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>{" "}
          and the{" "}
          <Link href="/refund-policy" className="underline">
            refund policy
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
