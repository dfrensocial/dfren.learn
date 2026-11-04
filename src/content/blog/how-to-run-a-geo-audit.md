---
title: How to run a GEO audit, step by step (for your own site or a client's)
seoTitle: How to run a GEO audit step by step (2027 guide)
description: A step-by-step GEO audit: record a baseline, check crawler access, review pages, test AI answers and write a prioritised fix list. Tools and limits included.
date: 2026-11-04
updated: 2026-11-04
author: Litmus Team
authorRole: Research and writing, Litmus by AiVirex
authorUrl: https://litmus.aivirex.in
tag: Audits and measurement
related: geo-checklist-2027, free-geo-audit-tools-compared, how-much-geo-audit
---

# How to run a GEO audit, step by step (for your own site or a client's)

A GEO audit checks whether AI assistants can find, understand and trust your site, then lists what to fix first. Do it in six steps: record a baseline, check crawler access, review your key pages, check your off-site mentions, test what assistants say, and write a prioritised fix list. A first audit of a small site can take a day.

We make an audit tool, Litmus, and teach this in a course, so read our tool mentions with that in mind. The method below works with a spreadsheet.

## Step 1: Record a baseline (1 hour)

Before you change anything, save what's true today. Connect [Google Analytics](/blog/connect-google-analytics-4-website) and Search Console, and note traffic and top queries. Ask 10 customer questions in ChatGPT, Gemini, Perplexity and Claude, and log who is named, three runs each, with dates. Our [free method](/blog/know-if-ai-recommends-your-business) shows the sheet. Answers vary run to run, so counts matter more than any single result.

## Step 2: Check crawler access (30 minutes)

- Open robots.txt and check you haven't blocked OAI-SearchBot, Claude-SearchBot or PerplexityBot. Each company publishes what its bot does, for example [OpenAI](https://developers.openai.com/api/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) and [Perplexity](https://docs.perplexity.ai/guides/bots).
- Check that your host or firewall allows the bots' IP addresses. OpenAI's help page says this is needed for eligibility.
- Confirm key pages are indexed by Google, since that's the entry ticket for [AI Overviews](https://developers.google.com/search/docs/appearance/ai-features).

## Step 3: Review your key pages (2 to 3 hours)

For your top three to five pages, ask:

1. Does the first line answer the main question?
2. Are there facts with numbers, and are sources linked?
3. Is there a short FAQ with real questions?
4. Are your name, address and phone number consistent?
5. Do pages show a date, and were they updated in the last three months?
6. Is structured data present, accurate and matching the page? See [schema markup for AI answers](/blog/schema-markup-for-ai-answers).

These map to six areas: technical access, answer-first content, AI comprehension, citation authority, freshness and content depth. Litmus's own page names the same six.

## Step 4: Check your off-site mentions (1 to 2 hours)

Search for your business name, and for your category plus city. Note which directories, review sites and articles mention you, and which mention your competitors but not you. In one [SE Ranking study](https://www.searchenginejournal.com/new-data-top-factors-influencing-chatgpt-citations/561954/), sites listed on several review platforms averaged more ChatGPT citations. It's a correlation, so treat it as a lead to check.

## Step 5: Test what assistants say (1 hour)

Repeat the prompts from Step 1 with the wording changed, and add your business name. Look for wrong facts, missing details and competitors that appear where you don't. Note what their pages state that yours don't, such as prices or areas served.

## Step 6: Write a prioritised fix list (1 hour)

Sort fixes into three groups:

| Priority | Examples |
|---|---|
| Now | Unblock crawlers, fix indexing, add the answer to the top of key pages |
| Next | Add facts and sources, FAQs, fix inconsistent details, complete listings |
| Later | Structured data, refreshing older pages, new content for gaps |

Give each fix an owner and a date. Re-run the baseline in a month and compare.

## Why not just ask ChatGPT to score the site?

A chatbot has no fixed rubric, so the same site can get different scores on different runs. We explain this in [why ChatGPT gives a different website score every time](/blog/why-chatgpt-gives-different-website-score). Use a checklist or a rule-based tool so that a score can be repeated.

## Where The GEO Blueprint fits

The GEO Blueprint walks through a live audit of a real site with Litmus, then shows how to turn the findings into a fix list and a client proposal. It's ₹499 plus GST, about 1.5 hours, mostly in Tamil with English terms mixed in. Start small and see if it's useful. Get the course to learn the full guide for your own site or a client's. It has no student reviews yet and promises no results.

## Questions, answered

### How long does a GEO audit take?
For a small site, a day or two by our estimate: about 8 to 10 hours across the six steps. Larger sites take longer.

### What does a GEO audit include?
Crawler access, page content, off-site mentions, a sample of assistant answers and a prioritised fix list. A good audit also records a baseline so results can be compared later.

### Do I need a paid tool for a GEO audit?
No. A spreadsheet and the checks above work. Tools save time on larger sites. We compare options in [free GEO audit tools](/blog/free-geo-audit-tools-compared).

### How much does a GEO audit cost?
Published prices vary a lot. See [how much to charge for a GEO audit](/blog/how-much-geo-audit).

## Sources

Checked 4 November 2026.

- [OpenAI: crawler overview](https://developers.openai.com/api/docs/bots)
- [Anthropic: web crawling and blocking](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: bots](https://docs.perplexity.ai/guides/bots)
- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Search Engine Journal: SE Ranking study on ChatGPT citations](https://www.searchenginejournal.com/new-data-top-factors-influencing-chatgpt-citations/561954/)
- [Litmus by AiVirex](https://litmus.aivirex.in)
