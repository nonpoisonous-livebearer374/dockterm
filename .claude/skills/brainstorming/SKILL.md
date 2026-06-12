---
name: brainstorming
description: Use before building any DockTerm feature — explore intent, requirements, and design before writing code.
---

# Brainstorming

DockTerm is deliberately small. Before implementing anything, make sure the idea
belongs here and is well-shaped.

1. Confirm it fits the product: terminal-first, on-demand panels, no IDE features,
   no AI API calls, no telemetry/accounts/cloud. If it pulls toward "another IDE",
   push back.
2. Ask clarifying questions one at a time — purpose, constraints, success criteria.
3. Propose 2–3 approaches with trade-offs and a recommendation.
4. Sketch the design: which `src/` files change, the IPC channels involved, the
   security implications (filesystem jail, git hooks, secret masking).
5. Get agreement before writing code.

Read `docs/PRODUCT_PLAN.md` and `docs/ARCHITECTURE.md` first.
