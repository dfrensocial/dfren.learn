import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL } from "@/content/legal";
import { geoBlueprintCourse } from "@/content/courses/geo-blueprint";
import { rupeesFromPaise } from "@/lib/gst";

export const metadata: Metadata = {
  title: "About dfrenLearn and The GEO Blueprint | dfrenLearn",
  description:
    "dfrenLearn is run by DFREN Marketing Agency in Chennai. It sells The GEO Blueprint, a 1.5-hour GEO course by AiVirex, and publishes GEO guides.",
  alternates: { canonical: "/about" },
  openGraph: { url: `${SITE_URL}/about`, type: "website", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
};

const SITE = SITE_URL;

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${SITE}/about`,
    name: "About dfrenLearn and The GEO Blueprint",
    dateModified: LEGAL.siteUpdatedISO,
    about: { "@id": `${SITE}/#organization` },
    isPartOf: { "@id": `${SITE}/#website` },
  };
  const price = rupeesFromPaise(geoBlueprintCourse.pricing.priceInPaise);

  return (
    <LegalPage title="About dfrenLearn">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section>
        <h2>What dfrenLearn is</h2>
        <p>
          dfrenLearn (also written Dfren Learn) is a learning site at {LEGAL.website}. It sells one course today,{" "}
          <Link href="/" className="underline">
            The GEO Blueprint
          </Link>
          . It also publishes plain guides on GEO, or generative engine optimization. GEO means making a website easy
          for assistants like ChatGPT, Gemini and Claude to find, understand and recommend.
        </p>
      </section>
      <section>
        <h2>Who runs it</h2>
        <p>
          dfrenLearn is operated by {LEGAL.entity} (brand name: Dfren), {LEGAL.entityType} based in Chennai,
          Tamil Nadu (GSTIN {LEGAL.gstin}). The course and the Litmus audit tool are made by AiVirex Innovations, a technology studio at{" "}
          <a href="https://aivirex.in" target="_blank" rel="noopener noreferrer" className="underline">
            aivirex.in
          </a>
          . The course is taught by {geoBlueprintCourse.instructor.name}, {geoBlueprintCourse.instructor.title}.
        </p>
      </section>
      <section>
        <h2>The GEO Blueprint in short</h2>
        <ul>
          <li>About 1.5 hours of video in 6 modules.</li>
          <li>Covers how AI picks answers, the 6 pillars of GEO, a live audit, and two ways to charge for GEO work.</li>
          <li>Comes with a client research questionnaire, a Claude Code prompt pack and a quick-win checklist.</li>
          <li>₹{price} including GST, one time. Taught mostly in Tamil, with English terms mixed in.</li>
          <li>Access for as long as the course is offered on dfrenLearn, with updates included.</li>
        </ul>
        <p className="mt-2">
          It has no certificate and only a few early student messages so far (shown on the home page), and we make no promise of rankings, mentions or income.
        </p>
      </section>
      <section>
        <h2>Why GEO matters</h2>
        <p>
          More people now ask an AI assistant for a recommendation before they open a website. India has about 100 million
          weekly ChatGPT users, according to a{" "}
          <a
            href="https://www.techcrunch.com/2026/02/15/india-has-100m-weekly-active-chatgpt-users-sam-altman-says/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            February 2026 TechCrunch report
          </a>
          . Google&apos;s AI Overviews reached{" "}
          <a
            href="https://techcrunch.com/2025/07/23/googles-ai-overviews-have-2b-monthly-users-ai-mode-100m-in-the-us-and-india"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            2 billion monthly users
          </a>{" "}
          by July 2025. A business that these assistants cannot find or describe correctly may never be named. GEO is the
          work of fixing that.
        </p>
      </section>
      <section>
        <h2>Who the course is for</h2>
        <ul>
          <li>Business owners who want their own site to show up in AI answers.</li>
          <li>Marketers, freelancers and agencies who want to offer GEO audits or content to clients.</li>
          <li>Tamil speakers who want to learn in the language they think in.</li>
        </ul>
        <p className="mt-2">You do not need to know SEO first. The course starts from how an AI model writes an answer.</p>
      </section>
      <section>
        <h2>How we write our guides</h2>
        <p>
          Every guide links its sources and says where the evidence is thin. We mark opinion as opinion, and we say that we
          sell a course. We do not promise rankings, mentions or income, because nobody can. The research behind the term
          GEO is a{" "}
          <a href="https://arxiv.org/abs/2311.09735" target="_blank" rel="noopener noreferrer" className="underline">
            2023 paper
          </a>{" "}
          from Indian and US researchers, and our guides also cite Google, OpenAI and Pew Research.
        </p>
      </section>
      <section>
        <h2>Our guides</h2>
        <p>
          The{" "}
          <Link href="/blog" className="underline">
            blog
          </Link>{" "}
          has guides on where to learn GEO, what GEO costs in India, how AI assistants choose businesses, how to audit a
          site and how to track results. Each guide links its sources and says where the evidence is thin.
        </p>
      </section>
      <section>
        <h2>Contact and policies</h2>
        <p>
          See the{" "}
          <Link href="/contact" className="underline">
            contact page
          </Link>
          , the{" "}
          <Link href="/terms" className="underline">
            terms
          </Link>
          , the{" "}
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
