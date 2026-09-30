ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS block_id VARCHAR(50);
-- Memberi tahu Supabase API untuk me-reload skema tabel agar kolom baru bisa langsung diakses
NOTIFY pgrst, 'reload schema';
