import { supabase } from '../../../lib/supabase';

// =====================================================
// IRIDOLOGY ZONES SERVICES
// =====================================================

/**
 * Get all iridology zones
 */
export async function getIridologyZones(eyeSide = null) {
    let query = supabase
        .from('iridology_zones')
        .select('*')
        .order('zone_number', { ascending: true });

    if (eyeSide && eyeSide !== 'both') {
        query = query.or(`eye_side.eq.${eyeSide},eye_side.eq.both`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Get zones by clock position for a specific eye
 */
export async function getZonesByClockPosition(eyeSide) {
    const { data, error } = await supabase
        .from('iridology_zones')
        .select('*')
        .eq('zone_type', 'clock')
        .or(`eye_side.eq.${eyeSide},eye_side.eq.both`)
        .order('clock_position', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Get concentric zones
 */
export async function getConcentricZones() {
    const { data, error } = await supabase
        .from('iridology_zones')
        .select('*')
        .eq('zone_type', 'concentric')
        .order('zone_number', { ascending: true });

    if (error) throw error;
    return data || [];
}

// =====================================================
// ORGAN-EMOTION MAPPING SERVICES
// =====================================================

/**
 * Get emotions related to an organ
 */
export async function getEmotionsByOrgan(organId) {
    const { data, error } = await supabase
        .from('iridology_organ_emotions')
        .select('*')
        .eq('organ_id', organId)
        .order('priority', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Get all organ-emotion mappings
 */
export async function getAllOrganEmotions() {
    const { data, error } = await supabase
        .from('iridology_organ_emotions')
        .select('*')
        .order('organ_id', { ascending: true })
        .order('priority', { ascending: true });

    if (error) throw error;
    return data || [];
}

// =====================================================
// HERBAL RECOMMENDATION SERVICES
// =====================================================

/**
 * Get herbal recommendations for an organ
 */
export async function getHerbalByOrgan(organId) {
    const { data, error } = await supabase
        .from('iridology_herbal_recommendations')
        .select('*')
        .eq('organ_id', organId)
        .order('schedule', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Get all herbal recommendations
 */
export async function getAllHerbalRecommendations() {
    const { data, error } = await supabase
        .from('iridology_herbal_recommendations')
        .select('*')
        .order('organ_id', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Get herbal schedule (pagi, siang, malam)
 */
export async function getHerbalBySchedule(schedule) {
    const { data, error } = await supabase
        .from('iridology_herbal_recommendations')
        .select('*')
        .eq('schedule', schedule)
        .order('organ_id', { ascending: true });

    if (error) throw error;
    return data || [];
}

// =====================================================
// IRIDOLOGY SESSION SERVICES
// =====================================================

/**
 * Create new iridology session
 */
export async function createIridologySession(sessionData) {
    const { data, error } = await supabase
        .from('iridology_sessions')
        .insert([sessionData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get iridology sessions history
 */
export async function getIridologySessions(userId = null, deviceId = null, limit = 20) {
    let query = supabase
        .from('iridology_sessions')
        .select('*')
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

/**
 * Get single iridology session by ID
 */
export async function getIridologySessionById(sessionId) {
    const { data, error } = await supabase
        .from('iridology_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

// =====================================================
// HERBAL TRACKER SERVICES
// =====================================================

/**
 * Log herbal consumption
 */
export async function logHerbalConsumption(trackerData) {
    const { data, error } = await supabase
        .from('iridology_herbal_tracker')
        .insert([trackerData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Toggle herbal completion status
 */
export async function toggleHerbalCompletion(id, completed) {
    const { data, error } = await supabase
        .from('iridology_herbal_tracker')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get today's herbal tracker
 */
export async function getTodayHerbalTracker(userId = null, deviceId = null) {
    const today = new Date().toISOString().split('T')[0];

    let query = supabase
        .from('iridology_herbal_tracker')
        .select('*')
        .eq('tanggal', today)
        .order('schedule', { ascending: true });

    if (userId) {
        query = query.eq('user_id', userId);
    } else if (deviceId) {
        query = query.eq('device_id', deviceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

/**
 * Get herbal tracker history
 */
export async function getHerbalTrackerHistory(userId = null, deviceId = null, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
        .from('iridology_herbal_tracker')
        .select('*')
        .gte('tanggal', startDate.toISOString().split('T')[0])
        .order('tanggal', { ascending: false });

    if (userId) {
        query = query.eq('user_id', userId);
    } else if (deviceId) {
        query = query.eq('device_id', deviceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

// =====================================================
// UTILITY: Generate recommendations from zones
// =====================================================

/**
 * Generate SEFT and Herbal recommendations based on selected zones
 * @param {string[]} selectedOrgans - Array of organ names
 * @returns {Promise<{emotions: Array, herbs: Array}>}
 */
export async function generateRecommendations(selectedOrgans) {
    const emotionsPromises = selectedOrgans.map(organ => getEmotionsByOrgan(organ));
    const herbsPromises = selectedOrgans.map(organ => getHerbalByOrgan(organ));

    const [emotionsResults, herbsResults] = await Promise.all([
        Promise.all(emotionsPromises),
        Promise.all(herbsPromises)
    ]);

    // Flatten and deduplicate
    const allEmotions = emotionsResults.flat();
    const allHerbs = herbsResults.flat();

    // Sort emotions by priority (penyakit hati berat lebih prioritas)
    const sortedEmotions = allEmotions.sort((a, b) => {
        if (a.emosi_level_hawkins !== b.emosi_level_hawkins) {
            return a.emosi_level_hawkins - b.emosi_level_hawkins;
        }
        return a.priority - b.priority;
    });

    // Remove duplicate emotions by name
    const uniqueEmotions = sortedEmotions.reduce((acc, curr) => {
        if (!acc.find(e => e.emosi_nama === curr.emosi_nama)) {
            acc.push(curr);
        }
        return acc;
    }, []);

    // Group herbs by schedule
    const herbsBySchedule = {
        pagi: allHerbs.filter(h => h.schedule === 'pagi'),
        siang: allHerbs.filter(h => h.schedule === 'siang'),
        sore: allHerbs.filter(h => h.schedule === 'sore'),
        malam: allHerbs.filter(h => h.schedule === 'malam'),
        lainnya: allHerbs.filter(h => !['pagi', 'siang', 'sore', 'malam'].includes(h.schedule))
    };

    return {
        emotions: uniqueEmotions,
        herbs: allHerbs,
        herbsBySchedule
    };
}
