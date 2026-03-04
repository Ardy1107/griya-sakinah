-- V7: Maintenance Tracking for Housing Management
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('atap','pipa','listrik','cat','taman','jalan','lainnya')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'dilaporkan' CHECK (status IN ('dilaporkan','diproses','selesai')),
  reported_by TEXT,
  resolved_at TIMESTAMPTZ,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Policy: allow all authenticated operations (like other angsuran tables)
CREATE POLICY "Allow all operations on maintenance_logs" ON maintenance_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_logs;
