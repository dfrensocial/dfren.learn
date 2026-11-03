---
title: Is adding llms.txt enough for GEO and AEO? What it does and doesn't do
seoTitle: Is llms.txt enough for GEO and AEO? What it does and doesn't do
description: No. Google says llms.txt neither helps nor harms Google Search, and a study of 300,000 domains found no link to AI citations. What to do instead.
date: 2026-11-03
updated: 2026-11-03
author: Litmus Team
authorRole: Research and writing, Litmus by AiVirex
authorUrl: https://litmus.aivirex.in
tag: How AI picks answers
related: geo-vs-seo-vs-aeo, is-geo-rebranded-seo, learn-geo-30-days
---

# Is adding llms.txt enough for GEO and AEO? What it does and doesn't do

No. Adding an llms.txt file isn't a GEO or AEO strategy. Google's own guide says Google Search ignores these files, so they neither help nor harm your visibility there. Evidence for other AI tools is thin, and none of the big AI companies we checked has said it reads the file. It's harmless to add if you want one. Just don't count on it.

We read every source below on 3 November 2026. The evidence here is limited, and we say where.

## What is llms.txt?

llms.txt is a proposal for a plain Markdown file at the root of a website, written for AI tools. [The proposal's site](https://llmstxt.org/) says Jeremy Howard published it on 3 September 2024. The file holds a site name, a short summary and lists of links to your most useful pages. The idea is that an AI agent gets a tidy overview instead of parsing cluttered HTML.

It's a proposal, not an official standard. No search engine or AI company set it up, and it has no authority behind it.

## What does Google say about it?

Google says it ignores the file. Its [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says you don't need new machine readable files, AI text files, markup or Markdown to appear in Google Search, and that Google Search ignores them. [Search Engine Journal covered](https://www.searchenginejournal.com/googles-says-its-fine-to-use-llms-txt-for-ai-seo/579608/) the clarified wording on 17 June 2026: it's "completely fine" to create such files for other services, with no effect on Google visibility either way.

Google people had said this before:

- John Mueller wrote on Bluesky on 17 June 2025, per [Search Engine Roundtable](https://www.seroundtable.com/google-ai-llms-txt-39607.html): "FWIW no AI system currently uses llms.txt."
- Gary Illyes reportedly said at a Search Central Live event that Google doesn't support llms.txt and isn't planning to. That's [secondhand](https://www.seroundtable.com/openai-crawling-llms-txt-files-39811.html), from an attendee's LinkedIn post, not a transcript.
- In January 2026, Mueller said Google hosting some llms.txt files on its own sites [isn't an endorsement](https://www.seroundtable.com/google-does-not-endorse-llms-txt-40789.html).

## Does any study show it helps?

We found none. Two data points point the other way.

**A 300,000-domain study.** SE Ranking looked at about 300,000 domains. [Search Engine Journal reported](https://www.searchenginejournal.com/llms-txt-shows-no-clear-effect-on-ai-citations-based-on-300k-domains/561542/) on 20 November 2025 that 10.13% had an llms.txt file, and that the researchers found no measurable link with AI citations. Their words: it "doesn't seem to directly impact AI citation frequency. At least not yet." SE Ranking sells SEO tools, and the study is correlational. It shows no measurable effect, not proof of none.

**One site's server log.** The [dejan.ai log](https://dejan.ai/blog/crawler-census-robots-llms-okf/) covers 27 July to 15 August 2026. Googlebot, ClaudeBot and OpenAI's bots fetched robots.txt 1,150 times and llms.txt 4 times: 3 by Googlebot, 1 by ClaudeBot, none by OpenAI. It's one site over about 20 days, so it can't speak for the whole web.

For balance: an SEO named Ray Martinez posted log screenshots showing OpenAI requesting his llms.txt every 15 minutes on a few sites. [Search Engine Roundtable noted](https://www.seroundtable.com/openai-crawling-llms-txt-files-39811.html) that OpenAI hadn't confirmed it. On its [bots page](https://developers.openai.com/api/docs/bots), OpenAI mentions llms.txt only as a link to its own docs index, and says nothing there about using it for search.

## So should you add one?

It's your call. It costs an hour. It might help some tool in future, and Google says it's fine. But it won't fix a thin page, an unreadable site or a business that no one writes about. Treat it like a tidy filing cabinet in an empty office.

If you do add one, don't promise a client any result from it.

## What actually matters instead?

The public course page for The GEO Blueprint names 6 pillars. Here they are in plain words, with what each means for a small site.

| Pillar | What it means in practice |
|---|---|
| Technical optimization | Crawlers can reach and read your pages. Google says a page must be [indexed and eligible to show with a snippet](https://developers.google.com/search/docs/appearance/ai-features). OpenAI [recommends allowing OAI-SearchBot](https://developers.openai.com/api/docs/bots) in robots.txt |
| Answer-first content | Each section opens with the direct answer |
| Citation authority | Other credible sources mention and link to you, and you cite yours |
| AI comprehension | Names, services, prices and places are stated in plain text, not only in images |
| Content freshness | Pages show real dates and get updated |
| Content depth | You cover the follow-up questions a buyer would ask |

Structured data is a minor item. Google's guide says there's no special schema.org markup you need for its AI features, though it's still worth using for other search features.

For evidence on content changes, the one controlled study we know of is the GEO paper. It found that adding statistics, quotations and cited sources lifted visibility in its tests, and keyword stuffing didn't. We unpack it in [what "up to 40%" really means](/blog/geo-paper-up-to-40-percent). It's a lab result, not a promise. For the terms, see [GEO vs SEO vs AEO](/blog/geo-vs-seo-vs-aeo) and [is GEO just rebranded SEO](/blog/is-geo-rebranded-seo).

## How do you check your own site?

Do these five checks first:

1. Open yourdomain.com/robots.txt. Make sure you haven't blocked the bots you want, such as OAI-SearchBot.
2. Search Google for site:yourdomain.com and confirm your key pages are indexed.
3. Read your top page as a stranger would. Does the first line answer the question?
4. Look for dates, sources and a named author on posts.
5. Ask an AI assistant a question about your service and see who gets named. Our [free method for that](/blog/know-if-ai-recommends-your-business) uses a spreadsheet.

For a scored check, there's Litmus. It's made by AiVirex, the same team behind our course, so we have a stake. Per [its page](https://litmus.aivirex.in), you enter a URL and it scores the site across six dimensions: technical access, answer-first content, AI comprehension, citation authority, content freshness and blog visibility. It says its checks are rule-based, with no LLM calls, and it scans up to 200 pages.

## Where The GEO Blueprint fits

llms.txt is a small piece. The GEO Blueprint is the full guide to doing GEO on your own site or a client's: how AI picks the next word, SEO vs GEO, the 6 pillars, why manual audits are inconsistent, a live audit demo with Litmus, two ways to turn GEO into revenue, and client onboarding and proof.

It's a one-time ₹499 course, about 1.5 hours across 6 modules, mostly in Tamil with English terms mixed in. Start small, see if it's useful, and go deeper later if you want. See the [curriculum](/#curriculum). It has no student reviews yet, and it doesn't promise rankings or income.

## Questions, answered

### What is llms.txt?
It's a proposed Markdown file at your site's root that lists your key pages for AI tools. Jeremy Howard published the proposal on 3 September 2024. It isn't an official standard, and Google says Google Search ignores it.

### Does llms.txt help me get cited by ChatGPT?
We found no evidence that it does. OpenAI's bots page recommends allowing OAI-SearchBot in robots.txt and doesn't describe llms.txt as a ranking input. SE Ranking's 300,000-domain study found no measurable link with AI citations. The evidence is limited.

### Will llms.txt hurt my Google rankings?
No, per Google. Its guide says Google Search ignores these files, so creating them neither helps nor harms. Search Engine Journal reports Google calls it completely fine to maintain them for other services.

### Do I need Markdown copies of my pages?
Google's guide says you don't need Markdown to appear in Google Search. We found no source showing another AI tool prefers it. Spend that time making the HTML pages clear instead.

### What should I do first for AI visibility?
Make sure crawlers can reach your pages, then rewrite your top pages so each section opens with a direct answer and cites a source. Then record a baseline of mentions and traffic before you change more.

## Sources

Checked 3 November 2026.

- [llmstxt.org: the llms.txt proposal](https://llmstxt.org/)
- [Google Search Central: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Search Engine Journal: Google says it's fine to use llms.txt (17 June 2026)](https://www.searchenginejournal.com/googles-says-its-fine-to-use-llms-txt-for-ai-seo/579608/)
- [Search Engine Roundtable: Mueller on llms.txt (18 June 2025)](https://www.seroundtable.com/google-ai-llms-txt-39607.html)
- [Search Engine Roundtable: Google and OpenAI on llms.txt (24 July 2025)](https://www.seroundtable.com/openai-crawling-llms-txt-files-39811.html)
- [Search Engine Roundtable: Google hosting llms.txt is not an endorsement (20 January 2026)](https://www.seroundtable.com/google-does-not-endorse-llms-txt-40789.html)
- [Search Engine Journal: llms.txt and AI citations across 300,000 domains (20 November 2025)](https://www.searchenginejournal.com/llms-txt-shows-no-clear-effect-on-ai-citations-based-on-300k-domains/561542/)
- [dejan.ai: crawler census of robots.txt and llms.txt](https://dejan.ai/blog/crawler-census-robots-llms-okf/)
- [OpenAI: bots documentation](https://developers.openai.com/api/docs/bots)
- [Litmus by AiVirex](https://litmus.aivirex.in)
- [The GEO Blueprint curriculum](/#curriculum)
