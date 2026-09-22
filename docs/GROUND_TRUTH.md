# 🔒 Ground Truth — Locked Facts

> **AI WAJIB baca file ini SEBELUM mulai kerja.**
> Fakta di sini TIDAK BOLEH di-override oleh model hallucination.
> Ground truth > Model internal knowledge.

---

## 📌 Super AI Kit Facts

### System Info
- **Kit Name:** Super AI Level 99
- **Version:** 1.0.0
- **Location:** `.agent/` directory in project root
- **Agents:** 21 specialist agents in `.agent/agents/`
- **Skills:** 77+ skills in `.agent/skills/`
- **Workflows:** 11 commands in `.agent/workflows/`
- **Memory:** `docs/` for project context, `knowledge/` for general learnings
- **IDE:** Antigravity IDE
- **Available Models:** Opus 4.6 (premium), Gemini 3.1 Pro (efficient)

### Architecture Rules (LOCKED)
- **Entry Point:** `GEMINI.md` → routes to agents → agents load skills
- **Rule Priority:** P0 (GEMINI.md) > P1 (Agent .md) > P2 (SKILL.md)
- **Autonomy Level:** Full auto-proceed EXCEPT delete/deploy/breaking changes
- **Research Policy:** Boros token OK di awal, invest in knowledge base
- **Memory System:** Hybrid — `docs/` (project) + `knowledge/` (general)

### DO NOT Hallucinate About
- ❌ Jangan ngarang agent yang tidak ada di `.agent/agents/`
- ❌ Jangan ngarang skill yang tidak ada di `.agent/skills/`
- ❌ Jangan ngarang workflow yang tidak ada di `.agent/workflows/`
- ❌ Jangan ubah Priority rules (P0 > P1 > P2)

---

<!-- ADD NEW GROUND TRUTHS ABOVE THIS LINE -->
<!-- Format:
## [Topic]
- **Confirmed:** [fact]
- **Source:** [where verified]
- **Date Verified:** [date]
- **DO NOT:** [hallucination to avoid]
-->
