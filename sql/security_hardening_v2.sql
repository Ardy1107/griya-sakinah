-- =============================================
-- SECURITY HARDENING MIGRATION
-- Fix: Server-side PIN verification + RLS overhaul
-- Run Date: 2026-10-01
-- Target: Angsuran Supabase (gxdelxjdgkwscnojhlhc)
-- =============================================

-- 1. Create verify_pin RPC function (SECURITY DEFINER = runs as table owner)
--    PIN hash comparison happens server-side, never exposed to browser
CREATE OR REPLACE FUNCTION verify_pin(input_pin TEXT, input_role TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_user RECORD;
  hashed_pin TEXT;
BEGIN
  hashed_pin := encode(digest(input_pin, 'sha256'), 'hex');
  
  IF input_role IS NOT NULL THEN
    SELECT id, username, name, role INTO found_user
    FROM public.users
    WHERE pin_hash = hashed_pin AND role = input_role
    LIMIT 1;
  ELSE
    SELECT id, username, name, role INTO found_user
    FROM public.users
    WHERE pin_hash = hashed_pin
    LIMIT 1;
  END IF;
  
  IF found_user.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'PIN salah');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', found_user.id,
      'username', found_user.username,
      'name', found_user.name,
      'role', found_user.role
    )
  );
END;
$$;

-- 2. Secure users table: block anon from reading pin_hash/password_hash
DROP POLICY IF EXISTS "Public read users" ON public.users;
DROP POLICY IF EXISTS "Authenticated full access users" ON public.users;
CREATE POLICY "users_no_anon_read" ON public.users
  FOR SELECT TO anon USING (false);
CREATE POLICY "users_authenticated_read" ON public.users
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_authenticated_write" ON public.users
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Operational tables: allow anon full access (PIN auth is at app level)
-- Units
DROP POLICY IF EXISTS "Public read units" ON public.units;
DROP POLICY IF EXISTS "Authenticated full access units" ON public.units;
CREATE POLICY "units_full_access" ON public.units
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Payments
DROP POLICY IF EXISTS "Public read payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated full access payments" ON public.payments;
CREATE POLICY "payments_full_access" ON public.payments
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Audit Logs
DROP POLICY IF EXISTS "Public read audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated full access audit_logs" ON public.audit_logs;
CREATE POLICY "audit_logs_full_access" ON public.audit_logs
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Expenses
DROP POLICY IF EXISTS "expenses_full_access" ON public.expenses;
CREATE POLICY "expenses_full_access" ON public.expenses
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Enable RLS on 5 spiritual tables that were missing it
ALTER TABLE public.spiritual_emosi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_doa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_zikir ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_amalan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_abundance_materi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spiritual_emosi_full" ON public.spiritual_emosi
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "spiritual_doa_full" ON public.spiritual_doa
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "spiritual_zikir_full" ON public.spiritual_zikir
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "spiritual_amalan_full" ON public.spiritual_amalan
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "spiritual_abundance_materi_full" ON public.spiritual_abundance_materi
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Reload schema cache
NOTIFY pgrst, 'reload schema';
