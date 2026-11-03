---
title: How to know if AI is recommending your business (a free method)
seoTitle: How to know if AI is recommending your business (free method)
description: Write 10 to 20 customer questions, ask ChatGPT, Gemini, Perplexity and Claude several times, and log who gets named. A free spreadsheet method with limits.
date: 2026-11-03
updated: 2026-11-03
author: Litmus Team
authorRole: Research and writing, Litmus by AiVirex
authorUrl: https://litmus.aivirex.in
tag: Technical guides
related: see-if-chatgpt-sends-visitors-to-your-site, track-who-visits-your-website, learn-geo-30-days
---

# How to know if AI is recommending your business (a free method)

Write 10 to 20 questions your customers would ask, ask each one in ChatGPT, Gemini, Perplexity and Claude, and log which businesses get named. Repeat each question a few times, because the answers change from run to run. Then count how often you appear. It costs nothing but time, and it measures mentions, which your website analytics can't see. One honest warning: this is a free quick win, not a reliable tracking method. AI doesn't give the same answer every time, so you may be cited on one run and missed on the next, for many reasons. Read the next section before you trust any single result.

We read every source below on 3 November 2026.

## Is asking the AI directly a reliable way to track this?

No. It's a useful free check, and it's a weak tracker. Assistants build each answer fresh, and what they cite depends on the exact wording, the assistant, whether web search is on, your location, the day and plain chance. So a single run can show you named when you usually aren't, or missing when you usually appear. What you can measure is how often you appear across many runs, a share of voice for your business, and even that is only an estimate. Use this method to get a quick, free first picture and to spot gaps. Don't use it to prove that a GEO change worked, and don't report one screenshot to a client as a result. For a steadier view, repeat prompts many times, track over months and combine it with traffic and Search Console data. Paid trackers automate the repeating, and they face the same limits.

## Why does one answer prove so little?

Because the same question rarely gets the same answer twice. In a study reported by [Search Engine Journal](https://www.searchenginejournal.com/ai-recommendations-change-with-nearly-every-query-sparktoro/566242) on 30 January 2026, SparkToro's Rand Fishkin and Patrick O'Donnell of Gumshoe.ai ran 12 recommendation prompts 60 to 100 times each. ChatGPT and Google's AI in Search returned the same list of brands less than 1% of the time, and the same list in the same order less than 0.1% of the time.

So don't treat "I asked once and I wasn't there" as a verdict. The same report says how often a brand appeared across many runs was steadier than its position in any one list. Fishkin called tools that report an "AI ranking position" "full of baloney".

Two cautions. The study isn't peer reviewed, and Gumshoe.ai sells AI tracking tools, which Fishkin disclosed. It also left open how many runs you need for reliable data.

## Step 1: Write your prompt list

Pick 10 to 20 questions a real customer would type or say. Mix four kinds:

- **Category plus place:** "best physiotherapy clinic in Adyar, Chennai"
- **Problem:** "who can fix a knee that hurts on stairs near T. Nagar"
- **Price or comparison:** "how much does a root canal cost in Coimbatore"
- **Your name:** "is [your business name] any good?"

Use your customers' real words. If they ask in Tamil, or in Tamil typed in English letters, include some prompts that way. Put the city or area in the question, since tools may use your approximate location. [Claude's help page](https://support.claude.com/en/articles/10684626-enabling-and-using-web-search) says Claude may use a location inferred from your IP address for local questions.

## Step 2: Run them in each tool

Use ChatGPT, Gemini, Perplexity and Claude. Open a fresh chat for each prompt, so earlier questions don't colour the answer. Where a tool lets you pick web search, note whether it was on. [Claude's page](https://support.claude.com/en/articles/10684626-enabling-and-using-web-search) says that in its new experience there's no toggle and "Claude searches the web when it helps", so an answer may come from search or from the model's own memory. Write down what you see rather than guess.

Run each prompt 3 times per tool. Three is our suggestion, not a researched number.

## Step 3: Log it in a spreadsheet

One row per answer. Here's a layout that works:

| Date | Tool | Prompt | Run | Businesses named | You named? | Your site linked? | Sources cited |
|---|---|---|---|---|---|---|---|
| 3 Nov 2026 | Perplexity | best physio clinic in Adyar | 1 | Clinic A, Clinic B, You | Yes | Yes | 4 |
| 3 Nov 2026 | Perplexity | best physio clinic in Adyar | 2 | Clinic A, Clinic C | No | No | 5 |

The names in that table are placeholders for the layout, not real results.

For each prompt and tool, work out your appearance rate: the number of runs where you're named, divided by total runs. This is the "visibility percentage" idea from the SparkToro report. In an illustrative example, you're named in 4 of 12 runs of a prompt, so your rate is 33%. Note your competitors' names too. If the same two names keep showing up, that's your real competition in AI answers.

## Step 4: Add traffic and search data

Mentions are half the picture. Check whether anyone clicked. In GA4, look for the "AI Assistant" channel, as we explain in [how to see if ChatGPT sends visitors to your site](/blog/see-if-chatgpt-sends-visitors-to-your-site). In Search Console, watch queries and clicks. Google's AI features page says links shown in AI Overviews and AI Mode are [included in overall search traffic](https://developers.google.com/search/docs/appearance/ai-features) there. Our [tracking overview](/blog/track-who-visits-your-website) has a weekly routine.

## How often should you re-check?

Monthly is enough for most small businesses. Use the same prompts each time so your numbers compare. Add new prompts at the bottom, don't swap old ones out. And record the date, since these tools change. Before you change anything on your site, run the whole panel once. That's your baseline.

## What does a result prove, and what doesn't it?

A result proves one narrow thing: on that day, in that tool, with that wording, you were or weren't named. It doesn't prove rank, because the SparkToro data shows order shifts almost every time. It doesn't prove sales either. And it doesn't prove what other people see, since answers can vary by account, place and settings.

A rising appearance rate over several months is a useful hint that something is working. It's not proof that your edits caused it.

## Can a tool do part of this for you?

Some tools do prompt tracking, and Fishkin's advice was to check that any provider "shows their math". Litmus is a different kind of tool. It's made by AiVirex, the same team behind our course, so weigh our view accordingly. Per [its own page](https://litmus.aivirex.in), you enter a URL and get a score across six dimensions, from technical access to answer-first content and citation authority. The page says it uses no LLM calls, so it checks your site, not what AI says about you. It lists credit packs starting at ₹49 for one scan.

Use the manual panel to see mentions, and a site audit to find the likely reasons you're missing.

## Where The GEO Blueprint fits

The manual panel tells you where you stand. Fixing it needs a plan. The GEO Blueprint is a one-time ₹499 course, about 1.5 hours and 6 modules. It covers how AI picks its next word, the 6 pillars of GEO, why manual audits are inconsistent, and a live audit demo with Litmus.

If you want the full guide to doing GEO on your own site or a client's, start small and see if it's useful, then go deeper later if you want. It's mostly in Tamil, with English terms mixed in. See the [pricing and curriculum](/#pricing). It has no student reviews yet. For a week-by-week plan, read [how to learn GEO in 30 days](/blog/learn-geo-30-days).

## Questions, answered

### How many prompts should I test?
Start with 10 to 20 questions that real customers would ask, across category, problem, price and brand-name types. More isn't better at first. Ten prompts run three times each in two tools is already 60 answers.

### Why does ChatGPT give a different answer each time?
Answers vary from run to run. SparkToro's study found repeated runs of the same prompt almost never gave the same brand list. That's why you repeat prompts and count how often you appear.

### Is it enough to ask once?
No. One answer is a single sample. Fishkin's data suggests ranking position in one run means little, while appearance rate over many runs is steadier. Run each prompt several times and record all of them.

### Do I need a paid tool?
Not to start. A spreadsheet and a few hours do the job. Paid tools can save time if you have many prompts or clients, but ask how they handle run-to-run variation and whether they show their method.

### What if I'm never mentioned?
It's information, not a verdict. Note who is mentioned and what their pages state that yours don't, such as prices, areas served and sources. Then fix one page and rerun the panel next month.

## Sources

Checked 3 November 2026.

- [Search Engine Journal: AI recommendations change with nearly every query (SparkToro study, 30 January 2026)](https://www.searchenginejournal.com/ai-recommendations-change-with-nearly-every-query-sparktoro/566242)
- [Claude Help Center: Enabling and using web search](https://support.claude.com/en/articles/10684626-enabling-and-using-web-search)
- [Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Litmus by AiVirex](https://litmus.aivirex.in)
- [The GEO Blueprint curriculum and pricing](/#pricing)
