import { createClient } from '@supabase/supabase-js';

// Using ANGSURAN-specific env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_ANGSURAN;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_ANGSURAN;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Angsuran Supabase credentials not found. Check .env file.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () => !!supabase;
