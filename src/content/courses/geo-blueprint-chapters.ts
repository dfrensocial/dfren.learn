// Chapter markers for the course video, keyed by lessonId. Timestamps are
// "m:ss" so they can be checked against the video by eye. Drafted from the
// auto-generated captions and the course deck — adjust titles/times here, then run
//   npm run set-chapters
// to push them to Firestore (the player and chapter list read them from there).
//
// `group` mirrors the module titles on the landing page (curriculum.modules).
import type { Chapter } from "@/types/course";

function t(mmss: string): number {
  const [m, s] = mmss.split(":").map(Number);
  return m * 60 + s;
}

const M1 = "1 — How AI Actually Picks the Next Word";
const M2 = "2 — SEO vs GEO: What Changed and Why";
const M3 = "3 — The 6 Pillars of GEO";
const M4 = "4 — Why Manual Audits Don't Work (and the Fix)";
const M5 = "5 — Two Ways to Turn GEO Into Revenue";
const M6 = "6 — Client Onboarding & Proving It Worked";

export const lessonChapters: Record<string, Chapter[]> = {
  "lesson-1": [
    { start: t("0:00"), title: "Welcome and what you'll learn", group: M1 },
    { start: t("1:06"), title: "A language model is a next-word predictor", group: M1 },

    { start: t("6:01"), title: "Search has changed direction twice already", group: M2 },
    { start: t("11:31"), title: "What GEO is", group: M2 },
    { start: t("12:35"), title: "SEO vs GEO, side by side", group: M2 },
    { start: t("15:30"), title: "Where SEO and GEO overlap", group: M2 },
    { start: t("17:02"), title: "Why AI answers vary: share of authority", group: M2 },
    { start: t("18:35"), title: "Why now: can customers still find you?", group: M2 },

    { start: t("20:37"), title: "How AI decides who to recommend: the 6 pillars", group: M3 },
    { start: t("25:00"), title: "Pillar 1: Technical optimization", group: M3 },
    { start: t("26:03"), title: "Pillar 2: Answer-first content", group: M3 },
    { start: t("28:30"), title: "Pillar 3: Citation authority", group: M3 },
    { start: t("29:30"), title: "Pillar 4: AI comprehension", group: M3 },
    { start: t("32:09"), title: "Pillar 5: Content freshness", group: M3 },
    { start: t("33:01"), title: "Pillar 6: Blog and content visibility", group: M3 },
    { start: t("36:31"), title: "What not to do: common GEO mistakes", group: M3 },
    { start: t("41:32"), title: "Your GEO quick-win checklist", group: M3 },
    { start: t("42:08"), title: "Content still does most of the work", group: M3 },

    { start: t("44:03"), title: "Why not just ask ChatGPT? Same question, different score", group: M4 },
    { start: t("45:01"), title: "Why most GEO tools guess, and why we built Litmus", group: M4 },
    { start: t("46:33"), title: "Live demo: score a real site on all six pillars", group: M4 },
    { start: t("50:00"), title: "One audit, two documents: for developers and for clients", group: M4 },

    { start: t("51:02"), title: "Revenue stream 1: charge to fix what the audit finds", group: M5 },
    { start: t("54:02"), title: "Revenue stream 2: ongoing content, starting with client questions", group: M5 },
    { start: t("56:02"), title: "Questionnaire: business story and location", group: M5 },
    { start: t("59:00"), title: "Questionnaire: customers, compliments and objections", group: M5 },
    { start: t("65:02"), title: "Questionnaire: demographics, fears and the customer's mindset", group: M5 },
    { start: t("70:33"), title: "Questionnaire: competitors and comparison content", group: M5 },
    { start: t("73:04"), title: "Questionnaire: offering, ROI, case studies and brand voice", group: M5 },
    { start: t("78:31"), title: "The prompt pack: from client answers to 10 blogs", group: M5 },
    { start: t("81:31"), title: "Human review before anything goes live", group: M5 },
    { start: t("82:34"), title: "Packaging it: deliverables and a monthly retainer", group: M5 },

    { start: t("84:04"), title: "Onboarding: find out what's already being tracked", group: M6 },
    { start: t("84:30"), title: "Proving it worked: capture the before screenshots", group: M6 },
    { start: t("87:00"), title: "Set expectations early: results take time", group: M6 },
    { start: t("89:04"), title: "Wrap-up", group: M6 },
  ],
};
