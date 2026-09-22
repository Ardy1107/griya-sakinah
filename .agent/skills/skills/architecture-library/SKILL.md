---
name: architecture-library
description: "Pre-built Architecture Decision Records and pattern catalog. 20+ decision templates and 30+ proven patterns for mature architecture decisions."
version: 1.0.0
---

# Architecture Decision Library

> **Purpose:** Make architecture decisions as good as a 10-year veteran architect.

## 📋 ADR Templates (Quick Decision Guides)

### Authentication
| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| JWT + Refresh | Stateless, scalable | Token management complex | SPA, API-first |
| Session-based | Simple, revocable | Server memory, not stateless | Traditional web |
| OAuth 2.0 | Social login, standards | Complex setup | Public-facing apps |
| Supabase Auth | Easy, RLS integration | Vendor lock-in | Supabase projects ✅ |

### State Management
| Option | Bundle Size | Learning Curve | Best For |
|--------|:-----------:|:--------------:|----------|
| useState/useReducer | 0KB | Low | Simple components |
| Context API | 0KB | Low | App-wide theme/auth |
| Zustand | 1.1KB | Low | Medium complexity ✅ |
| Redux Toolkit | 11KB | Medium | Large enterprise |
| Jotai | 2.4KB | Low | Atomic state |

### Database Strategy
| Option | Realtime | Pricing | Best For |
|--------|:--------:|---------|----------|
| Supabase (PostgreSQL) | ✅ | Free tier generous | This project ✅ |
| Firebase (NoSQL) | ✅ | Pay-per-read | Mobile-first |
| PlanetScale (MySQL) | ❌ | Branching is great | Large teams |
| MongoDB Atlas | ❌ | Flexible schema | Prototyping |

### Styling Approach
| Option | Performance | DX | Best For |
|--------|:----------:|:--:|----------|
| CSS Modules | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | This project ✅ |
| Tailwind CSS | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Rapid prototyping |
| styled-components | ⭐⭐⭐ | ⭐⭐⭐⭐ | Component libraries |
| Vanilla CSS | ⭐⭐⭐⭐⭐ | ⭐⭐ | Simple projects |

### API Pattern
| Option | Type Safety | Complexity | Best For |
|--------|:----------:|:----------:|----------|
| REST | Manual | Low | Simple CRUD ✅ |
| GraphQL | Schema-based | Medium | Complex queries |
| tRPC | Full TypeScript | Medium | Full-stack TS |
| Supabase Client | Via RLS | Low | Direct DB access ✅ |

### Hosting / Deploy
| Option | Speed | Price | Best For |
|--------|:-----:|:-----:|----------|
| Vercel | ⭐⭐⭐⭐⭐ | Free tier | Next.js, React |
| Cloudflare Pages | ⭐⭐⭐⭐⭐ | Free | Static + Workers |
| Railway | ⭐⭐⭐⭐ | $5/mo | Backend, DB |
| VPS (Contabo) | ⭐⭐⭐ | $4/mo | Full control |

---

## 🧩 Pattern Catalog (30+ Proven Patterns)

### Component Patterns
| Pattern | When | Implementation |
|---------|------|----------------|
| **Compound Components** | Complex UI with shared state | `<Select><Select.Option/></Select>` |
| **Render Props** | Shared behavior, different UI | `<DataFetcher render={data => ...}/>` |
| **Custom Hooks** | Reusable logic | `useDebounce()`, `useLocalStorage()` |
| **Error Boundary** | Graceful error handling | Class component with `componentDidCatch` |
| **Loading Skeleton** | Better perceived performance | Animated placeholder while loading |
| **Empty State** | No data scenarios | Illustrated message + CTA |
| **Optimistic Update** | Instant feel | Update UI before API response |

### Data Patterns
| Pattern | When | Benefit |
|---------|------|---------|
| **SWR / React Query** | API data fetching | Cache, revalidate, dedup |
| **Pagination** | Large lists | Load only visible data |
| **Infinite Scroll** | Social feed, timeline | Load on demand |
| **Debounced Search** | Search inputs | Reduce API calls |
| **Optimistic Mutation** | Form submits | Instant feedback |

### Security Patterns
| Pattern | When | Implementation |
|---------|------|----------------|
| **RLS Policies** | Database access | Supabase row-level security |
| **Input Sanitization** | User input | Zod validation + DOMPurify |
| **CSRF Protection** | Form submissions | Token-based verification |
| **Rate Limiting** | API endpoints | Token bucket algorithm |
| **XSS Prevention** | Dynamic content | CSP headers + sanitization |

---

## 🤖 Decision Protocol

```markdown
WHEN making architecture decisions:
1. Check docs/DECISIONS.md for prior decisions
2. Consult this library for pre-analyzed options
3. Consider BUSINESS_CONTEXT.md constraints
4. Pick option marked ✅ if project-specific recommendation exists
5. Document decision in docs/DECISIONS.md
```
