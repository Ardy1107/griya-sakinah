---
name: universal-intelligence
description: "Universal Intelligence Protocol — Level 0-10 AI enhancements applied to EVERY agent and skill. Anti-hallucination, memory, DNA compliance, predictive scanning, self-healing, research, and continuous learning."
version: 2.0.0
skills:
  - session-memory
  - self-healing
  - code-dna
  - predictive-analysis
  - anti-hallucination
  - autonomous-task
  - deep-research
---

# Universal Intelligence Protocol v2

> **Applied to EVERY agent, EVERY skill, EVERY action.**
> **v2 Upgrade:** Added L0 (Anti-Hallucination) and L10 (Knowledge Capture).

## 11 Intelligence Layers

| Layer | Name | When | Action |
|:-----:|------|------|--------|
| **L0** | **🛡️ Anti-Hallucination** | BEFORE everything | Read GROUND_TRUTH.md + check task scope |
| L1 | **Memory Check** | BEFORE any task | Read docs/DECISIONS.md, PATTERNS.md, KNOWN_ISSUES.md |
| L2 | **Business Context** | BEFORE any task | Read docs/BUSINESS_CONTEXT.md (personas, KPIs) |
| L2.5 | **🔄 Task Resume** | BEFORE any task | Read docs/TASK_QUEUE.md → auto-resume if needed |
| L3 | **DNA Compliance** | BEFORE writing code | Match docs/CODE_DNA.json conventions |
| L4 | **Creative Check** | BEFORE UI work | Apply creative-intelligence anti-template protocol |
| L5 | **Persona Validation** | DURING UI work | Validate against user personas |
| L6 | **Predictive Scan** | AFTER writing code | Scan for risks (file size, missing handlers, etc.) |
| L7 | **Self-Heal** | AFTER any change | Auto-fix build/lint/type errors |
| L8 | **Quality Score** | AFTER completion | Score quality 1-10 per dimension |
| L9 | **Memory Update** | AFTER task end | Update relevant docs/ files |
| **L10** | **📚 Knowledge Capture** | AFTER task end | Save new learnings to knowledge/ |

---

## Quick Protocol

```
BEFORE → L0: Anti-halu check → L1-2.5: Load memory + queue + DNA
DURING → Follow DNA + Stay on task + Research if unsure
AFTER  → Self-heal + scan + score + update memory + capture knowledge
```

## Agent Integration

ALL agents MUST apply this protocol. Add to agent frontmatter:
```yaml
skills: [...existing-skills, session-memory, self-healing, code-dna, predictive-analysis, anti-hallucination, autonomous-task, deep-research]
```

## Key Files to Read

| Priority | File | Purpose |
|:--------:|------|---------|
| P0 | `docs/GROUND_TRUTH.md` | Locked facts — anti-hallucination |
| P0 | `docs/TASK_QUEUE.md` | Active tasks — what to work on |
| P0 | `docs/MODEL_BRIDGE.md` | Quick context sync |
| P1 | `docs/DECISIONS.md` | Past decisions |
| P1 | `docs/PATTERNS.md` | Proven patterns |
| P1 | `docs/KNOWN_ISSUES.md` | Bugs to avoid |
| P2 | `docs/BUSINESS_CONTEXT.md` | Business context |
| P2 | `knowledge/ground-truth/` | Additional locked facts |
