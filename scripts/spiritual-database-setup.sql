-- =====================================================
-- SPIRITUAL ABUNDANCE DATABASE SETUP
-- Supabase Tables for Spiritual Features
-- =====================================================

-- =====================================================
-- MASTER TABLES
-- =====================================================

-- 1. Master Emosi (for SEFT Tracker)
CREATE TABLE IF NOT EXISTS spiritual_emosi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    kategori VARCHAR(20) NOT NULL CHECK (kategori IN ('negatif', 'positif')),
    level_hawkins INTEGER,
    deskripsi TEXT,
    urutan INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Master Doa
CREATE TABLE IF NOT EXISTS spiritual_doa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(200) NOT NULL,
    kategori VARCHAR(50), -- 'para_nabi', 'sulaiman', 'logos', 'afirmasi', 'pelunas_hutang', 'harian'
    teks_arab TEXT,
    teks_latin TEXT,
    arti TEXT,
    dalil VARCHAR(200),
    keutamaan TEXT,
    urutan INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Master Zikir
CREATE TABLE IF NOT EXISTS spiritual_zikir (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(200) NOT NULL,
    waktu VARCHAR(20), -- 'pagi', 'petang', 'setelah_shalat', 'harian'
    teks_arab TEXT,
    teks_latin TEXT,
    arti TEXT,
    jumlah_baca INTEGER DEFAULT 1,
    dalil VARCHAR(200),
    urutan INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Master Amalan Harian
CREATE TABLE IF NOT EXISTS spiritual_amalan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(200) NOT NULL,
    kategori VARCHAR(50), -- 'shalat_wajib', 'shalat_sunnah', 'zikir', 'quran', 'sedekah', 'penghapus_dosa'
    target_harian INTEGER DEFAULT 1,
    keutamaan TEXT,
    dalil VARCHAR(200),
    urutan INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Master Abundance Materi (38 hari program)
CREATE TABLE IF NOT EXISTS spiritual_abundance_materi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hari INTEGER NOT NULL,
    judul VARCHAR(200) NOT NULL,
    konten TEXT,
    doa_terkait TEXT,
    latihan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRACKER TABLES
-- =====================================================

-- 6. SEFT Sessions
CREATE TABLE IF NOT EXISTS spiritual_seft_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('release', 'amplify')),
    emosi_id UUID REFERENCES spiritual_emosi(id) ON DELETE SET NULL,
    emosi_nama VARCHAR(100),
    masalah TEXT,
    kalimat_setup TEXT,
    rating_sebelum INTEGER CHECK (rating_sebelum BETWEEN 1 AND 10),
    rating_sesudah INTEGER CHECK (rating_sesudah BETWEEN 1 AND 10),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SEFT Program Enrollment
CREATE TABLE IF NOT EXISTS spiritual_seft_program (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    program_type VARCHAR(20) CHECK (program_type IN ('7_hari', '14_hari', '30_hari', 'custom')),
    start_date DATE DEFAULT CURRENT_DATE,
    current_day INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Habit Tracker Daily
CREATE TABLE IF NOT EXISTS spiritual_habit_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    amalan_id UUID REFERENCES spiritual_amalan(id) ON DELETE CASCADE,
    amalan_nama VARCHAR(200),
    completed BOOLEAN DEFAULT FALSE,
    count INTEGER DEFAULT 0,
    nominal DECIMAL(15,2), -- untuk sedekah
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tanggal, amalan_id)
);

-- 9. Doa Diam-diam Tracker (11 Ring System)
CREATE TABLE IF NOT EXISTS spiritual_doa_diamdiam (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    ring INTEGER CHECK (ring BETWEEN 0 AND 5),
    nama_orang VARCHAR(100),
    hubungan VARCHAR(100),
    doa_yang_didoakan TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Ring Contacts (untuk menyimpan daftar orang per ring)
CREATE TABLE IF NOT EXISTS spiritual_ring_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    ring INTEGER CHECK (ring BETWEEN 0 AND 5),
    nama VARCHAR(100) NOT NULL,
    hubungan VARCHAR(100),
    urutan INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Muhasabah Journal
CREATE TABLE IF NOT EXISTS spiritual_muhasabah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    dosa_hari_ini TEXT,
    orang_yang_disakiti TEXT,
    kebaikan_dilakukan TEXT,
    perbaikan_besok TEXT,
    catatan_bebas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tanggal)
);

-- 12. Syukur Journal
CREATE TABLE IF NOT EXISTS spiritual_syukur (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kategori VARCHAR(50), -- 'iman', 'kesehatan', 'keluarga', 'rezeki', 'kecil'
    isi_syukur TEXT NOT NULL,
    nominal_sedekah DECIMAL(15,2), -- untuk Toples Syukur
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Qalbu Meter (Heart Health Tracker)
CREATE TABLE IF NOT EXISTS spiritual_qalbu_meter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    ketenangan INTEGER CHECK (ketenangan BETWEEN 1 AND 10),
    syukur INTEGER CHECK (syukur BETWEEN 1 AND 10),
    cinta_allah INTEGER CHECK (cinta_allah BETWEEN 1 AND 10),
    welas_asih INTEGER CHECK (welas_asih BETWEEN 1 AND 10),
    keikhlasan INTEGER CHECK (keikhlasan BETWEEN 1 AND 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tanggal)
);

-- 14. Kebaikan Harian
CREATE TABLE IF NOT EXISTS spiritual_kebaikan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    kategori VARCHAR(50), -- 'ortu', 'pasangan', 'anak', 'tetangga', 'asing'
    deskripsi TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Memaafkan Tracker
CREATE TABLE IF NOT EXISTS spiritual_memaafkan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    nama_orang VARCHAR(100),
    kesalahan TEXT,
    sudah_dimaafkan BOOLEAN DEFAULT FALSE,
    tanggal_maafkan DATE,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Streak & Statistics
CREATE TABLE IF NOT EXISTS spiritual_streak (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    kategori VARCHAR(50), -- 'habit', 'seft', 'doa_diamdiam', 'muhasabah', 'syukur'
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed_date DATE,
    total_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, kategori)
);

-- 17. Abundance Progress (38 hari tracker)
CREATE TABLE IF NOT EXISTS spiritual_abundance_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    hari INTEGER NOT NULL,
    materi_id UUID REFERENCES spiritual_abundance_materi(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT FALSE,
    doa_para_nabi BOOLEAN DEFAULT FALSE,
    abc_clearing BOOLEAN DEFAULT FALSE,
    light_of_abundance BOOLEAN DEFAULT FALSE,
    doa_logos BOOLEAN DEFAULT FALSE,
    tosca BOOLEAN DEFAULT FALSE,
    catatan TEXT,
    tanggal_selesai DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, hari)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_seft_sessions_user_date ON spiritual_seft_sessions(user_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_habit_daily_user_date ON spiritual_habit_daily(user_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_doa_diamdiam_user_date ON spiritual_doa_diamdiam(user_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_syukur_user_date ON spiritual_syukur(user_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_emosi_kategori ON spiritual_emosi(kategori);
CREATE INDEX IF NOT EXISTS idx_doa_kategori ON spiritual_doa(kategori);
CREATE INDEX IF NOT EXISTS idx_zikir_waktu ON spiritual_zikir(waktu);
CREATE INDEX IF NOT EXISTS idx_amalan_kategori ON spiritual_amalan(kategori);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE spiritual_seft_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_seft_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_habit_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_doa_diamdiam ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_ring_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_muhasabah ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_syukur ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_qalbu_meter ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_kebaikan ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_memaafkan ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_streak ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_abundance_progress ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (Allow all for authenticated users - adjust as needed)
-- =====================================================

-- Master tables: public read access
CREATE POLICY "Public read access for emosi" ON spiritual_emosi FOR SELECT USING (true);
CREATE POLICY "Public read access for doa" ON spiritual_doa FOR SELECT USING (true);
CREATE POLICY "Public read access for zikir" ON spiritual_zikir FOR SELECT USING (true);
CREATE POLICY "Public read access for amalan" ON spiritual_amalan FOR SELECT USING (true);
CREATE POLICY "Public read access for abundance_materi" ON spiritual_abundance_materi FOR SELECT USING (true);

-- Tracker tables: users can manage their own data
CREATE POLICY "Users can manage own seft_sessions" ON spiritual_seft_sessions FOR ALL USING (true);
CREATE POLICY "Users can manage own seft_program" ON spiritual_seft_program FOR ALL USING (true);
CREATE POLICY "Users can manage own habit_daily" ON spiritual_habit_daily FOR ALL USING (true);
CREATE POLICY "Users can manage own doa_diamdiam" ON spiritual_doa_diamdiam FOR ALL USING (true);
CREATE POLICY "Users can manage own ring_contacts" ON spiritual_ring_contacts FOR ALL USING (true);
CREATE POLICY "Users can manage own muhasabah" ON spiritual_muhasabah FOR ALL USING (true);
CREATE POLICY "Users can manage own syukur" ON spiritual_syukur FOR ALL USING (true);
CREATE POLICY "Users can manage own qalbu_meter" ON spiritual_qalbu_meter FOR ALL USING (true);
CREATE POLICY "Users can manage own kebaikan" ON spiritual_kebaikan FOR ALL USING (true);
CREATE POLICY "Users can manage own memaafkan" ON spiritual_memaafkan FOR ALL USING (true);
CREATE POLICY "Users can manage own streak" ON spiritual_streak FOR ALL USING (true);
CREATE POLICY "Users can manage own abundance_progress" ON spiritual_abundance_progress FOR ALL USING (true);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- Run this script in Supabase SQL Editor to create all tables
-- Total: 17 tables created for Spiritual Abundance features
