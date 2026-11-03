import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL } from "@/content/legal";

export const metadata: Metadata = {
  title: "Contact dfrenLearn | dfrenLearn",
  description:
    "How to reach dfrenLearn: email, postal address in Tambaram, Chennai, and our Grievance Officer. We reply within 48 hours.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "https://learn.dfren.in/contact", type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
};

const SITE = "https://learn.dfren.in";

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
