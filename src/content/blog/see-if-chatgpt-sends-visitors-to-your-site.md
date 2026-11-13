---
title: How to see if ChatGPT, Perplexity and Gemini send visitors to your website (GA4)
seoTitle: See if ChatGPT, Perplexity and Gemini send visitors (GA4 guide)
description: In GA4, open Traffic acquisition and look for the AI Assistant channel or sources naming ChatGPT. Steps, custom channel group, and limits like missing referrers.
date: 2026-11-03
updated: 2026-11-13
author: AiVirex Team
authorRole: Research and writing, AiVirex Innovations
authorUrl: https://aivirex.in
tag: Technical guides
related: track-who-visits-your-website, know-if-ai-recommends-your-business
---

# How to see if ChatGPT, Perplexity and Gemini send visitors to your website (GA4)

Open GA4, go to Reports, then Acquisition, then Traffic acquisition, and look for the "AI Assistant" channel. Google's current channel list includes it, for visits from chatbots such as ChatGPT, Gemini, DeepSeek, Copilot and Grok. Not every AI visit gets labelled, so also scan your sources for names like chatgpt and perplexity. Expect small numbers.

We read the Google pages below on 3 November 2026. GA4 changes often, so labels may differ on your screen.

## Where do you look in GA4?

Sign in, choose Reports from the left menu, then Acquisition, then Traffic acquisition. [Google's report page](https://support.google.com/analytics/answer/12923437) says the report uses session dimensions, and "Session default channel grouping" is its default. If the report is missing, an Editor or Administrator can add it back to the navigation.

Then check two things:

1. **The channel list.** [Google's channel definitions](https://support.google.com/analytics/answer/9756891) list "AI Assistant" as a default channel: "visits from AI chatbots such as ChatGPT, Gemini, Deepseek, Copilot, or Grok." The same page says Google's AI Overviews and AI Mode are excluded and counted under Organic Search.
2. **The source names.** Look at "Session source / medium", which the same report offers as a dimension. Scan for values containing chatgpt, perplexity, gemini, copilot or claude.

If you don't see an AI Assistant row, either no matching visits arrived in your date range, or your property labels them differently. Try a longer range before you worry.

## Which source names are verified?

Honestly, only some. Here's what we could and couldn't confirm.

| Name | Status |
|---|---|
| ChatGPT, Gemini, DeepSeek, Copilot, Grok | Named in Google's default AI Assistant channel definition |
| ChatGPT link tags | One published report says ChatGPT adds a utm_source value naming chatgpt to links. Not confirmed by OpenAI |
| Perplexity, Claude | Not named in the default channel text we read. Check your own data |
| Exact hostnames (for example chatgpt.com, perplexity.ai) | We found no official list. Treat any list you see as a starting point |

On the ChatGPT tags: in June 2025, [Search Engine Roundtable reported](https://www.seroundtable.com/openai-chatgpt-analytics-update-39590.html) a post from Glenn Gabe saying ChatGPT had added UTM parameters to links in its "More" sources, not just its citations. The article contained no statement from OpenAI. So tagging may change without notice.

## How do you group AI visits yourself?

You can build your own channel. [Google's custom channel groups page](https://support.google.com/analytics/answer/13051316) says you need Editor access. Then:

1. Go to Admin, then "Data display", then "Channel groups".
2. Click "Create new channel group". It copies the default group.
3. Name it, then click "Add new channel", and name that channel (Google's example calls it "AI assistants").
4. Add a condition on source that "matches regex", using a list of assistant names. Google's page gives an example regex covering terms such as openai, chatgpt, gemini, copilot and perplexity. Copy it from the page.
5. Use "Reorder" to put the channel above "Referrals", then "Apply" and "Save group".

Order matters because [Google says](https://support.google.com/analytics/answer/13051316) traffic goes to the first channel it matches. You'll need to update the regex as assistants and their addresses change. The page notes that custom groups can be applied to reports retroactively, and that standard properties get 2 custom groups.

If you'd rather not build a channel, open Explore, pick the "Free form" template, and put a source dimension in Rows and a metric such as Sessions in Values. [Google's exploration help](https://support.google.com/analytics/answer/9327972) explains Rows and Values but doesn't list specific fields, so pick them from the Variables list. Then search the table for your names.

## What AI visits will you not see?

Three gaps matter.

**AI Overviews and AI Mode.** Visits from Google's AI features are counted in Google search, not as AI Assistant. [Google's AI features page](https://developers.google.com/search/docs/appearance/ai-features) says links in them are included in overall search traffic in Search Console. So they sit in Organic Search. You can't tell them apart from ordinary search clicks here.

**Visits with no referrer.** When someone clicks a link, the browser can send the page it came from, and it can also leave that out. [MDN's Referrer-Policy page](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy) says the "no-referrer" policy omits it entirely, and links can opt out one by one with rel="noreferrer". GA4 then has nothing to read. [Google defines Direct](https://support.google.com/analytics/answer/9756891) as visits through "a saved link or by entering your URL", and blog posts say some AI visits land there. We found no neutral study that measures how many, so we won't quote a number.

**Mentions without a click.** If ChatGPT names your shop and the reader opens Google Maps or calls you, GA4 sees nothing. To check mentions themselves, see [how to know if AI is recommending your business](/blog/know-if-ai-recommends-your-business).

## What do small numbers mean?

Mostly, not much. In an illustrative example, a site gets 2,000 sessions a month and 14 come from AI Assistant. That's 0.7%. It tells you the channel exists for you, nothing more. Check it monthly, note the date, and keep the same date range each time.

Treat it as one signal, not the scoreboard. The audience is real, though. [TechCrunch reported](https://www.techcrunch.com/2026/02/15/india-has-100m-weekly-active-chatgpt-users-sam-altman-says/) on 15 February 2026 that OpenAI's CEO said India has 100 million weekly active ChatGPT users. And a [Pew Research study](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) of 900 US adults in March 2025 found people clicked a regular result in 8% of visits with an AI summary, against 15% without one. Fewer clicks means thin referral data, even when an assistant mentions you.

Before you start any GEO work, record this number, so you have something to compare against. Our [tracking overview](/blog/track-who-visits-your-website) has a weekly checklist.

## Where The GEO Blueprint fits

Knowing where AI traffic shows up in GA4 is half of proving your work. The GEO Blueprint is a one-time ₹599 including GST course, about 1.5 hours and 6 modules, mostly in Tamil with English terms mixed in. Its last module covers setting up tracking before you start a project, setting timeline expectations and turning before and after into a case study.

If you want the full guide to doing GEO on your own site or a client's, start small and see if it's useful, then go deeper later if you want. Details are in the [curriculum](/#curriculum). It has no student reviews yet.

## Questions, answered

### Does ChatGPT show up as a source in GA4?
It can. Google's channel list puts ChatGPT visits under "AI Assistant" when GA4 recognises them. Some may carry a utm_source tag instead. Check Traffic acquisition and the source names. Visits that come with no referrer won't be labelled.

### Why is my AI traffic so small?
Few people click through from AI answers, and some clicks arrive without source data. Pew found clicks fell to 8% from 15% when a Google AI summary showed. For a small site, a count in single digits a month is normal to see. It says little by itself.

### Does GA4 show Google AI Overviews traffic separately?
No. Google's channel page says AI Overviews and AI Mode are counted under Organic Search. Search Console also includes them in overall search traffic. We found no official way to split them out in these two reports.

### Do I need a custom channel group?
No. Start with the default AI Assistant channel. Build your own only if you want to include assistants it misses, or group them your way. Remember the limit: 2 custom groups for standard properties.

### Is a missing AI visit a sign AI doesn't mention me?
No. Mentions don't need a click. Someone might see your name in an answer and search for you later, which GA4 could file under search or Direct. Test mentions directly by asking the assistants, then compare with traffic.

## Sources

Checked 3 November 2026.

- [Google Analytics Help: Traffic acquisition report](https://support.google.com/analytics/answer/12923437)
- [Google Analytics Help: Default channel group](https://support.google.com/analytics/answer/9756891)
- [Google Analytics Help: Custom channel groups](https://support.google.com/analytics/answer/13051316)
- [Google Analytics Help: Free-form exploration](https://support.google.com/analytics/answer/9327972)
- [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Search Engine Roundtable: ChatGPT adds UTM parameters (16 June 2025)](https://www.seroundtable.com/openai-chatgpt-analytics-update-39590.html)
- [MDN: Referrer-Policy header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)
- [TechCrunch: India has 100M weekly active ChatGPT users (15 February 2026)](https://www.techcrunch.com/2026/02/15/india-has-100m-weekly-active-chatgpt-users-sam-altman-says/)
- [Pew Research Center: Google users are less likely to click on links when an AI summary appears (22 July 2025)](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)
- [The GEO Blueprint curriculum](/#curriculum)
