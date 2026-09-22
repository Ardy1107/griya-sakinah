# Tailwind CSS v4 — New Features & Migration Guide

## Summary
Tailwind CSS v4.0 (released Jan 22, 2025) is a complete rewrite. CSS-first config replaces tailwind.config.js. 5x faster builds. Modern CSS features (cascade layers, container queries, P3 colors).

## Breaking Changes from v3

### 1. No More tailwind.config.js
```css
/* v4: Configure in CSS, not JavaScript! */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.7 0.15 220);
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 1920px;
}
```
- ❌ OLD: `tailwind.config.js` → `module.exports = { theme: { extend: { ... } } }`
- ✅ NEW: `@theme { }` directive in CSS

### 2. Installation Simplified
```bash
# v4 install — much simpler
npm install tailwindcss @tailwindcss/vite

# In your CSS file - THAT'S IT
@import "tailwindcss";
```
- No PostCSS config needed for Vite projects
- Automatic content detection (no manual content paths)

### 3. Design Tokens as CSS Variables
```css
/* All theme values are native CSS variables */
@theme {
  --color-brand: oklch(0.65 0.2 260);
  --spacing-18: 4.5rem;
}

/* Accessible anywhere! */
.custom-element {
  color: var(--color-brand);
  padding: var(--spacing-18);
}
```

## New Features

### Container Queries (Built-in!)
```html
<!-- No plugin needed! -->
<div class="@container">
  <div class="@sm:flex @lg:grid @lg:grid-cols-3">
    Responds to CONTAINER size, not viewport
  </div>
</div>
```

### 3D Transforms
```html
<div class="rotate-x-45 rotate-y-30 perspective-800">
  3D transformed element
</div>
```

### Gradient Improvements
```html
<!-- Radial and conic gradients -->
<div class="bg-radial-[at_25%_25%] from-white to-blue-500">
<div class="bg-conic from-red-500 via-yellow-500 to-green-500">
```

### Color Opacity with color-mix()
```html
<!-- Works with ANY color, including custom -->
<div class="bg-[color-mix(in_oklch,var(--color-brand),transparent_50%)]">
```

### Starting Style (Entry Animations)
```html
<!-- Animate elements when they first appear -->
<div class="starting:opacity-0 starting:scale-95 transition-all">
  Fades and scales in on mount
</div>
```

### P3 Wide-Gamut Colors
- Default palette now uses more vivid P3 colors
- `oklch()` color space for better perceptual uniformity

## Performance
- 5x faster **full builds**
- 100x faster **incremental builds**
- New engine written from scratch
- First-party Vite plugin for optimal integration

## Migration from v3

### Key Changes
| v3 | v4 |
|----|----|
| `tailwind.config.js` | `@theme { }` in CSS |
| `content: ['./src/**']` | Auto-detected |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| PostCSS required | Vite plugin preferred |
| `theme.extend.colors` | `--color-*` CSS variables |
| Container queries plugin | Built-in `@container` |

### Migration Tool
```bash
npx @tailwindcss/upgrade
```

## Gotchas
- ⚠️ `tailwind.config.js` still works but is LEGACY — migrate to CSS
- ⚠️ Some plugins may not be compatible yet
- ⚠️ Color values changed (P3) — check existing designs
- ⚠️ PostCSS setup is different — prefer Vite plugin

## Date Researched: 2026-03-17
## Sources: tailwindcss.com, laravel-news.com, logrocket.com
