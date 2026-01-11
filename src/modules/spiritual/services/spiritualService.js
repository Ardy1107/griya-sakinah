import { supabase } from '../../../lib/supabase';

// =====================================================
// EMOSI SERVICES
// =====================================================

export async function getEmosi(kategori = null) {
    let query = supabase
        .from('spiritual_emosi')
        .select('*')
        .order('urutan', { ascending: true });

    if (kategori) {
        query = query.eq('kategori', kategori);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getEmosiNegatif() {
    return getEmosi('negatif');
}

export async function getEmosiPositif() {
    return getEmosi('positif');
}

// =====================================================
// DOA SERVICES
// =====================================================

export async function getDoa(kategori = null) {
    let query = supabase
        .from('spiritual_doa')
        .select('*')
        .order('urutan', { ascending: true });

    if (kategori) {
        query = query.eq('kategori', kategori);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getDoaParaNabi() {
    return getDoa('para_nabi');
}

export async function getDoaSulaiman() {
    return getDoa('sulaiman');
}

export async function getDoaLogos() {
    return getDoa('logos');
}

// =====================================================
// ZIKIR SERVICES
// =====================================================

export async function getZikir(waktu = null) {
    let query = supabase
        .from('spiritual_zikir')
        .select('*')
        .order('urutan', { ascending: true });

    if (waktu) {
        query = query.eq('waktu', waktu);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// =====================================================
// AMALAN SERVICES
// =====================================================

export async function getAmalan(kategori = null) {
    let query = supabase
        .from('spiritual_amalan')
        .select('*')
        .order('urutan', { ascending: true });

    if (kategori) {
        query = query.eq('kategori', kategori);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// =====================================================
// SEFT SESSION SERVICES
// =====================================================

export async function createSeftSession(sessionData) {
    const { data, error } = await supabase
        .from('spiritual_seft_sessions')
        .insert([sessionData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getSeftSessions(userId, tanggal = null) {
    let query = supabase
        .from('spiritual_seft_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (tanggal) {
        query = query.eq('tanggal', tanggal);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// Get all SEFT sessions (for anonymous/non-logged-in users, uses device_id)
export async function getSeftSessionsByDevice(deviceId) {
    const { data, error } = await supabase
        .from('spiritual_seft_sessions')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

// Get today's SEFT count
export async function getTodaySeftCount(userId = null, deviceId = null) {
    const today = new Date().toISOString().split('T')[0];

    let query = supabase
        .from('spiritual_seft_sessions')
        .select('id', { count: 'exact' })
        .eq('tanggal', today);

    if (userId) {
        query = query.eq('user_id', userId);
    } else if (deviceId) {
        query = query.eq('device_id', deviceId);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
}

// Get SEFT history with statistics
export async function getSeftHistory(userId = null, deviceId = null, limit = 50) {
    let query = supabase
        .from('spiritual_seft_sessions')
        .select('*')
        .eq('mode', 'release')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (userId) {
        query = query.eq('user_id', userId);
    } else if (deviceId) {
        query = query.eq('device_id', deviceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

// Get SEFT statistics
export async function getSeftReleaseStats(userId = null, deviceId = null) {
    let query = supabase
        .from('spiritual_seft_sessions')
        .select('*')
        .eq('mode', 'release');

    if (userId) {
        query = query.eq('user_id', userId);
    } else if (deviceId) {
        query = query.eq('device_id', deviceId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const sessions = data || [];
    const totalReleased = sessions.length;
    const avgPenurunan = sessions.length > 0
        ? sessions.reduce((acc, s) => acc + ((s.rating_sebelum || 0) - (s.rating_sesudah || 0)), 0) / sessions.length
        : 0;

    // Count by category
    const byKategori = {};
    sessions.forEach(s => {
        const kat = s.kategori || 'Lainnya';
        byKategori[kat] = (byKategori[kat] || 0) + 1;
    });

    return {
        totalReleased,
        avgPenurunan: Math.round(avgPenurunan * 10) / 10,
        byKategori,
        sessions
    };
}

export async function getSeftStats(userId) {
    const { data, error } = await supabase
        .from('spiritual_seft_sessions')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;

    const releaseCount = data.filter(s => s.mode === 'release').length;
    const amplifyCount = data.filter(s => s.mode === 'amplify').length;
    const avgImprovement = data.length > 0
        ? data.reduce((acc, s) => acc + (s.rating_sebelum - s.rating_sesudah), 0) / data.length
        : 0;

    return {
        totalSessions: data.length,
        releaseCount,
        amplifyCount,
        avgImprovement: Math.round(avgImprovement * 10) / 10
    };
}

// Generate or get device ID for anonymous users
export function getDeviceId() {
    let deviceId = localStorage.getItem('seft_device_id');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('seft_device_id', deviceId);
    }
    return deviceId;
}

// =====================================================
// HABIT DAILY SERVICES
// =====================================================

export async function getHabitDaily(userId, tanggal) {
    const { data, error } = await supabase
        .from('spiritual_habit_daily')
        .select('*, spiritual_amalan(*)')
        .eq('user_id', userId)
        .eq('tanggal', tanggal);

    if (error) throw error;
    return data;
}

export async function upsertHabitDaily(habitData) {
    const { data, error } = await supabase
        .from('spiritual_habit_daily')
        .upsert([habitData], { onConflict: 'user_id,tanggal,amalan_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function toggleHabitCompletion(id, completed) {
    const { data, error } = await supabase
        .from('spiritual_habit_daily')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// =====================================================
// DOA DIAM-DIAM SERVICES (11 Ring System)
// =====================================================

export async function getDoaDiamdiam(userId, tanggal) {
    const { data, error } = await supabase
        .from('spiritual_doa_diamdiam')
        .select('*')
        .eq('user_id', userId)
        .eq('tanggal', tanggal)
        .order('ring', { ascending: true });

    if (error) throw error;
    return data;
}

export async function createDoaDiamdiam(doaData) {
    const { data, error } = await supabase
        .from('spiritual_doa_diamdiam')
        .insert([doaData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function toggleDoaDiamdiam(id, completed) {
    const { data, error } = await supabase
        .from('spiritual_doa_diamdiam')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getRingContacts(userId) {
    const { data, error } = await supabase
        .from('spiritual_ring_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('ring', { ascending: true })
        .order('urutan', { ascending: true });

    if (error) throw error;
    return data;
}

export async function upsertRingContact(contactData) {
    const { data, error } = await supabase
        .from('spiritual_ring_contacts')
        .upsert([contactData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// =====================================================
// MUHASABAH SERVICES
// =====================================================

export async function getMuhasabah(userId, tanggal) {
    const { data, error } = await supabase
        .from('spiritual_muhasabah')
        .select('*')
        .eq('user_id', userId)
        .eq('tanggal', tanggal)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function upsertMuhasabah(muhasabahData) {
    const { data, error } = await supabase
        .from('spiritual_muhasabah')
        .upsert([muhasabahData], { onConflict: 'user_id,tanggal' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// =====================================================
// SYUKUR SERVICES
// =====================================================

export async function getSyukur(userId, tanggal) {
    const { data, error } = await supabase
        .from('spiritual_syukur')
        .select('*')
        .eq('user_id', userId)
        .eq('tanggal', tanggal)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

export async function createSyukur(syukurData) {
    const { data, error } = await supabase
        .from('spiritual_syukur')
        .insert([syukurData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getTotalSedekahSyukur(userId) {
    const { data, error } = await supabase
        .from('spiritual_syukur')
        .select('nominal_sedekah')
        .eq('user_id', userId)
        .not('nominal_sedekah', 'is', null);

    if (error) throw error;
    return data.reduce((acc, item) => acc + (parseFloat(item.nominal_sedekah) || 0), 0);
}

// =====================================================
// QALBU METER SERVICES
// =====================================================

export async function getQalbuMeter(userId, tanggal) {
    const { data, error } = await supabase
        .from('spiritual_qalbu_meter')
        .select('*')
        .eq('user_id', userId)
        .eq('tanggal', tanggal)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function upsertQalbuMeter(qalbuData) {
    const { data, error } = await supabase
        .from('spiritual_qalbu_meter')
        .upsert([qalbuData], { onConflict: 'user_id,tanggal' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getQalbuMeterHistory(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
        .from('spiritual_qalbu_meter')
        .select('*')
        .eq('user_id', userId)
        .gte('tanggal', startDate.toISOString().split('T')[0])
        .order('tanggal', { ascending: true });

    if (error) throw error;
    return data;
}

// =====================================================
// STREAK SERVICES
// =====================================================

export async function getStreak(userId, kategori) {
    const { data, error } = await supabase
        .from('spiritual_streak')
        .select('*')
        .eq('user_id', userId)
        .eq('kategori', kategori)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function updateStreak(userId, kategori) {
    const today = new Date().toISOString().split('T')[0];

    // Get existing streak
    const existing = await getStreak(userId, kategori);

    if (existing) {
        const lastDate = existing.last_completed_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak;
        if (lastDate === today) {
            // Already completed today, no change
            return existing;
        } else if (lastDate === yesterdayStr) {
            // Consecutive day
            newStreak = existing.current_streak + 1;
        } else {
            // Streak broken
            newStreak = 1;
        }

        const { data, error } = await supabase
            .from('spiritual_streak')
            .update({
                current_streak: newStreak,
                longest_streak: Math.max(newStreak, existing.longest_streak),
                last_completed_date: today,
                total_completed: existing.total_completed + 1
            })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        // Create new streak
        const { data, error } = await supabase
            .from('spiritual_streak')
            .insert([{
                user_id: userId,
                kategori,
                current_streak: 1,
                longest_streak: 1,
                last_completed_date: today,
                total_completed: 1
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

// =====================================================
// KEBAIKAN SERVICES
// =====================================================

export async function getKebaikan(userId, tanggal) {
    const { data, error } = await supabase
        .from('spiritual_kebaikan')
        .select('*')
        .eq('user_id', userId)
        .eq('tanggal', tanggal)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

export async function createKebaikan(kebaikanData) {
    const { data, error } = await supabase
        .from('spiritual_kebaikan')
        .insert([kebaikanData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

// =====================================================
// MEMAAFKAN SERVICES
// =====================================================

export async function getMemaafkan(userId) {
    const { data, error } = await supabase
        .from('spiritual_memaafkan')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createMemaafkan(memaafkanData) {
    const { data, error } = await supabase
        .from('spiritual_memaafkan')
        .insert([memaafkanData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function markAsForgiven(id) {
    const { data, error } = await supabase
        .from('spiritual_memaafkan')
        .update({
            sudah_dimaafkan: true,
            tanggal_maafkan: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// =====================================================
// ABUNDANCE PROGRESS SERVICES
// =====================================================

export async function getAbundanceProgress(userId) {
    const { data, error } = await supabase
        .from('spiritual_abundance_progress')
        .select('*, spiritual_abundance_materi(*)')
        .eq('user_id', userId)
        .order('hari', { ascending: true });

    if (error) throw error;
    return data;
}

export async function upsertAbundanceProgress(progressData) {
    const { data, error } = await supabase
        .from('spiritual_abundance_progress')
        .upsert([progressData], { onConflict: 'user_id,hari' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getAbundanceMateri() {
    const { data, error } = await supabase
        .from('spiritual_abundance_materi')
        .select('*')
        .order('hari', { ascending: true });

    if (error) throw error;
    return data;
}
