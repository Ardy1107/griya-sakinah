/**
 * Supabase client for Community/Musholla features
 * Uses the Internet/Musholla Supabase instance
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_MUSHOLLA;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_MUSHOLLA;

export const supabaseMusholla = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
