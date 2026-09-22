# Common Errors & Solutions — TypeScript + React 2025

## TypeScript Errors

### 1. Over-using `any`
- **Problem:** Bypasses type checking entirely
- **Fix:** Use `unknown` instead, then narrow with type guards
- **Rule:** `any` = LAST RESORT only

### 2. Skipping Strict Mode
- **Problem:** Hides potential errors
- **Fix:** `tsconfig.json` → `"strict": true` always
- **Includes:** `strictNullChecks`, `noImplicitAny`

### 3. Excessive Type Assertions (`as`)
- **Problem:** Masks type issues, runtime errors
- **Fix:** Use type guards and inference instead
- **Rule:** If you need `as`, your types might be wrong

### 4. Missing Return Type Annotations
- **Problem:** Subtle bugs during refactoring
- **Fix:** Always annotate function return types

### 5. Over-engineering Types
- **Problem:** Unreadable deeply nested types
- **Fix:** Use utility types: `Partial`, `Pick`, `Omit`, `Record`

## React Errors

### 1. Direct State Mutation
- **Problem:** React can't detect changes
- **Fix:** Use spread operator or Immer for immutable updates
- **Fix:** Use functional setState: `setState(prev => ({...prev, key: value}))`

### 2. Array Index as Key
- **Problem:** Rendering bugs when list changes
- **Fix:** Use stable unique ID from data, never array index

### 3. Wrong Server/Client Split
- **Problem:** Everything `"use client"` → huge bundles
- **Fix:** Server-first mindset. Only `"use client"` for interactivity
- **Rule:** Data fetching, DB queries → Server Component

### 4. useEffect for Data Fetching
- **Problem:** Client waterfalls, loading spinners everywhere
- **Fix:** Use Server Components or `use` hook (React 19)
- **Fix:** Use Server Actions for mutations

### 5. Missing Error Boundaries
- **Problem:** One error crashes entire app
- **Fix:** Wrap sections in Error Boundaries
- **Fix:** Implement fallback UI for each boundary

### 6. State Explosion (5+ useState)
- **Problem:** Hard to manage, bugs likely
- **Fix:** Group related state into one object
- **Fix:** Use `useReducer` for complex state logic

## Quick Reference
| Error | Signal | Fix |
|-------|--------|-----|
| `any` type | TS bypass | Use `unknown` + guards |
| Strict off | Missing errors | `strict: true` |
| State mutation | No re-render | Spread operator / Immer |
| Index as key | Re-render bugs | Unique ID |
| All `"use client"` | Large bundle | Server-first |
| useEffect fetch | Waterfalls | Server Components |
| No Error Boundary | App crashes | Wrap components |
| 5+ useState | Complex state | useReducer |

## Date Researched: 2026-03-17
## Sources: dev.to, gitconnected.com, medium.com
