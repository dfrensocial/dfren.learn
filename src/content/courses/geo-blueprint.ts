// Single source of truth for this course's marketing copy + price.
// scripts/seed-course.ts reads id/title/priceInPaise from here to seed Firestore —
// change the price or title here, then re-run the seed script.
//
// Adding a second course later = a new file shaped like this one, a new route
// reusing the same section components, and a re-run of the seed script.

export interface CourseContent {
  id: string;
  title: string;
  hero: {
    kicker: string;
    headline: string;
    subheadline: string;
    ctaLabel: string;
    ctaNote: string;
  };
  stats: { value: string; label: string }[];
  curriculum: {
    heading: string;
    subheading: string;
    modules: { title: string; description: string }[];
  };
  bonus: {
    heading: string;
    items: { title: string; description: string }[];
  };
  instructor: {
    name: string;
    title: string;
    bio: string;
    linkedinUrl: string;
  };
  testimonials: { quote: string; name: string; role: string }[];
  pricing: {
    productLabel: string;
    priceInPaise: number;
    includes: string[];
  };
}

export const geoBlueprintCourse: CourseContent = {
  id: "geo-blueprint",
  title: "The GEO Blueprint",
  hero: {
    kicker: "The GEO Blueprint",
    headline: "Get your business recommended by ChatGPT, Gemini, and Claude",
    subheadline:
      "A practical course on Generative Engine Optimization — how it actually works, and how to turn it into income. 1.5 hours, no fluff, built around a real audit tool and two working revenue models.",
    ctaLabel: "Enroll now — lifetime access",
    ctaNote: "One-time payment. No subscription.",
  },
  stats: [
    { value: "1.5 hrs", label: "runtime, no filler" },
    { value: "6", label: "GEO pillars covered" },
    { value: "2", label: "revenue models" },
    { value: "Lifetime", label: "access & updates" },
  ],
  curriculum: {
    heading: "What's inside",
    subheading:
      "One 1.5-hour sitting, in the order you actually need it — foundation first, the 6 pillars second, monetization last.",
    modules: [
      {
        title: "1 — How AI Actually Picks the Next Word",
        description:
          "The plain-terms mental model of how a transformer predicts an answer — no equations, just what every GEO tactic is actually influencing.",
      },
      {
        title: "2 — SEO vs GEO: What Changed and Why",
        description:
          "Google Search → Voice → AI Search. Where SEO and GEO overlap, where they diverge, and why ranking well doesn't guarantee an AI citation.",
      },
      {
        title: "3 — The 6 Pillars of GEO",
        description:
          "Technical Optimization, Answer-First Content, Citation Authority, AI Comprehension, Content Freshness, and Content Depth — plus the quick win for each.",
      },
      {
        title: "4 — Why Manual Audits Don't Work (and the Fix)",
        description:
          "Why asking ChatGPT to grade your site gives a different score every time, and a live demo of Litmus running a fixed, repeatable 6-pillar audit.",
      },
      {
        title: "5 — Two Ways to Turn GEO Into Revenue",
        description:
          "Charging to fix what an audit finds, and charging on an ongoing basis for content — both laid out as a step-by-step client workflow.",
      },
      {
        title: "6 — Client Onboarding & Proving It Worked",
        description:
          "Setting up tracking before you start, setting timeline expectations, and turning a before/after into the case study that wins your next client.",
      },
    ],
  },
  bonus: {
    heading: "Comes with the material, not just the video",
    items: [
      {
        title: "Client research questionnaire",
        description:
          "The exact set of questions to send a client before writing a single word — becomes your source of truth for their content.",
      },
      {
        title: "Claude Code prompt pack",
        description:
          "Ready-to-use prompts for brand voice, competitive research, and blog writing — the same prompts used to turn client answers into published content.",
      },
    ],
  },
  instructor: {
    name: "K Sai Anirudh",
    title: "Founder, AiVirex Innovations",
    bio: "Before writing a single slide of this course, Sai and the AiVirex team spent time researching GEO properly — papers, testing, real iteration — because most tools marketed as “AI visibility scanners” turned out to be a URL wrapped in a ChatGPT prompt, giving a different score every time you ran it. That research became Litmus, a GEO audit tool that scores a site against a fixed, repeatable rubric instead of guessing — and this course teaches the same six-pillar framework it's built on, plus how to charge for it.",
    linkedinUrl: "https://www.linkedin.com/in/sai-anirudh-415001168/",
  },
  testimonials: [
    {
      quote:
        "[Placeholder] Within a month of applying Module 3 we started showing up as a cited source in Perplexity for our category's main queries.",
      name: "Name Surname",
      role: "Role, Company",
    },
    {
      quote:
        "[Placeholder] Finally a course that skips the theory and gives an actual checklist. Rolled it out on our blog in a weekend.",
      name: "Name Surname",
      role: "Role, Company",
    },
    {
      quote:
        "[Placeholder] The technical GEO module alone paid for the course — our engineering team had this wrong for a year.",
      name: "Name Surname",
      role: "Role, Company",
    },
  ],
  pricing: {
    productLabel: "The GEO Blueprint",
    priceInPaise: 49900,
    includes: [
      "1.5 hours of video — the 6 GEO pillars, no filler",
      "The GEO quick-win checklist from the course",
      "Client research questionnaire + Claude Code prompt pack",
      "Lifetime access, including future updates",
    ],
  },
};
