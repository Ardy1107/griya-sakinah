import { supabase } from '../../../lib/supabase';

// ==================== SECURITY SCHEDULES ====================

export async function fetchSchedules(filters = {}) {
    let query = supabase
        .from('security_schedules')
        .select('*')
        .order('schedule_date', { ascending: true });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.month && filters.year) {
        const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
        const end = new Date(filters.year, filters.month, 0).toISOString().split('T')[0];
        query = query.gte('schedule_date', start).lte('schedule_date', end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function createSchedule(scheduleData) {
    const { data, error } = await supabase
        .from('security_schedules')
        .insert(scheduleData)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateScheduleStatus(id, status) {
    const { error } = await supabase
        .from('security_schedules')
        .update({ status })
        .eq('id', id);
    if (error) throw error;
}

// ==================== CHECK-INS ====================

export async function checkin(scheduleId, userId) {
    const { data, error } = await supabase
        .from('security_checkins')
        .insert({ schedule_id: scheduleId, user_id: userId })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function checkout(checkinId) {
    const { error } = await supabase
        .from('security_checkins')
        .update({ checkout_time: new Date().toISOString() })
        .eq('id', checkinId);
    if (error) throw error;
}

export async function fetchCheckins(scheduleId) {
    const { data, error } = await supabase
        .from('security_checkins')
        .select('*, user:portal_users!user_id(full_name)')
        .eq('schedule_id', scheduleId)
        .order('checkin_time');
    if (error) throw error;
    return data || [];
}

// ==================== PANIC ALERTS ====================

export async function sendPanicAlert(alertData) {
    const { data, error } = await supabase
        .from('panic_alerts')
        .insert(alertData)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function fetchAlerts(statusFilter) {
    let query = supabase
        .from('panic_alerts')
        .select('*, reporter:portal_users!reporter_id(full_name), responder:portal_users!responded_by(full_name)')
        .order('created_at', { ascending: false });

    if (statusFilter) query = query.eq('status', statusFilter);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function respondToAlert(alertId, responderId) {
    const { error } = await supabase
        .from('panic_alerts')
        .update({
            status: 'responding',
            responded_by: responderId,
            responded_at: new Date().toISOString(),
        })
        .eq('id', alertId);
    if (error) throw error;
}

export async function resolveAlert(alertId) {
    const { error } = await supabase
        .from('panic_alerts')
        .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId);
    if (error) throw error;
}

export async function markFalseAlarm(alertId) {
    const { error } = await supabase
        .from('panic_alerts')
        .update({ status: 'false_alarm' })
        .eq('id', alertId);
    if (error) throw error;
}

// ==================== REALTIME ====================

export function subscribeToPanicAlerts(callback) {
    const channel = supabase
        .channel('panic-alerts-realtime')
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'panic_alerts' },
            payload => callback(payload.new)
        )
        .subscribe();

    return () => supabase.removeChannel(channel);
}

// ==================== HELPERS ====================

export const ALERT_TYPES = [
    { value: 'emergency', label: 'Darurat', icon: '🚨', color: '#ef4444' },
    { value: 'suspicious', label: 'Mencurigakan', icon: '👁️', color: '#f59e0b' },
    { value: 'fire', label: 'Kebakaran', icon: '🔥', color: '#dc2626' },
    { value: 'medical', label: 'Medis', icon: '🏥', color: '#3b82f6' },
    { value: 'other', label: 'Lainnya', icon: '⚠️', color: '#6b7280' },
];

export const SHIFTS = [
    { value: 'malam_1', label: 'Malam I (20:00 - 00:00)', icon: '🌙' },
    { value: 'malam_2', label: 'Malam II (00:00 - 04:00)', icon: '🌑' },
    { value: 'subuh', label: 'Subuh (04:00 - 06:00)', icon: '🌅' },
];

export function getAlertType(value) {
    return ALERT_TYPES.find(t => t.value === value) || ALERT_TYPES[4];
}

export function getShift(value) {
    return SHIFTS.find(s => s.value === value) || SHIFTS[0];
}

export function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
}
