/**
 * Shared Supabase Client for Portal Griya Sakinah
 * Centralized authentication for all modules
 */
import { createClient } from '@supabase/supabase-js';

// Use Angsuran Supabase instance as the main auth database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_ANGSURAN;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_ANGSURAN;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Portal Supabase credentials not found. Auth will not work.');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () => {
    return !!(supabaseUrl && supabaseAnonKey && supabase);
};

export default supabase;
