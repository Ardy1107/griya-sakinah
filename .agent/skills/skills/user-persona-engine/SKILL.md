---
name: user-persona-engine
description: "Design decisions driven by user personas, not templates. Understands user psychology, behavior patterns, and optimizes UX for real human needs."
version: 1.0.0
---

# User Persona Engine

> **Purpose:** Every UI/UX decision must be linked to a specific user persona.

## Protocol

### Before ANY UI Decision

```
1. READ docs/BUSINESS_CONTEXT.md → Load personas
2. IDENTIFY which persona this feature serves
3. DESIGN for that persona's tech level & needs
4. VALIDATE: "Would Persona X understand this in 3 seconds?"
```

---

## Persona-Driven Design Rules

### Low-Tech Users (Admin Staff, Leadership)
| Rule | Why |
|------|-----|
| Large touch targets (min 44x44px) | May use touchscreen |
| Max 3 actions per screen | Reduce cognitive overload |
| Clear labels (no icons-only) | No guessing what buttons do |
| Confirmation dialogs for destructive actions | Prevent accidents |
| Default values pre-filled | Reduce typing |
| Inline validation (instant feedback) | Know immediately if wrong |

### Power Users (Developers, Super Admins)
| Rule | Why |
|------|-----|
| Keyboard shortcuts | Speed |
| Bulk actions | Efficiency |
| Advanced filters | Find data fast |
| Dark mode option | Extended use comfort |
| Density toggle (compact/comfortable) | More data per screen |

### Public Users (Mobile, Slow Connection)
| Rule | Why |
|------|-----|
| < 100KB initial bundle | 3G connections |
| Skeleton loading states | Perceived performance |
| Offline-capable core features | Connection drops |
| Progressive image loading | Save bandwidth |
| Simple language (no jargon) | Diverse literacy levels |

---

## Psychology-Based UX Patterns

| Principle | Application | Impact |
|-----------|-------------|--------|
| **Hick's Law** | Fewer choices → faster decisions | Limit menu items to 5-7 |
| **Fitts's Law** | Bigger + closer = easier to click | Important buttons = large |
| **Jakob's Law** | Users prefer familiar patterns | Don't innovate on core navigation |
| **Miller's Rule** | 7±2 items in working memory | Chunk information in groups |
| **Von Restorff** | Different items stand out | Highlight CTAs with contrast |
| **Zeigarnik Effect** | Incomplete tasks create tension | Progress bars increase completion |
| **Serial Position** | First & last items remembered most | Put key actions at top & bottom |

---

## Validation Checklist

Before marking any UI task complete:

- [ ] Can Persona 1 (admin) complete the task in < 30 seconds?
- [ ] Can Persona 2 (pimpinan) understand the data at a glance?
- [ ] Does it work on Persona 3's slow 3G mobile?
- [ ] Is the text readable without zooming?
- [ ] Are error messages helpful (not technical)?
- [ ] Is there a clear path back / undo?
