---
name: anti-hallucination
description: "Strict verification protocol to prevent AI hallucination. Forces AI to verify claims, cite sources, follow ground-truth, and stay on-task. CRITICAL for cross-model knowledge transfer."
version: 1.0.0
skills:
  - session-memory
  - deep-research
---

# 🛡️ Anti-Hallucination Protocol

> **Purpose:** Pastikan AI TIDAK pernah ngarang, halu, atau menyimpang dari tugas.
> **Priority:** P0 — Protocol ini dijalankan SEBELUM semua skill lain.

---

## 🔴 GOLDEN RULES (Wajib Dipatuhi Semua Model)

### Rule 1: JANGAN NGARANG
```
❌ HARAM: Menyebut API, function, library, method yang belum dikonfirmasi exist
✅ WAJIB: Cek ground-truth → cek docs → cek internet → baru klaim
```

### Rule 2: STAY ON TASK
```
❌ HARAM: Disuruh bikin login page, malah refactor seluruh app
❌ HARAM: Disuruh fix bug A, malah "sekalian" ubah arsitektur
✅ WAJIB: Baca ulang task → kerjakan PERSIS yang diminta → TIDAK LEBIH
```

### Rule 3: VERIFY BEFORE CLAIM
```
❌ HARAM: "API ini punya method X" (tanpa verifikasi)
✅ WAJIB: "Berdasarkan [source], API ini punya method X"
```

### Rule 4: GROUND TRUTH WINS
```
Kalau ground-truth (knowledge/ground-truth/) bertentangan dengan
"pengetahuan internal" model → GROUND TRUTH yang MENANG.
```

### Rule 5: UNCERTAINTY = RESEARCH
```
Confidence < 80%? → JANGAN lanjut coding
→ Riset dulu (web search, baca docs, cek GitHub)
→ Simpan hasil ke knowledge/research/
→ Baru lanjut dengan confidence tinggi
```

---

## 📋 Pre-Task Checklist (WAJIB Sebelum Mulai Kerja)

```markdown
Sebelum menulis SATU BARIS CODE pun, jawab:

1. ☐ Apa PERSIS yang diminta user? (copy-paste task)
2. ☐ Apa yang TIDAK diminta? (jangan kerjakan ini)
3. ☐ File mana yang PERLU diubah? (list)
4. ☐ File mana yang TIDAK BOLEH diubah? (list)
5. ☐ Ada ground-truth yang relevan? (cek knowledge/ground-truth/)
6. ☐ Ada keputusan sebelumnya yang relevan? (cek docs/DECISIONS.md)
7. ☐ Ada pattern yang harus diikuti? (cek docs/PATTERNS.md)
```

---

## 🚫 Hallucination Categories & Prevention

### Category 1: API/Library Fabrication
| Signal | Prevention |
|--------|-----------|
| Menyebut method yang "pasti ada" | Cek official docs dulu |
| Import dari package yang "harusnya ada" | Verify package exists di npm/pypi |
| "Library X support feature Y" | Cek changelog/docs |

### Category 2: Task Drift (UTAMA — Masalah Gemini)
| Signal | Prevention |
|--------|-----------|
| "Sekalian saya juga..." | STOP. Baca ulang task. |
| Mengubah file yang tidak diminta | STOP. List file yang diminta saja. |
| Menambah fitur yang tidak diminta | STOP. Fitur = yang diminta saja. |
| Refactor tanpa diminta | STOP. Hanya kalau diminta refactor. |

### Category 3: Context Amnesia
| Signal | Prevention |
|--------|-----------|
| Lupa apa yang dikerjakan session lalu | Baca docs/TASK_QUEUE.md + MODEL_BRIDGE.md |
| Buat keputusan yang sudah dibuat | Baca docs/DECISIONS.md |
| Ulangi bug yang sudah difix | Baca docs/KNOWN_ISSUES.md |

### Category 4: Confidence Bluffing
| Signal | Prevention |
|--------|-----------|
| "Pasti bisa" tapi gak pernah test | WAJIB test/verify dulu |
| Code yang "seharusnya works" tapi gak dirun | WAJIB run command |
| "Saya yakin" tanpa bukti | Ganti: "Berdasarkan [source]..." |

---

## 🎯 Task Adherence Protocol

```
SETIAP KALI mau menulis code, BACA ULANG:

1. Task asli user (exact words)
2. Scope yang sudah disepakati
3. File list yang disetujui

Kalau yang mau dikerjakan TIDAK ADA di scope:
→ STOP
→ Tanya user: "Ini di luar scope. Mau saya tambahkan?"
→ Baru lanjut kalau disetujui
```

---

## 🔄 Continuous Verification Loop

```
START TASK
  → Read task description (exact)
  → Check ground-truth files
  → Check existing decisions
  ↓
DURING TASK
  → Every 3 file changes: re-read task → am I still on track?
  → Every new claim: do I have a source?
  → Every uncertainty: research first, code later
  ↓
END TASK
  → Compare output vs original task
  → Did I do EXACTLY what was asked?
  → Did I add anything NOT asked? → Remove it
  → Update ground-truth if new facts confirmed
```

---

## ⚙️ Model-Specific Patches

### Gemini 3.1 Pro — Known Issues
| Issue | Patch |
|-------|-------|
| Task drift — does different thing than asked | DOUBLE-READ task before starting |
| Invents APIs that don't exist | Ground-truth check mandatory |
| Forgets session context | Read MODEL_BRIDGE.md + TASK_QUEUE.md |
| Over-enthusiastic refactoring | Strict scope adherence |
| Confident about wrong things | Uncertainty = research first |

### All Models — Universal Patches
| Issue | Patch |
|-------|-------|
| Outdated knowledge cutoff | Research internet for latest info |
| Pattern mismatch with codebase | Read CODE_DNA.json first |
| Architectural re-decisions | Read DECISIONS.md first |
