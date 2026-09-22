# 🔒 Ground Truth — Anti-Hallucination Facts

> **LOCKED FACTS.** Semua AI model WAJIB baca file-file di sini SEBELUM menjawab.
> Fakta di sini TIDAK BOLEH di-override oleh model hallucination.

## Format Entry

```markdown
## [Topic]
- **Confirmed:** [fact]
- **Source:** [where this was verified]
- **Date Verified:** [date]
- **DO NOT:** [common hallucination to avoid]
```

## Rules
1. Hanya facts yang TERKONFIRMASI boleh masuk sini
2. Setiap fact harus punya SOURCE
3. Model WAJIB prioritaskan ground-truth di atas "pengetahuan internal"
4. Kalau ground-truth bertentangan dengan model knowledge → ground-truth MENANG
