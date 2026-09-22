# DaisyUI v5 + Tailwind CSS v4 — Best Practices 2025

## Summary
DaisyUI v5 = semantic component library on Tailwind v4. CSS-first config, 30+ themes, 61% smaller. Key: use semantic colors, `@plugin "daisyui"` in CSS, Theme Generator.

## Setup (Tailwind v4 + DaisyUI v5)
```css
/* index.css — THAT'S IT! */
@import "tailwindcss";
@plugin "daisyui";
```
- No `tailwind.config.js` needed
- No `plugins: [require('daisyui')]` 
- Automatic content detection

## Custom Theme
```css
@plugin "daisyui" {
  themes: light --default, dark --prefersdark, 
    mytheme {
      primary: oklch(0.7 0.15 200);
      secondary: oklch(0.6 0.12 280);
      accent: oklch(0.8 0.2 90);
      neutral: oklch(0.3 0.02 260);
      base-100: oklch(0.98 0 0);
    };
}
```

## Component Patterns
```html
<!-- Button variants -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-outline btn-sm">Small Outline</button>

<!-- Card -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Content</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>

<!-- Modal -->
<dialog id="my_modal" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Hello!</h3>
    <p>Content here</p>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<!-- Drawer (Sidebar) -->
<div class="drawer lg:drawer-open">
  <input id="sidebar" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">Main content</div>
  <div class="drawer-side">
    <label for="sidebar" class="drawer-overlay"></label>
    <ul class="menu bg-base-200 w-80 p-4">
      <li><a>Menu 1</a></li>
    </ul>
  </div>
</div>
```

## v5 Breaking Changes (from v4)
| v4 | v5 |
|----|----|
| `btm-nav` | `dock` |
| `menu-title` | Changed structure |
| JS config `plugins: []` | CSS `@plugin "daisyui"` |
| Theme in config | Theme in CSS |

## Best Practices
- ✅ Use semantic colors: `btn-primary`, `bg-base-100` (theme-aware)
- ✅ Use DaisyUI modifier system for variants
- ✅ Theme Generator for creating custom themes
- ✅ 30+ built-in themes — try before custom
- ❌ Don't override DaisyUI classes with raw Tailwind
- ❌ Don't use `bg-blue-500` — use `bg-primary` (respects theme)
- ❌ Don't mix DaisyUI v4 and v5 syntax

## Date: 2026-03-17 | Sources: daisyui.com, builder.io, logrocket.com
