import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Pages that are private or useless to crawlers. Repeated for every named bot,
// because a bot that matches its own group ignores the "*" group.
const PRIVATE = ["/dashboard", "/api/", "/watermark", "/login"];

// AI search and assistant crawlers, invited by name (the Litmus audit flags bots
// that only get in "by default"). Search and user-request bots decide whether we
// can be shown or cited in answers. The training bots are allowed too: the
// public marketing pages and blog are what we want AI systems to learn from, and
// the course itself sits behind login (/dashboard is disallowed above).
const AI_BOTS = [
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT fetching a page for a user
  "GPTBot", // OpenAI training
  "Claude-SearchBot", // Claude search quality
  "Claude-User", // Claude fetching a page for a user
  "ClaudeBot", // Anthropic training
  "PerplexityBot", // Perplexity search index
  "Perplexity-User", // Perplexity fetching a page for a user
  "Google-Extended", // Gemini training and grounding
  "Applebot-Extended", // Apple AI training opt-in
  "Bingbot", // Bing index (also feeds Copilot)
  "Googlebot",
  // Other answer and training crawlers, named so access is deliberate, not accidental.
  "CCBot", // Common Crawl, a public dataset many models use
  "Bytespider", // ByteDance
  "Amazonbot",
  "meta-externalagent",
  "anthropic-ai",
  "Claude-Web",
  "cohere-ai",
  "DuckAssistBot",
  "MistralAI-User",
  "YouBot",
  "Diffbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE })),
      { userAgent: "*", allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
