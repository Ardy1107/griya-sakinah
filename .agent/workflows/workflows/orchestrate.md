---
description: "Super AI 99/100 orchestration with memory, self-healing, debate, research, predictive analysis, business context, creative intelligence, persona-driven design, and continuous learning."
---

# Multi-Agent Orchestration — Super AI 99/100 Edition

You are now in **ORCHESTRATION MODE**. Enhanced with Level 1-4 AI + Business Intelligence + Creative Protocol.

## Task to Orchestrate
$ARGUMENTS

---

## 🧠 PHASE 0: MEMORY + ANTI-HALLUCINATION

> 🔴 Load memory by priority. Ground-truth FIRST.

| Priority | Files | Purpose |
|:--------:|-------|--------|
| **P0** | GROUND_TRUTH.md, TASK_QUEUE.md, MODEL_BRIDGE.md, knowledge/ground-truth/ | Anti-halu + task context |
| **P1** | DECISIONS.md, PATTERNS.md, KNOWN_ISSUES.md | Project context |
| **P2** | CODE_DNA.json, META_LEARNINGS.md, BUSINESS_CONTEXT.md, knowledge/tech/ | Depth |

> 🛡️ After loading: (1) What EXACTLY is the task? (2) What is NOT part of task? (3) Ground-truth conflicts?

---

## 🔴 MINIMUM AGENT REQUIREMENT

> ⚠️ **ORCHESTRATION = MINIMUM 3 DIFFERENT AGENTS**
> If `agent_count < 3` → STOP and invoke more agents.

### Agent Selection Matrix

| Task Type | REQUIRED Agents (minimum) |
|-----------|---------------------------|
| **Web App** | frontend-specialist, backend-specialist, test-engineer |
| **API** | backend-specialist, security-auditor, test-engineer |
| **UI/Design** | frontend-specialist, seo-specialist, performance-optimizer |
| **Database** | database-architect, backend-specialist, security-auditor |
| **Full Stack** | project-planner, frontend-specialist, backend-specialist, devops-engineer |
| **Debug** | debugger, explorer-agent, test-engineer |
| **Security** | security-auditor, penetration-tester, devops-engineer |

### Automatic Skill Injection

> When invoking agents, ALWAYS auto-load their optimal skills:

| Agent | Auto-Load Skills |
|-------|------------------|
| frontend-specialist | frontend-design, react-patterns, tailwind-patterns, web-performance-optimization, code-dna |
| backend-specialist | api-patterns, nodejs-best-practices, database-design, code-dna |
| security-auditor | vulnerability-scanner, red-team-tactics, secrets-management |
| test-engineer | testing-patterns, tdd-workflow, webapp-testing |
| performance-optimizer | performance-profiling, web-performance-optimization |
| database-architect | database-design, postgres-best-practices |
| mobile-developer | mobile-design, react-patterns |
| research-agent | architecture, api-patterns, session-memory |

---

## Pre-Flight: Mode Check

| Current Mode | Task Type | Action |
|--------------|-----------|--------|
| **plan** | Any | ✅ Proceed with planning-first approach |
| **edit** | Simple execution | ✅ Proceed directly |
| **edit** | Complex/multi-file | ⚠️ Ask: "This task requires planning. Switch to plan mode?" |
| **ask** | Any | ⚠️ Ask: "Ready to orchestrate. Switch to edit or plan mode?" |

---

## 🔴 4-PHASE ORCHESTRATION (Upgraded from 2-Phase)

### PHASE 1: RESEARCH + PLANNING (Sequential)

| Step | Agent | Action |
|------|-------|--------|
| 0.5 | `self` | **Load Memory** (PHASE 0 above) |
| 1 | `research-agent` | Research brief — existing patterns, trade-offs |
| 2 | `project-planner` | Create PLAN.md based on research |
| 3 | (optional) `explorer-agent` | Codebase discovery if needed |

> 🔴 **NO implementation agents during Phase 1!**

### ⏸️ CHECKPOINT: User Approval

```
After PLAN.md is complete, ASK:

"✅ Plan created: [plan-file]

🔬 Research: [key findings from research-agent]
📋 Plan: [summary of tasks]
🎯 Confidence: [HIGH/MEDIUM/LOW]

Do you approve? (Y/N)"
```

> 🔴 **DO NOT proceed to Phase 2 without explicit user approval!**

### PHASE 2: IMPLEMENTATION (Parallel agents after approval)

| Parallel Group | Agents |
|----------------|--------|
| Foundation | `database-architect`, `security-auditor` |
| Core | `backend-specialist`, `frontend-specialist` |
| Polish | `test-engineer`, `devops-engineer` |

#### 🤺 DEBATE MODE (for architecture decisions)

> When agents face a decision with 2+ valid approaches:

| Step | Action |
|------|--------|
| 1 | Identify decision point (min 2 valid options) |
| 2 | Invoke 2-3 agents with the same question |
| 3 | Each agent gives PRO & CONTRA |
| 4 | Orchestrator evaluates & picks best |
| 5 | Document in docs/DECISIONS.md |

> Trigger: Use DEBATE for decisions affecting >5 files

#### 🎯 Confidence-Weighted Output

> Every agent must report confidence level:

| Confidence | Action |
|:----------:|--------|
| 🟢 >80% | Auto-proceed |
| 🟡 60-80% | Proceed with note |
| 🟠 40-60% | Ask user for input |
| 🔴 <40% | STOP. Research more or debate. |

#### 🧩 Context Passing Protocol v2

> When invoking ANY subagent, include this CONTEXT PACKET:

```markdown
**CONTEXT PACKET:**
- 🎯 Goal: [1 sentence]
- 📋 Decisions: [bullet list of confirmed decisions]
- 📁 Key Files: [max 5 file paths]
- ⚠️ Constraints: [limitations]
- 🧠 Memory: [relevant items from DECISIONS.md/PATTERNS.md]
- 🔗 Dependencies: [what previous agents produced]
- 🧬 Code DNA: [conventions from CODE_DNA.json]
```

### PHASE 3: SELF-HEAL + VERIFY (Mandatory)

#### 🩺 Self-Healing Pipeline

```
After ALL code changes:
1. npm run build → fail? → auto-fix → rebuild (max 3 cycles)
2. npm run lint → errors? → auto-fix with --fix → re-check
3. npx tsc --noEmit → type errors? → fix types → re-check
4. npm test → failures? → analyze → fix regression → re-test
```

#### 🛡️ Regression Gate

| Check | Command | Must Pass |
|-------|---------|-----------|
| Build | `npm run build` | ✅ Zero errors |
| Lint | `npm run lint` | ✅ Zero errors |
| Tests | `npm test` | ✅ All passing |
| Type Check | `npx tsc --noEmit` | ✅ Zero errors |

> 🔴 If ANY check fails → Self-heal up to 3x → then report to user

#### 🛡️ Red/Blue Team (for security-sensitive code)

| Team | Agent | Role |
|------|-------|------|
| 🔴 Red | penetration-tester | Find vulnerabilities in new code |
| 🔵 Blue | security-auditor | Patch every vulnerability found |
| 🟢 Ref | orchestrator | Verify all issues resolved |

> Trigger: Any auth/payment/data-sensitive code changes

#### Verification Scripts

```bash
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
python .agent/skills/lint-and-validate/scripts/lint_runner.py .
```

#### 📡 Proactive Issue Detection

> After implementation, scan for:

| Signal | Prediction | Action |
|--------|-----------|--------|
| File >400 lines | God component | Suggest split |
| 5+ useState | State explosion | Suggest useReducer/custom hook |
| API without error handling | Crash risk | Auto-add try-catch |
| CSS without responsive | Mobile broken | Flag for review |
| console.log remaining | Production leak | Auto-remove |
| Missing key prop in .map() | Render bug | Auto-add key |

### PHASE 4: RETROSPECTIVE + MEMORY UPDATE

> 🔴 **MANDATORY:** Update memory after every orchestration.

| Step | Action |
|------|--------|
| 1 | Score quality (1-10 per dimension) |
| 2 | New decision made? → Append to `docs/DECISIONS.md` |
| 3 | New pattern proved? → Append to `docs/PATTERNS.md` |
| 4 | Bug found & fixed? → Append to `docs/KNOWN_ISSUES.md` |
| 5 | Record agent combo result → Append to `docs/META_LEARNINGS.md` |
| 6 | Record quality score → Append to `docs/QUALITY_HISTORY.md` |
| 7 | Codebase changed? → Update `docs/CODE_DNA.json` |

---

## 📊 Effort Scaling Matrix

| Task Complexity | Agents | Verification | Memory Update | Debate? |
|----------------|:------:|:------------:|:-------------:|:-------:|
| **Simple** (1 file) | 1-2 | Lint only | Skip | No |
| **Medium** (2-5 files) | 2-3 | Lint + Test | If new pattern | No |
| **Complex** (5+ files) | 3-5 | Full suite | Always | If arch decision |
| **Critical** (security/deploy) | 4-6 | Full + Red/Blue | Always | Always |

---

## 🤖 Level 3: Autonomous Behaviors

### Auto-Planning Trigger
```
IF file_changes > 5 files AND no PLAN.md exists:
  → Auto-generate plan suggestion
  → Ask user: "Complex change detected. Want me to plan first?"
```

### Auto-Agent Assignment
```
IF task involves:
  - Auth code → auto-include security-auditor
  - Database → auto-include database-architect
  - UI changes → auto-include frontend-specialist
  - >3 files → auto-include test-engineer
  - Performance concern → auto-include performance-optimizer
```

### Proactive Refactoring
```
IF component_lines > 400 → Suggest split
IF duplicated_blocks >= 3 → Suggest extract utility
IF outdated_dependency → Flag vulnerability
```

---

## 🔮 Level 4: Predictive Behaviors

### Predictive Suggestions
Auto-suggest: auth→rate limiting/CSRF, forms→validation/error states, API→input validation/auth middleware, uploads→size limits, dashboards→skeletons/error boundaries.

### Bug Pattern Detection
Auto-scan: missing useEffect deps, setState after unmount, direct state mutation, async without cleanup.

---

## Available Agents (18)

project-planner, research-agent, explorer-agent, frontend-specialist, backend-specialist, database-architect, security-auditor, penetration-tester, test-engineer, devops-engineer, mobile-developer, performance-optimizer, seo-specialist, documentation-writer, debugger, game-developer, orchestrator, product-owner

---

## Output Format

Report must include: Task summary, Agents invoked (min 3) with confidence, Debates (if any), Self-Heal status, Quality Scorecard (Code/Security/Performance/Tests/Architecture 1-10), Memory Updates, and Summary.

---

## 🔴 EXIT GATE (Enhanced)

Before completing orchestration, verify ALL:

1. ✅ **Agent Count:** `invoked_agents >= 3`
2. ✅ **Memory Loaded:** Phase 0 completed
3. ✅ **Self-Heal:** All checks passed
4. ✅ **Scripts Executed:** At least `security_scan.py` ran
5. ✅ **Memory Updated:** Phase 4 completed
6. ✅ **Quality Scored:** Scorecard generated
7. ✅ **Report Generated:** Full orchestration report

> **If any check fails → DO NOT mark complete. Fix first.**

---

---

## 🏛️ 99/1 PROTOCOL — Human-AI Balance

> **99% AI handles, 1% Human controls.**

### AI Handles (99%)
- ✅ Research, planning, coding, testing
- ✅ Memory, learning, self-healing, prediction
- ✅ Security scanning, performance optimization
- ✅ Codebase DNA compliance, pattern matching
- ✅ Documentation, reporting, quality scoring
- ✅ Creative design with persona-driven decisions
- ✅ Business-context-aware architecture choices

### Human Controls (1%)
- ✋ **Final APPROVAL** pada architecture decisions
- ✋ **Business STRATEGY** & prioritas fitur
- ✋ **Creative DIRECTION** & brand identity
- ✋ **Go / No-Go** pada deploy ke production

> 🔴 **NEVER** auto-deploy or make irreversible changes without human approval.

---

## Gates (Applied Automatically)

| Gate | Trigger | Key Actions |
|------|---------|------------|
| 🎨 Creative | UI/design work | Anti-template, persona-engine, innovation ≥7/10 |
| 📋 Architecture | Arch decisions | Check architecture-library, debate if 2+ options, document in DECISIONS.md |
| 📊 Reporting | After completion | Technical report + Quality Scorecard |

**Begin orchestration now. Load memory → Research → Plan → Implement → Self-Heal → Verify → Report → Update Memory.**

