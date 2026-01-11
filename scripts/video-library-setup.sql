-- =====================================================
-- Video Library Schema for Spiritual Module
-- Portal Griya Sakinah
-- =====================================================

-- Create video_categories table
CREATE TABLE IF NOT EXISTS video_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES video_categories(id),
    title TEXT NOT NULL,
    description TEXT,
    gdrive_file_id TEXT NOT NULL,
    duration_minutes INTEGER,
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create video_progress table (track user watch progress)
CREATE TABLE IF NOT EXISTS video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID,
    device_id TEXT,
    last_position_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    watch_count INTEGER DEFAULT 1,
    last_watched_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(video_id, device_id)
);

-- Enable RLS
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read for categories and videos
CREATE POLICY "Anyone can view active categories"
    ON video_categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Anyone can view active videos"
    ON videos FOR SELECT
    USING (is_active = true);

CREATE POLICY "Anyone can view/update own progress"
    ON video_progress FOR ALL
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_device ON video_progress(device_id);
CREATE INDEX IF NOT EXISTS idx_videos_sort ON videos(sort_order);

-- =====================================================
-- SEED DATA - Categories
-- =====================================================

INSERT INTO video_categories (name, slug, description, icon, sort_order) VALUES
('Spiritual Abundance (AFZ)', 'abundance', 'Program Mentoring 38 Hari Financial & Spiritual Abundance', '✨', 1),
('SEFT Therapy', 'seft', 'Video Tutorial SEFT: Setup, Release, Amplify, dan Teknik Lanjutan', '🎯', 2),
('Iridology', 'iridology', 'Panduan Analisis Mata dan Kesehatan Holistik', '👁️', 3),
('Herbal & Nutrisi', 'herbal', 'Video Edukasi Herbal dan Nutrisi Islami', '🌿', 4)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SEED DATA - Sample Abundance Videos (23 videos)
-- Replace FILE_ID with actual Google Drive file IDs
-- =====================================================

INSERT INTO videos (category_id, title, description, gdrive_file_id, duration_minutes, sort_order) VALUES
-- Get category_id for abundance
((SELECT id FROM video_categories WHERE slug = 'abundance'),
 'Hari 1: Pengantar Spiritual Abundance', 
 'Memahami konsep dasar Spiritual Abundance dan 7 Prinsip AFZ',
 'PLACEHOLDER_FILE_ID_1', 45, 1),

((SELECT id FROM video_categories WHERE slug = 'abundance'),
 'Hari 2: Mindset Kelimpahan vs Kekurangan', 
 'Mengubah pola pikir dari scarcity ke abundance mindset',
 'PLACEHOLDER_FILE_ID_2', 38, 2),

((SELECT id FROM video_categories WHERE slug = 'abundance'),
 'Hari 3: Prinsip 1 - Gratitude (Syukur)', 
 'Praktik syukur harian untuk membuka pintu rezeki',
 'PLACEHOLDER_FILE_ID_3', 42, 3),

((SELECT id FROM video_categories WHERE slug = 'abundance'),
 'Hari 4: Prinsip 2 - Giving (Sedekah)', 
 'Hukum memberi dan menerima dalam Islam',
 'PLACEHOLDER_FILE_ID_4', 40, 4),

((SELECT id FROM video_categories WHERE slug = 'abundance'),
 'Hari 5: Prinsip 3 - Trust (Tawakkal)', 
 'Menyerahkan hasil kepada Allah setelah berikhtiar',
 'PLACEHOLDER_FILE_ID_5', 35, 5);

-- =====================================================
-- SEED DATA - Sample SEFT Videos (first 10 of 50)
-- Replace FILE_ID with actual Google Drive file IDs
-- =====================================================

INSERT INTO videos (category_id, title, description, gdrive_file_id, duration_minutes, sort_order) VALUES
((SELECT id FROM video_categories WHERE slug = 'seft'),
 'SEFT 101: Pengenalan Teknik SEFT', 
 'Apa itu SEFT dan bagaimana cara kerjanya',
 'PLACEHOLDER_SEFT_1', 25, 1),

((SELECT id FROM video_categories WHERE slug = 'seft'),
 'SEFT 102: 18 Titik Tapping', 
 'Panduan lengkap lokasi 18 titik meridian',
 'PLACEHOLDER_SEFT_2', 30, 2),

((SELECT id FROM video_categories WHERE slug = 'seft'),
 'SEFT 103: Teknik Setup', 
 'Cara membuat kalimat setup yang efektif',
 'PLACEHOLDER_SEFT_3', 20, 3),

((SELECT id FROM video_categories WHERE slug = 'seft'),
 'SEFT 104: Teknik Release', 
 'Praktik release emosi negatif step by step',
 'PLACEHOLDER_SEFT_4', 35, 4),

((SELECT id FROM video_categories WHERE slug = 'seft'),
 'SEFT 105: Teknik Amplify', 
 'Memperkuat emosi positif setelah release',
 'PLACEHOLDER_SEFT_5', 28, 5),

((SELECT id FROM video_categories WHERE slug = 'seft'),
 'SEFT untuk Trauma', 
 'Teknik khusus menangani trauma masa lalu',
 'PLACEHOLDER_SEFT_6', 45, 6),

((SELECT id FROM video_categories WHERE slug = 'seft'),
 'SEFT untuk Phobia', 
 'Mengatasi ketakutan dengan SEFT',
 'PLACEHOLDER_SEFT_7', 32, 7),

((SELECT id FROM video_categories WHERE slug = 'seft'),
 'SEFT untuk Kecanduan', 
 'Lepas dari kebiasaan buruk dengan SEFT',
 'PLACEHOLDER_SEFT_8', 40, 8),

((SELECT id FROM video_categories WHERE slug = 'seft'),
 'Surrogate SEFT', 
 'Terapi jarak jauh untuk orang lain',
 'PLACEHOLDER_SEFT_9', 38, 9),

((SELECT id FROM video_categories WHERE slug = 'seft'),
 'SEFT untuk Anak', 
 'Teknik SEFT khusus untuk anak-anak',
 'PLACEHOLDER_SEFT_10', 25, 10);

-- =====================================================
-- Note: Replace PLACEHOLDER_FILE_ID with actual 
-- Google Drive file IDs from your videos
-- Format: Just the ID part, e.g., "1ABC123xyz..."
-- =====================================================
