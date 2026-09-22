---
name: autonomous-task
description: "Autonomous task tracking with auto-resume, progress persistence, and deadline awareness. AI knows what to continue without being told. Full autonomy except destructive (delete) operations."
version: 1.0.0
skills:
  - session-memory
  - anti-hallucination
---

# 🤖 Autonomous Task Tracking

> **Purpose:** AI tahu sendiri apa yang harus dikerjakan, apa lanjutannya, dan kapan deadline-nya.
> **Autonomy Level:** FULL — kecuali operasi DELETE. Semua hal lain boleh auto-proceed.

---

## 🔴 AUTONOMY RULES

### Boleh Auto-Proceed (Tanpa Approval)
- ✅ Buat file baru
- ✅ Edit file existing
- ✅ Install dependencies
- ✅ Run build/lint/test
- ✅ Research internet
- ✅ Fix errors & bugs
- ✅ Update docs/
- ✅ Create branches
- ✅ Refactor (kalau dalam scope task)

### HARUS Minta Approval
- 🛑 **DELETE** file/folder/data
- 🛑 **Deploy** ke production
- 🛑 **Architectural decisions** yang mengubah >10 files
- 🛑 **Breaking changes** yang affect user-facing features
- 🛑 **Database migrations** yang destructive (DROP TABLE, dll)

---

## 📋 Task Queue System

### File: `docs/TASK_QUEUE.md`

AI membaca file ini di SETIAP AWAL SESSION untuk tahu:
1. Apa yang sedang dikerjakan (IN PROGRESS)
2. Apa yang harus dilanjutkan (NEXT)
3. Apa yang sudah selesai (DONE)
4. Apa deadline-nya

### Protocol

```
SESSION START:
  1. Baca docs/TASK_QUEUE.md
  2. Cari task dengan status "IN PROGRESS" atau "NEXT"
  3. Lapor ke user: "Saya lihat ada task [X] yang belum selesai. Mau lanjut?"
  4. Kalau user bilang "lanjut" → langsung kerja tanpa pertanyaan lagi
  5. Kalau user kasih task baru → tambahkan ke queue, kerjakan

SESSION END:
  1. Update status task di TASK_QUEUE.md  
  2. Catat progress (berapa % selesai)
  3. Catat "next steps" supaya session berikutnya tahu lanjutannya
  4. Update docs/ memory files
```

---

## 📊 Task Queue Format

```markdown
# Task Queue

## 🔴 IN PROGRESS
### [Task Title]
- **Priority:** P0/P1/P2
- **Started:** [date]
- **Deadline:** [date or "none"]
- **Progress:** [X]% 
- **Current Step:** [apa yang sedang dikerjakan]
- **Next Steps:** [apa yang harus dilanjutkan]
- **Files Modified:** [list files]
- **Blockers:** [jika ada yang blocking]

## 🟡 NEXT (Queued)
### [Task Title]
- **Priority:** P0/P1/P2
- **Requested:** [date]
- **Deadline:** [date or "none"]
- **Brief:** [1-2 sentence description]

## ✅ DONE (Recent)
### [Task Title]
- **Completed:** [date]
- **Summary:** [apa yang dikerjakan]
- **Quality Score:** [1-10]
```

---

## 🔄 Auto-Resume Protocol

```
Saat session baru dimulai:

1. READ docs/TASK_QUEUE.md
2. IF ada "IN PROGRESS" task:
   → Baca "Current Step" dan "Next Steps"
   → Resume PERSIS dari posisi terakhir
   → Jangan mulai dari awal
3. IF ada "NEXT" task tapi tidak ada "IN PROGRESS":
   → Tanya user: "Ada [N] task di queue. Mau mulai [highest priority]?"
4. IF queue kosong:
   → Tunggu user kasih task baru
```

---

## ⏰ Deadline Awareness

```
Setiap kali baca TASK_QUEUE.md, cek deadline:

- Deadline < 24 jam → ⚠️ URGENT: Prioritaskan, skip non-essential polish
- Deadline < 3 hari → 🟡 Soon: Focus pada core features dulu
- Deadline > 3 hari → 🟢 Normal: Full quality protocol
- No deadline → 🔵 Relaxed: Take time for best quality
```

---

## 🧠 Context Preservation

### What Gets Saved (Session End)
1. **Task Queue** dengan status terbaru
2. **Decisions** yang dibuat selama session → docs/DECISIONS.md
3. **Patterns** yang berhasil → docs/PATTERNS.md
4. **Bugs** yang ditemukan & difix → docs/KNOWN_ISSUES.md
5. **Research findings** → knowledge/research/
6. **Ground truths** yang terkonfirmasi → knowledge/ground-truth/

### What Gets Loaded (Session Start)
1. **Task Queue** → tahu apa yang harus dikerjakan
2. **All docs/** files → ingat keputusan & patterns
3. **Ground truth** → anti-hallucination
4. **MODEL_BRIDGE.md** → quick context sync

---

## 💾 Auto-Push to GitHub (MANDATORY)

> **SETIAP session end yang menghasilkan knowledge baru → PUSH ke GitHub.**
> Ini memastikan kepintaran Opus 4.6 tersimpan dan bisa dipakai Gemini 3.1 Pro.

```
SESSION END (setelah update semua docs/):
1. git add docs/ knowledge/ .agent/
2. git commit -m "brain: [summary of learnings] — by [model-name]"
3. git push origin main
4. Confirm: "✅ Knowledge saved & pushed to GitHub!"
```

> 🔴 **JANGAN LUPA PUSH.** Knowledge yang tidak di-push = knowledge yang hilang.
> Gunakan workflow `/save-brain` untuk push manual kapan saja.

