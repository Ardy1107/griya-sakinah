-- =====================================================
-- RESET SEMUA DATA SEFT - MULAI DARI NOL
-- Jalankan di Supabase Dashboard -> SQL Editor
-- =====================================================

-- 1. Hapus SEMUA sesi SEFT (Release & Amplify)
DELETE FROM spiritual_seft_sessions;

-- 2. Hapus SEMUA data SEFT Proxy (Didoakan)
DELETE FROM spiritual_seft_proxy;

-- =====================================================
-- VERIFIKASI DATA SUDAH KOSONG
-- =====================================================

-- Cek jumlah data tersisa
SELECT 'spiritual_seft_sessions' as table_name, COUNT(*) as total FROM spiritual_seft_sessions
UNION ALL
SELECT 'spiritual_seft_proxy' as table_name, COUNT(*) as total FROM spiritual_seft_proxy;
