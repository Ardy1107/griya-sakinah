---
description: "Deep learning session — research a topic from internet and save to knowledge base. Usage: /learn [topic]"
---

# /learn — Deep Learning Session

> **Purpose:** AI riset topik dari internet, distill jadi knowledge, simpan ke knowledge/.
> **Usage:** `/learn [topic]`

## Workflow

### Step 1: Define Learning Goal
```
Topic: $ARGUMENTS
Goal: Understand best practices, patterns, gotchas
Depth: L3 (Deep Dive — 5-10 sources)
```

### Step 2: Research
```
1. Web search for latest info (2024-2026)
2. Read official documentation
3. Find real-world examples
4. Cross-check minimum 2 sources
```

### Step 3: Distill & Save
```
Save to: knowledge/tech/{topic}-{date}.md

Format:
- Summary (2-3 sentences)
- Key Features/Changes
- Best Practices (DO's)
- Anti-Patterns (DON'Ts)
- Gotchas & Pitfalls
- Code Examples (if applicable)
- Sources with URLs
```

### Step 4: Push to GitHub
```
git add knowledge/
git commit -m "learn: {topic} — by {model}"
git push origin main
```

> 🧠 Every /learn session makes ALL models smarter for ALL future projects!
