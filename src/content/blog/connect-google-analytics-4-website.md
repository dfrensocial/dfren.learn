---
title: How to connect Google Analytics 4 to your website (step by step)
seoTitle: How to connect Google Analytics 4 to your website (2027 guide)
description: Create a GA4 property and web data stream, copy the Measurement ID, install the Google tag, then check Realtime. Steps from Google's own help pages.
date: 2026-11-03
updated: 2026-11-03
author: AiVirex Team
authorRole: Research and writing, AiVirex Innovations
authorUrl: https://aivirex.in
tag: Technical guides
related: track-who-visits-your-website, connect-microsoft-clarity-google-analytics
---

# How to connect Google Analytics 4 to your website (step by step)

You connect Google Analytics 4 (GA4) in four moves: create an account and property, add a web data stream, copy the Measurement ID that starts with "G-", and install the Google tag on your site. Then open the Realtime report and visit your own site to confirm it works.

Button names change now and then, so treat the labels below as a guide. Everything here comes from Google's own help pages, which we read on 3 November 2026.

## Step 1: Create the account and property

Go to analytics.google.com. Per [Google's setup guide](https://support.google.com/analytics/answer/9304153), a first-time user clicks "Start Measuring". Otherwise open Admin, click "Create", then choose "Account".

Name the account and set your data-sharing options. Next, name the property and pick a reporting time zone and currency. For an Indian business, that's usually India's time zone and INR. Then choose your industry and business size, say how you plan to use Analytics, and click "Create". New accounts also have to accept the Terms of Service and the Data Processing Amendment.

## Step 2: Add a web data stream

A data stream is the feed of visits from one website. In Admin, under "Data collection and modification", click "Data streams". Click "Add stream" and choose "Web". Enter your website's URL and a stream name, decide whether to keep enhanced measurement on, and click "Create stream". [Google recommends turning it on](https://support.google.com/analytics/answer/9304153).

## Step 3: Copy your Measurement ID

Back in Admin, open "Data streams" and click your website's stream. Under "Stream Details" you'll see the Measurement ID. [Google's guide](https://support.google.com/analytics/answer/9304153) says it starts with "G-" (or "AW-"). Copy it.

## Step 4: Install the Google tag

How you install depends on how your site is built. Google's guide gives these routes:

| Your site | What to do |
|---|---|
| Shopify, Wix, Squarespace, or a WordPress plugin with a Google Analytics field | Paste the Measurement ID into that field |
| Another website builder | In the stream, under "Google tag", click "View tag instructions", choose "Install manually", and paste the full snippet into the builder's custom HTML option |
| A plain HTML site | Paste the same snippet right after the opening head tag on every page |
| Google Tag Manager | Follow Tag Manager's own help to add the Google Analytics configuration tag |

If a developer maintains your site, send them the snippet and the instruction. [Google's tag page](https://support.google.com/analytics/answer/9744165) says to add only one Google tag per page. Two copies can muddy your numbers.

## How do you check that GA4 is working?

Open your site in a new tab, click through two or three pages, then go to Realtime in GA4. [Google says](https://support.google.com/analytics/answer/9744165) data can take up to 30 minutes to appear in a new property, and that the Realtime report is where you look first. Full reports can lag much more: [Google's page on confirming data collection](https://support.google.com/analytics/answer/9333790) says many take 24 to 48 hours to process.

For event-level checking, use DebugView. Per [Google's DebugView page](https://support.google.com/analytics/answer/7201382), it sits in Admin under "Data display", and you switch on debug mode with Google Tag Assistant. One catch: events won't show if a consent setup is active and the visitor hasn't agreed to analytics cookies.

## Which settings should you change first?

Two settings are worth a few minutes on day one.

**Data retention.** Admin, then "Data Settings", then "Data Retention". For a standard property, [Google lists](https://support.google.com/analytics/answer/7667196) 2 months or 14 months. It applies to explorations and funnel reports, not the standard reports. Check which one is selected, and pick 14 months if you want to compare this year with last quarter. You need the Editor role.

**Internal traffic.** Your own visits inflate small-site numbers. [Google's internal traffic guide](https://support.google.com/analytics/answer/10104470) has two steps: define a rule by IP address in your web stream's tag settings, then create an "Internal Traffic" filter under Admin, "Data filters". Start the filter in Testing, not Active. Active filters change data permanently, and they can take 24 to 36 hours to apply.

## Common mistakes

- Installing the tag twice, once by plugin and once by hand.
- Pasting the ID of the wrong stream, such as a staging site's.
- Never opening Realtime, then finding a blank report three weeks later.
- Sending personal data into GA4. [Google's policy](https://support.google.com/analytics/answer/6366371) says no data may be passed that Google could recognise as personally identifiable. Email addresses are on its list. Keep them out of page URLs and event names.
- Starting GA4 only after a project begins. Without a before picture, you can't show a change.

## A note on consent and the law

Analytics cookies and tracking tools can need a visitor's consent under India's Digital Personal Data Protection Act, 2023, where they process personal data. [Section 6(1) of the Act](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf) says consent must be free, specific, informed, unconditional and unambiguous, with a clear affirmative action. Section 6(4) lets people withdraw consent at any time, with the ease of withdrawing comparable to the ease of giving it. This isn't legal advice. Ask a lawyer how it applies to your site.

## Where The GEO Blueprint fits

Setting up tracking before you touch a client's site is one step in proving that your work moved anything. The GEO Blueprint is a one-time ₹499 plus GST course, about 1.5 hours across 6 modules. Its last module covers client onboarding, including setting up tracking before you start and turning before and after results into a case study. It's mostly taught in Tamil, with English terms mixed in.

If you want the full guide to doing GEO on your own site or a client's, start small and see if it's useful. Go deeper later if you want. See the [curriculum](/#curriculum). It has no student reviews yet, and it doesn't promise rankings or income.

## Questions, answered

### Can I link GA4 to Google Search Console?
Yes. In GA4, open Admin, then "Search Console Links" under "Product links", and click "Link". Per [Google's linking page](https://support.google.com/analytics/answer/10737381), you need the Editor role on the Analytics property and verified owner status in Search Console. The reports are unpublished by default and sit under Library.

### What is a Measurement ID?
It's the code that tells GA4 which data stream a visit belongs to. Google says it starts with "G-". You find it under Admin, "Data streams", then your stream's "Stream Details". You paste it into a plugin field or inside the Google tag snippet.

### How long before GA4 shows data?
The Realtime report can show your own visit within minutes. Google says a new property can take up to 30 minutes. Other reports and explorations can take 24 to 48 hours to process. If nothing appears after a day, recheck the tag and the ID.

### Can I install GA4 without a developer?
Often, yes. If your platform has a Google Analytics field, you paste the ID there. Otherwise you paste the tag into a custom HTML option. If you can't edit the head section of your pages, ask whoever manages the site.

### Does GA4 tell me who visited?
No. It reports groups: where visitors came from, which pages they viewed, what device they used. Google's policy actually forbids sending personal identifiers into it. You can't see a named person, and you shouldn't try.

## Sources

Checked 3 November 2026.

- [Google Analytics Help: Set up Analytics for a website](https://support.google.com/analytics/answer/9304153)
- [Google Analytics Help: Set up the Google tag and confirm data](https://support.google.com/analytics/answer/9744165)
- [Google Analytics Help: Check that data is arriving](https://support.google.com/analytics/answer/9333790)
- [Google Analytics Help: DebugView](https://support.google.com/analytics/answer/7201382)
- [Google Analytics Help: Data retention](https://support.google.com/analytics/answer/7667196)
- [Google Analytics Help: Internal traffic filters](https://support.google.com/analytics/answer/10104470)
- [Google Analytics Help: Connect Search Console to Google Analytics](https://support.google.com/analytics/answer/10737381)
- [Google Analytics Help: Avoid sending PII](https://support.google.com/analytics/answer/6366371)
- [The Digital Personal Data Protection Act, 2023 (MeitY, PDF)](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf)
- [The GEO Blueprint curriculum](/#curriculum)
