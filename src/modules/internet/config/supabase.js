// Supabase Configuration for Internet Module
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_INTERNET
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_INTERNET

// Session persistence options
const authOptions = {
    auth: {
        persistSession: true,
        storageKey: 'griya-internet-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
}

// Client protected by RLS policies
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, authOptions)
    : null

// Admin operations should use Supabase Edge Functions, not client-side service keys
export const supabaseAdmin = supabase

export const isSupabaseConfigured = () => !!supabase

export { supabaseUrl }

