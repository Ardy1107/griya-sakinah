# React 19 & Next.js 15 — Best Practices 2025-2026

## Summary
React 19 (stable Dec 2024) and Next.js 15 (stable Oct 2024) bring major changes: Server Components by default, Actions API, concurrent rendering, revised caching, and Turbopack.

## React 19 — Key Changes

### New APIs & Hooks
- **Actions** — async functions in transitions for data mutations, auto-manages pending/error/optimistic states
- **`useActionState`** — manages form action state
- **`useOptimistic`** — instant UI feedback before server confirms
- **`use` hook** — read Promises/context directly in render
- **`<Activity />`** — pre-render hidden parts of app for faster navigation
- **`useEffectEvent`** — separate event logic from effects

### Defaults Changed
- Concurrent rendering is **default** (non-blocking)
- Automatic batching extended to promises, setTimeout, native events
- Server Components are **stable** (not experimental)
- Streaming SSR optimized

### Best Practices
- ✅ Use Server Components for data-heavy logic (reduces client JS)
- ✅ Use `use` hook for async data in render
- ✅ Use Actions + `useActionState` for forms (replaces manual useState)
- ✅ Use Suspense boundaries with skeleton loaders
- ✅ TypeScript for all new hooks
- ❌ Don't use `useEffect` for data fetching — use Server Components or `use`
- ❌ Don't use `useMemo`/`useCallback` everywhere — React Compiler coming

## Next.js 15 — Key Changes

### Breaking Changes
- **Async Request APIs** — `headers()`, `cookies()`, `params`, `searchParams` are now async
- **Caching off by default** — `fetch` uses `no-store`, opt-IN to caching (was opt-out)
- **Turbopack stable** — default dev bundler, much faster

### New Features
- Server Actions **stable** (no more experimental flag)
- `next/form` — enhanced forms with client-side navigation
- `instrumentation.js` — server lifecycle observability
- ESLint 9 support
- Better hydration error messages
- `@next/codemod` CLI for migrations

### Best Practices
- ✅ App Router (not Pages) — future-proof
- ✅ Server Components by default, `"use client"` only when needed
- ✅ Server Actions for form handling (no separate API routes)
- ✅ Explicit caching with `revalidateTag()` for granular control
- ✅ Edge deployment for latency-sensitive routes
- ❌ Don't mark everything `"use client"` — increases bundle
- ❌ Don't rely on default caching — explicitly configure

## Gotchas & Pitfalls
- ⚠️ `headers()` is now ASYNC in Next.js 15 — add `await`
- ⚠️ `fetch` no longer cached by default — add `cache: 'force-cache'` if needed
- ⚠️ React Compiler is NOT stable yet — don't remove manual memos yet
- ⚠️ `params` and `searchParams` are now Promises — must await

## Date Researched: 2026-03-17
## Sources: react.dev, nextjs.org, dev.to, medium.com
