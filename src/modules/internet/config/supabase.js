// Supabase Configuration for Internet Module
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_INTERNET
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_INTERNET
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY_INTERNET || ''

// Session persistence options
const authOptions = {
    auth: {
        persistSession: true,
        storageKey: 'griya-internet-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
}

// Public client (for read operations)
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, authOptions)
    : null

// Admin client (for write operations - use only server-side or protected routes)
export const supabaseAdmin = supabaseServiceKey && supabaseUrl
    ? createClient(supabaseUrl, supabaseServiceKey, authOptions)
    : supabase

export const isSupabaseConfigured = () => !!supabase

export { supabaseUrl }

