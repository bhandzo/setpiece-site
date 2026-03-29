---
title: "Collective Intelligence Is the Next Frontier, And Gastown Is a Glimpse of the Future"
publishDate: "28 Mar 2026"
description: "The best AI models can code anything. But making agents work together at scale is the real challenge — and Gastown shows us how."
tags: ["ai", "agents", "distributed-systems"]
draft: false
---

The best AI models can code virtually anything right now. Architect, build, test, deploy. We've crossed a threshold you could reasonably call "coding AGI."

But ask one of these models to build something genuinely complex — a product with multiple moving parts, integrations, a real data layer — and it will eventually fall apart. The work is too big for one agent to hold in its head.

The next step forward is coordination. Making agents work together.

## The coordination problem

[Jesse Genet — a homeschooling mom of four, not an engineer — runs five separate AI agents on dedicated Mac Minis.](https://www.chatprd.ai/how-i-ai/jesse-genets-5-openclaw-agents-for-homeschooling-app-building-and-physical-inventories) One handles her homeschool curriculum. One does her family's finances. One codes apps. One manages her schedule. She moved them all into Slack hoping they'd collaborate, and then found that no human communication channel works for agent-to-agent coordination. "I believe now after spending more than a week with five agents that no one communication channel that is native to Open Claw... is actually very good for agent to agent collaboration," she said on the *How I AI* podcast, "because all of these tools have been made for humans to use and agents are kind of like hacking into them from the side."

She's a mom running a household who hit the coordination ceiling. And she's not alone — anyone running multiple AI sessions in parallel is experiencing this. The models are capable enough. The problem is getting them to work together.

This is a distributed systems problem, the same class of problem that companies like Google and Amazon spent decades solving for servers. Agents can disappear mid-task. They can finish work wrong because they didn't fully understand the requirements. They can't start because another agent hasn't finished a prerequisite. They complete something and have no way to hand it off.

If you've ever worked on a team with bad project management, you already understand this.

## What customer support looks like with collective intelligence

I want to walk through an example that has nothing to do with writing software.

Imagine customer support for a software company. Today you might have a chatbot that handles the easy stuff and escalates the hard stuff to a human. Now imagine this:

A front-line agent handles customer communication. Behind it sits a product expert agent that can answer deep questions about how the product works. A software expert agent helps reproduce bugs and gather diagnostic information. A support engineer agent can make small configuration changes to fix things.

When the front-line agent hits something it can't handle, it escalates. Maybe to an account management agent for more nuanced relationship conversations. Maybe to a team of engineering agents that can fix bugs or build small features.

Every one of these agents needs to know what the others are doing. The front-line agent needs to know the engineer fixed the bug before it tells the customer. The account manager needs to see what support has already tried. The engineering team needs reproduction steps from the software expert.

You can build this today. It's expensive from a token perspective, but it works. And as costs come down — which they always do — this pattern is going to be everywhere.

## AGI might be a team sport

We already have agents that are individually brilliant at specific tasks. What we don't have is a reliable way to make them work together at scale.

AGI may not emerge from a single superintelligent model. It may emerge from orchestrating many agents into a collective intelligence. Solving coordination might be what gets us there fastest.

## So what is Gastown?

[Gastown](https://github.com/steveyegge/gastown) is a distributed multi-agent system that takes coordination seriously. It solves the problems Jesse ran into — and the ones that would break our customer support example — with four ideas.

**Mail.** Agents need their own communication protocol. Slack doesn't work. Email doesn't work. Human tools are designed for humans. Humans are lazy, the do not update the CRM. Agents will happily complete a 10 page form in order to hand off a simple piece of work. Gastown gives agents a structured mail system where every handoff is explicit.

**Roles and supervision.** In any organization, you need people doing the work and people making sure the work gets done. Gastown has both. Workers called Polecats handle discrete tasks. A Witness supervises each team of Polecats — monitoring health, detecting stuck agents, nudging ones that stall, recycling ones that fail. A Deacon runs background patrols across the whole system, and Dogs handle infrastructure maintenance: health checks, garbage collection, backups. It's a management hierarchy, not because hierarchy is fun, but because unsupervised agents drift, stall, and silently fail.

**GUPP.** The Gas Town Universal Propulsion Principle: "If there is work on your Hook, you must run it." Every agent has a Hook — a personal work queue. When something lands on it, the agent acts. No waiting for permission. No polling a coordinator. This is what makes the system autonomous rather than orchestrated. Agents don't sit idle waiting to be told what to do. They pick up work the moment it's available.

**Convoys.** A convoy is how you track a batch of related work. You create a convoy, point it at a set of tasks, and workers swarm it — each Polecat taking one piece, working in parallel across different repos. The convoy tracks what's done, what's in progress, and what's blocked. When everything lands, it notifies you. You get a single view of "what's in flight" without having to check on each agent individually.

Gastown is oriented around coding right now, but there's no reason it stays there. The customer support example above could run on this architecture today. The only constraint is defining the workflows for a given domain.

## Where this is going

When the iPhone came out, smartphones became inevitable for everyone. It took something that was a business tool for a specific kind of person and made it general-purpose.

Openclawd and Claude Cowork could be a similar inflection point, where in the near term most people will interact with a true agent, rather than copying and pasting in and out of a chat, as a primary part of their daily lives. Solving the coordination problem is what stands between where we are today, and the agentic future.

---

*I'm pretty sure this is the first in a three-part series. Next up: The Road to Gastown — the surprisingly straight line from making your first Claude artifact to running distributed agent teams.*
