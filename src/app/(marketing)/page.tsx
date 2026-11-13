import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { MarketingNav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Promo } from "@/components/marketing/promo";
import { Problem } from "@/components/marketing/problem";
import { Curriculum } from "@/components/marketing/curriculum";
import { AtAGlance } from "@/components/marketing/at-a-glance";
import { Bonus } from "@/components/marketing/bonus";
import { Instructor } from "@/components/marketing/instructor";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ, faqForSchema } from "@/components/marketing/faq";
import { Audience } from "@/components/marketing/audience";
import { MarketingFooter } from "@/components/marketing/footer";
import { geoBlueprintCourse } from "@/content/courses/geo-blueprint";
import { LEGAL } from "@/content/legal";

const PAGE_TITLE = "The GEO Blueprint by dfrenLearn: GEO and AEO course, ₹599 incl. GST";
const PAGE_DESCRIPTION =
  "The GEO Blueprint by dfrenLearn: a 1.5-hour GEO and AEO course on how AI picks answers, 6 pillars, a live audit, 2 ways to charge. ₹599 incl. GST, mostly Tamil.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
    siteName: "dfrenLearn",
    locale: "en_IN",
    url: SITE_URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "The GEO Blueprint: a 1.5-hour GEO course by dfrenLearn" }],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

const SITE = SITE_URL;

// Structured data for the home page: who we are, the course and its price, and the
// FAQ. Everything here is also visible on the page; no ratings or reviews are
// claimed because there are none yet.
function homeJsonLd() {
  const course = geoBlueprintCourse;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE}/#webpage`,
        url: SITE,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "en-IN",
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#course` },
        publisher: { "@id": `${SITE}/#organization` },
        datePublished: LEGAL.publishedISO,
        dateModified: LEGAL.siteUpdatedISO,
      },
      {
        "@type": "Course",
        "@id": `${SITE}/#course`,
        name: course.title,
        alternateName: ["GEO Blueprint", "The GEO Blueprint by dfrenLearn"],
        description: PAGE_DESCRIPTION,
        url: SITE,
        inLanguage: ["ta", "en"],
        provider: { "@id": `${SITE}/#organization` },
        author: { "@id": `${SITE}/#instructor` },
        datePublished: LEGAL.publishedISO,
        dateModified: LEGAL.siteUpdatedISO,
        timeRequired: "PT1H30M",
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT1H30M" },
        offers: {
          "@type": "Offer",
          price: String(course.pricing.priceInPaise / 100),
          priceCurrency: "INR",
          // The price is what the buyer pays: GST is included.
          priceSpecification: {
            "@type": "PriceSpecification",
            price: String(course.pricing.priceInPaise / 100),
            priceCurrency: "INR",
            valueAddedTaxIncluded: true,
          },
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
      <Hero hero={course.hero} stats={course.stats} courseId={course.id} />
      <Testimonials />
      <Promo />
      <Problem />
      <Curriculum
        curriculum={course.curriculum}
        courseTitle={course.title}
        instructorName={`${course.instructor.name} · ${course.instructor.title}`}
        courseId={course.id}
      />
      <Audience />
      <Instructor instructor={course.instructor} />
      <AtAGlance pricing={course.pricing} />
      <Bonus bonus={course.bonus} />
      <FAQ />
      <Pricing courseId={course.id} pricing={course.pricing} subheadline={course.hero.subheadline} />
      <MarketingFooter />
    </main>
  );
}
