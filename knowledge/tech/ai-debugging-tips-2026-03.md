# AI IDE Debugging — Tips & Tricks 2025

## Summary
AI coding tools (Cursor, Copilot, Claude Code, Antigravity) are powerful but require strategy. Key: clear prompts, verify fixes, time-box AI effort, maintain debugging fundamentals.

## AI Debugging Strategy

### The 7 Rules

1. **AI = Assistant, NOT Replacement**
   - AI recognizes patterns but misses nuanced context
   - Always review AI suggestions critically
   - Don't let AI erode your debugging skills

2. **Craft Explicit Prompts**
   ```
   BAD:  "fix this bug"
   GOOD: "The login form on /auth/login throws 'Cannot read properties 
         of undefined (reading email)' when submitting with empty fields.
         Expected: show validation error. Actual: crashes.
         Stack trace: [paste]. I've tried adding null checks but the 
         error persists."
   ```
   Include: error message, expected vs actual, what you tried, stack trace

3. **Iterate, Don't Accept Blindly**
   - First fix wrong? Refine prompt with more context
   - Ask "why does this fix work?" to understand root cause
   - Never apply a fix you don't understand

4. **Verify Every Fix**
   ```
   After AI fix → Run tests → Check diff → Lint → Manual test
   ```
   - AI can introduce NEW bugs while fixing old ones
   - Always check the full diff, not just the changed function

5. **Time-Box AI Effort**
   - 3 attempts with AI → no progress? → Switch to manual debugging
   - Sometimes console.log + breakpoints > AI suggestion

6. **Rebuild vs Patch**
   - If AI keeps patching the same code → the code is fundamentally wrong
   - Fresh rewrite with clear spec > multiple AI patches

7. **Commit Before AI Changes**
   - `git commit -m "checkpoint: before AI fix attempt"`
   - If AI makes it worse → easy revert

## Effective AI Prompts for Debugging

### Template 1: Error Bug
```
Error: [exact error message]
File: [path]
Line: [number]
Expected behavior: [what should happen]
Actual behavior: [what happens instead]
Stack trace: [paste]
Already tried: [what you attempted]
```

### Template 2: Logic Bug
```
Function: [name] in [file]
Input: [example input]
Expected output: [what it should return]
Actual output: [what it returns]
I believe the issue is in [specific area]
```

### Template 3: Performance Bug
```
Page/Component: [name]
Issue: [slow render / high memory / network waterfall]
Metrics: [load time / re-render count / bundle size]
DevTools showed: [what profiler revealed]
```

## Antigravity / IDE-Specific Tips

### Maximize AI Effectiveness
- **Reference files**: Use `@[filepath]` to give AI context
- **Small scope**: Ask about ONE problem at a time
- **Show don't tell**: Paste error output, screenshots
- **Use workflows**: `/debug` for systematic approach
- **Sequential not parallel**: Fix bug → verify → next bug (not all at once)

### Common AI Debugging Mistakes
| Mistake | Solution |
|---------|----------|
| Accepting first suggestion | Always verify with tests |
| Too vague prompt | Include error, expected, actual |
| Asking AI to fix entire file | Focus on specific function |
| Not committing before fix | Always checkpoint |
| Ignoring AI explanation | Ask WHY, not just WHAT |
| Multiple bugs at once | One bug at a time |

## Self-Healing Protocol (For SuperAI)
```
When error detected:
1. Read FULL error message (not just first line)
2. Check KNOWN_ISSUES.md — seen before?
3. If yes → apply known fix
4. If no → analyze root cause
5. Apply fix → test → verify
6. Log to KNOWN_ISSUES.md for future prevention
7. Max 3 heal cycles per issue
```

## Date Researched: 2026-03-17
## Sources: neon.com, debugg.ai, dev.to, medium.com
