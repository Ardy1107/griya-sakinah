-- ============================================================
-- Portal Griya Sakinah — 5 Fitur Baru: Database Setup
-- Run this in Supabase SQL Editor (Angsuran instance)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BATCH 1: Kalender Event + Voting/Polling
-- ============================================

-- 1. community_events
CREATE TABLE IF NOT EXISTS community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('pengajian','kerja_bakti','rapat','arisan','sosial','olahraga','lainnya')),
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    created_by UUID REFERENCES portal_users(id),
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern TEXT,
    max_participants INTEGER,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON community_events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON community_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON community_events(status);

-- 2. event_rsvps
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES portal_users(id),
    status TEXT DEFAULT 'going' CHECK (status IN ('going','maybe','not_going')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 3. polls
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    poll_type TEXT DEFAULT 'single' CHECK (poll_type IN ('single','multiple')),
    created_by UUID REFERENCES portal_users(id),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,
    require_verification BOOLEAN DEFAULT true,
    is_anonymous BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft','active','closed','cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);

-- 4. poll_options
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. poll_votes — 1 blok = 1 suara
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES portal_users(id),
    voter_blok TEXT NOT NULL,
    voter_nik TEXT,
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, voter_blok)
);

-- ============================================
-- BATCH 2: Keamanan + Notifikasi
-- ============================================

-- 6. security_schedules
CREATE TABLE IF NOT EXISTS security_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_date DATE NOT NULL,
    shift TEXT NOT NULL CHECK (shift IN ('malam_1','malam_2','subuh')),
    assigned_users UUID[] DEFAULT '{}',
    assigned_bloks TEXT[] DEFAULT '{}',
    notes TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','active','completed','missed')),
    created_by UUID REFERENCES portal_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_date ON security_schedules(schedule_date);

-- 7. security_checkins
CREATE TABLE IF NOT EXISTS security_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES security_schedules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES portal_users(id),
    checkin_time TIMESTAMPTZ DEFAULT NOW(),
    checkout_time TIMESTAMPTZ,
    notes TEXT
);

-- 8. panic_alerts
CREATE TABLE IF NOT EXISTS panic_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES portal_users(id),
    reporter_blok TEXT NOT NULL,
    alert_type TEXT DEFAULT 'emergency' CHECK (alert_type IN ('emergency','suspicious','fire','medical','other')),
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','responding','resolved','false_alarm')),
    responded_by UUID REFERENCES portal_users(id),
    responded_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_panic_status ON panic_alerts(status);

-- ============================================
-- BATCH 3: Real-time Chat
-- ============================================

-- 9. chat_rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    room_type TEXT DEFAULT 'group' CHECK (room_type IN ('private','group','announcement')),
    description TEXT,
    created_by UUID REFERENCES portal_users(id),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES portal_users(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','system')),
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_room ON chat_messages(room_id, created_at);

-- 11. chat_members
CREATE TABLE IF NOT EXISTS chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES portal_users(id),
    role TEXT DEFAULT 'member' CHECK (role IN ('admin','member')),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- ============================================
-- RLS Policies (all tables)
-- ============================================

ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE panic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;

-- Public read for all community features
CREATE POLICY "Allow public read events" ON community_events FOR SELECT USING (true);
CREATE POLICY "Allow public read rsvps" ON event_rsvps FOR SELECT USING (true);
CREATE POLICY "Allow public read polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Allow public read poll_options" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Allow public read poll_votes" ON poll_votes FOR SELECT USING (true);
CREATE POLICY "Allow public read schedules" ON security_schedules FOR SELECT USING (true);
CREATE POLICY "Allow public read checkins" ON security_checkins FOR SELECT USING (true);
CREATE POLICY "Allow public read alerts" ON panic_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read rooms" ON chat_rooms FOR SELECT USING (true);
CREATE POLICY "Allow public read messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public read members" ON chat_members FOR SELECT USING (true);

-- Full access for inserts/updates (anon key — app handles auth via portal_users)
CREATE POLICY "Allow insert events" ON community_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update events" ON community_events FOR UPDATE USING (true);
CREATE POLICY "Allow delete events" ON community_events FOR DELETE USING (true);

CREATE POLICY "Allow insert rsvps" ON event_rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update rsvps" ON event_rsvps FOR UPDATE USING (true);
CREATE POLICY "Allow delete rsvps" ON event_rsvps FOR DELETE USING (true);

CREATE POLICY "Allow insert polls" ON polls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update polls" ON polls FOR UPDATE USING (true);

CREATE POLICY "Allow insert poll_options" ON poll_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete poll_options" ON poll_options FOR DELETE USING (true);

CREATE POLICY "Allow insert poll_votes" ON poll_votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow insert schedules" ON security_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update schedules" ON security_schedules FOR UPDATE USING (true);

CREATE POLICY "Allow insert checkins" ON security_checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update checkins" ON security_checkins FOR UPDATE USING (true);

CREATE POLICY "Allow insert alerts" ON panic_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update alerts" ON panic_alerts FOR UPDATE USING (true);

CREATE POLICY "Allow insert rooms" ON chat_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update rooms" ON chat_rooms FOR UPDATE USING (true);

CREATE POLICY "Allow insert messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update messages" ON chat_messages FOR UPDATE USING (true);

CREATE POLICY "Allow insert members" ON chat_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update members" ON chat_members FOR UPDATE USING (true);
CREATE POLICY "Allow delete members" ON chat_members FOR DELETE USING (true);

-- ============================================
-- Enable Realtime for chat & panic alerts
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE panic_alerts;

-- ============================================
-- Seed: Default chat room
-- ============================================

INSERT INTO chat_rooms (name, room_type, description, is_default)
VALUES ('Warga Griya Sakinah', 'group', 'Group chat untuk seluruh warga perumahan', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Verify
-- ============================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'community_events','event_rsvps','polls','poll_options','poll_votes',
    'security_schedules','security_checkins','panic_alerts',
    'chat_rooms','chat_messages','chat_members'
)
ORDER BY table_name;
