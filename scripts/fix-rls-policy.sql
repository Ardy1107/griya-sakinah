-- ============================================
-- PERBAIKI RLS POLICY UNTUK TABEL ANGSURAN
-- Jalankan script ini di Supabase SQL Editor
-- ============================================

-- 1. Disable RLS (jika mau akses tanpa autentikasi)
-- ATAU tambahkan policy yang mengizinkan akses

-- OPSI A: Disable RLS sepenuhnya (untuk development)
ALTER TABLE public.units DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- OPSI B: Jika ingin tetap pakai RLS, tambahkan policy berikut:
-- (Uncomment bagian ini jika ingin pakai RLS)

/*
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.units;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.payments;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.expenses;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.audit_logs;

-- Create new policies that allow all operations
CREATE POLICY "Allow all operations for anon" ON public.units
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon" ON public.payments
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon" ON public.expenses
    FOR ALL  
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for anon" ON public.audit_logs
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);
*/

-- Verifikasi RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('units', 'payments', 'expenses', 'audit_logs');
