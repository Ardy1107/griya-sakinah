# React Router v7 — Features & Best Practices 2025

## Summary
React Router v7 = data-first routing. Loaders for pre-render data fetching, actions for mutations, Framework Mode with Vite. 15% smaller bundle than v6.

## Key Features
- Data Routers with `loader` and `action` functions
- Framework Mode (Vite plugin) with type-safe routes
- Built-in Suspense support
- Improved SSR capabilities
- useNavigation(), useRouteLoaderData(), useFetcher()
- Error handling with `errorElement`

## Basic Setup (SPA Mode — BGTK style)
```javascript
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'admin', element: <Admin /> },
      { 
        path: 'events/:id',
        element: <EventDetail />,
        loader: async ({ params }) => {
          return fetch(`/api/events/${params.id}`)
        }
      }
    ]
  }
])

function App() {
  return <RouterProvider router={router} />
}
```

## Data Loading (Loaders)
```javascript
// ✅ Data ready BEFORE component renders
{
  path: '/dashboard',
  element: <Dashboard />,
  loader: async () => {
    // Parallel fetching — no waterfalls!
    const [stats, events, users] = await Promise.all([
      getStats(),
      getEvents(),
      getUsers()
    ])
    return { stats, events, users }
  }
}

// In component:
function Dashboard() {
  const { stats, events, users } = useLoaderData()
  return <DashboardView stats={stats} events={events} users={users} />
}
```

## Mutations (Actions)
```javascript
{
  path: '/events/new',
  element: <NewEvent />,
  action: async ({ request }) => {
    const formData = await request.formData()
    const event = await createEvent(Object.fromEntries(formData))
    return redirect(`/events/${event.id}`)
  }
}

// In component:
function NewEvent() {
  return (
    <Form method="post">
      <input name="title" />
      <button type="submit">Create</button>
    </Form>
  )
}
```

## Navigation State
```javascript
function SubmitButton() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  return (
    <button disabled={isSubmitting}>
      {isSubmitting ? 'Saving...' : 'Save'}
    </button>
  )
}
```

## Lazy Loading Routes
```javascript
{
  path: '/admin',
  lazy: () => import('./pages/admin/AdminPanel'),
  // Component, loader, and action are all lazy loaded!
}
```

## Best Practices
- ✅ Use loaders for data fetching (not useEffect)
- ✅ Promise.all for parallel data in loaders
- ✅ errorElement for route-specific error handling
- ✅ Lazy loading for code splitting
- ✅ NavLink for active link styling
- ✅ Wildcard `*` route for 404 page
- ❌ Don't fetch data in useEffect (loader is better)
- ❌ Don't put auth logic in route component (use loader redirect)

## Date: 2026-03-17 | Sources: reactrouter.com, dev.to, medium.com
