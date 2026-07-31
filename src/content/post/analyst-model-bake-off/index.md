---
title: "The Analyst Model Bake-Off"
publishDate: "31 Jul 2026"
description: "We ran six LLMs through a live-warehouse regression suite. Every model that finished aced it — and that's the finding."
tags: ["ai", "agents", "evals", "data"]
coverImage:
  src: "./cover.jpg"
  alt: "Header of the Analyst Model Bake-Off report"
draft: false
---

We run an AI pricing analyst against a live BigQuery warehouse at Extra Point. This month we asked a question every team running an agent in production eventually asks: **is the model we picked still the right one?**

So we built a bake-off. Six frontier LLMs, each dropped into the *same* analyst harness — same system prompt, same tools, same cost-guarded warehouse access — and graded on twelve real pricing questions with known answers. Deterministic scorers, measured latency, and per-run cost pulled from the harness's own observability store. No vibes.

The headline result: **four models posted perfect boards.** Numeric accuracy no longer separates frontier models on this corpus. What separates them now is discipline (does the model answer from the canonical data marts, or freelance against raw tables?), speed (28 to 152 seconds per case), and cost (a 23× spread — and the "flash" model was the *most expensive* run on the board).

Two findings we think generalize beyond our warehouse:

1. **Your eval harness is probably lying to you.** Our first scoreboard undercounted two models badly — infrastructure failures were being laundered into "wrong answers." Silent non-answers, sandbox friction, and corpus bugs each needed a structural fix before the numbers meant anything. Treat any eval number from an unaudited harness as a lower bound.

2. **When models agree with each other and disagree with your answer key, fix the answer key.** Three unrelated architectures producing the *identical* "wrong" number is a corpus-bug detector, not a coincidence.

The full report — the final board, the methodology, and the three bugs that were really lessons — is published here:

**[Read the full report → The Analyst Model Bake-Off](/reports/analyst-model-matrix/)**

One more thing worth saying about that link. The report isn't a PDF or a slide export — it's the report *itself*, published as a page of this site. It was authored as a [softcopy](https://softcopy.dev) report: plain files on disk, written and revised by the same agents that ran the evals, rendered with live charts straight from the harness's observability data. Publishing it here was a copy of a folder. That's the hypothesis we keep coming back to — reports are better as websites — and this is us dogfooding it.
