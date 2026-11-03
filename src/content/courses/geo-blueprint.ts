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
    headline: "Learn how to get your business recommended by ChatGPT, Gemini and Claude",
    subheadline:
      "A 1.5-hour GEO course: how AI assistants pick their answers, the 6 pillars to fix on a website, a live audit, and two ways to charge for the work.",
    ctaLabel: "Get the course for ₹499",
    ctaNote: "One-time payment, no subscription. Taught mostly in Tamil, with English terms mixed in.",
  },
  stats: [
    { value: "1.5 hrs", label: "of video, no filler" },
    { value: "6", label: "GEO pillars" },
    { value: "2", label: "ways to charge for GEO work" },
    { value: "₹499", label: "one time" },
  ],
  curriculum: {
    heading: "What you learn in 1.5 hours",
    subheading:
      "Six short modules in the order you need them: how AI answers work, what to fix on a site, then how to use it for clients.",
    modules: [
      {
        title: "1. How AI picks its next word",
        description:
          "A plain-language look at how a model like ChatGPT predicts an answer, with no equations. Every GEO tactic is an attempt to influence this one process.",
      },
      {
        title: "2. SEO vs GEO: what changed",
        description:
          "From Google search to voice to AI assistants. Where SEO and GEO overlap, where they differ, and why ranking well on Google doesn't guarantee an AI recommendation.",
      },
      {
        title: "3. The 6 pillars of GEO",
        description:
          "Technical optimization, answer-first content, citation authority, AI comprehension, content freshness and content depth, each with a quick win you can apply the same day.",
      },
      {
        title: "4. Why manual audits don't work, and a live audit",
        description:
          "Why asking ChatGPT to grade your site gives a different score every time, and a live demo of Litmus scoring a real website against all 6 pillars with a fixed rubric.",
      },
      {
        title: "5. Two ways to turn GEO into income",
        description:
          "Charging to fix what an audit finds, and charging monthly for content. Both are laid out as a step-by-step workflow you can run with a client.",
      },
      {
        title: "6. Onboarding a client and proving the work",
        description:
          "Setting up tracking before you start, setting honest timeline expectations, and turning a before-and-after into the case study that helps you win the next client.",
      },
    ],
  },
  bonus: {
    heading: "Also included: the working files",
    items: [
      {
        title: "Client research questionnaire",
        description:
          "The questions to send a client before you write a word for them. Their answers become the source of truth for everything you publish.",
      },
      {
        title: "Claude Code prompt pack",
        description:
          "Ready-to-use prompts for brand voice, competitor research and blog writing, so you aren't starting from a blank page on every client.",
      },
    ],
  },
  instructor: {
    name: "K Sai Anirudh",
    title: "Founder, AiVirex Innovations",
    bio: "Before writing this course, Sai and the AiVirex team spent time on GEO research: papers, testing and a lot of iteration. They found that many “AI visibility” tools simply wrap a URL in a ChatGPT prompt, so the score changes every time you run it. That work became Litmus, an audit tool that scores a site against a fixed rubric. The course teaches the same six-pillar framework, and how to charge for it.",
    linkedinUrl: "https://www.linkedin.com/in/sai-anirudh-415001168/",
  },
  // Left empty on purpose: the Testimonials section renders nothing until
  // there are real student quotes here. Don't ship made-up ones.
  testimonials: [],
  pricing: {
    productLabel: "The GEO Blueprint",
    priceInPaise: 49900,
    includes: [
      "1.5 hours of video: the 6 GEO pillars, a live audit and 2 ways to charge for the work",
      "The GEO quick-win checklist from the course",
      "Client research questionnaire and Claude Code prompt pack",
      "Access for as long as the course is offered, with updates included",
    ],
  },
};
