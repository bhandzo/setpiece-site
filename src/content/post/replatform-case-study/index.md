---
title: "How an AI-Native Replatform Retired the Offshore Team"
publishDate: "8 May 2026"
description: "An 18-month replatform where the onshore team shipped more, at higher quality, and landed a multi-year rewrite — without growing headcount."
tags: ["case-study", "ai-replatform", "product-strategy"]
draft: true
---

A ten-year-old bootstrapped vertical SaaS came out of an eighteen-month replatform shipping at the same cadence it had been when it was paying for a roughly ten-person offshore engineering augmentation on top of its onshore team. Quality went up. The frontend rewrite that had been stuck for nearly four years finally landed. The offshore team was retired. AI is the reason the math worked.

## This wasn't an "AI transformation." It was a margin story.

Every operating company has urgent problems it's already going to spend real money on this year — a launch that has to ship, a bug surge that has to be absorbed, documentation that has to get written. Until recently, the only way to scale through those moments was headcount: more engineers, more contractors, more offshore capacity. AI changed the math.

For the first time, the leverage option is cheaper than the headcount option for a real list of expensive, recurring jobs. We didn't add AI to the workflow. We treated each urgent fire as the moment to invest in leverage instead of patching with people.

Three places it showed up on the P&L.

## Design workflows

The frontend rewrite had been dragging for nearly four years. The alpha had launched buggy and badly designed, and the patch on the table was more frontend headcount and more offshore capacity to grind through it. Instead, we rebuilt the design pipeline so a small team could actually move.

A separate design-only environment let designers prototype in a stack the AI tools understood out of the box — no backend to fight, no integration tax. Designers and developers handed off through structured documents the agents could read and act on, not through meetings. Six weeks in, the team had a redesigned shell. Late in the rebuild, twenty-five form components got reskinned in a single day.

The work that had previously required a parallel offshore team got finished in-house. The rewrite shipped, on the original onshore team, without adding heads.

## Bug triage

A ten-year-old, tens-of-thousands-of-customer platform throws a bug surge that no engineering team can absorb during a major launch. The reflexive patch — pull engineers into a triage rotation — would have stalled the rewrite again, exactly when it couldn't afford another stall.

Instead we built a triage agent that takes every incoming bug report, drafts a reproduction, identifies duplicates, and pre-stages the issue for an engineer. The engineer sees a clean queue with the work already framed.

Engineers stayed on the rewrite. Customer-facing turnaround on bug reports got *faster*, not slower, during the highest-volume window in company history. A launch-grade bug surge got handled without pulling engineers off the work that was paying for the launch.

## Documentation

New customer-facing documentation was going to block the launch. The team had paused doc work during the rewrite to protect velocity, and the gap was a year deep. The patch — hire a technical writer and chase the codebase — was slow and expensive, and the codebase was still moving.

Instead we built a pipeline that turns a short product walkthrough — a screen recording, a Loom — into a launch-ready doc. The CEO runs her own marketing copy through a writing skill we built with her, in her voice, on her terms.

Documentation went from launch-blocker to launch-day-ready, on the existing team. No new writers were hired.

## The numbers

Equivalent shipping cadence with a roughly fifteen-person onshore product, engineering, and design team that had previously required a ten-plus-person offshore augmentation to keep pace. Code-review cost moved from senior-engineer hours per pull request to a few dollars in agent calls. The four-year rewrite landed. Quality climbed during the highest-bug window in company history. The team today is smaller, faster, and more profitable than it was eighteen months ago.

## Why this matters

The work was going to happen either way. The bills were going to be paid either way. AI made it possible to come out the other side with leverage instead of more headcount.

That's a margin story, not a technology story — and it's reproducible.

This is what Setpiece does. If you have an urgent problem and you're trying to decide whether to patch it or invest in leverage, that's the conversation we know how to have.
