# Supabase — Best Practices (Auth, RLS, Storage, Database) 2025

## Summary
Supabase = BaaS (PostgreSQL + Auth + Storage + Realtime). Key: RLS on ALL tables, never expose service_role key, use `(select auth.uid())` for RLS performance, index RLS columns.

## Auth Best Practices
```javascript
// ✅ Client-side: only use anon key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY  // safe for client
)

// ❌ NEVER in client code:
const supabase = createClient(url, SERVICE_ROLE_KEY) // bypasses RLS!
```
- Use Supabase Auth (handles hashing, JWT, sessions)
- Store keys in `.env` — never commit
- Implement rate limiting on auth endpoints
- Consider MFA for admin accounts
- Rotate API keys periodically

## RLS (Row Level Security) — CRITICAL
```sql
-- ✅ ENABLE RLS on ALL tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ✅ Performance: wrap auth.uid() in select
CREATE POLICY "Users read own data" ON posts
  FOR SELECT USING (user_id = (select auth.uid()));

-- ❌ SLOW: direct function call re-evaluates per row
CREATE POLICY "bad" ON posts
  FOR SELECT USING (user_id = auth.uid());

-- ✅ Always index RLS columns
CREATE INDEX idx_posts_user_id ON posts(user_id);
```
- **Deny by default** — only allow what's needed
- Separate policies for SELECT, INSERT, UPDATE, DELETE
- INSERT uses `WITH CHECK`, UPDATE uses both `USING` and `WITH CHECK`
- Test as different users (not SQL Editor — it bypasses RLS)

## Storage
- Separate public and private buckets
- Use RLS on storage objects (structure paths: `user_id/filename`)
- Public bucket for avatars/images shown to all
- Private bucket for documents/sensitive files

## Database Patterns
- Start normalized, denormalize only for performance
- Index foreign keys and WHERE/ORDER BY columns
- Use connection pooling for serverless
- Prepared statements to prevent SQL injection
- Don't over-index (slows writes)

## React Integration
```javascript
// ✅ Custom hook pattern
function useUser() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])
  return user
}
```
- Use `supabase-js` (not `supabase/ssr` for client SPAs)
- Modular service layer: `src/services/api/supabaseClient.js`

## Date: 2026-03-17 | Sources: supabase.com, leanware.co, makerkit.dev
