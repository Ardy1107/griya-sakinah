# Full Animated Website — Techniques & Libraries 2025

## Summary
2025 web animation uses GSAP for complex timeline/scroll, Framer Motion for React UI, and CSS for simple transitions. Key trends: scroll-triggered, parallax, kinetic typography, 3D, micro-interactions.

## Library Comparison

| Feature | GSAP | Framer Motion | CSS |
|---------|------|---------------|-----|
| **Complexity** | 🔴 High (imperative) | 🟡 Medium (declarative) | 🟢 Low |
| **Scroll Animations** | ⭐⭐⭐⭐⭐ ScrollTrigger | ⭐⭐⭐ whileInView | ⭐⭐ scroll-timeline |
| **Timeline Control** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **React Integration** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **SVG Animation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Best For** | Complex creative sites | React UI/UX | Simple transitions |

### When to Use What
- **Landing pages, portfolios, creative sites** → GSAP
- **React SaaS apps, dashboards** → Framer Motion
- **Hover effects, simple transitions** → CSS only
- **Mega complex** → GSAP + Framer Motion hybrid

## GSAP (GreenSock) — Key Patterns

### Basic Animation
```javascript
import gsap from 'gsap'

// Animate to
gsap.to('.hero-title', { 
  opacity: 1, y: 0, duration: 1, ease: 'power3.out' 
})

// Stagger children
gsap.from('.card', { 
  opacity: 0, y: 50, stagger: 0.15, ease: 'back.out(1.5)' 
})
```

### ScrollTrigger (Most Used Plugin)
```javascript
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

gsap.to('.parallax-bg', {
  y: -200,
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: true        // Ties animation to scroll position
  }
})

// Pin section while scrolling
gsap.to('.sticky-content', {
  scrollTrigger: {
    trigger: '.sticky-section',
    pin: true,
    start: 'top top',
    end: '+=500'
  }
})
```

### Timeline (Sequence Animations)
```javascript
const tl = gsap.timeline()
tl.to('.logo', { scale: 1, duration: 0.5 })
  .to('.nav', { opacity: 1, duration: 0.3 }, '-=0.2')  // overlap!
  .to('.hero', { y: 0, duration: 0.8 }, '<')             // same time
  .to('.cta', { scale: 1, ease: 'elastic' })
```

## Framer Motion (React) — Key Patterns

### Basic Animation
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
  Hello!
</motion.div>
```

### Scroll-Triggered (whileInView)
```tsx
<motion.div
  initial={{ opacity: 0, x: -100 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.6 }}
>
  Appears on scroll!
</motion.div>
```

### Page Transitions (AnimatePresence)
```tsx
import { AnimatePresence, motion } from 'framer-motion'

<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Stagger Children (Variants)
```tsx
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.li key={i} variants={item}>{i}</motion.li>
  ))}
</motion.ul>
```

## Performance Rules
- ✅ Animate `transform` and `opacity` only (GPU accelerated)
- ✅ Use `will-change: transform` sparingly
- ✅ `prefers-reduced-motion` for accessibility
- ❌ NEVER animate `width`, `height`, `top`, `left` (triggers layout)
- ❌ NEVER animate more than ~20 elements simultaneously

## Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition-duration: 0.01ms !important; }
}
```

## Date Researched: 2026-03-17
## Sources: gsap.com, motion.dev, elementor.com, dev.to
