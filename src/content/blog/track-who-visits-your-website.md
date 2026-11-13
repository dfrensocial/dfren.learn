---
title: How to track who visits your website: GA4, Search Console and Clarity explained
seoTitle: How to track website visitors: GA4, Search Console and Clarity
description: GA4 shows where visitors come from, Search Console shows the searches, Clarity shows what they did. A weekly checklist and what none of them can tell you.
date: 2026-11-03
updated: 2026-11-13
author: AiVirex Team
authorRole: Research and writing, AiVirex Innovations
authorUrl: https://aivirex.in
tag: Technical guides
related: connect-google-analytics-4-website, see-if-chatgpt-sends-visitors-to-your-site, know-if-ai-recommends-your-business
---

# How to track who visits your website: GA4, Search Console and Clarity explained

Three free Google and Microsoft tools cover most of what a small business needs. Google Analytics 4 (GA4) shows where visitors came from and which pages they viewed. Google Search Console shows the searches that brought them from Google. Microsoft Clarity shows what they did on the page. None of them can tell you a visitor's name, and none should.

Set all three up before you change anything on your site. That gives you a baseline to compare against later.

## What does each tool answer?

Each tool answers a different question, so they don't replace each other.

| Tool | Question it answers | What you see |
|---|---|---|
| Google Analytics 4 | Where did visitors come from, and what did they view? | Sessions by source, medium and channel, plus pages |
| Google Search Console | Which Google searches showed and sent people to my pages? | Clicks, impressions, click-through rate, average position |
| Microsoft Clarity | What did people do on the page? | Session replays and heatmaps |

All three are described in the official help pages we cite below. We read them on 3 November 2026.

## Where do visitors come from? Use GA4

In GA4, open Reports, then Acquisition, then Traffic acquisition. [Google's help page](https://support.google.com/analytics/answer/12923437) says the report is built on "Session" dimensions, such as session source, session medium and session default channel group. The default channels include Direct, Organic Search, Organic Social, Email and Referral.

Google also lists an "AI Assistant" channel for visits from chatbots such as ChatGPT, Gemini, Copilot and Grok, and says [Google's AI Overviews and AI Mode count under Organic Search](https://support.google.com/analytics/answer/9756891) instead. We go through this in [how to see if ChatGPT sends visitors to your site](/blog/see-if-chatgpt-sends-visitors-to-your-site).

If you haven't installed GA4 yet, follow [how to connect Google Analytics 4 to your website](/blog/connect-google-analytics-4-website).

## Which searches bring people? Use Search Console

Search Console only covers Google Search, but it's the one place that shows the words people typed. Its Performance report gives you [Clicks, Impressions, CTR and Average position](https://support.google.com/webmasters/answer/7576553), and lets you split them by Queries, Pages, Countries and Devices.

To add your site, open the property selector, choose "+ Add property", then pick a Domain or URL-prefix property. [Google explains](https://support.google.com/webmasters/answer/34592) that a Domain property covers all subdomains and both http and https, and needs DNS verification. Data usually appears within a few days.

Two limits matter. First, the report doesn't show everything: [Google says](https://support.google.com/webmasters/answer/96568) it stores top data rows, not all of them, to protect privacy. Second, AI features count here too. Google's [AI features page](https://developers.google.com/search/docs/appearance/ai-features) says links shown in them are "included in the overall search traffic in Search Console" and reported in the Performance report. You can't split AI Overview clicks out from that page alone.

You can also link Search Console to GA4 so queries and landing pages sit side by side. [Google's steps](https://support.google.com/analytics/answer/10737381) need the Editor role in GA4 and verified owner status in Search Console. Data arrives in GA4 about 48 hours after Search Console has it.

## What did people do on the page? Use Clarity

Clarity rebuilds each visit from the page's HTML and the visitor's clicks and scrolls, per its [recordings page](https://learn.microsoft.com/en-us/clarity/session-recordings/recordings-overview). Its [heatmaps](https://learn.microsoft.com/en-us/clarity/heatmaps/heatmaps-overview) show where people click and how far they scroll. Setup is in [our Clarity guide](/blog/connect-microsoft-clarity-google-analytics).

Use it after you spot a problem in GA4. If a page loses visitors, watch ten replays of it. You'll see things no table shows, like a button nobody notices.

## A 15-minute weekly checklist

This routine is our suggestion, not a Google or Microsoft standard. Do it once a week, same day, same date range, and write the numbers in a sheet.

1. **GA4:** note total sessions and sessions by default channel group.
2. **GA4:** note your top 5 pages by views.
3. **Search Console:** note clicks, impressions and the top 5 queries.
4. **Clarity:** watch 3 recordings of your most important page.
5. **Write one line:** what changed since last week, and one guess why.

Keep the guess honest. A week of data on a small site is noisy. A jump from 12 to 18 visits isn't a trend.

## What can't you know?

You can't see who a visitor is. These tools report groups and patterns. [Google's policy](https://support.google.com/analytics/answer/6366371) says no data may be passed to Google Analytics that Google could recognise as personally identifiable, with email addresses as an example. Search Console hides rare queries to protect privacy. Clarity masks sensitive content by default, and [masks input boxes](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking) in every mode.

You also can't say a visit caused a sale unless you set up goals, and some visits arrive with no source at all, because [browsers can leave the referrer out](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy). Take small numbers as hints.

## Why take a baseline before any GEO work?

If you start fixing pages first and measure later, you'll never know what moved. So record four weeks of the checklist numbers first. Then change one thing at a time and note the date.

This also keeps you honest with clients. "Organic Search sessions went from 140 to 190 over six weeks" is a statement you can defend. "Traffic feels better" isn't.

## A note on consent and the law

Tracking tools set cookies and process data about visitors. Under India's Digital Personal Data Protection Act, 2023, [Section 5](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf) asks that a request for consent come with or after a notice saying what data is processed and why, and Section 6(1) asks for consent that is free, specific, informed, unconditional and unambiguous. This isn't legal advice. Ask a lawyer how it applies to your site.

## Where The GEO Blueprint fits

Proving that work moved something starts with a baseline. The GEO Blueprint's last module covers client onboarding and proof: setting up tracking before you start, setting timeline expectations, and turning before and after into a case study.

It's a one-time ₹599 including GST course, about 1.5 hours across 6 modules. If you want the full guide to doing GEO on your own site or a client's, start small and see if it's useful, then go deeper later if you want. It's mostly taught in Tamil with English terms mixed in. See the [curriculum](/#curriculum). It has only a few early student messages so far.

## Questions, answered

### Can I see exactly who visited my website?
No. GA4, Search Console and Clarity report groups and behaviour, not names. Google's policy actually bars sending identifiable data like email addresses into Analytics. If you need to know who someone is, ask them through a form or a call.

### Which tool should I set up first?
Start with Search Console and GA4. Search Console takes a few days to start filling, so the sooner it's verified, the sooner your history begins. Add Clarity once you have enough visits to watch. Install them in that order so you collect history early.

### Does Search Console show AI Overview clicks?
It includes them in overall search traffic, per Google's AI features page. The page we read doesn't describe a separate split. So you can see total Google Search clicks, but not cleanly isolate AI ones.

### How often should I check my analytics?
Weekly is plenty for a small site. Daily checking mostly shows noise. Look at the same date range each time and compare against your baseline, not yesterday.

### Do I need visitor consent to use these tools?
Probably, where they process personal data. The DPDP Act asks for free, specific, informed, unconditional and unambiguous consent. This isn't legal advice, so check your own setup with a lawyer.

## Sources

Checked 3 November 2026.

- [Google Analytics Help: Traffic acquisition report](https://support.google.com/analytics/answer/12923437)
- [Google Analytics Help: Default channel group](https://support.google.com/analytics/answer/9756891)
- [Google Analytics Help: Connect Search Console to Google Analytics](https://support.google.com/analytics/answer/10737381)
- [Google Analytics Help: Avoid sending PII](https://support.google.com/analytics/answer/6366371)
- [Search Console Help: Add a website property](https://support.google.com/webmasters/answer/34592)
- [Search Console Help: Performance report (Search results)](https://support.google.com/webmasters/answer/7576553)
- [Search Console Help: About Search Console data](https://support.google.com/webmasters/answer/96568)
- [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Microsoft Learn: Recordings overview](https://learn.microsoft.com/en-us/clarity/session-recordings/recordings-overview)
- [Microsoft Learn: Heatmaps overview](https://learn.microsoft.com/en-us/clarity/heatmaps/heatmaps-overview)
- [Microsoft Learn: Masking content](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking)
- [MDN: Referrer-Policy header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)
- [The Digital Personal Data Protection Act, 2023 (MeitY, PDF)](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf)
- [The GEO Blueprint curriculum](/#curriculum)
