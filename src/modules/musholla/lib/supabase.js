import { createClient } from '@supabase/supabase-js';

// Supabase configuration (shared with Sakinah Net)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client with session persistence
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            storageKey: 'griya-musholla-auth',
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })
    : null;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return !!(supabaseUrl && supabaseAnonKey && supabase);
};

// ============================================
// MUSHOLLA DONORS (mush_donors)
// ============================================

export async function getDonors() {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
        .from('mush_donors')
        .select('*')
        .order('created_at', { ascending: false });
    return { data: data || [], error };
}

export async function getDonorById(id) {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
        .from('mush_donors')
        .select('*')
        .eq('id', id)
        .single();
    return { data, error };
}

export async function searchDonors(query) {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
        .from('mush_donors')
        .select('*')
        .ilike('nama', `%${query}%`)
        .limit(10);
    return { data: data || [], error };
}

export async function createDonor(donor) {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
        .from('mush_donors')
        .insert([donor])
        .select()
        .single();
    return { data, error };
}

export async function updateDonor(id, updates) {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
        .from('mush_donors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
}

// ============================================
// MUSHOLLA DONATIONS (mush_donations)
// ============================================

export async function getDonations() {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
        .from('mush_donations')
        .select(`
            *,
            mush_donors (
                id,
                nama,
                blok_rumah,
                no_telp
            )
        `)
        .order('tanggal_bayar', { ascending: false });
    return { data: data || [], error };
}

export async function getDonationByReference(reference) {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
        .from('mush_donations')
        .select(`
            *,
            mush_donors (
                id,
                nama,
                blok_rumah,
                no_telp
            )
        `)
        .eq('nomor_referensi', reference)
        .single();
    return { data, error };
}

export async function createDonation(donation) {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
        .from('mush_donations')
        .insert([donation])
        .select()
        .single();
    return { data, error };
}

export async function getNextDonationSequence() {
    if (!supabase) return 1;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const { count } = await supabase
        .from('mush_donations')
        .select('*', { count: 'exact', head: true })
        .gte('tanggal_bayar', startDate)
        .lte('tanggal_bayar', endDate);

    return (count || 0) + 1;
}

// ============================================
// CONSTRUCTION COSTS (mush_construction_costs)
// ============================================

export async function getConstructionCosts() {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
        .from('mush_construction_costs')
        .select('*')
        .order('tanggal', { ascending: false });
    return { data: data || [], error };
}

export async function createConstructionCost(cost) {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
        .from('mush_construction_costs')
        .insert([cost])
        .select()
        .single();
    return { data, error };
}

// ============================================
// PROGRESS GALLERY (mush_progress_gallery)
// ============================================

export async function getProgressGallery() {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
        .from('mush_progress_gallery')
        .select('*')
        .order('tanggal', { ascending: false });
    return { data: data || [], error };
}

export async function createProgressPhoto(photo) {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
        .from('mush_progress_gallery')
        .insert([photo])
        .select()
        .single();
    return { data, error };
}

// Alias for gallery page
export async function createProgressGallery(photo) {
    return createProgressPhoto(photo);
}

// ============================================
// SETTINGS (mush_settings)
// ============================================

export async function getSetting(key) {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
        .from('mush_settings')
        .select('value')
        .eq('key', key)
        .single();
    return { data: data?.value, error };
}

export async function updateSetting(key, value) {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
        .from('mush_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })
        .select()
        .single();
    return { data, error };
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
    if (!supabase) {
        return {
            totalTerkumpul: 0,
            totalTerpakai: 0,
            saldo: 0,
            targetDonasi: 500000000,
            totalDonatur: 0
        };
    }

    // Get total donations
    const { data: donationsData } = await supabase
        .from('mush_donations')
        .select('nominal');

    const totalTerkumpul = donationsData?.reduce((sum, d) => sum + parseFloat(d.nominal || 0), 0) || 0;

    // Get total expenses
    const { data: expensesData } = await supabase
        .from('mush_construction_costs')
        .select('nominal');

    const totalTerpakai = expensesData?.reduce((sum, e) => sum + parseFloat(e.nominal || 0), 0) || 0;

    // Get target from settings
    const { data: targetData } = await getSetting('target_donasi');
    const targetDonasi = parseInt(targetData) || 500000000;

    // Get unique donor count
    const { count: totalDonatur } = await supabase
        .from('mush_donors')
        .select('*', { count: 'exact', head: true });

    return {
        totalTerkumpul,
        totalTerpakai,
        saldo: totalTerkumpul - totalTerpakai,
        targetDonasi,
        totalDonatur: totalDonatur || 0
    };
}

// ============================================
// TOP DONORS
// ============================================

export async function getTopDonors(limit = 10) {
    if (!supabase) return { data: [], error: null };

    // Try RPC first
    const { data, error } = await supabase
        .rpc('get_mush_top_donors', { limit_count: limit });

    // If RPC doesn't exist, fallback to basic query
    if (error && error.code === 'PGRST202') {
        const { data: donations } = await supabase
            .from('mush_donations')
            .select(`
                nominal,
                mush_donors (id, nama, blok_rumah)
            `);

        // Aggregate by donor
        const donorTotals = {};
        donations?.forEach(d => {
            if (d.mush_donors) {
                const id = d.mush_donors.id;
                if (!donorTotals[id]) {
                    donorTotals[id] = {
                        ...d.mush_donors,
                        total: 0
                    };
                }
                donorTotals[id].total += parseFloat(d.nominal || 0);
            }
        });

        const sorted = Object.values(donorTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);

        return { data: sorted, error: null };
    }

    return { data: data || [], error };
}

// ============================================
// AUTHENTICATION
// ============================================

export async function signIn(email, password) {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    return { data, error };
}

export async function signOut() {
    if (!supabase) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getCurrentUser() {
    if (!supabase) return { data: null };
    const { data: { user } } = await supabase.auth.getUser();
    return { data: user };
}

export function onAuthStateChange(callback) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => { } } } };
    return supabase.auth.onAuthStateChange(callback);
}

// ============================================
// LINK WITH EXISTING WARGA (for integration)
// ============================================

export async function getExistingWarga() {
    if (!supabase) return { data: [], error: null };
    const { data, error } = await supabase
        .from('warga')
        .select('id, nama, no_rumah, no_telp')
        .eq('status_aktif', true)
        .order('no_rumah');
    return { data: data || [], error };
}

export async function linkDonorToWarga(donorId, wargaId) {
    if (!supabase) return { data: null, error: null };
    const { data, error } = await supabase
        .from('mush_donors')
        .update({ warga_id: wargaId })
        .eq('id', donorId)
        .select()
        .single();
    return { data, error };
}
