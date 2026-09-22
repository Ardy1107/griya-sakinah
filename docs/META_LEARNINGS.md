# Meta Learnings
> Learnings from agent combinations and orchestration.
---

## 2026-03-17 — System Bootstrap Session (Opus 4.6)

### What Worked
- **Sequential skill creation** — Build anti-hallucination first, then autonomy, then research (dependency order)
- **Internet research in parallel** — 4 searches simultaneously = fast knowledge gathering
- **File size awareness** — Caught the 12000 char limit on workflow files early

### What Didn't Work
- **PowerShell syntax** — `&&` doesn't work in PowerShell, use `;` instead
- **Git config missing** — Need to set user.email/name before first commit

### Best Agent Combo for This Task Type
- **System setup/config:** Opus 4.6 solo (needs deep reasoning, no need for multi-agent)
- **Research tasks:** Web search in parallel + distill into knowledge files
- **File creation:** Batch create related files together, not one by one

### Key Insight
> The most impactful thing for cross-model knowledge transfer is NOT the skills/rules,
> it's the **CONCRETE DATA** in docs/ and knowledge/. Gemini won't halu if it has
> real facts to reference instead of relying on internal knowledge.

---
<!-- NEW LEARNINGS GO ABOVE THIS LINE -->
