---
name: stakeholder-reporting
description: "Generate executive-level reports and progress updates. Non-technical summaries, risk dashboards, and quality metrics for stakeholders."
version: 1.0.0
---

# Stakeholder Reporting Protocol

> **Purpose:** Communicate AI work in language that stakeholders understand.

## Report Levels

| Level | Audience | Detail | Format |
|:-----:|----------|--------|--------|
| L1 | Developer | Full technical | Markdown with code |
| L2 | Tech Lead | High-level technical | Summary + key changes |
| L3 | Manager | Non-technical | Business impact + timeline |
| L4 | Executive | Strategic overview | 3 bullet points max |

---

## Auto-Report Templates

### After Every Orchestration — L2 Report

```markdown
## 📊 Progress Report — [Date]

### ✅ Completed
- [Feature/fix in plain language]

### 📈 Quality Score: X/10
| Metric | Score |
|--------|:-----:|
| Builds cleanly | ✅ |
| Tests passing | ✅ |
| Security scan | ✅ |

### ⚠️ Risks
- [Any identified risks with traffic light]

### 📅 Next Steps
- [What's planned next]
```

### Weekly Summary — L3 Report

```markdown
## 📋 Weekly Summary — Week X

### Achievements
1. [Achievement in business terms]
2. [Achievement in business terms]

### Health Dashboard
| Area | Status |
|------|:------:|
| Performance | 🟢 Good |
| Security | 🟢 Good |
| Code Quality | 🟡 Needs attention |

### Recommendations
- [Business-relevant suggestion]
```

---

## Traffic Light System

| Color | Meaning | Action Required |
|:-----:|---------|-----------------|
| 🟢 Green | On track, no issues | None |
| 🟡 Yellow | Minor issues, monitoring | Awareness |
| 🔴 Red | Critical issue, blocking | Immediate attention |

---

## Communication Rules

1. **NEVER** use jargon with non-technical stakeholders
2. **ALWAYS** translate technical metrics to business impact
3. **ALWAYS** include risks with mitigation plans
4. **ALWAYS** end with actionable next steps
5. **MATCH** user's language (if Indonesian → report in Indonesian)
