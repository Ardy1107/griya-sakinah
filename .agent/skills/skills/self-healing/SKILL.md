---
name: self-healing
description: "Auto-detect and fix code issues without user intervention. Build errors, lint failures, type errors, and test regressions are caught and fixed automatically. Max 3 heal cycles."
version: 1.0.0
---

# Self-Healing Code Protocol

> **Purpose:** Automatically detect and fix issues after every implementation, before user notices.

## When to Trigger

- After EVERY code change by any agent
- After file creation/modification
- Before marking any task as complete

---

## Healing Pipeline

### Cycle (Max 3 attempts per issue)

```
CODE CHANGE → Check 1: Build → Check 2: Lint → Check 3: Types → Check 4: Tests
                 ↓ fail          ↓ fail          ↓ fail           ↓ fail
              Auto-fix →      Auto-fix →      Auto-fix →      Auto-fix →
              Re-check        Re-check        Re-check        Re-check
```

### Check Priority

| Priority | Check | Command | Auto-Fix Strategy |
|:--------:|-------|---------|-------------------|
| P0 | **Build** | `npm run build` | Analyze error → fix import/syntax → rebuild |
| P1 | **Lint** | `npm run lint` | Run `npm run lint -- --fix` → manual fix remaining |
| P2 | **Types** | `npx tsc --noEmit` | Analyze type mismatch → fix type annotations |
| P3 | **Tests** | `npm test` | Analyze failure → fix regression → re-test |

---

## Auto-Fix Strategies

### Build Errors
| Error Pattern | Auto-Fix |
|---------------|----------|
| `Module not found` | Fix import path |
| `Unexpected token` | Fix syntax error |
| `Cannot find name` | Add import or declare variable |
| `is not a function` | Fix function call/import |

### Lint Errors
| Error Pattern | Auto-Fix |
|---------------|----------|
| `no-unused-vars` | Remove unused variable |
| `prefer-const` | Change `let` to `const` |
| `no-console` | Remove console.log |
| Style errors | Run `--fix` flag |

### Type Errors
| Error Pattern | Auto-Fix |
|---------------|----------|
| `Type X not assignable to Y` | Add type assertion or fix type |
| `Property does not exist` | Add property to interface |
| `Missing return type` | Add return type annotation |

---

## Rules

1. **Max 3 cycles** — if not fixed after 3 attempts → report to user
2. **Never hide failures** — always log what was auto-fixed
3. **Never change business logic** — only fix technical errors
4. **Always log changes** — document what self-heal changed

## Output Format

```markdown
### 🩺 Self-Heal Report
| Check | Status | Auto-Fixed? |
|-------|--------|-------------|
| Build | ✅ Pass | — |
| Lint | ✅ Pass | Fixed 3 issues (no-console, prefer-const) |
| Types | ✅ Pass | — |
| Tests | ⚠️ 1 fail | Could not auto-fix → reported to user |
```
