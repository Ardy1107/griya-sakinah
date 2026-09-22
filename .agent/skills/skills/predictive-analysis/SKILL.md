---
name: predictive-analysis
description: "Predict issues before they happen. Analyze code patterns, file complexity, and change history to proactively suggest improvements. Level 4 Predictive AI capability."
version: 1.0.0
---

# Predictive Analysis — Level 4 AI

> **Purpose:** Predict problems before they happen. Be 3 steps ahead of the user.

## Proactive Detection Rules

### Code Smell Predictions

| 🚨 Signal Detected | 🔮 Prediction | 🎯 Auto-Action |
|---------------------|---------------|-----------------|
| File >400 lines | God component incoming | Suggest split into smaller components |
| 5+ useState in 1 component | State complexity explosion | Suggest useReducer or custom hook |
| API call without error handling | Runtime crash risk | Auto-add try-catch |
| CSS without media queries | Mobile broken risk | Flag for responsive review |
| Dependency >1 year outdated | Security vulnerability risk | Flag + suggest update |
| console.log in production code | Data leak risk | Auto-remove or flag |
| Inline styles detected | Maintainability risk | Suggest CSS module |
| Deeply nested callbacks (3+) | Callback hell risk | Suggest async/await refactor |
| Duplicated code blocks (3+) | Maintenance nightmare | Suggest extract to utility |
| Missing key prop in .map() | React rendering bug | Auto-add key prop |

---

## Predictive Scoring

After scanning any file, generate a risk score:

```markdown
### 📊 File Risk Assessment: [filename]

| Risk Factor | Score (0-10) | Details |
|-------------|:----------:|---------|
| Complexity | 7 | 12 functions, cyclomatic complexity 15 |
| Size | 6 | 380 lines (threshold: 400) |
| Dependencies | 3 | 5 imports (low coupling) |
| Test Coverage | 8 | No tests found |
| **Overall Risk** | **6.0** | **Medium-High** |

⚠️ Recommendation: Add tests + consider splitting large functions
```

---

## "You Might Need..." Suggestions

### Trigger Conditions

| User Action | AI Suggestion |
|------------|---------------|
| Creates auth component | "You might need: rate limiting, password validation, CSRF protection" |
| Adds form component | "You might need: form validation (Zod), error states, loading states" |
| Creates API endpoint | "You might need: input validation, auth middleware, error handling" |
| Adds file upload | "You might need: file size limit, type validation, virus scan" |
| Creates dashboard | "You might need: loading skeletons, error boundaries, empty states" |
| Adds real-time feature | "You might need: reconnection logic, offline handling, optimistic updates" |

---

## Auto-Suggestions Protocol

```markdown
### When to Suggest (MANDATORY)

After every implementation, scan for:

1. Missing error boundaries near new components
2. Missing loading states on async operations
3. Missing empty states on list components
4. Missing validation on form inputs
5. Missing auth checks on sensitive operations
6. Missing responsive styles on new layouts

### Output Format:
💡 **Proactive Suggestions:**
1. [suggestion] — Risk: [HIGH/MEDIUM/LOW]
2. [suggestion] — Risk: [HIGH/MEDIUM/LOW]

> Apply automatically? (Y/N) or skip if LOW risk
```

---

## Bug Pattern Detection

### Common Patterns to Watch

| Pattern | Bug It Causes | Detection |
|---------|--------------|-----------|
| `useEffect` with missing deps | Stale closure / infinite loop | Scan useEffect dependency arrays |
| `setState` in unmounted component | Memory leak warning | Check cleanup in useEffect |
| Direct state mutation | Silent rendering bugs | Detect `.push()`, `.splice()` on state |
| Async without cleanup | Race conditions | Check for abort controllers |
| String comparison for objects | Always false comparison | Detect `===` on objects/arrays |

---

## Level 3: Autonomous Behaviors

### Zero-Prompt Auto-Planning
```markdown
IF file_changes > 5 files AND no PLAN.md exists:
  → Auto-generate plan suggestion
  → Ask user: "This is a complex change. Want me to create a plan first?"
```

### Auto-Assign Agents
```markdown
IF task involves:
  - Auth code → auto-include security-auditor
  - Database changes → auto-include database-architect
  - UI changes → auto-include frontend-specialist
  - >3 files → auto-include test-engineer
```

### Proactive Refactoring
```markdown
IF component_lines > 400:
  → Flag: "Component is getting large. Suggest splitting?"
IF duplicated_code_blocks >= 3:
  → Flag: "Found 3 similar blocks. Extract to shared utility?"
IF outdated_dependency detected:
  → Flag: "Dependency X has known vulnerability. Update?"
```
