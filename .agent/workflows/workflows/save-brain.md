---
description: "Auto-save knowledge and push to GitHub after every session. Ensures AI intelligence accumulates across projects."
---

# Knowledge Auto-Save & Push

> **Purpose:** Setiap kali AI belajar sesuatu (dari Opus, Gemini, atau model apapun),
> hasilnya OTOMATIS disimpan dan di-push ke GitHub SuperAI repo.
> Ini memastikan "kepintaran" terakumulasi dan bisa dipakai di project baru manapun.

## When to Trigger

**SETIAP AKHIR SESSION yang menghasilkan knowledge baru:**
- Setelah `/orchestrate` selesai
- Setelah riset internet (deep-research)
- Setelah fix bug yang teaching
- Setelah architectural decision
- Setelah menemukan pattern baru
- Ketika user bilang "simpan", "push", "save"

## Workflow

### Step 1: Identify What Changed
```
Cek apakah ada perubahan di:
- docs/*.md (decisions, patterns, issues, ground-truth, dll)
- knowledge/**/* (tech, research, solutions, ground-truth)  
- .agent/skills/**/* (skill baru atau updated)
- .agent/workflows/**/* (workflow baru atau updated)
```

### Step 2: Commit dengan Descriptive Message
```bash
cd [SuperAI repo root]
git add docs/ knowledge/ .agent/
git commit -m "brain: [summary of what was learned]

- Model: [opus-4.6 / gemini-3.1-pro]
- Session: [date]
- New knowledge: [brief list]"
```

### Step 3: Push to GitHub
```bash
git push origin main
```

### Step 4: Confirm to User
```
✅ Knowledge saved & pushed!
- [X] new entries in docs/
- [X] new files in knowledge/
- Ready to clone for new projects
```

## New Project Setup (Using Accumulated Knowledge)

Ketika user mau project baru dengan kepintaran yang sudah terkumpul:

```bash
# Clone SuperAI brain ke project baru
git clone https://github.com/Ardy1107/SuperAI.git temp-brain

# Copy brain ke project
xcopy temp-brain\.agent YOUR_PROJECT\.agent\ /E /I /Y
xcopy temp-brain\docs YOUR_PROJECT\docs\ /E /I /Y
xcopy temp-brain\knowledge YOUR_PROJECT\knowledge\ /E /I /Y
copy temp-brain\GEMINI.md YOUR_PROJECT\

# Cleanup
rmdir /S /Q temp-brain
```

Sekarang Gemini 3.1 Pro di project baru langsung punya SEMUA kepintaran dari Opus 4.6! 🧠
