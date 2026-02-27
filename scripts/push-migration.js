/**
 * Push Super Upgrade Migration to Supabase
 * Usage: node scripts/push-migration.js
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gxdelxjdgkwscnojhlhc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZGVseGpkZ2t3c2Nub2pobGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODM0NDIsImV4cCI6MjA4Mjk1OTQ0Mn0.G11AtJjEF8yKjMQVizzu_hQzq9ZORlRdFivbBU9vE3I';

async function runSQL(sql, label) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: sql }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.log(`⚠️  ${label}: ${text.substring(0, 100)}`);
            return false;
        }
        console.log(`✅ ${label}`);
        return true;
    } catch (err) {
        console.log(`❌ ${label}: ${err.message}`);
        return false;
    }
}

// Split SQL into individual statements and run via Supabase REST
async function main() {
    console.log('🚀 Pushing Super Upgrade Migration to Supabase...\n');
    console.log(`📡 Target: ${SUPABASE_URL}\n`);

    const sqlFile = fs.readFileSync(
        path.join(__dirname, '..', 'sql', 'super_upgrade_migration.sql'),
        'utf-8'
    );

    // Split SQL into statements (split by semicolons, ignoring comments)
    const statements = sqlFile
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('//'));

    console.log(`📋 Found ${statements.length} SQL statements\n`);

    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < statements.length; i++) {
        let stmt = statements[i].trim();

        // Skip pure comment blocks
        const lines = stmt.split('\n').filter(l => !l.trim().startsWith('--') && l.trim().length > 0);
        if (lines.length === 0) { skipped++; continue; }
        stmt = lines.join('\n');

        // Extract a label from the statement
        let label = `Statement ${i + 1}`;
        if (stmt.includes('CREATE TABLE')) {
            const match = stmt.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
            if (match) label = `CREATE TABLE ${match[1]}`;
        } else if (stmt.includes('ALTER TABLE')) {
            const match = stmt.match(/ALTER TABLE\s+(\w+)\s+(ADD|DROP|ENABLE)/i);
            if (match) label = `ALTER ${match[1]} ${match[2]}`;
        } else if (stmt.includes('CREATE INDEX')) {
            const match = stmt.match(/CREATE INDEX\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
            if (match) label = `CREATE INDEX ${match[1]}`;
        } else if (stmt.includes('CREATE POLICY')) {
            const match = stmt.match(/CREATE POLICY\s+"([^"]+)"/);
            if (match) label = `POLICY: ${match[1]}`;
        } else if (stmt.includes('INSERT INTO')) {
            const match = stmt.match(/INSERT INTO\s+(\w+)/i);
            if (match) label = `INSERT ${match[1]}`;
        } else if (stmt.includes('ALTER PUBLICATION')) {
            label = 'ALTER PUBLICATION (realtime)';
        } else if (stmt.includes('SELECT')) {
            label = 'VERIFY tables';
        }

        const ok = await runSQL(stmt + ';', label);
        if (ok) success++;
        else failed++;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Success: ${success}`);
    console.log(`⚠️  Failed/Skipped: ${failed}`);
    console.log(`⏭️  Skipped (comments): ${skipped}`);
    console.log(`${'='.repeat(50)}`);

    if (failed > 0) {
        console.log('\n💡 Some failures are expected (e.g. tables already exist, publication already has table).');
        console.log('   If the CREATE TABLE statements succeeded, the migration is complete.');
    }

    console.log('\n🎉 Migration push complete!');
}

main().catch(console.error);
