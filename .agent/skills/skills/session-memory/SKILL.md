---
name: session-memory
description: "Persistent memory system for AI agents. Stores decisions, patterns, known issues, quality scores, and knowledge across sessions. MANDATORY: Load at session start, update at session end."
version: 2.0.0
skills:
  - anti-hallucination
---

# Session Memory v2 — Persistent AI Learning

> **Purpose:** Make AI remember, learn, and improve across sessions AND across models.
> **v2 Upgrade:** Added knowledge/, ground-truth, task queue, and model bridge support.

## Core Files

| File | Purpose | Load At | Update When |
|------|---------|---------|-------------|
| `docs/GROUND_TRUTH.md` | Locked facts (anti-halu) | **Session start (P0)** | After confirming new facts |
| `docs/TASK_QUEUE.md` | Active task backlog | **Session start (P0)** | After every task change |
| `docs/MODEL_BRIDGE.md` | Quick context sync | **Session start (P0)** | Session end |
| `docs/DECISIONS.md` | Architectural decisions | Session start | After any arch decision |
| `docs/PATTERNS.md` | Proven code patterns | Before coding | After successful pattern |
| `docs/KNOWN_ISSUES.md` | Bugs & solutions | Before debugging | After fixing any bug |
| `docs/QUALITY_HISTORY.md` | Quality scores over time | Never (append-only) | After orchestration |
| `docs/META_LEARNINGS.md` | Orchestration learnings | Before orchestrating | After orchestration |
| `docs/CODE_DNA.json` | Codebase personality | Before coding | After major changes |
| `knowledge/ground-truth/` | Additional locked facts | Session start | After verifying facts |
| `knowledge/tech/` | Tech learnings | When relevant | After research |
| `knowledge/research/` | Research results | When relevant | After research |
| `knowledge/solutions/` | Proven solutions | When debugging | After solving problems |

---

## Protocol

### 1. Session Start — LOAD MEMORY (MANDATORY)

```markdown
PRIORITY ORDER:

P0 (CRITICAL — Anti-Hallucination):
1. docs/GROUND_TRUTH.md → Locked facts, DO NOT override
2. docs/TASK_QUEUE.md → What to work on, auto-resume
3. docs/MODEL_BRIDGE.md → Quick context sync

P1 (IMPORTANT — Context):
4. docs/DECISIONS.md → Past architectural decisions
5. docs/PATTERNS.md → Proven code patterns
6. docs/KNOWN_ISSUES.md → Bugs to avoid

P2 (USEFUL — Depth):
7. docs/CODE_DNA.json → Codebase conventions
8. docs/META_LEARNINGS.md → What worked, what didn't
9. knowledge/ground-truth/ → Additional facts
```

### 2. During Work — APPLY MEMORY

| Situation | Memory to Apply |
|-----------|----------------|
| Starting any task | Check TASK_QUEUE.md for context |
| Making architecture decision | Check DECISIONS.md for precedents |
| Writing new code | Follow CODE_DNA.json conventions |
| Debugging | Check KNOWN_ISSUES.md for similar bugs |
| Choosing agent combo | Check META_LEARNINGS.md for best combos |
| Unsure about a fact | Check ground-truth/ before claiming |
| Learning something new | Save to knowledge/ immediately |

### 3. Session End — UPDATE MEMORY (MANDATORY)

```markdown
Before completing ANY session:

1. Task changed? → Update TASK_QUEUE.md (status, progress, next steps)
2. New decision made? → Append to DECISIONS.md
3. New pattern proved? → Append to PATTERNS.md
4. Bug found & fixed? → Append to KNOWN_ISSUES.md
5. Orchestration done? → Append to META_LEARNINGS.md
6. Quality scored? → Append to QUALITY_HISTORY.md
7. New fact confirmed? → Add to GROUND_TRUTH.md or knowledge/ground-truth/
8. New tech learned? → Save to knowledge/tech/
9. Research done? → Save to knowledge/research/
10. Solution found? → Save to knowledge/solutions/
11. Update MODEL_BRIDGE.md → Refresh context for next session/model
```

---

## Memory File Formats

### DECISIONS.md Format
```markdown
## [DATE] — [Decision Title]
- **Context:** Why this decision was needed
- **Decision:** What was decided
- **Alternatives:** What was considered
- **Outcome:** Result (updated later)
```

### PATTERNS.md Format
```markdown
## [Pattern Name]
- **Use When:** Trigger conditions
- **Code:** Minimal example
- **Files:** Where it's used in this project
- **Success Rate:** How often it works
```

### KNOWN_ISSUES.md Format
```markdown
## [Issue Title]
- **Symptom:** What went wrong
- **Root Cause:** Why it happened
- **Fix:** How it was fixed
- **Prevention:** How to avoid in future
```

---

## Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Load ALL memory files always | Load by PRIORITY (P0 → P1 → P2) |
| Store trivial decisions | Store only decisions that affect >2 files |
| Copy entire code blocks | Store patterns as minimal examples |
| Update memory mid-task | Update at natural checkpoints |
| Ignore ground-truth | Ground-truth ALWAYS overrides model knowledge |
| Skip TASK_QUEUE.md | ALWAYS read queue at session start |
| Forget to update MODEL_BRIDGE.md | ALWAYS refresh at session end |
