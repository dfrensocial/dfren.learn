import { WideImage } from "@/components/ui/wide-image";
import { SectionCta } from "@/components/marketing/section-cta";
import Image from "next/image";
import { OldVsNewMobile } from "@/components/marketing/mobile-infographics";

const PAIN_POINTS = [
  "Customers now ask full questions, like \"What's the best CRM for a 10 person sales team?\", and the assistant hands back a short list. Sometimes it's one name.",
  "Asking ChatGPT to grade your site gives you a different score each time. It improvises a judgment. It doesn't apply a fixed rubric.",
  "Many \"AI visibility\" scanners work the same way: your URL goes into a prompt, the model answers, and a dashboard wraps the result. The score still can't be repeated.",
  "Knowing GEO matters isn't a method. You need a repeatable way to audit a site, decide what to fix first and charge for the work.",
];

const link = "underline underline-offset-2 hover:text-black";

export function Problem() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Your customers are asking AI for a shortlist. Is your business on it?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-neutral-600">
          <strong className="text-accent">GEO, or generative engine optimization,</strong> is the work of making your
          site easy for these assistants to find, understand and recommend. The term comes from a{" "}
          <a href="https://arxiv.org/abs/2311.09735" target="_blank" rel="noopener noreferrer" className={link}>
            2023 research paper
          </a>
          .
        </p>

        {/* The numbers */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Stat
            image="research-100m-chatgpt-india"
            alt="About 100 million weekly ChatGPT users in India"
            source="February 2026 TechCrunch report"
            href="https://www.techcrunch.com/2026/02/15/india-has-100m-weekly-active-chatgpt-users-sam-altman-says/"
          />
          <Stat
            image="research-2b-ai-overviews"
            alt="2 billion monthly users reached by Google's AI Overviews by July 2025"
            source="2 billion monthly users"
            href="https://techcrunch.com/2025/07/23/googles-ai-overviews-have-2b-monthly-users-ai-mode-100m-in-the-us-and-india"
          />
          <Stat
            image="research-8-vs-15-percent-clicks"
            alt="8% vs 15% of US visits ended in a click on a result, with an AI summary vs without one"
            source="Pew Research study"
            href="https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/"
          />
        </div>

        {/* Old way vs new way */}
        <WideImage
          src="/images/geo/old-way-vs-new-way.webp"
          mobile={<OldVsNewMobile />}
          alt="The old way: a search for CRM software India returns a page of links. The new way: an AI assistant names two brands and leaves everyone else out."
          width={2400}
          height={1200}
          sizes="(min-width: 1152px) 1104px, 100vw"
          className="mt-4 h-auto w-full rounded-2xl"
        />

        {/* The problems */}
        <ul className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {PAIN_POINTS.map((point, i) => (
            <li key={point} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="pt-0.5 text-neutral-700">{point}</p>
            </li>
          ))}
        </ul>
        <SectionCta location="problem" variant="soft" label="See what you will learn" href="#curriculum" />
      </div>
    </section>
  );
}

function Stat({ image, alt, source, href }: { image: string; alt: string; source: string; href: string }) {
  return (
    <div className="flex flex-col">
      <Image
        src={`/images/geo/${image}.webp`}
        alt={alt}
        width={1200}
        height={800}
        sizes="(min-width: 1152px) 360px, (min-width: 768px) 33vw, 100vw"
        className="h-auto w-full rounded-2xl"
      />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-center text-xs text-neutral-500 underline underline-offset-2 hover:text-black"
      >
        Source: {source} ↗
      </a>
    </div>
  );
}
