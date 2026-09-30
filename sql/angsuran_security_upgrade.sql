-- =============================================
-- ANGSURAN SECURITY UPGRADE MIGRATION
-- Adds PIN-based auth for all roles & enables RLS
-- Run Date: 2026-09-30
-- =============================================

-- 1. Add pin_hash column for PIN-based authentication
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255);

-- 2. Set PIN hashes (SHA-256)
-- Admin PIN: 111111
UPDATE public.users 
SET pin_hash = 'bcb15f821479b4d5772bd0ca866c00ad5f926e3580720659cc80d39c9d09802a' 
WHERE role = 'admin';

-- Developer PIN: 000000
UPDATE public.users 
SET pin_hash = '91b4d142823f7d20c5f08df69122de43f35f057a988d9619f6d3138485c9a203' 
WHERE role = 'developer';

-- 3. Enable Row Level Security on all core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies - Users table
-- Public read needed for PIN login verification
CREATE POLICY "Public read users" ON public.users 
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated full access users" ON public.users 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. RLS Policies - Units table
CREATE POLICY "Public read units" ON public.units 
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated full access units" ON public.units 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. RLS Policies - Payments table
CREATE POLICY "Public read payments" ON public.payments 
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated full access payments" ON public.payments 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. RLS Policies - Audit Logs table
CREATE POLICY "Public read audit_logs" ON public.audit_logs 
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated full access audit_logs" ON public.audit_logs 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Reload schema cache
NOTIFY pgrst, 'reload schema';
