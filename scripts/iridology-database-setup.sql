-- =====================================================
-- IRIDOLOGY + HERBAL INTEGRATION DATABASE SETUP
-- Supabase Tables for Iridology Analysis System
-- =====================================================

-- =====================================================
-- STEP 1: Update SEFT Sessions (if not already done)
-- =====================================================
ALTER TABLE spiritual_seft_sessions 
ADD COLUMN IF NOT EXISTS kategori VARCHAR(100),
ADD COLUMN IF NOT EXISTS level_hawkins INTEGER,
ADD COLUMN IF NOT EXISTS mode_seft VARCHAR(30) DEFAULT 'mandiri',
ADD COLUMN IF NOT EXISTS target_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS target_relation VARCHAR(100),
ADD COLUMN IF NOT EXISTS device_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_seft_sessions_device ON spiritual_seft_sessions(device_id);

-- =====================================================
-- STEP 2: Create Iridology Zones Master Table
-- =====================================================
CREATE TABLE IF NOT EXISTS iridology_zones (
    id SERIAL PRIMARY KEY,
    zone_type VARCHAR(20) NOT NULL, -- 'concentric' atau 'clock'
    zone_number INT,
    clock_position VARCHAR(10), -- '12:00', '1:00', etc
    eye_side VARCHAR(10) NOT NULL, -- 'left' atau 'right'
    organ_en VARCHAR(100),
    organ_id VARCHAR(100) NOT NULL, -- Indonesian name
    organ_system VARCHAR(50), -- digestive, respiratory, etc
    description_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 3: Create Organ to Emotion Mapping
-- =====================================================
CREATE TABLE IF NOT EXISTS iridology_organ_emotions (
    id SERIAL PRIMARY KEY,
    organ_id VARCHAR(100) NOT NULL,
    emosi_nama VARCHAR(100) NOT NULL,
    emosi_level_hawkins INT,
    priority INT DEFAULT 1, -- 1 = highest priority
    scientific_basis TEXT,
    journal_source VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 4: Create Herbal Recommendations Table
-- =====================================================
CREATE TABLE IF NOT EXISTS iridology_herbal_recommendations (
    id SERIAL PRIMARY KEY,
    organ_id VARCHAR(100) NOT NULL,
    herbal_name VARCHAR(100) NOT NULL,
    herbal_name_latin VARCHAR(150),
    dosage VARCHAR(100),
    schedule VARCHAR(50), -- 'pagi', 'siang', 'malam'
    duration VARCHAR(50), -- '4-8 minggu'
    benefits TEXT,
    scientific_basis TEXT,
    journal_source VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 5: Create Iridology Sessions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS iridology_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    device_id VARCHAR(100),
    photo_left_url TEXT,
    photo_right_url TEXT,
    analysis_type VARCHAR(20) DEFAULT 'manual', -- 'manual', 'ai'
    zones_detected JSONB, -- array of detected zones
    organs_affected TEXT[], -- array of organ names
    recommended_emotions TEXT[],
    recommended_herbs TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 6: Create Herbal Schedule Tracker
-- =====================================================
CREATE TABLE IF NOT EXISTS iridology_herbal_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    device_id VARCHAR(100),
    session_id UUID REFERENCES iridology_sessions(id),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    herbal_name VARCHAR(100) NOT NULL,
    schedule VARCHAR(50), -- 'pagi', 'siang', 'malam'
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 7: Enable RLS
-- =====================================================
ALTER TABLE iridology_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE iridology_organ_emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE iridology_herbal_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE iridology_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE iridology_herbal_tracker ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 8: RLS Policies
-- =====================================================
CREATE POLICY "Public read for iridology_zones" ON iridology_zones FOR SELECT USING (true);
CREATE POLICY "Public read for organ_emotions" ON iridology_organ_emotions FOR SELECT USING (true);
CREATE POLICY "Public read for herbal_recommendations" ON iridology_herbal_recommendations FOR SELECT USING (true);
CREATE POLICY "Users manage own iridology_sessions" ON iridology_sessions FOR ALL USING (true);
CREATE POLICY "Users manage own herbal_tracker" ON iridology_herbal_tracker FOR ALL USING (true);

-- =====================================================
-- STEP 9: Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_iridology_zones_eye ON iridology_zones(eye_side);
CREATE INDEX IF NOT EXISTS idx_iridology_sessions_device ON iridology_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_herbal_tracker_device_date ON iridology_herbal_tracker(device_id, tanggal);

-- =====================================================
-- SEED DATA: 7 Concentric Zones (Bernard Jensen)
-- =====================================================
INSERT INTO iridology_zones (zone_type, zone_number, eye_side, organ_id, organ_system, description_id) VALUES
-- Zone 1: Pupillary Zone (innermost)
('concentric', 1, 'both', 'Lambung', 'digestive', 'Zona paling dalam sekitar pupil - mencerminkan kesehatan lambung dan pencernaan'),
('concentric', 2, 'both', 'Usus', 'digestive', 'Zona usus halus dan usus besar - penyerapan dan eliminasi'),
('concentric', 3, 'both', 'Sistem Saraf Otonom', 'nervous', 'Nerve Wreath - regulasi fungsi organ internal'),
('concentric', 4, 'both', 'Metabolisme', 'metabolic', 'Zona metabolisme dan nutrisi'),
('concentric', 5, 'both', 'Sirkulasi', 'circulatory', 'Zona sirkulasi darah dan limfa'),
('concentric', 6, 'both', 'Otot & Sendi', 'musculoskeletal', 'Zona otot dan persendian'),
('concentric', 7, 'both', 'Kulit', 'integumentary', 'Zona paling luar - kulit dan tulang');

-- =====================================================
-- SEED DATA: 12 Clock Positions - RIGHT Eye
-- =====================================================
INSERT INTO iridology_zones (zone_type, clock_position, eye_side, organ_id, organ_system, description_id) VALUES
('clock', '12:00', 'right', 'Otak', 'nervous', 'Kepala, otak, fungsi kognitif'),
('clock', '1:00', 'right', 'Paru Kanan', 'respiratory', 'Paru-paru kanan, bronkus'),
('clock', '2:00', 'right', 'Paru Kanan', 'respiratory', 'Paru-paru kanan bagian bawah'),
('clock', '3:00', 'right', 'Hati', 'digestive', 'Hati dan empedu'),
('clock', '4:00', 'right', 'Ginjal Kanan', 'urinary', 'Ginjal kanan'),
('clock', '5:00', 'right', 'Adrenal Kanan', 'endocrine', 'Kelenjar adrenal kanan'),
('clock', '6:00', 'right', 'Organ Reproduksi', 'reproductive', 'Organ reproduksi'),
('clock', '7:00', 'right', 'Usus Besar', 'digestive', 'Usus besar ascending'),
('clock', '8:00', 'right', 'Usus Besar', 'digestive', 'Usus besar transverse'),
('clock', '9:00', 'right', 'Jantung', 'circulatory', 'Jantung'),
('clock', '10:00', 'right', 'Pankreas', 'endocrine', 'Pankreas'),
('clock', '11:00', 'right', 'Tiroid', 'endocrine', 'Tiroid dan tenggorokan');

-- =====================================================
-- SEED DATA: 12 Clock Positions - LEFT Eye
-- =====================================================
INSERT INTO iridology_zones (zone_type, clock_position, eye_side, organ_id, organ_system, description_id) VALUES
('clock', '12:00', 'left', 'Otak', 'nervous', 'Kepala, fungsi mental, sirkulasi otak'),
('clock', '1:00', 'left', 'Jantung', 'circulatory', 'Jantung sisi kiri'),
('clock', '2:00', 'left', 'Limpa', 'lymphatic', 'Limpa'),
('clock', '3:00', 'left', 'Pankreas', 'endocrine', 'Pankreas dan lambung'),
('clock', '4:00', 'left', 'Ginjal Kiri', 'urinary', 'Ginjal kiri'),
('clock', '5:00', 'left', 'Adrenal Kiri', 'endocrine', 'Kelenjar adrenal kiri'),
('clock', '6:00', 'left', 'Organ Reproduksi', 'reproductive', 'Organ reproduksi'),
('clock', '7:00', 'left', 'Usus Besar', 'digestive', 'Usus besar descending'),
('clock', '8:00', 'left', 'Usus Besar', 'digestive', 'Usus besar sigmoid'),
('clock', '9:00', 'left', 'Paru Kiri', 'respiratory', 'Paru-paru kiri'),
('clock', '10:00', 'left', 'Paru Kiri', 'respiratory', 'Paru-paru kiri bagian atas'),
('clock', '11:00', 'left', 'Tiroid', 'endocrine', 'Tiroid dan sirkulasi');

-- =====================================================
-- SEED DATA: Organ to Emotion Mapping (Psychosomatic)
-- =====================================================
INSERT INTO iridology_organ_emotions (organ_id, emosi_nama, emosi_level_hawkins, priority, scientific_basis, journal_source) VALUES
-- Hati
('Hati', 'Marah', 150, 1, 'Emosi marah terpendam menyebabkan peradangan hati', 'Psychosomatic Medicine'),
('Hati', 'Dengki', 150, 2, 'Dengki meningkatkan kortisol yang merusak hati', 'APA Journal'),
('Hati', 'Dendam', 150, 3, 'Dendam kronis mempengaruhi fungsi detoksifikasi hati', 'NCBI Studies'),
('Hati', 'Benci', 150, 4, 'Kebencian menyebabkan ketegangan otot di area hati', 'Frontiers Psychology'),

-- Ginjal
('Ginjal Kanan', 'Takut', 100, 1, 'Takut kronis mempengaruhi kelenjar adrenal di atas ginjal', 'Endocrine Reviews'),
('Ginjal Kiri', 'Takut', 100, 1, 'Takut kronis mempengaruhi kelenjar adrenal di atas ginjal', 'Endocrine Reviews'),
('Ginjal Kanan', 'Cemas', 100, 2, 'Kecemasan meningkatkan adrenalin yang membebani ginjal', 'NIH Studies'),
('Ginjal Kiri', 'Cemas', 100, 2, 'Kecemasan meningkatkan adrenalin yang membebani ginjal', 'NIH Studies'),
('Ginjal Kanan', 'Trauma', 100, 3, 'Trauma menyebabkan respons fight-or-flight kronis', 'PTSD Research'),
('Ginjal Kiri', 'Trauma', 100, 3, 'Trauma menyebabkan respons fight-or-flight kronis', 'PTSD Research'),

-- Paru-paru
('Paru Kanan', 'Sedih', 75, 1, 'Kesedihan mendalam mempengaruhi kapasitas paru', 'Respiratory Medicine'),
('Paru Kiri', 'Sedih', 75, 1, 'Kesedihan mendalam mempengaruhi kapasitas paru', 'Respiratory Medicine'),
('Paru Kanan', 'Duka', 75, 2, 'Grief menyebabkan penyempitan saluran napas', 'Bereavement Studies'),
('Paru Kiri', 'Duka', 75, 2, 'Grief menyebabkan penyempitan saluran napas', 'Bereavement Studies'),

-- Lambung
('Lambung', 'Khawatir', 100, 1, 'Kekhawatiran meningkatkan produksi asam lambung', 'Gut-Brain Axis Studies'),
('Lambung', 'Cemas', 100, 2, 'Kecemasan mempengaruhi motilitas lambung', 'Gastroenterology Journal'),
('Lambung', 'Inner Child Terluka', 50, 3, 'Trauma masa kecil tersimpan di solar plexus', 'Developmental Psychology'),

-- Jantung
('Jantung', 'Patah Hati', 75, 1, 'Sindrom patah hati (Takotsubo) adalah kondisi medis nyata', 'Cardiology Research'),
('Jantung', 'Kesepian', 75, 2, 'Kesepian kronis meningkatkan risiko penyakit jantung', 'AHA Journals'),
('Jantung', 'Sedih', 75, 3, 'Kesedihan mendalam mempengaruhi ritme jantung', 'Heart Rhythm Journal'),

-- Kulit
('Kulit', 'Malu', 20, 1, 'Malu melemahkan sistem imun dan menyerang kulit', 'Dermatology Research'),
('Kulit', 'Merasa Tidak Berharga', 20, 2, 'Perasaan tidak berharga bermanifestasi di kulit', 'Psychodermatology'),
('Kulit', 'Merasa Rendah Diri', 20, 3, 'Rendah diri menyebabkan stres oksidatif pada kulit', 'Skin Health Studies'),

-- Usus
('Usus', 'Cemas', 100, 1, 'Kecemasan mempengaruhi mikrobioma usus', 'Microbiome Journal'),
('Usus Besar', 'Trauma Masa Kecil', 50, 2, 'Trauma tersimpan di usus (gut feeling)', 'Gut-Brain Axis'),
('Usus Besar', 'Tidak Bisa Melepaskan', 50, 3, 'Sembelit terkait ketidakmampuan melepaskan emosi', 'Functional GI Studies'),

-- Otak
('Otak', 'Stres', 100, 1, 'Stres kronis menyebabkan penyusutan hippocampus', 'Neuroscience Journal'),
('Otak', 'Overthinking', 100, 2, 'Overthinking meningkatkan kortisol otak', 'Cognitive Studies'),
('Otak', 'Perfeksionis', 175, 3, 'Perfeksionisme menyebabkan kelelahan mental', 'Psychology Today'),

-- Tiroid
('Tiroid', 'Tidak Bisa Ekspresikan Diri', 100, 1, 'Tiroid terkait dengan ekspresi diri', 'Endocrine Studies'),
('Tiroid', 'Merasa Tidak Didengar', 100, 2, 'Merasa tidak didengar mempengaruhi tiroid', 'Thyroid Research');

-- =====================================================
-- SEED DATA: Herbal Recommendations
-- =====================================================
INSERT INTO iridology_herbal_recommendations (organ_id, herbal_name, herbal_name_latin, dosage, schedule, duration, benefits, scientific_basis, journal_source) VALUES
-- Hati
('Hati', 'Temulawak', 'Curcuma xanthorrhiza', '1 sendok makan', 'pagi', '4-8 minggu', 'Detoksifikasi hati, anti-inflamasi', 'Kurkuminoid melindungi sel hati', 'J. Ethnopharmacology'),
('Hati', 'Kunyit', 'Curcuma longa', '1/2 sendok teh', 'pagi', '4-8 minggu', 'Anti-inflamasi, antioksidan', 'Kurkumin modulasi NF-kB pathway', 'Frontiers Pharmacology'),

-- Ginjal
('Ginjal Kanan', 'Pegagan', 'Centella asiatica', '1 cangkir teh', 'siang', '4-8 minggu', 'Melancarkan sirkulasi, detoks ginjal', 'Triterpenoid meningkatkan fungsi ginjal', 'Kidney Research'),
('Ginjal Kiri', 'Pegagan', 'Centella asiatica', '1 cangkir teh', 'siang', '4-8 minggu', 'Melancarkan sirkulasi, detoks ginjal', 'Triterpenoid meningkatkan fungsi ginjal', 'Kidney Research'),
('Ginjal Kanan', 'Habbatussauda', 'Nigella sativa', '1 kapsul', 'siang', '4-8 minggu', 'Anti-inflamasi, pelindung ginjal', 'Thymoquinone melindungi nefron', 'NIH Clinical Trials'),
('Ginjal Kiri', 'Habbatussauda', 'Nigella sativa', '1 kapsul', 'siang', '4-8 minggu', 'Anti-inflamasi, pelindung ginjal', 'Thymoquinone melindungi nefron', 'NIH Clinical Trials'),

-- Paru-paru
('Paru Kanan', 'Jahe Merah', 'Zingiber officinale', '1 ruas', 'pagi', '4-8 minggu', 'Menghangatkan paru, melancarkan napas', 'Gingerol anti-inflamasi saluran napas', 'Respiratory Medicine'),
('Paru Kiri', 'Jahe Merah', 'Zingiber officinale', '1 ruas', 'pagi', '4-8 minggu', 'Menghangatkan paru, melancarkan napas', 'Gingerol anti-inflamasi saluran napas', 'Respiratory Medicine'),
('Paru Kanan', 'Kencur', 'Kaempferia galanga', '1 ruas dikunyah', 'pagi', '4-8 minggu', 'Mukolitik, jernihkan saluran napas', 'Mengurangi akumulasi lendir', 'J. Ethnopharmacology'),
('Paru Kiri', 'Kencur', 'Kaempferia galanga', '1 ruas dikunyah', 'pagi', '4-8 minggu', 'Mukolitik, jernihkan saluran napas', 'Mengurangi akumulasi lendir', 'J. Ethnopharmacology'),
('Paru Kanan', 'Madu', 'Apis mellifera', '1 sendok makan', 'pagi', '4-8 minggu', 'Menenangkan tenggorokan iritasi', 'Efektivitas setara dekstrometorfan', 'J. Nursing Indonesia'),
('Paru Kiri', 'Madu', 'Apis mellifera', '1 sendok makan', 'pagi', '4-8 minggu', 'Menenangkan tenggorokan iritasi', 'Efektivitas setara dekstrometorfan', 'J. Nursing Indonesia'),

-- Lambung
('Lambung', 'Kunyit', 'Curcuma longa', '1/2 sendok teh', 'sebelum makan', '4-8 minggu', 'Menetralkan asam lambung', 'Anti-inflamasi mukosa lambung', 'Gastroenterology'),
('Lambung', 'Air Nabeez', 'Phoenix dactylifera', '1 gelas', 'pagi', '4-8 minggu', 'Detoks alami, menyehatkan lambung', 'Probiotik alami dari fermentasi', 'Islamic Medicine Studies'),

-- Jantung
('Jantung', 'Kurma', 'Phoenix dactylifera', '3-7 butir', 'pagi', 'harian', 'Energi untuk jantung, antioksidan', 'Fenolik melindungi sel jantung', 'Cardiology Nutrition'),
('Jantung', 'Saffron', 'Crocus sativus', '3-5 helai', 'siang', '4-8 minggu', 'Memperbaiki mood, sehatkan jantung', 'Modulasi serotonin', 'BJPsych Open'),

-- Kulit
('Kulit', 'Bunga Telang', 'Clitoria ternatea', '1 cangkir teh', 'sore', '4-8 minggu', 'Antioksidan untuk kulit', 'Antosianin melindungi kulit', 'ResearchGate'),
('Kulit', 'Madu', 'Apis mellifera', 'masker wajah', 'malam', '4-8 minggu', 'Antibakteri, regenerasi kulit', 'Sifat antimikroba alami', 'Dermatology Research'),

-- Otak
('Otak', 'Ashwagandha', 'Withania somnifera', '1 kapsul', 'malam', '4-8 minggu', 'Menurunkan kortisol, menenangkan', 'Penurunan kortisol 27-30%', 'J. Clinical Medicine'),
('Otak', 'Pegagan', 'Centella asiatica', '1 cangkir teh', 'siang', '4-8 minggu', 'Meningkatkan fokus dan memori', 'Meningkatkan aliran oksigen ke otak', 'Cognitive Studies'),
('Otak', 'Bunga Telang', 'Clitoria ternatea', '1 cangkir teh', 'sore', '4-8 minggu', 'Neuroprotektif, meningkatkan asetilkolin', 'Meningkatkan memori dan konsentrasi', 'ResearchGate'),

-- Tiroid
('Tiroid', 'Rumput Laut', 'Laminaria sp.', 'sebagai lauk', 'siang', '4-8 minggu', 'Sumber yodium alami untuk tiroid', 'Yodium penting untuk hormon tiroid', 'Endocrine Reviews');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- Run this script in Supabase SQL Editor to create all iridology tables
-- Total: 6 tables created + seed data for zones, emotions, and herbs
