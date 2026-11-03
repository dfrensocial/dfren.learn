import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { StatsBar } from "@/components/marketing/stats-bar";
import { Problem } from "@/components/marketing/problem";
import { Curriculum } from "@/components/marketing/curriculum";
import { Bonus } from "@/components/marketing/bonus";
import { Instructor } from "@/components/marketing/instructor";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ, faqForSchema } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/final-cta";
import { MarketingFooter } from "@/components/marketing/footer";
import { geoBlueprintCourse } from "@/content/courses/geo-blueprint";
import { LEGAL } from "@/content/legal";

const PAGE_TITLE = "GEO course for ₹499: The GEO Blueprint";
const PAGE_DESCRIPTION =
  "A 1.5-hour GEO course: how AI assistants pick answers, the 6 pillars to fix on a site, a live audit and 2 ways to charge for the work. ₹499 one time, mostly in Tamil.";

export const metadata: Metadata = {
  title: { absolute: `${PAGE_TITLE} | dfrenLearn` },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
    siteName: "dfrenLearn",
    locale: "en_IN",
    url: "https://learn.dfren.in",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The GEO Blueprint: a 1.5-hour GEO course by dfrenLearn" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

const SITE = "https://learn.dfren.in";

// Structured data for the home page: who we are, the course and its price, and the
// FAQ. Everything here is also visible on the page; no ratings or reviews are
// claimed because there are none yet.
function homeJsonLd() {
  const course = geoBlueprintCourse;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: LEGAL.entity,
        alternateName: ["Dfren", "dfrenLearn"],
        url: SITE,
        email: LEGAL.contactEmail,
        address: {
          "@type": "PostalAddress",
          streetAddress: "7/16, Lutheran Church St, Kadaperi, Tambaram",
          addressRegion: "Tamil Nadu",
          postalCode: "600045",
          addressCountry: "IN",
        },
        sameAs: ["https://dfren.in", "https://aivirex.in", "https://litmus.aivirex.in"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE,
        name: "dfrenLearn",
        inLanguage: "en-IN",
        publisher: { "@id": `${SITE}/#organization` },
      },
      {
        "@type": "Course",
        "@id": `${SITE}/#course`,
        name: course.title,
        description: PAGE_DESCRIPTION,
        url: SITE,
        inLanguage: ["ta", "en"],
        provider: { "@id": `${SITE}/#organization` },
        author: { "@type": "Person", name: course.instructor.name, jobTitle: course.instructor.title, sameAs: [course.instructor.linkedinUrl] },
        dateModified: LEGAL.siteUpdatedISO,
        timeRequired: "PT1H30M",
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT1H30M" },
        offers: {
          "@type": "Offer",
          price: String(course.pricing.priceInPaise / 100),
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `${SITE}/#pricing`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqForSchema().map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export default function LandingPage() {
  const course = geoBlueprintCourse;

  return (
    <main className="min-h-screen bg-white text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd()) }} />
      <MarketingNav />
      <Hero hero={course.hero} courseId={course.id} />
      <StatsBar stats={course.stats} />
      <Problem />
      <Curriculum curriculum={course.curriculum} />
      <Bonus bonus={course.bonus} />
      <Instructor instructor={course.instructor} />
      <Testimonials testimonials={course.testimonials} />
      <Pricing courseId={course.id} pricing={course.pricing} />
      <FAQ />
      <FinalCTA courseId={course.id} />
      <MarketingFooter />
    </main>
  );
}
