---
name: deep-research
description: "Structured internet research protocol. When and how AI researches Google, YouTube, official docs, GitHub. Saves all findings to knowledge/ for future sessions."
version: 1.0.0
skills:
  - session-memory
  - anti-hallucination
---

# 🔬 Deep Research Protocol

> **Purpose:** AI belajar dari internet (Google, YouTube, docs, GitHub) dan simpan hasilnya.
> **Philosophy:** Boros token di awal = investasi. AI yang sudah riset = hemat token di masa depan.

---

## 🔴 KAPAN WAJIB RISET

### Auto-Research Triggers (Otomatis, Tanpa Diminta)
| Trigger | Alasan |
|---------|--------|
| Framework/library yang belum pernah dipakai di project | Biar gak halu soal API-nya |
| Error message yang tidak dikenali | Cari solusi yang proven |
| Confidence < 80% tentang suatu claim | Verifikasi dulu |
| User minta fitur yang complex | Research best practices |
| Arsitektur baru yang belum ada di DECISIONS.md | Riset opsi sebelum decide |
| Library version conflict | Cek compatibility |
| Security-sensitive code (auth, payment) | Riset latest vulnerability |

### Manual Research (Diminta User)
| Trigger | Action |
|---------|--------|
| User bilang "cari dulu" / "riset dulu" | Research mendalam |
| User share link | Baca & extract knowledge |
| User bilang "pelajari X" | Deep dive topic X |

---

## 📊 RESEARCH DEPTH LEVELS

| Level | Kapan | Effort | Simpan Sebagai |
|:-----:|-------|--------|----------------|
| L1: Quick Check | Verify satu fakta | 1-2 web search | Ground-truth entry |
| L2: Standard Research | Pahami framework/tool | 3-5 sources | Knowledge article |
| L3: Deep Dive | Arsitektur/migration besar | 5-10+ sources | Full research doc |

---

## 🔍 RESEARCH PROTOCOL

### Step 1: Define Research Question
```
Sebelum search, tulis JELAS:
- Apa yang mau dicari?
- Kenapa perlu dicari?
- Apa yang sudah diketahui?
```

### Step 2: Source Priority
```
1. 🥇 Official Documentation (PALING DIPERCAYA)
2. 🥈 GitHub Repository (source code = truth)
3. 🥉 Stack Overflow (verified answers)
4. 4️⃣ Tech Blogs (dari known experts)
5. 5️⃣ YouTube (tutorials, conference talks)
6. 6️⃣ Community Forums (Reddit, Discord)
```

### Step 3: Verify & Cross-Check
```
- Satu sumber TIDAK CUKUP
- Minimum 2 sources yang agree
- Kalau sources bertentangan → catat keduanya + reasoning
```

### Step 4: Save to Knowledge Base
```
Setiap research WAJIB disimpan ke knowledge/ folder:

- Quick fact → knowledge/ground-truth/{topic}.md
- Tech learning → knowledge/tech/{topic}-{date}.md  
- Full research → knowledge/research/{topic}-{date}.md
- Proven solution → knowledge/solutions/{problem}-{date}.md
```

---

## 📝 KNOWLEDGE CAPTURE FORMAT

### Quick Fact (Ground Truth)
```markdown
## [Fact Title]
- **Confirmed:** [the fact]
- **Source:** [URL or doc reference]
- **Date Verified:** [date]
- **DO NOT:** [common misconception to avoid]
```

### Tech Learning
```markdown
# [Topic] — Tech Knowledge

## Summary
[2-3 sentence overview]

## Key Findings
- [finding 1]
- [finding 2]

## Code Patterns
[code snippets yang terbukti benar]

## Gotchas & Pitfalls
- ⚠️ [common mistake 1]
- ⚠️ [common mistake 2]

## Sources
- [source 1 URL]
- [source 2 URL]

## Date Researched: [date]
```

### Full Research Doc
```markdown
# Research: [Topic]

## Question
[Apa yang mau dijawab]

## Context
[Kenapa riset ini perlu]

## Findings
### Source 1: [name]
- URL: [url]
- Key points: [...]

### Source 2: [name]
- URL: [url]  
- Key points: [...]

## Conclusion
[Rekomendasi berdasarkan riset]

## Action Items
- [ ] [what to do with this knowledge]

## Date: [date]
```

---

## 💡 TOKEN EFFICIENCY

### Phase 1: Investment (Boros Tapi Perlu)
```
Session awal → riset mendalam → simpan ke knowledge/
Token cost: TINGGI
Value: Membangun knowledge base
```

### Phase 2: Harvest (Hemat)
```
Session berikutnya → baca knowledge/ → TIDAK perlu riset ulang
Token cost: RENDAH (hanya baca file lokal)
Value: AI sudah pintar, langsung kerja
```

### Optimization Rules
1. **Sebelum riset internet** → cek dulu knowledge/ apakah sudah ada
2. **Kalau sudah ada** → pakai langsung, skip internet
3. **Kalau sudah ada tapi outdated** (>6 bulan) → update research
4. **Simpan summary, bukan copy-paste** → hemat storage & token baca

---

## 🔄 KNOWLEDGE LIFECYCLE

```
DISCOVER → Research & collect
VERIFY   → Cross-check minimum 2 sources
SAVE     → Store in knowledge/{category}/
APPLY    → Use in actual code
REVIEW   → Validasi apakah masih akurat (per 6 bulan)
UPDATE   → Refresh kalau outdated
```
