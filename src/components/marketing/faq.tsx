import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL } from "@/content/legal";

// `text` is the plain-text answer used for FAQPage structured data when `a` is JSX.
const FAQS: { q: string; a: ReactNode; text?: string }[] = [
  {
    q: "What is GEO?",
    a: "GEO, or generative engine optimization, means structuring a website so AI assistants can find it, understand it and recommend it. Assistants include ChatGPT, Gemini and Claude. SEO aims to get you ranked. GEO aims to get you named in the answer.",
  },
  {
    q: "Who is this course for?",
    a: "Business owners who want their own site to show up in AI answers. Also marketers, freelancers and agencies who want to offer GEO audits and content to clients. You don't need to know SEO first. It starts from how an AI model produces an answer and builds up to the 6 pillars.",
  },
  {
    q: "Will this get my business recommended by ChatGPT?",
    a: "We can't promise that, and no one honestly can. AI answers change from one run to the next. Content must be published, crawled and cited before it can show up. That takes weeks to a few months. The course teaches what to fix and how to measure it. The result depends on your site and your market.",
  },
  {
    q: "Is this just SEO with a new name?",
    a: "Partly overlapping, not identical. Content quality, structure, authority and a healthy site matter for both. SEO chases rank position and clicks. GEO chases being cited and recommended inside an answer, and strong SEO alone doesn't guarantee that. The course covers where they overlap and where they differ.",
  },
  {
    q: "What is Litmus?",
    text: "Litmus is a GEO audit tool built by the same team as the course (litmus.aivirex.in). The course uses it in a live demo. It scores a real website on all 6 pillars with a fixed rubric, instead of the shifting scores you get from a chatbot.",
    a: (
      <>
        Litmus is a GEO audit tool built by the same team as the course (
        <a href="https://litmus.aivirex.in" target="_blank" rel="noopener noreferrer" className="underline">
          litmus.aivirex.in
        </a>
        ). The course uses it in a live demo. It scores a real website on all 6 pillars with a fixed rubric, instead of
        the shifting scores you get from a chatbot.
      </>
    ),
  },
  {
    q: "Does it cover making money from GEO?",
    a: "Yes. The second half covers two ways to charge for GEO: fixing what an audit finds, and an ongoing monthly fee for content. It also covers client onboarding and setting honest expectations. These are methods, not promised earnings.",
  },
  {
    q: "How much does it cost?",
    a: `The GEO Blueprint costs ₹499 plus GST. GST is added at checkout and shown on your invoice. It is a one-time payment with no subscription.`,
  },
  {
    q: "What language is the course in?",
    a: "Mostly Tamil, with English terms mixed in, since words like schema, citation and audit are used in English anyway.",
  },
  {
    q: "How long do I have access?",
    a: "For as long as the course is offered on dfrenLearn, with updates included. The exact wording is in the Terms linked in the footer.",
  },
  {
    q: "Can I get a refund?",
    text: `The course is a digital product with instant access, so payments aren't refundable for a change of mind. We do refund an extra charge, or a payment where you can't get access and we can't fix it within ${LEGAL.accessFixDays} days. Details are in the refund policy.`,
    a: (
      <>
        The course is a digital product with instant access, so payments aren&apos;t refundable for a change of mind. We
        do refund an extra charge, or a payment where you can&apos;t get access and we can&apos;t fix it within {LEGAL.accessFixDays} days.
        Details are in the{" "}
        <Link href="/refund-policy" className="underline">
          refund policy
        </Link>
        .
      </>
    ),
  },
  {
    q: "How is the course delivered?",
    a: "You stream it on this site from your dashboard after checkout. No app to install.",
  },
];

export function faqForSchema() {
  return FAQS.map((item) => ({ q: item.q, a: typeof item.a === "string" ? item.a : (item.text ?? "") }));
}

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-16 bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <div className="mt-10 space-y-3">
          {FAQS.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-neutral-200 bg-white px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {item.q}
                <span aria-hidden className="ml-4 text-neutral-500 transition-transform group-open:rotate-180">
                  ⌄
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
