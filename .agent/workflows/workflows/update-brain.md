---
description: "Safely update SuperAI brain in existing projects. Pulls latest skills and knowledge from GitHub WITHOUT deleting project-specific memory."
---

# Update Brain — Safe Merge Protocol

> **Purpose:** Update SuperAI di project yang sudah berjalan.
> Dapat kepintaran baru dari project lain, TANPA menghapus memory project ini.

## ⚠️ CRITICAL RULE

```
🔴 NEVER overwrite project-specific files:
   - docs/DECISIONS.md      → project's own decisions
   - docs/PATTERNS.md       → project's own patterns  
   - docs/KNOWN_ISSUES.md   → project's own bugs
   - docs/TASK_QUEUE.md     → project's active tasks
   - docs/CODE_DNA.json     → project's conventions
   - docs/QUALITY_HISTORY.md → project's quality log
   - docs/BUSINESS_CONTEXT.md → project's business info
   
🟢 SAFE to overwrite (these are generic, not project-specific):
   - .agent/skills/**       → skills are universal
   - .agent/agents/**       → agents are universal
   - .agent/workflows/**    → workflows are universal  
   - .agent/ARCHITECTURE.md → system architecture
   - GEMINI.md              → entry point rules

🟡 MERGE (append new, keep existing):
   - docs/GROUND_TRUTH.md   → append new facts
   - docs/MODEL_BRIDGE.md   → update system info, keep project info
   - knowledge/**           → append new knowledge files
```

## Workflow

### Step 1: Backup Project Memory
```powershell
# Create backup of project-specific files
$projectDir = "."
$backupDir = ".brain-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force
Copy-Item "$projectDir\docs\*" "$backupDir\docs\" -Recurse -Force
if (Test-Path "$projectDir\knowledge") {
    Copy-Item "$projectDir\knowledge\*" "$backupDir\knowledge\" -Recurse -Force
}
Write-Host "✅ Backup created at $backupDir"
```

### Step 2: Clone Latest SuperAI
```powershell
git clone https://github.com/Ardy1107/SuperAI.git .temp-superai-update
```

### Step 3: Safe Update — Overwrite Generic Files
```powershell
# Overwrite skills, agents, workflows (these are universal)
xcopy .temp-superai-update\.agent\skills $projectDir\.agent\skills\ /E /I /Y
xcopy .temp-superai-update\.agent\agents $projectDir\.agent\agents\ /E /I /Y
xcopy .temp-superai-update\.agent\workflows $projectDir\.agent\workflows\ /E /I /Y
copy .temp-superai-update\.agent\ARCHITECTURE.md $projectDir\.agent\ /Y
copy .temp-superai-update\GEMINI.md $projectDir\ /Y
```

### Step 4: Smart Merge — Knowledge (Append Only)
```
For each file in .temp-superai-update/knowledge/**:
  IF file does NOT exist in project → COPY it (new knowledge!)
  IF file ALREADY exists in project → SKIP it (project has its own version)
```

```powershell
# Copy new knowledge files without overwriting existing ones
xcopy .temp-superai-update\knowledge $projectDir\knowledge\ /E /I /D
# /D flag = only copy if source is newer, but we also check manually
```

### Step 5: Smart Merge — Ground Truth (Append New Facts)
```
For docs/GROUND_TRUTH.md:
  1. Read project's GROUND_TRUTH.md (has project-specific facts)
  2. Read SuperAI's GROUND_TRUTH.md (has new general facts)
  3. Append any NEW sections from SuperAI that don't exist in project
  4. KEEP all project-specific sections unchanged
```

### Step 6: Cleanup
```powershell
Remove-Item .temp-superai-update -Recurse -Force
Write-Host "✅ SuperAI updated! Project memory preserved."
Write-Host "📁 Backup at: $backupDir (delete when confirmed OK)"
```

### Step 7: Verify
```
After update, check:
1. ✅ docs/DECISIONS.md → still has project decisions? 
2. ✅ docs/PATTERNS.md → still has project patterns?
3. ✅ docs/TASK_QUEUE.md → still has project tasks?
4. ✅ .agent/skills/ → has latest skills?
5. ✅ knowledge/ → has both project + new knowledge?
```

## Quick Summary

| What | Action | Why |
|------|--------|-----|
| Skills, Agents, Workflows | **OVERWRITE** | Universal, same for all projects |
| GEMINI.md, ARCHITECTURE.md | **OVERWRITE** | System config, same for all |
| docs/ memory files | **KEEP** project version | Project-specific learnings |
| knowledge/ | **APPEND** new files only | Don't lose existing, add new |
| GROUND_TRUTH.md | **MERGE** | Keep project facts + add new general facts |
