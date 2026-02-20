/**
 * Setup Takjil Schedule Table in Supabase
 * Seeds the takjil_schedule table with 25 days of Ramadan schedule
 * 
 * Usage: node scripts/setup-takjil-table.js
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxfbulscyogddqsnmqhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZmJ1bHNjeW9nZGRxc25tcWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTYxNDQsImV4cCI6MjA4MjMzMjE0NH0.cLUlC3k7n3LE5x9IKC99vDofRpwcQqiTTqHenRLu6Hs';

const supabase = createClient(supabaseUrl, supabaseKey);

const SCHEDULE = [
    { no: 1, tanggal: 'Kamis, 19 Feb', tanggal_date: '2026-02-19', nasi1_nama: 'Pak Hasyid', nasi1_blok: 'B-1', nasi2_nama: 'Pak Arif', nasi2_blok: 'A-9', takjil_nama: 'Ibu Mariani', takjil_blok: 'B-5', minuman_nama: 'Pak Azzemy', minuman_blok: 'A-4' },
    { no: 2, tanggal: 'Jumat, 20 Feb', tanggal_date: '2026-02-20', nasi1_nama: 'Pak Juliansyah', nasi1_blok: 'B-6', nasi2_nama: 'Pak Alvin', nasi2_blok: 'A-3', takjil_nama: 'Pak Denny S.', takjil_blok: 'B-11', minuman_nama: 'Pak Tarmiji', minuman_blok: 'A-5' },
    { no: 3, tanggal: 'Sabtu, 21 Feb', tanggal_date: '2026-02-21', nasi1_nama: 'Pak Narto', nasi1_blok: 'A-2', nasi2_nama: 'Pak Steven H.', nasi2_blok: 'B-16', takjil_nama: 'Pak Sugianto', takjil_blok: 'A-17', minuman_nama: 'Pak Gilang A.', minuman_blok: 'B-12' },
    { no: 4, tanggal: 'Minggu, 22 Feb', tanggal_date: '2026-02-22', nasi1_nama: 'Pak Ardy', nasi1_blok: 'A-18', nasi2_nama: 'Pak Jumberi', nasi2_blok: 'B-10', takjil_nama: 'Pak Indra', takjil_blok: 'A-6', minuman_nama: "Pak M. Rifa'i", minuman_blok: 'B-9' },
    { no: 5, tanggal: 'Senin, 23 Feb', tanggal_date: '2026-02-23', nasi1_nama: 'Pak Galih', nasi1_blok: 'B-2', nasi2_nama: 'Pak Andy S.W.', nasi2_blok: 'A-16', takjil_nama: 'Pak Fadli', takjil_blok: 'A-1', minuman_nama: 'Pak Alpi', minuman_blok: 'B-3' },
    { no: 6, tanggal: 'Selasa, 24 Feb', tanggal_date: '2026-02-24', nasi1_nama: 'Ust Mujennih', nasi1_blok: 'A-11', nasi2_nama: 'Mama Risky', nasi2_blok: 'Kav', takjil_nama: 'Ibu Kamariah', takjil_blok: 'B-4', minuman_nama: 'Pak Ramadhani', minuman_blok: 'B-7' },
    { no: 7, tanggal: 'Rabu, 25 Feb', tanggal_date: '2026-02-25', nasi1_nama: 'Pak Bagus P.', nasi1_blok: 'B-8', nasi2_nama: 'Pak Ahmad E.', nasi2_blok: 'A-13', takjil_nama: 'Pak Steven H.', takjil_blok: 'B-16', minuman_nama: 'Pak Yudi', minuman_blok: 'A-15' },
    { no: 8, tanggal: 'Kamis, 26 Feb', tanggal_date: '2026-02-26', nasi1_nama: 'Pak Sandri', nasi1_blok: 'A-14', nasi2_nama: 'Pak Ari', nasi2_blok: 'B-20', takjil_nama: 'Pak Nur Rahman', takjil_blok: 'B-17', minuman_nama: 'Pak Fitra', minuman_blok: 'A-12' },
    { no: 9, tanggal: 'Jumat, 27 Feb', tanggal_date: '2026-02-27', nasi1_nama: 'Pak Arpan', nasi1_blok: 'B-19', nasi2_nama: 'Ibu Dwi', nasi2_blok: 'Kav', takjil_nama: 'Pak Rani', takjil_blok: 'Kav', minuman_nama: 'Pak Yadin', minuman_blok: 'Kav' },
    { no: 10, tanggal: 'Sabtu, 28 Feb', tanggal_date: '2026-02-28', nasi1_nama: 'Pak Azzemy', nasi1_blok: 'A-4', nasi2_nama: 'Ibu Mariani', nasi2_blok: 'B-5', takjil_nama: 'Pak Hasyid', takjil_blok: 'B-1', minuman_nama: 'Pak Arif', minuman_blok: 'A-9' },
    { no: 11, tanggal: 'Minggu, 01 Mar', tanggal_date: '2026-03-01', nasi1_nama: 'Pak Denny S.', nasi1_blok: 'B-11', nasi2_nama: 'Pak Tarmiji', nasi2_blok: 'A-5', takjil_nama: 'Pak Juliansyah', takjil_blok: 'B-6', minuman_nama: 'Pak Alvin', minuman_blok: 'A-3' },
    { no: 12, tanggal: 'Senin, 02 Mar', tanggal_date: '2026-03-02', nasi1_nama: 'Pak Sugianto', nasi1_blok: 'A-17', nasi2_nama: 'Pak Gilang A.', nasi2_blok: 'B-12', takjil_nama: 'Pak Narto', takjil_blok: 'A-2', minuman_nama: 'Pak Jumberi', minuman_blok: 'B-10' },
    { no: 13, tanggal: 'Selasa, 03 Mar', tanggal_date: '2026-03-03', nasi1_nama: 'Pak Yadin', nasi1_blok: 'Kav', nasi2_nama: "Pak M. Rifa'i", nasi2_blok: 'B-9', takjil_nama: 'Pakde Loso', takjil_blok: 'Kav', minuman_nama: 'Pak Supriono', minuman_blok: 'Kav' },
    { no: 14, tanggal: 'Rabu, 04 Mar', tanggal_date: '2026-03-04', nasi1_nama: 'Pak Fadli', nasi1_blok: 'A-1', nasi2_nama: 'Pak Alpi', nasi2_blok: 'B-3', takjil_nama: 'Pak Galih', takjil_blok: 'B-2', minuman_nama: 'Pak Andy S.W.', minuman_blok: 'A-16' },
    { no: 15, tanggal: 'Kamis, 05 Mar', tanggal_date: '2026-03-05', nasi1_nama: 'Ibu Kamariah', nasi1_blok: 'B-4', nasi2_nama: 'Pak Ramadhani', nasi2_blok: 'B-7', takjil_nama: 'Ust Mujennih', takjil_blok: 'A-11', minuman_nama: 'Pak Ahmad E.', minuman_blok: 'A-13' },
    { no: 16, tanggal: 'Jumat, 06 Mar', tanggal_date: '2026-03-06', nasi1_nama: 'Pak Yudi', nasi1_blok: 'A-15', nasi2_nama: 'Pak Fitra', nasi2_blok: 'A-12', takjil_nama: 'Pak Bagus P.', takjil_blok: 'B-8', minuman_nama: 'Pak Sandri', minuman_blok: 'A-14' },
    { no: 17, tanggal: 'Sabtu, 07 Mar', tanggal_date: '2026-03-07', nasi1_nama: 'Pak Nur Rahman', nasi1_blok: 'B-17', nasi2_nama: 'Pak Supriono', nasi2_blok: 'Kav', takjil_nama: 'Pak Ardy', takjil_blok: 'A-18', minuman_nama: 'Pak Ari', minuman_blok: 'B-20' },
    { no: 18, tanggal: 'Minggu, 08 Mar', tanggal_date: '2026-03-08', nasi1_nama: 'Ibu Ita', nasi1_blok: 'B-18', nasi2_nama: 'Pak Indra', nasi2_blok: 'A-6', takjil_nama: 'Ibu Dwi', takjil_blok: 'Kav', minuman_nama: 'Pak Hamka', minuman_blok: 'Kav' },
    { no: 19, tanggal: 'Senin, 09 Mar', tanggal_date: '2026-03-09', nasi1_nama: 'Pak M. Fauzi', nasi1_blok: 'B-14', nasi2_nama: 'Pak Rani', nasi2_blok: 'Kav', takjil_nama: 'Pak Pujianto', takjil_blok: 'Kav', minuman_nama: 'Mama Risky', minuman_blok: 'Kav' },
    { no: 20, tanggal: 'Selasa, 10 Mar', tanggal_date: '2026-03-10', nasi1_nama: 'Pakde Loso', nasi1_blok: 'Kav', nasi2_nama: 'Pak Jemi', nasi2_blok: 'Kav', takjil_nama: 'Pak Hamka', takjil_blok: 'Kav', minuman_nama: 'Pak Arpan', minuman_blok: 'B-19' },
    { no: 21, tanggal: 'Rabu, 11 Mar', tanggal_date: '2026-03-11', nasi1_nama: 'Pak Eko', nasi1_blok: 'Donatur', nasi2_nama: 'Pak Eko', nasi2_blok: 'Donatur', takjil_nama: 'Pak Eko', takjil_blok: 'Donatur', minuman_nama: 'Pak Eko', minuman_blok: 'Donatur' },
    { no: 22, tanggal: 'Kamis, 12 Mar', tanggal_date: '2026-03-12', nasi1_nama: 'Azzam', nasi1_blok: 'Donatur', nasi2_nama: null, nasi2_blok: null, takjil_nama: 'Ibu Ita', takjil_blok: 'B-18', minuman_nama: 'Pak Jemi', minuman_blok: 'Kav' },
    { no: 23, tanggal: 'Jumat, 13 Mar', tanggal_date: '2026-03-13', nasi1_nama: null, nasi1_blok: null, nasi2_nama: null, nasi2_blok: null, takjil_nama: 'Pak Pujianto', takjil_blok: 'Kav', minuman_nama: 'Pak M. Fauzi', minuman_blok: 'B-14' },
    { no: 24, tanggal: 'Sabtu, 14 Mar', tanggal_date: '2026-03-14', nasi1_nama: null, nasi1_blok: null, nasi2_nama: null, nasi2_blok: null, takjil_nama: 'Pak Galih', takjil_blok: 'B-2', minuman_nama: 'Pak Galih', minuman_blok: 'B-2' },
    { no: 25, tanggal: 'Minggu, 15 Mar', tanggal_date: '2026-03-15', nasi1_nama: null, nasi1_blok: null, nasi2_nama: null, nasi2_blok: null, takjil_nama: null, takjil_blok: null, minuman_nama: null, minuman_blok: null },
];

async function setup() {
    console.log('🔧 Seeding takjil_schedule table...\n');

    // Check if table is accessible
    const { data: checkData, error: checkError } = await supabase
        .from('takjil_schedule')
        .select('id')
        .limit(1);

    if (checkError) {
        console.log('❌ Cannot access takjil_schedule table:', checkError.message);
        console.log('   Make sure the table was created in Supabase SQL Editor.');
        return;
    }

    // If data already exists, clear it first
    if (checkData && checkData.length > 0) {
        console.log('⚠️  Table has existing data. Clearing...');
        const { error: delError } = await supabase
            .from('takjil_schedule')
            .delete()
            .neq('id', 0); // Delete all rows
        if (delError) {
            console.log('❌ Error clearing data:', delError.message);
            return;
        }
        console.log('✅ Cleared existing data');
    }

    // Seed data
    const rows = SCHEDULE.map(s => ({
        no: s.no,
        tanggal: s.tanggal,
        tanggal_date: s.tanggal_date,
        nasi1_nama: s.nasi1_nama || null,
        nasi1_blok: s.nasi1_blok || null,
        nasi1_donatur: s.nasi1_donatur || false,
        nasi1_done: false,
        nasi2_nama: s.nasi2_nama || null,
        nasi2_blok: s.nasi2_blok || null,
        nasi2_donatur: s.nasi2_donatur || false,
        nasi2_done: false,
        takjil_nama: s.takjil_nama || null,
        takjil_blok: s.takjil_blok || null,
        takjil_donatur: s.takjil_donatur || false,
        takjil_done: false,
        minuman_nama: s.minuman_nama || null,
        minuman_blok: s.minuman_blok || null,
        minuman_donatur: s.minuman_donatur || false,
        minuman_done: false,
    }));

    const { data, error } = await supabase
        .from('takjil_schedule')
        .insert(rows)
        .select();

    if (error) {
        console.log('❌ Error seeding data:', error.message);
        console.log('   Details:', JSON.stringify(error, null, 2));
        return;
    }

    console.log(`✅ Seeded ${data.length} rows into takjil_schedule`);
    console.log('\n🎉 Setup complete!');
    console.log('\nPublic link: /komunitas/takjil');
    console.log('Admin link:  /komunitas/takjil/admin');
}

setup();
