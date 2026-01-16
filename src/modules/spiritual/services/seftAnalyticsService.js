/**
 * SEFT Analytics Service
 * Advanced analytics for SEFT Release tracking
 */

import { supabase } from '../../../lib/supabase';

// =====================================================
// USER SETTINGS
// =====================================================

/**
 * Get user settings (target, program days, etc)
 */
export async function getUserSettings(deviceId) {
    const { data, error } = await supabase
        .from('spiritual_seft_user_settings')
        .select('*')
        .eq('device_id', deviceId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || { target_daily_sessions: 2, program_days: 14, notification_enabled: true };
}

/**
 * Upsert user settings
 */
export async function upsertUserSettings(deviceId, settings) {
    const { data, error } = await supabase
        .from('spiritual_seft_user_settings')
        .upsert({
            device_id: deviceId,
            target_daily_sessions: settings.target_daily_sessions,
            program_days: settings.program_days,
            notification_enabled: settings.notification_enabled,
            updated_at: new Date().toISOString()
        }, { onConflict: 'device_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// =====================================================
// ANALYTICS SUMMARY
// =====================================================

/**
 * Get analytics summary for dashboard cards
 */
export async function getAnalyticsSummary(deviceId, days = 14) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data: sessions, error } = await supabase
        .from('spiritual_seft_sessions')
        .select('*')
        .eq('device_id', deviceId)
        .eq('mode', 'release')
        .gte('tanggal', startDateStr)
        .order('tanggal', { ascending: false });

    if (error) throw error;

    const allSessions = sessions || [];
    const totalSessions = allSessions.length;

    // Count unique wounds vs recurring
    const woundCounts = {};
    allSessions.forEach(s => {
        const key = s.emosi_nama || 'Unknown';
        woundCounts[key] = (woundCounts[key] || 0) + 1;
    });

    const uniqueWounds = Object.keys(woundCounts).length;
    const recurringWounds = Object.values(woundCounts).filter(c => c > 1).length;

    // Calculate effectiveness
    const avgReduction = allSessions.length > 0
        ? allSessions.reduce((acc, s) => acc + ((s.rating_sebelum || 0) - (s.rating_sesudah || 0)), 0) / allSessions.length
        : 0;

    // Get target for progress calculation
    const settings = await getUserSettings(deviceId);
    const targetTotal = settings.target_daily_sessions * days;
    const progressPercent = targetTotal > 0 ? Math.round((totalSessions / targetTotal) * 100) : 0;

    return {
        totalSessions,
        uniqueWounds,
        recurringWounds,
        avgReduction: Math.round(avgReduction * 10) / 10,
        progressPercent: Math.min(progressPercent, 100),
        targetTotal,
        days
    };
}

// =====================================================
// TOP WOUNDS
// =====================================================

/**
 * Get top wounds by frequency with category colors
 */
export async function getTopWounds(deviceId, days = 14, limit = 10) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('spiritual_seft_sessions')
        .select('emosi_nama, kategori, rating_sebelum, rating_sesudah')
        .eq('device_id', deviceId)
        .eq('mode', 'release')
        .gte('tanggal', startDateStr);

    if (error) throw error;

    const woundStats = {};
    (data || []).forEach(s => {
        const key = s.emosi_nama || 'Unknown';
        if (!woundStats[key]) {
            woundStats[key] = {
                name: key,
                count: 0,
                kategori: s.kategori || 'Lainnya',
                totalReduction: 0
            };
        }
        woundStats[key].count++;
        woundStats[key].totalReduction += (s.rating_sebelum || 0) - (s.rating_sesudah || 0);
    });

    // Sort by count and limit
    const sorted = Object.values(woundStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(w => ({
            ...w,
            avgReduction: w.count > 0 ? Math.round((w.totalReduction / w.count) * 10) / 10 : 0
        }));

    return sorted;
}

// =====================================================
// RECURRING WOUNDS ANALYSIS
// =====================================================

/**
 * Analyze recurring wounds and detect patterns
 */
export async function getRecurringWounds(deviceId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('spiritual_seft_sessions')
        .select('emosi_nama, kategori, tanggal, rating_sebelum, rating_sesudah')
        .eq('device_id', deviceId)
        .eq('mode', 'release')
        .gte('tanggal', startDateStr)
        .order('tanggal', { ascending: true });

    if (error) throw error;

    const woundHistory = {};
    (data || []).forEach(s => {
        const key = s.emosi_nama || 'Unknown';
        if (!woundHistory[key]) {
            woundHistory[key] = {
                name: key,
                kategori: s.kategori || 'Lainnya',
                occurrences: [],
                dates: []
            };
        }
        woundHistory[key].occurrences.push(s);
        woundHistory[key].dates.push(new Date(s.tanggal));
    });

    // Find recurring wounds (appeared > 1 time)
    const recurring = Object.values(woundHistory)
        .filter(w => w.occurrences.length > 1)
        .map(w => {
            // Calculate average interval between occurrences
            const intervals = [];
            for (let i = 1; i < w.dates.length; i++) {
                const diff = Math.ceil((w.dates[i] - w.dates[i - 1]) / (1000 * 60 * 60 * 24));
                intervals.push(diff);
            }
            const avgInterval = intervals.length > 0
                ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
                : 0;

            // Calculate days since last occurrence
            const lastDate = w.dates[w.dates.length - 1];
            const daysSinceLast = Math.ceil((new Date() - lastDate) / (1000 * 60 * 60 * 24));

            return {
                name: w.name,
                kategori: w.kategori,
                recurrenceCount: w.occurrences.length,
                avgIntervalDays: avgInterval,
                daysSinceLast,
                lastDate: lastDate.toISOString().split('T')[0],
                needsAttention: daysSinceLast > avgInterval && avgInterval > 0 // May recur soon
            };
        })
        .sort((a, b) => b.recurrenceCount - a.recurrenceCount);

    return recurring;
}

// =====================================================
// EMOTION TIMELINE (for line chart)
// =====================================================

/**
 * Get emotion intensity timeline for charting
 */
export async function getEmotionTimeline(deviceId, days = 14) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('spiritual_seft_sessions')
        .select('tanggal, rating_sebelum, rating_sesudah, emosi_nama')
        .eq('device_id', deviceId)
        .eq('mode', 'release')
        .gte('tanggal', startDateStr)
        .order('tanggal', { ascending: true });

    if (error) throw error;

    // Group by date
    const dateMap = {};
    (data || []).forEach(s => {
        const date = s.tanggal;
        if (!dateMap[date]) {
            dateMap[date] = {
                date,
                avgBefore: 0,
                avgAfter: 0,
                sessions: 0,
                totalBefore: 0,
                totalAfter: 0
            };
        }
        dateMap[date].totalBefore += s.rating_sebelum || 0;
        dateMap[date].totalAfter += s.rating_sesudah || 0;
        dateMap[date].sessions++;
    });

    // Calculate averages
    const timeline = Object.values(dateMap).map(d => ({
        date: d.date,
        avgBefore: d.sessions > 0 ? Math.round((d.totalBefore / d.sessions) * 10) / 10 : 0,
        avgAfter: d.sessions > 0 ? Math.round((d.totalAfter / d.sessions) * 10) / 10 : 0,
        sessions: d.sessions
    }));

    return timeline;
}

// =====================================================
// ACTIVITY HEATMAP
// =====================================================

/**
 * Get activity heatmap data (days of week)
 */
export async function getActivityHeatmap(deviceId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('spiritual_seft_sessions')
        .select('tanggal')
        .eq('device_id', deviceId)
        .eq('mode', 'release')
        .gte('tanggal', startDateStr);

    if (error) throw error;

    // Count by day of week and week number
    const heatmap = {};
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    (data || []).forEach(s => {
        const date = new Date(s.tanggal);
        const dayOfWeek = date.getDay();
        const weekOfMonth = Math.floor(date.getDate() / 7);
        const key = `${weekOfMonth}-${dayOfWeek}`;

        if (!heatmap[key]) {
            heatmap[key] = { week: weekOfMonth, day: dayOfWeek, dayName: dayNames[dayOfWeek], count: 0 };
        }
        heatmap[key].count++;
    });

    return Object.values(heatmap);
}

// =====================================================
// RECOMMENDED TODAY
// =====================================================

/**
 * Get recommended wounds to release today based on patterns
 */
export async function getRecommendedToday(deviceId) {
    const recurring = await getRecurringWounds(deviceId, 60);

    // Filter wounds that need attention (likely to recur)
    const recommendations = recurring
        .filter(w => w.needsAttention || w.daysSinceLast >= w.avgIntervalDays)
        .slice(0, 3)
        .map(w => ({
            name: w.name,
            kategori: w.kategori,
            reason: w.needsAttention
                ? `Sudah ${w.daysSinceLast} hari tidak di-release (biasanya muncul setiap ${w.avgIntervalDays} hari)`
                : `Sering muncul (${w.recurrenceCount}x), terakhir ${w.daysSinceLast} hari lalu`,
            priority: w.needsAttention ? 'high' : 'medium'
        }));

    // If no recurring patterns, get most common wounds
    if (recommendations.length === 0) {
        const topWounds = await getTopWounds(deviceId, 30, 3);
        topWounds.forEach(w => {
            recommendations.push({
                name: w.name,
                kategori: w.kategori,
                reason: `Luka yang sering muncul (${w.count}x dalam 30 hari)`,
                priority: 'low'
            });
        });
    }

    return recommendations;
}

// =====================================================
// EFFECTIVENESS ANALYSIS
// =====================================================

/**
 * Get effectiveness score by wound category
 */
export async function getEffectivenessScore(deviceId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('spiritual_seft_sessions')
        .select('emosi_nama, kategori, rating_sebelum, rating_sesudah')
        .eq('device_id', deviceId)
        .eq('mode', 'release')
        .gte('tanggal', startDateStr);

    if (error) throw error;

    const categoryStats = {};
    (data || []).forEach(s => {
        const cat = s.kategori || 'Lainnya';
        if (!categoryStats[cat]) {
            categoryStats[cat] = { kategori: cat, totalReduction: 0, count: 0 };
        }
        categoryStats[cat].totalReduction += (s.rating_sebelum || 0) - (s.rating_sesudah || 0);
        categoryStats[cat].count++;
    });

    const effectiveness = Object.values(categoryStats)
        .map(c => ({
            kategori: c.kategori,
            avgReduction: c.count > 0 ? Math.round((c.totalReduction / c.count) * 10) / 10 : 0,
            sessions: c.count
        }))
        .sort((a, b) => b.avgReduction - a.avgReduction);

    // Find most and least effective
    const mostEffective = effectiveness[0] || null;
    const leastEffective = effectiveness[effectiveness.length - 1] || null;

    return {
        byCategory: effectiveness,
        mostEffective,
        leastEffective,
        overallAvg: data && data.length > 0
            ? Math.round((data.reduce((acc, s) => acc + ((s.rating_sebelum || 0) - (s.rating_sesudah || 0)), 0) / data.length) * 10) / 10
            : 0
    };
}

// =====================================================
// FILTER BY CATEGORY
// =====================================================

/**
 * Get sessions filtered by category
 */
export async function getSessionsByCategory(deviceId, kategori, days = 14) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    let query = supabase
        .from('spiritual_seft_sessions')
        .select('*')
        .eq('device_id', deviceId)
        .eq('mode', 'release')
        .gte('tanggal', startDateStr)
        .order('tanggal', { ascending: false });

    if (kategori && kategori !== 'all') {
        query = query.eq('kategori', kategori);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
}

/**
 * Get available categories
 */
export async function getAvailableCategories(deviceId) {
    const { data, error } = await supabase
        .from('spiritual_seft_sessions')
        .select('kategori')
        .eq('device_id', deviceId)
        .eq('mode', 'release');

    if (error) throw error;

    const categories = [...new Set((data || []).map(d => d.kategori).filter(Boolean))];
    return categories.sort();
}
