# Proven Patterns
> Document successful code patterns here.
---

## Cross-Model Knowledge Transfer Pattern
- **Use When:** Switching between AI models (Opus → Gemini)
- **Pattern:** Save learnings to `docs/` + `knowledge/` → push to GitHub → clone in new project
- **Files:** docs/MODEL_BRIDGE.md, docs/GROUND_TRUTH.md, knowledge/**
- **Success Rate:** First implementation — to be validated

## Safe Update Pattern (Brain Merge)
- **Use When:** Updating SuperAI in existing projects
- **Pattern:** Backup project memory → Overwrite generic (skills/agents) → Merge knowledge (append only) → Verify
- **Files:** .agent/workflows/update-brain.md
- **Success Rate:** First implementation — to be validated

## Priority-Based Memory Loading
- **Use When:** Every session start
- **Pattern:** P0 (anti-halu: GROUND_TRUTH, TASK_QUEUE, MODEL_BRIDGE) → P1 (context: DECISIONS, PATTERNS) → P2 (depth: CODE_DNA, META_LEARNINGS)
- **Files:** .agent/skills/session-memory/SKILL.md
- **Success Rate:** First implementation — to be validated

---
<!-- NEW PATTERNS GO ABOVE THIS LINE -->
