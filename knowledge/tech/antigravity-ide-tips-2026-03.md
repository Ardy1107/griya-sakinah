# Antigravity IDE — Tips, Tricks & Best Practices

## Summary
Antigravity is an AI-powered IDE supporting multiple models (Opus 4.6, Gemini 3.1 Pro). Key: use @references, workflows, and structured prompts for best results.

## Essential Tips

### 1. File References (@mentions)
```
@[path/to/file.ts]          → Give AI context of specific file
@[path/to/folder/]          → Reference entire folder  
@[workflow.md]              → Activate specific workflow
```
- **ALWAYS** reference relevant files — AI performs 10x better with context
- Reference error logs, config files, and the file you want edited

### 2. Workflow Commands (Slash Commands)
| Command | Purpose |
|---------|---------|
| `/orchestrate` | Full multi-agent workflow |
| `/debug` | Systematic bug fixing |
| `/plan` | Create project plan (no code) |
| `/create` | New application builder |
| `/learn [topic]` | Research & store knowledge |
| `/save-brain` | Push knowledge to GitHub |
| `/update-brain` | Update AI intelligence from repo |
| `/test` | Generate and run tests |
| `/deploy` | Production deployment |

### 3. Model Selection Strategy
| Task | Best Model | Why |
|------|-----------|-----|
| Complex architecture | Opus 4.6 | Deep reasoning, nuanced decisions |
| Quick code edits | Gemini 3.1 Pro | Fast, good enough for simple tasks |
| Research/learning | Opus 4.6 | Better at synthesizing information |
| Debugging | Either | Both good with clear prompts |
| Bulk file edits | Opus 4.6 | Better at tracking multiple files |

### 4. Structured Prompts (Better Results)
```
BAD:  "fix the login"
GOOD: "The login form in @[src/auth/Login.tsx] throws a type error 
       on line 45. The error is: [paste error]. 
       Expected: form submits successfully. 
       Please fix while keeping the existing validation logic."
```

### 5. File Size Limits
- Workflow files: **12000 characters max** (red border = exceeded)
- Check size: `(Get-Content file.md -Raw).Length`
- Solution: Use tables instead of verbose lists

### 6. Session Continuity
- AI loses context between sessions (new chat = fresh start)
- Use `docs/` files to preserve decisions across sessions
- `/save-brain` at end of session to preserve learnings
- Start new sessions with: "Read docs/MODEL_BRIDGE.md first"

### 7. PowerShell Gotchas
```powershell
# ❌ WRONG (bash syntax)
git add -A && git commit -m "msg"

# ✅ RIGHT (PowerShell)
git add -A; git commit -m "msg"
```

### 8. Efficient Debugging Flow
1. Show AI the EXACT error (copy full output)
2. Reference the file: `@[path/to/file]`  
3. Describe what you expected vs what happened
4. Let AI fix → verify → commit
5. One bug at a time, never batch

### 9. Knowledge Accumulation
```
Every session:
1. AI learns from work done
2. Saves to docs/ and knowledge/
3. `/save-brain` pushes to GitHub
4. Next session = smarter AI

New project:
1. Clone SuperAI repo
2. Copy .agent/ + docs/ + knowledge/
3. AI starts with accumulated intelligence
```

### 10. Agent System
- AI auto-selects the best agent for your task
- Override with `@[agent-name]` if needed
- Available: frontend-specialist, backend-specialist, mobile-developer, debugger, etc.

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Red border on file | File >12000 chars, condense it |
| AI does wrong thing | Be more specific, reference exact file |
| AI hallucinates API | Check GROUND_TRUTH.md, ask AI to verify |
| Lost context | Start with "Read docs/MODEL_BRIDGE.md" |
| Slow response | Break task into smaller pieces |
| Git push fails | Set git config user.email and user.name |

## Date Researched: 2026-03-17
## Sources: Direct experience, neon.com, medium.com
