---
title: How do ChatGPT, Gemini and Claude choose which businesses to recommend?
seoTitle: How ChatGPT, Gemini and Claude pick which businesses to recommend
description: No AI company publishes its formula. Here is what OpenAI, Google and Anthropic do say, what studies link to being named, and why answers change each run.
date: 2026-11-03
updated: 2026-11-03
author: AiVirex Team
authorRole: Research and writing, AiVirex Innovations
authorUrl: https://aivirex.in
tag: How AI picks answers
related: google-rank-vs-chatgpt-mentions, get-recommended-by-chatgpt, geo-paper-up-to-40-percent
---

# How do ChatGPT, Gemini and Claude choose which businesses to recommend?

Nobody outside these companies knows the exact formula, and none of them has published one. What is documented: when you ask for a recommendation, the assistant searches the web, reads the pages it can reach and writes an answer from what it found. OpenAI says only that ChatGPT [ranks results using "multiple factors"](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt). Studies link being named to things like mentions across the web and reviews, but those are correlations, not rules.

We teach GEO, so we have a stake in this topic. We have tried to separate what companies say from what studies suggest and from what we don't know.

## What the companies say they do

Each assistant has its own crawler, and each company says what it's for. This is the one part you can read in plain text.

| Assistant | What the company says | What you control |
|---|---|---|
| ChatGPT | [OAI-SearchBot](https://developers.openai.com/api/docs/bots) surfaces websites in ChatGPT's search features. GPTBot is a separate bot for training. | Allow OAI-SearchBot in robots.txt |
| Claude | [Claude-SearchBot](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) crawls to improve search results. Claude-User fetches pages when a user's question needs it. | Allow Claude-SearchBot and Claude-User |
| Perplexity | [PerplexityBot](https://docs.perplexity.ai/guides/bots) surfaces and links websites in Perplexity's results. | Allow PerplexityBot |
| Google AI Overviews and AI Mode | A page must be [indexed and eligible to show in Search with a snippet](https://developers.google.com/search/docs/appearance/ai-features). No extra requirements. | Normal Google Search basics |

Two more facts from the same pages. ChatGPT search [sometimes partners with other search providers](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) and rewrites your question into one or more targeted queries. Google says its AI features may use [query fan-out](https://developers.google.com/search/docs/appearance/ai-features), meaning several related searches across subtopics. So one customer question can become several searches, and your page may match only one of them.

## What studies link to being named

Researchers can't see inside the assistants either, so they measure what named brands have in common. Two examples, both from companies that sell SEO tools:

- **Brand mentions.** In an [Ahrefs study of 75,000 brands](https://ahrefs.com/blog/ai-overview-brand-correlation/), the number of times a brand was mentioned across the web had the strongest link to appearing in Google AI Overviews (a correlation of 0.664, where 1 is a perfect match). Backlinks were much weaker at 0.218. The brands studied were fairly large, so small sites were left out.
- **Reviews and freshness.** An [SE Ranking study](https://www.searchenginejournal.com/new-data-top-factors-influencing-chatgpt-citations/561954/) of 129,000 domains found sites listed on several review platforms averaged 4.6 to 6.3 ChatGPT citations, against 1.8 for sites not listed. Pages updated within three months averaged 6, against 3.6 for outdated ones.

Both are correlations. Big, well known sites tend to have more of everything, so these numbers don't prove that adding reviews makes ChatGPT name you.

## Why the answer changes every time

Ask the same question twice and you may get different businesses. [SparkToro and Gumshoe](https://www.searchenginejournal.com/ai-recommendations-change-with-nearly-every-query-sparktoro/566242) ran 2,961 prompts in late 2025 and found ChatGPT and Google's AI returned the same list of brands less than 1% of the time. Gumshoe sells AI tracking tools, and the study isn't peer reviewed.

There's a useful side to it. In the same study, a few well known headphone brands still showed up in 55% to 77% of responses. Brands that are strongly tied to a topic come up again and again. That's why a single check tells you very little, and a pattern across many checks tells you more.

For local businesses, BrightLocal's 2026 study found that a business [reappeared in later ChatGPT runs about 50% of the time](https://www.brightlocal.com/research/local-ai-visibility-study/). Its data comes from US locations and BrightLocal sells local SEO software, so treat the exact figure as a rough guide for India.

## What we don't know

- **The ranking formula.** No source we found gives one. Anyone who claims to know the exact weights is guessing.
- **Where local business data comes from.** OpenAI says ChatGPT may share your location with ["trusted third-party providers"](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) for things like nearby business listings, and doesn't name them. We found no official statement on what the consumer Gemini app uses.
- **India-specific behaviour.** We found no India study on local recommendations.

## What this means for a small business

This is our reading of the evidence, not a guarantee.

1. **Let the crawlers in.** If a bot can't fetch your page, it can't be named from it.
2. **Make each page answer a question directly,** so a search for one sub-question can find it.
3. **Be mentioned elsewhere.** Reviews, directories and articles that name you give the assistant more than your own site does.
4. **Keep pages current.** Update key pages every quarter.
5. **Check many times, not once.** Ask the same prompts across several days and note how often you appear. Here is a [free method](/blog/know-if-ai-recommends-your-business).

Our [30-day GEO plan](/blog/learn-geo-30-days) turns this into weekly tasks.

## Where The GEO Blueprint fits

Start small. The GEO Blueprint is ₹499 plus GST and about 1.5 hours, taught mostly in Tamil with English terms mixed in. It walks through how a model produces an answer, the 6 pillars of GEO and a live audit, so you can apply the checks above to your own site. It has no student reviews yet, and it doesn't promise that any assistant will name you.

## Questions, answered

### Does ChatGPT use Google or Bing to find businesses?
OpenAI says ChatGPT search sometimes partners with other search providers and doesn't publish a full list. It names Microsoft and Shopify only in its privacy information. Any claim that ChatGPT "uses Bing" comes from third parties, not OpenAI.

### Can I pay to be recommended by ChatGPT?
We found no way to pay for a place in ChatGPT's organic answers. OpenAI's help page says placement is not guaranteed. Be careful with anyone who sells guaranteed mentions.

### Do all AI assistants pick the same businesses?
No. A BrightEdge analysis reported by [Search Engine Journal](https://www.searchenginejournal.com/comparison-of-ai-citation-patterns-offers-strategic-seo-insights/573327/) found the sources cited by different engines overlapped only 16% to 59% of the time, depending on the pair. Check each assistant separately.

### How long before a new page can be named?
We don't know. OpenAI says a robots.txt change can take [about 24 hours](https://developers.openai.com/api/docs/bots) to be picked up, but being crawled and being recommended are different things.

## Sources

Checked 3 November 2026.

- [OpenAI: crawler overview](https://developers.openai.com/api/docs/bots)
- [OpenAI help: searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)
- [Anthropic: web crawling and blocking](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: bots](https://docs.perplexity.ai/guides/bots)
- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Ahrefs: brand visibility correlations (AI Overviews)](https://ahrefs.com/blog/ai-overview-brand-correlation/)
- [Search Engine Journal: SE Ranking study on ChatGPT citations](https://www.searchenginejournal.com/new-data-top-factors-influencing-chatgpt-citations/561954/)
- [Search Engine Journal: SparkToro and Gumshoe study](https://www.searchenginejournal.com/ai-recommendations-change-with-nearly-every-query-sparktoro/566242)
- [BrightLocal: Local AI Visibility Study](https://www.brightlocal.com/research/local-ai-visibility-study/)
- [Search Engine Journal: BrightEdge citation patterns](https://www.searchenginejournal.com/comparison-of-ai-citation-patterns-offers-strategic-seo-insights/573327/)
