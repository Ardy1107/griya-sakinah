# Known Issues & Solutions
> Bugs found and fixed. AI checks here to avoid repeating mistakes.
---

## PowerShell `&&` Operator Not Supported
- **Symptom:** `git add -A && git status` fails with "token '&&' is not a valid statement separator"
- **Root Cause:** PowerShell uses `;` not `&&` for chaining commands
- **Fix:** Use `git add -A; git status` instead
- **Prevention:** Always use `;` in PowerShell, `&&` only in bash/cmd

## Workflow File Size Limit (Antigravity IDE)
- **Symptom:** Red border around file content in IDE
- **Root Cause:** Antigravity IDE has 12000 character limit for workflow files
- **Fix:** Condense verbose sections, use tables instead of lists
- **Prevention:** Check file size after edits with `(Get-Content file -Raw).Length`

## Git Config Missing on Fresh Clone
- **Symptom:** `fatal: unable to auto-detect email address` on first commit
- **Root Cause:** No git user.email/name configured
- **Fix:** `git config user.email "..."; git config user.name "..."`
- **Prevention:** Add git config setup to new project workflow

---
<!-- NEW ISSUES GO ABOVE THIS LINE -->
