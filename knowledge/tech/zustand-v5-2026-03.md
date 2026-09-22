# Zustand v5 — State Management Best Practices 2025

## Summary
Minimal React state manager. No providers, no boilerplate. v5 requires React 18+, TypeScript 4.5+. Key: atomic selectors, separate actions from state, multiple small stores.

## Basic Store
```javascript
import { create } from 'zustand'

const useCounterStore = create((set, get) => ({
  // State
  count: 0,
  
  // Actions (separate from state)
  actions: {
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
  }
}))

// ✅ Export custom hooks, NOT the store
export const useCount = () => useCounterStore((s) => s.count)
export const useCounterActions = () => useCounterStore((s) => s.actions)
```

## Key Rules

### 1. Atomic Selectors (Prevent Re-renders)
```javascript
// ❌ BAD: creates new object every render → infinite re-renders
const { count, name } = useStore((s) => ({ count: s.count, name: s.name }))

// ✅ GOOD: separate selectors
const count = useStore((s) => s.count)
const name = useStore((s) => s.name)

// ✅ ALSO GOOD: useShallow for multiple values
import { useShallow } from 'zustand/react/shallow'
const { count, name } = useStore(useShallow((s) => ({ count: s.count, name: s.name })))
```

### 2. Actions Are Stable (Never Re-render)
```javascript
// ✅ Actions object reference never changes
const { increment } = useCounterActions() // safe in deps array
```

### 3. Multiple Small Stores > One Big Store
```javascript
// ✅ GOOD: focused stores
const useAuthStore = create(...)   // auth state only
const useChatStore = create(...)   // chat state only
const useThemeStore = create(...)  // theme state only

// ❌ BAD: monolithic store
const useStore = create(...)  // everything in one place
```

### 4. Async Actions
```javascript
const usePostStore = create((set) => ({
  posts: [],
  loading: false,
  error: null,
  
  actions: {
    fetchPosts: async () => {
      set({ loading: true, error: null })
      try {
        const posts = await api.getPosts()
        set({ posts, loading: false })
      } catch (error) {
        set({ error: error.message, loading: false })
      }
    }
  }
}))
```

## Middleware
```javascript
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  devtools(          // Redux DevTools
    persist(         // localStorage
      immer((set) => ({  // immutable updates
        items: [],
        addItem: (item) => set((state) => {
          state.items.push(item)  // immer makes this safe!
        })
      })),
      { name: 'my-store' }
    )
  )
)
```

## Zustand vs Context
| Feature | Zustand | Context |
|---------|---------|---------|
| Re-renders | Only subscribed state | All consumers |
| Boilerplate | Minimal | Provider + useContext |
| DevTools | ✅ Redux DevTools | ❌ None |
| Persistence | ✅ persist middleware | Manual localStorage |
| Best for | Frequent updates | Rarely changing values |

**BGTK pattern**: Context for Auth/Theme (rarely changes), Zustand for Chat/Theme data (frequent updates)

## Date: 2026-03-17 | Sources: pmnd.rs, dev.to, medium.com
