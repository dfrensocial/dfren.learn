---
title: How to connect Microsoft Clarity to Google Analytics (and what each one shows)
seoTitle: Connect Microsoft Clarity to Google Analytics: setup and what each shows
description: Set up a Clarity project, install its code, then link it to Google Analytics from Settings, Setup. What recordings, heatmaps and GA each show, plus masking.
date: 2026-11-03
updated: 2026-11-03
author: AiVirex Team
authorRole: Research and writing, AiVirex Innovations
authorUrl: https://aivirex.in
tag: Tracking
related: connect-google-analytics-4-website, track-who-visits-your-website
---

# How to connect Microsoft Clarity to Google Analytics (and what each one shows)

Microsoft Clarity shows how visitors behave on your pages, through session replays and heatmaps. Google Analytics counts visits and tells you where they came from. To connect them, install Clarity first, then open Settings, then Setup, and click "Get Started" under Google Analytics integration. Sign in to Google, pick the web property, and save.

Menu names move around, so expect small differences. We read Microsoft's documentation on 3 November 2026 for every step below.

## What does each tool show?

Clarity answers "what did people do on this page?" Google Analytics answers "how many came, and from where?" You want both, since a number alone doesn't explain a drop and a replay alone doesn't tell you how common a problem is.

| Question | Google Analytics | Microsoft Clarity |
|---|---|---|
| How many visits did we get? | Yes | Sessions, yes |
| Which source or channel sent them? | Yes | Through the GA integration |
| Where did they click and scroll? | No | Heatmaps |
| What did one visit look like? | No | Session recordings |
| Is there a rage click or dead click? | No | Yes, in click maps |

## Step 1: Create a Clarity project

Per [Microsoft's getting started page](https://learn.microsoft.com/en-us/clarity/setup-and-installation/getting-started), go to clarity.microsoft.com and select "Sign up". Microsoft says onboarding is free. After sign-in you land on the Projects page. Select "New project", enter a name and your website address, and select "Add new project".

One rule from that page: Clarity shouldn't be used on websites or apps aimed at people under 18.

## Step 2: Install the Clarity code

Go to Settings, then Setup. [Microsoft's setup page](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup) lists three routes, plus a fourth for sharing.

- **Third-party platform.** Shopify, Squarespace, Wix, WordPress and more. Select "View all platforms" and follow the steps for yours.
- **Manually.** Select "Get tracking code", copy it, and paste it into the head section of your site. You need access to that section.
- **NPM.** For JavaScript projects.
- **Share code.** Enter a teammate's email and Clarity mails them the code and instructions.

To check it worked, open your project. The page says you can see real-time data and live users right after you add the code. You can also open your browser's Network tab and look for POST requests to clarity.ms/collect while you browse your site.

## Step 3: Connect Clarity to Google Analytics

This part is optional, and [Microsoft's integration page](https://learn.microsoft.com/en-us/clarity/ga-integration/ga-integration) is the guide. You must finish setup first.

1. Pick your project and open Settings, then Setup.
2. Under "Google Analytics integration", select "Get Started".
3. Sign in to Google when you're redirected. Choose an account.
4. Select the web property Clarity should pull data from, and select "Save".

You can link only one web property to each Clarity project. To pause the link, toggle "Active" off in the same place. If you click "Disconnect", Microsoft warns you'll need to repeat the installation to use the link again. The page doesn't say whether the property must be GA4, so check what the dialog lists for your account.

## What does the connection give you?

Per the [GA dashboard page](https://learn.microsoft.com/en-us/clarity/ga-integration/ga-dashboard), you get a "Google Analytics" view under Dashboards in Clarity. It holds an audience overview, an acquisition report (traffic channel and source or medium), popular pages, sessions by country or region, and sessions by device.

The useful part: from those cards you can open the matching heatmaps or recordings for the same time frame. So if GA shows a source sending many visits, you can go and watch what those visitors did. The dashboard doesn't support filters or segments beyond the time frame on each card.

## What do recordings and heatmaps show?

Recordings aren't video. [Clarity's recordings page](https://learn.microsoft.com/en-us/clarity/session-recordings/recordings-overview) says sessions are rebuilt step by step from the page's HTML and the visitor's actions. A session ends after 30 minutes of inactivity. Recordings are kept for 30 days, and favourites for up to 9 months.

[Heatmaps](https://learn.microsoft.com/en-us/clarity/heatmaps/heatmaps-overview) come in click, scroll, area, conversion and attention types. Click maps include dead clicks and rage clicks. Microsoft says there's no minimum traffic needed to generate one. That said, a heatmap built from 12 visits tells you very little, so read small numbers carefully.

## How do you mask sensitive data?

Clarity masks sensitive content by default. In Settings, then Masking, [Microsoft lists](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking) three modes: Strict masks everything, Balanced masks sensitive content such as numbers and email addresses, and Relaxed masks no content. Balanced is the default. Input boxes and drop-downs stay masked in every mode.

You can also add the attribute data-clarity-mask="True" to any element to mask it and its children. Changes affect new recordings only and can take up to an hour. Only project admins can change masking.

## A note on consent and the law

Session replay records behaviour, so treat it like any tracking tool. In Clarity's cookie settings, [Microsoft explains](https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-mode) that you can turn cookies off until a visitor agrees, then tell Clarity about the visitor's choice through its Consent API. Microsoft enforces this for visits from the EEA, UK and Switzerland. India isn't on that list, but India's [Digital Personal Data Protection Act, 2023](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf) asks for consent that is free, specific, informed, unconditional and unambiguous (Section 6(1)). This isn't legal advice. Ask a lawyer how it applies to your site.

## Where The GEO Blueprint fits

Clarity and GA are the kind of tools you'd set up before you start work on a site, so you can show what changed afterwards. The GEO Blueprint covers that habit in its last module: setting up tracking before you start, setting timeline expectations, and turning before and after into a case study.

It's a one-time ₹499 course of about 1.5 hours and 6 modules, taught mostly in Tamil with English terms mixed in. If you want the full guide to doing GEO on your own site or a client's, start small and see if it's useful. Go deeper later. The [curriculum](/#curriculum) is on the home page. It has no student reviews yet.

## Questions, answered

### Is Microsoft Clarity free?
Microsoft's getting started page says onboarding is free, and says you can add an unlimited number of projects for each domain or website. It doesn't discuss paid plans on that page. Check clarity.microsoft.com for current terms before you rely on it.

### Do I need Google Analytics to use Clarity?
No. The Google Analytics link is optional. Microsoft's setup page lists it under "Setup Integrations", and you can use recordings and heatmaps without it. The link adds GA's acquisition and page data inside Clarity.

### Does Clarity record what people type?
Input boxes are masked in every mode, and you can't change that. Balanced mode also masks numbers and email addresses. Still, test your own pages: watch a recording of your own visit and look for anything personal on screen.

### How long does Clarity keep recordings?
Microsoft says 30 days, with favourited recordings kept up to 9 months. After 30 days it keeps 1% of recordings or 10 per day, whichever is higher, for up to 9 months. Save the important ones as favourites.

### Can Clarity see everything on my page?
Not quite. Microsoft says it can't capture what's inside Canvas elements or third-party iframes. A payment widget or an embedded form from another provider may show as blank in a replay.

## Sources

Checked 3 November 2026.

- [Microsoft Learn: Clarity getting started](https://learn.microsoft.com/en-us/clarity/setup-and-installation/getting-started)
- [Microsoft Learn: How to set up Clarity manually](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup)
- [Microsoft Learn: Getting started with GA integration](https://learn.microsoft.com/en-us/clarity/ga-integration/ga-integration)
- [Microsoft Learn: Google Analytics dashboard](https://learn.microsoft.com/en-us/clarity/ga-integration/ga-dashboard)
- [Microsoft Learn: Recordings overview](https://learn.microsoft.com/en-us/clarity/session-recordings/recordings-overview)
- [Microsoft Learn: Heatmaps overview](https://learn.microsoft.com/en-us/clarity/heatmaps/heatmaps-overview)
- [Microsoft Learn: Masking content](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking)
- [Microsoft Learn: Consent mode](https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-mode)
- [The Digital Personal Data Protection Act, 2023 (MeitY, PDF)](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf)
- [The GEO Blueprint curriculum](/#curriculum)
