---
name: code-dna
description: "Fingerprint codebase conventions and enforce consistency. Auto-scan project to detect naming, structure, styling, and pattern preferences. All new code MUST match the DNA."
version: 1.0.0
---

# Code DNA Fingerprinting

> **Purpose:** Understand the "personality" of a codebase and ensure all new code matches it perfectly.

## When to Use

- **Session start** — Scan codebase to build/load DNA profile
- **Before coding** — Load DNA profile to follow conventions
- **After major changes** — Re-scan to update DNA

---

## DNA Traits to Detect

### 1. Naming Conventions
| Trait | Detect From | Example |
|-------|-------------|---------|
| Variables | Source files | `camelCase` vs `snake_case` |
| Components | Component files | `PascalCase` |
| Files | File names | `kebab-case.jsx` vs `PascalCase.jsx` |
| CSS Classes | Stylesheets | `kebab-case` vs `camelCase` |
| Constants | Config files | `UPPER_SNAKE_CASE` |

### 2. File Structure
| Trait | Detect From |
|-------|-------------|
| Organization | `src/` folder structure (feature-based vs type-based) |
| Co-location | Do CSS/test files sit next to components? |
| Index files | Are barrel exports used? |
| Path aliases | `@/` vs `../../../` |

### 3. Code Patterns
| Trait | Detect From |
|-------|-------------|
| State management | Hooks, Context, Redux, Zustand |
| Styling approach | CSS modules, Tailwind, styled-components |
| API calls | fetch, axios, Supabase client |
| Error handling | try-catch, Result type, error boundaries |
| Component size | Average lines per component |

### 4. Project-Specific
| Trait | Detect From |
|-------|-------------|
| Comment style | JSDoc vs inline vs none |
| Import order | React → libs → local → styles |
| Export style | default vs named exports |
| Prop pattern | Destructured vs props object |

---

## DNA Profile Format

Save to `docs/CODE_DNA.json`:

```json
{
  "scannedAt": "2026-03-17",
  "naming": {
    "variables": "camelCase",
    "components": "PascalCase",
    "files": "PascalCase.jsx",
    "cssFiles": "ComponentName.css",
    "constants": "UPPER_SNAKE_CASE"
  },
  "structure": {
    "organization": "feature-based",
    "pattern": "src/components/features/{feature}/{Component}.jsx",
    "coLocatedCSS": true,
    "coLocatedTests": false,
    "barrelExports": false
  },
  "patterns": {
    "stateManagement": "React hooks + Context",
    "styling": "CSS modules (co-located .css files)",
    "apiClient": "Supabase client",
    "errorHandling": "try-catch with console.error",
    "avgComponentLines": 150,
    "maxComponentLines": 400
  },
  "imports": {
    "order": ["react", "libraries", "components", "hooks", "utils", "styles"],
    "style": "named imports preferred"
  }
}
```

---

## Enforcement Rules

1. **SCAN first** — Run DNA scan before ANY new code
2. **MATCH always** — New code MUST follow detected DNA
3. **FLAG deviations** — If breaking DNA, explain WHY
4. **UPDATE on change** — If user explicitly changes convention, update DNA

> 🔴 **VIOLATION:** Writing code that doesn't match DNA without explicit user approval.
