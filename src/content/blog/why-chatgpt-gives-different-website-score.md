---
title: Why asking ChatGPT to grade your website gives a different score every time
seoTitle: Why ChatGPT gives a different website score every time you ask
description: A chatbot has no fixed rubric, so the same site can get different scores on different runs. Why it happens, what studies show and how to audit repeatably.
date: 2026-11-04
updated: 2026-11-04
author: Litmus Team
authorRole: Research and writing, Litmus by AiVirex
authorUrl: https://litmus.aivirex.in
tag: Audits and measurement
related: how-to-run-a-geo-audit, free-geo-audit-tools-compared, why-chatgpt-answers-differ-every-time
---

# Why asking ChatGPT to grade your website gives a different score every time

When you paste your site into ChatGPT and ask for a score, it improvises a judgment. It has no fixed rubric, so it doesn't weigh the same things the same way each time, and it writes its answer one word at a time from probabilities. Ask twice and you'll often get two different scores. For a one-off opinion that's fine. For an audit you'll show a client, it isn't.

We built an audit tool to avoid this problem, so we have an interest in the argument. We've separated what is measured from what is our reasoning.

## Why does the score move?

Three things stack up.

1. **No rubric.** You haven't told the model what a 7 out of 10 means, how much each factor weighs or what evidence counts. It decides as it goes.
2. **Probabilistic writing.** A language model picks each next word from likely options. The same prompt can diverge early and end elsewhere. The basic design is described in the 2017 paper [Attention Is All You Need](https://arxiv.org/abs/1706.03762).
3. **Different inputs on different runs.** If the assistant fetches your page, what it gets can vary: which parts it reads, how it renders the page, what else it searches.

This is our explanation of the mechanism. The measured part is on the output side.

## What do studies show about variation?

We found no published study of chatbot website scores specifically. We did find research on how much AI answers vary in a related task, recommending brands. [SparkToro and Gumshoe](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/) ran 12 prompts a combined 2,961 times and found ChatGPT and Google's AI gave the same list of brands less than 1 in 100 times. Gumshoe sells AI tracking tools, and the study isn't peer reviewed. It's evidence that repeated runs differ, not proof that scores do. You can test the scoring case yourself: ask three times and compare.

## Why does this matter for audits?

- **You can't show progress.** If the score changes without any change to the site, a before-and-after comparison means nothing.
- **You can't defend it to a client.** "The chatbot said 72" is hard to stand behind if it said 64 an hour later.
- **You can't prioritise.** A vague impression doesn't say which fix matters most.

Many "AI visibility" tools work by wrapping your URL in a prompt and sending it to a model. We can't say how any specific tool works, so ask vendors how they keep scores repeatable. Test it: scan the same site twice.

## How do you audit repeatably?

1. **Use a written rubric.** List the checks and what passes or fails. Our [GEO checklist](/blog/geo-checklist-2026) is one.
2. **Prefer rule-based checks for site properties.** Crawler access, indexing, dates, structure and consistent names can be checked by rules. Litmus's page says its scans are rule-based with no LLM calls, and that the same input gives the same score.
3. **Use AI for what only AI can show: what it says about you.** Run each question several times and count appearances. See our [free method](/blog/know-if-ai-recommends-your-business).
4. **Record dates and settings.** Tools and models change.

See [how to run a GEO audit](/blog/how-to-run-a-geo-audit) for the full steps.

## Where The GEO Blueprint fits

Module 4 of The GEO Blueprint covers exactly this: why manual chatbot audits don't work, then a live demo of a fixed-rubric audit with Litmus across all 6 pillars. It's ₹499, about 1.5 hours, mostly in Tamil with English terms mixed in. Start small and see if it's useful. Get the course to learn the full guide for your own site or a client's. It has no student reviews yet.

## Questions, answered

### Can ChatGPT audit my website?
It can give an opinion, and sometimes a useful one. It can't give a repeatable score without a rubric you supply, and even then results may vary. Use it to brainstorm fixes, not to measure progress.

### Why do I get a different score each time?
Because the model writes its answer from probabilities and has no fixed scoring rules. Small changes in how it reads the page can also change the outcome.

### Can I make ChatGPT score the same every time?
You can improve consistency by giving it a detailed rubric and asking it to show its working. We can't promise identical scores. The app doesn't give you control over randomness.

### What's a better way to get a repeatable score?
Use a rule-based checklist or tool, and run the same input twice to check. We compare options in [free GEO audit tools](/blog/free-geo-audit-tools-compared).

## Sources

Checked 4 November 2026.

- [Vaswani et al.: Attention Is All You Need (2017)](https://arxiv.org/abs/1706.03762)
- [SparkToro: AIs are highly inconsistent when recommending brands](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/)
- [Litmus by AiVirex](https://litmus.aivirex.in)
