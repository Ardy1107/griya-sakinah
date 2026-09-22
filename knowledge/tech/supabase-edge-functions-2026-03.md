# Supabase Edge Functions — Best Practices 2025

## Summary
Supabase Edge Functions run on Deno runtime, deployed globally via Deno Deploy. TypeScript-first, low-latency serverless functions for webhooks, auth, AI inference, and content generation.

## When to Use Edge Functions
- ✅ Authenticated/public HTTP endpoints
- ✅ Webhook receivers (Stripe, GitHub, etc.)
- ✅ On-demand content generation (Open Graph images, PDFs)
- ✅ Small AI inference tasks
- ✅ Sending transactional emails
- ❌ Heavy/long data processing → use Database Functions
- ❌ Scheduled/batch jobs → use cron + background workers

## Best Practices

### 1. TypeScript + Deno Setup
```bash
# Initialize Edge Function
supabase functions new my-function

# Local development  
supabase functions serve my-function --no-verify-jwt

# Deploy
supabase functions deploy my-function
```
- Install Deno VS Code extension for IntelliSense
- Use `deno.json` for import maps

### 2. Function Structure
```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')!
    
    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

### 3. Secrets Management
```typescript
// ✅ DO: Use environment variables
const apiKey = Deno.env.get('STRIPE_SECRET_KEY')!

// ❌ NEVER: Hardcode secrets
const apiKey = 'sk_live_...'
```
- Set secrets via: `supabase secrets set MY_SECRET=value`
- Access via: `Deno.env.get('MY_SECRET')`

### 4. CORS Handling
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### 5. Performance Tips
- Functions "stay warm" if frequently invoked (fast cold starts with Deno)
- Use connection pooling for database connections
- Keep functions short-lived and idempotent
- Use hyphen naming: `my-function-name`

## Gotchas
- ⚠️ Docker required for full local Supabase setup
- ⚠️ Use `--no-verify-jwt` flag for local dev only
- ⚠️ Import from `esm.sh` or `deno.land/std`, not `npm:`
- ⚠️ CORS must be handled manually (no middleware)

## Date Researched: 2026-03-17
## Sources: supabase.com, medium.com, logrocket.com
