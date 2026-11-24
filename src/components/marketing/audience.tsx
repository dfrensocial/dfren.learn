import { WideImage } from "@/components/ui/wide-image";
import { TimelineMobile } from "@/components/marketing/mobile-infographics";
import { SectionCta } from "@/components/marketing/section-cta";
import Image from "next/image";

// Who the course is for, as cards. Same facts as the "Who is this course for?" FAQ.
const AUDIENCE = [
  {
    label: "Business owners",
    image: "card-business-owners",
    title: "Get your own site into AI answers",
    body: "Apply the 6 pillars to your own website, or brief your developer on exactly what to fix.",
  },
  {
    label: "Marketers and freelancers",
    image: "card-marketers-freelancers",
    title: "Offer GEO audits and content to clients",
    body: "A repeatable audit and two ways to charge for the work: fixing what it finds, and monthly content.",
  },
  {
    label: "Agencies",
    image: "card-agencies",
    title: "Add GEO to what you already sell",
    body: "Run the same audit on every client site and turn the findings into fix projects and content work.",
  },
  {
    label: "New to SEO",
    image: "card-beginners",
    title: "No SEO background needed",
    body: "It starts from how an AI model produces an answer and builds up to the 6 pillars.",
  },
];

export function Audience() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Who the course is for
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE.map((a) => (
            <div key={a.label} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <Image
                src={`/images/geo/${a.image}.webp`}
                alt=""
                width={960}
                height={600}
                sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 100vw"
                className="mb-5 h-auto w-full rounded-xl"
              />
              <h3 className="text-xl font-bold leading-snug tracking-tight">{a.label}</h3>
              <p className="mt-1.5 text-sm font-medium text-neutral-500">{a.title}</p>
              <p className="mt-3 text-sm text-neutral-600">{a.body}</p>
            </div>
          ))}
        </div>
        <WideImage
          src="/images/geo/not-for-you-timeline.webp"
          mobile={<TimelineMobile />}
          alt="Results take weeks to a few months: content is published, crawled, then cited."
          width={2400}
          height={600}
          sizes="(min-width: 1152px) 1104px, 100vw"
          className="mt-6 h-auto w-full rounded-2xl"
        />
        <p className="mt-6 rounded-2xl border border-neutral-300 bg-white p-5 text-sm text-neutral-700">
          <strong className="text-accent">Not for you if</strong> you want overnight results. Content has to be
          published, crawled and cited before it shows up, and that takes weeks to a few months.
        </p>
        <SectionCta
          location="audience"
          variant="secondary"
          note="No SEO background needed · mostly Tamil · instant access"
        />
      </div>
    </section>
  );
}
