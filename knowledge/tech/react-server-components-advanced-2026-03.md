# React Server Components — Advanced Patterns 2025

## Summary
RSC is now the default paradigm. Server-first rendering with streaming, parallel data fetching, and composition via props — no more client waterfalls.

## Core Concept
- ALL components are Server Components by **default**
- Only add `"use client"` for interactivity (state, events, browser APIs)
- Data fetching happens ON the server, during render

## Advanced Patterns

### 1. Async Components (Direct Data Fetching)
```tsx
// Server Component — async is NATIVE
async function ProductPage({ id }: { id: string }) {
  const product = await db.product.findUnique({ where: { id } })
  return <ProductDetail product={product} />
}
```
- ✅ No `useEffect`, no `useState`, no loading spinner
- ✅ Data fetched at render time on server
- ✅ Zero client-side JavaScript for this component

### 2. Parallel Data Resolution (Kill Waterfalls)
```tsx
async function Dashboard() {
  // ✅ PARALLEL — both fetch simultaneously
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getPosts(),
    getStats()
  ])
  return <DashboardView user={user} posts={posts} stats={stats} />
}
```
- ❌ NEVER: `const user = await getUser(); const posts = await getPosts(user.id);` (waterfall!)
- ✅ Use `Promise.all` for independent data

### 3. Streaming with Suspense
```tsx
export default function Page() {
  return (
    <div>
      <Header />  {/* Renders immediately */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductList />  {/* Streams when ready */}
      </Suspense>
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />  {/* Streams independently */}
      </Suspense>
    </div>
  )
}
```
- ✅ Static parts render instantly
- ✅ Each Suspense boundary streams independently
- ✅ Users see content progressively

### 4. Server Components as Props (Composition Pattern)
```tsx
// Client Component that receives Server Component as child
'use client'
function InteractivePanel({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  return isOpen ? <div>{children}</div> : null
}

// Server Component passes server-rendered content
export default function Page() {
  return (
    <InteractivePanel>
      <ServerRenderedContent />  {/* ← Server Component as prop! */}
    </InteractivePanel>
  )
}
```
- ✅ Client Component stays lean (no data fetching JS)
- ✅ Server Component content is pre-rendered
- ✅ Best of both worlds

### 5. Server Actions for Mutations
```tsx
// Server Action — replaces API routes for mutations
async function createPost(formData: FormData) {
  'use server'
  const title = formData.get('title')
  await db.post.create({ data: { title } })
  revalidatePath('/posts')
}

// Use in form — no fetch(), no API route needed
export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  )
}
```

## Best Practices
- ✅ Server-first: Default all components to server
- ✅ `"use client"` only for: onClick, useState, useEffect, browser APIs
- ✅ Pass Server Components as children/props to Client Components
- ✅ Use Suspense for each independent data section
- ✅ Promise.all for parallel data fetching
- ❌ Don't make Client Components fetch data — let Server Components do it
- ❌ Don't put `"use client"` at the top of every file
- ❌ Don't use useEffect for data fetching anymore

## Gotchas
- ⚠️ Can't use hooks (useState, useEffect) in Server Components
- ⚠️ Can't pass functions as props from Server → Client Components
- ⚠️ Event handlers (onClick, onChange) require `"use client"`
- ⚠️ `window`, `document`, `localStorage` only in Client Components

## Date Researched: 2026-03-17
## Sources: react.dev, dev.to, joshwcomeau.com, gitconnected.com
