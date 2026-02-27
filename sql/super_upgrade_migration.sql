-- ============================================================
-- Super Upgrade Migration — Griya Sakinah
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================
-- 1. CHAT UPGRADES: reactions, reply, image messages, channels
-- ============================================

-- Add reply_to support for message threading
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES chat_messages(id);

-- Add image_url for image messages (stored as GDrive URL)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Extend message_type to support more types
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_message_type_check
    CHECK (message_type IN ('text','image','file','system','announcement'));

-- Chat room enhancements
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'umum'
    CHECK (category IN ('umum','blok','marketplace','admin','custom'));
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS pinned_message_id UUID REFERENCES chat_messages(id);
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS blok TEXT;

-- Chat member enhancements
ALTER TABLE chat_members DROP CONSTRAINT IF EXISTS chat_members_role_check;
ALTER TABLE chat_members ADD CONSTRAINT chat_members_role_check
    CHECK (role IN ('admin','moderator','member'));

-- Message reactions
CREATE TABLE IF NOT EXISTS chat_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES portal_users(id),
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_message ON chat_reactions(message_id);

-- ============================================
-- 2. KEAMANAN UPGRADES: GPS, photo evidence
-- ============================================

-- Add GPS coordinates to panic alerts
ALTER TABLE panic_alerts ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE panic_alerts ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE panic_alerts ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE panic_alerts ADD COLUMN IF NOT EXISTS address_text TEXT;

-- Add GPS tracking to security checkins
ALTER TABLE security_checkins ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE security_checkins ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Incident reports (separate from panic for non-emergency)
CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES portal_users(id),
    reporter_blok TEXT NOT NULL,
    incident_type TEXT NOT NULL CHECK (incident_type IN ('theft','vandalism','noise','parking','stray_animal','flood','other')),
    title TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status TEXT DEFAULT 'reported' CHECK (status IN ('reported','investigating','resolved','dismissed')),
    resolved_by UUID REFERENCES portal_users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_status ON incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incident_date ON incident_reports(created_at);

-- ============================================
-- 3. VOTING UPGRADES: multi-choice, quorum
-- ============================================

-- Add quorum and max_choices to polls
ALTER TABLE polls ADD COLUMN IF NOT EXISTS min_quorum INTEGER;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS max_choices INTEGER DEFAULT 1;

-- Add realtime subscription for poll votes
ALTER PUBLICATION supabase_realtime ADD TABLE poll_votes;

-- ============================================
-- 4. KALENDER UPGRADES: comments, photo gallery
-- ============================================

-- Event comments
CREATE TABLE IF NOT EXISTS event_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES portal_users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_comments_event ON event_comments(event_id);

-- Event photos (stored in GDrive)
CREATE TABLE IF NOT EXISTS event_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES portal_users(id),
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event attendance (check-in based)
CREATE TABLE IF NOT EXISTS event_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES portal_users(id),
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Add realtime for RSVP updates
ALTER PUBLICATION supabase_realtime ADD TABLE event_rsvps;

-- ============================================
-- 5. WARGA PORTAL: notifications
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES portal_users(id),
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info' CHECK (type IN ('info','warning','success','alert','chat','event','voting','security')),
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications(created_at);

-- ============================================
-- RLS Policies for new tables
-- ============================================

ALTER TABLE chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read reactions" ON chat_reactions FOR SELECT USING (true);
CREATE POLICY "Allow public read incidents" ON incident_reports FOR SELECT USING (true);
CREATE POLICY "Allow public read event_comments" ON event_comments FOR SELECT USING (true);
CREATE POLICY "Allow public read event_photos" ON event_photos FOR SELECT USING (true);
CREATE POLICY "Allow public read attendance" ON event_attendance FOR SELECT USING (true);
CREATE POLICY "Allow public read notifications" ON notifications FOR SELECT USING (true);

-- Full access for app-managed auth
CREATE POLICY "Allow insert reactions" ON chat_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete reactions" ON chat_reactions FOR DELETE USING (true);

CREATE POLICY "Allow insert incidents" ON incident_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update incidents" ON incident_reports FOR UPDATE USING (true);

CREATE POLICY "Allow insert event_comments" ON event_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete event_comments" ON event_comments FOR DELETE USING (true);

CREATE POLICY "Allow insert event_photos" ON event_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete event_photos" ON event_photos FOR DELETE USING (true);

CREATE POLICY "Allow insert attendance" ON event_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete attendance" ON event_attendance FOR DELETE USING (true);

CREATE POLICY "Allow insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update notifications" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Allow delete notifications" ON notifications FOR DELETE USING (true);

-- Realtime for notifications and chat reactions
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_reactions;

-- ============================================
-- Seed: Default chat channels
-- ============================================

INSERT INTO chat_rooms (name, room_type, description, is_default, category, icon, blok)
VALUES
    ('📢 Pengumuman', 'announcement', 'Pengumuman resmi dari pengurus', true, 'admin', '📢', NULL),
    ('🏠 Blok A', 'group', 'Chat khusus warga Blok A', false, 'blok', '🏠', 'A'),
    ('🏡 Blok B', 'group', 'Chat khusus warga Blok B', false, 'blok', '🏡', 'B'),
    ('🛒 Jual Beli', 'group', 'Jual beli antar warga', false, 'marketplace', '🛒', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- Verify all new tables
-- ============================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'chat_reactions','incident_reports','event_comments',
    'event_photos','event_attendance','notifications'
)
ORDER BY table_name;
