# Architectural Decisions
> Document key decisions here. AI reads this before making new decisions.
---

## 2026-03-17 — Hybrid Knowledge Storage (Opsi C)
- **Context:** Needed to decide where AI stores learnings for cross-model transfer
- **Decision:** Hybrid system — `docs/` for project-specific context, `knowledge/` for general learnings
- **Alternatives:** 
  - Opsi A: Only `docs/` (too simple, mixes project + general)
  - Opsi B: Only `knowledge/` (loses project context separation)
- **Outcome:** Clean separation. Models read both. Knowledge portable across projects.

## 2026-03-17 — Full Autonomy Except Delete
- **Context:** How autonomous should AI be? User wants OpenClaw-like behavior
- **Decision:** Full auto-proceed for all operations EXCEPT: delete, deploy, breaking changes, destructive DB migrations
- **Alternatives:** Checkpoint at every phase (too slow), Full autonomy (too risky)
- **Outcome:** Fast execution, safe guardrails. User happy with balance.

## 2026-03-17 — Token Investment Strategy
- **Context:** Research internet is token-expensive. User budget concern.
- **Decision:** "Boros token di awal OK" — invest heavily in research/knowledge building, then harvest savings in future sessions
- **Alternatives:** Minimal research (saves tokens now, halu later)
- **Outcome:** Knowledge base seeded. Future sessions will be much cheaper.

## 2026-03-17 — Anti-Hallucination Priority: Task Drift
- **Context:** Gemini 3.1 Pro's main problem identified
- **Decision:** #1 priority is TASK DRIFT prevention — AI does different thing than asked
- **Alternatives:** Focus on API fabrication or context amnesia
- **Outcome:** Anti-hallucination skill targets task drift with double-read protocol

---
<!-- NEW DECISIONS GO ABOVE THIS LINE -->
