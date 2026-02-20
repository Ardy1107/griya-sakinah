/**
 * Create Takjil Schedule Table via Supabase SQL
 * Uses the Supabase rpc endpoint to execute raw SQL
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxdelxjdgkwscnojhlhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZGVseGpkZ2t3c2Nub2pobGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODM0NDIsImV4cCI6MjA4Mjk1OTQ0Mn0.G11AtJjEF8yKjMQVizzu_hQzq9ZORlRdFivbBU9vE3I';

async function createTable() {
    console.log('🔧 Creating takjil_schedule table via SQL...\n');

    const sql = `
    CREATE TABLE IF NOT EXISTS takjil_schedule (
      id SERIAL PRIMARY KEY,
      no INTEGER NOT NULL,
      tanggal TEXT NOT NULL,
      tanggal_date DATE NOT NULL,
      nasi1_nama TEXT,
      nasi1_blok TEXT,
      nasi1_donatur BOOLEAN DEFAULT FALSE,
      nasi1_done BOOLEAN DEFAULT FALSE,
      nasi2_nama TEXT,
      nasi2_blok TEXT,
      nasi2_donatur BOOLEAN DEFAULT FALSE,
      nasi2_done BOOLEAN DEFAULT FALSE,
      takjil_nama TEXT,
      takjil_blok TEXT,
      takjil_donatur BOOLEAN DEFAULT FALSE,
      takjil_done BOOLEAN DEFAULT FALSE,
      minuman_nama TEXT,
      minuman_blok TEXT,
      minuman_donatur BOOLEAN DEFAULT FALSE,
      minuman_done BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    ALTER TABLE takjil_schedule ENABLE ROW LEVEL SECURITY;
    
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'takjil_schedule' AND policyname = 'Public read') THEN
        CREATE POLICY "Public read" ON takjil_schedule FOR SELECT USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'takjil_schedule' AND policyname = 'Public write') THEN
        CREATE POLICY "Public write" ON takjil_schedule FOR UPDATE USING (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'takjil_schedule' AND policyname = 'Public insert') THEN
        CREATE POLICY "Public insert" ON takjil_schedule FOR INSERT WITH CHECK (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'takjil_schedule' AND policyname = 'Public delete') THEN
        CREATE POLICY "Public delete" ON takjil_schedule FOR DELETE USING (true);
      END IF;
    END $$;
  `;

    // Use the SQL endpoint directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
        // The rpc function probably doesn't exist, try the pg_meta endpoint
        console.log('⚠️  Direct SQL execution not available via anon key.');
        console.log('📋 Please run this SQL in the Supabase SQL Editor:\n');
        console.log('1. Go to: https://supabase.com/dashboard/project/gxdelxjdgkwscnojhlhc/sql/new');
        console.log('2. Paste and run:\n');
        console.log(`CREATE TABLE IF NOT EXISTS takjil_schedule (
  id SERIAL PRIMARY KEY,
  no INTEGER NOT NULL,
  tanggal TEXT NOT NULL,
  tanggal_date DATE NOT NULL,
  nasi1_nama TEXT,
  nasi1_blok TEXT,
  nasi1_donatur BOOLEAN DEFAULT FALSE,
  nasi1_done BOOLEAN DEFAULT FALSE,
  nasi2_nama TEXT,
  nasi2_blok TEXT,
  nasi2_donatur BOOLEAN DEFAULT FALSE,
  nasi2_done BOOLEAN DEFAULT FALSE,
  takjil_nama TEXT,
  takjil_blok TEXT,
  takjil_donatur BOOLEAN DEFAULT FALSE,
  takjil_done BOOLEAN DEFAULT FALSE,
  minuman_nama TEXT,
  minuman_blok TEXT,
  minuman_donatur BOOLEAN DEFAULT FALSE,
  minuman_done BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE takjil_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON takjil_schedule FOR SELECT USING (true);
CREATE POLICY "Public write" ON takjil_schedule FOR UPDATE USING (true);
CREATE POLICY "Public insert" ON takjil_schedule FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete" ON takjil_schedule FOR DELETE USING (true);`);
        console.log('\n3. Then re-run: node scripts/setup-takjil-table.js');
        return;
    }

    const result = await response.json();
    console.log('✅ Table created:', result);
}

createTable();
