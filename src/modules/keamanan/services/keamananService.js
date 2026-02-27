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
        .select().single();
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

export async function checkin(scheduleId, userId, coords = null) {
    const insertData = { schedule_id: scheduleId, user_id: userId };
    if (coords) {
        insertData.latitude = coords.latitude;
        insertData.longitude = coords.longitude;
    }
    const { data, error } = await supabase
        .from('security_checkins')
        .insert(insertData)
        .select().single();
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
        .select('*, user:portal_users!user_id(full_name, blok, nomor)')
        .eq('schedule_id', scheduleId)
        .order('checkin_time');
    if (error) throw error;
    return data || [];
}

export async function getMyActiveCheckin(userId) {
    const { data } = await supabase
        .from('security_checkins')
        .select('*')
        .eq('user_id', userId)
        .is('checkout_time', null)
        .order('checkin_time', { ascending: false })
        .limit(1)
        .maybeSingle();
    return data;
}

// ==================== PANIC ALERTS ====================

export async function sendPanicAlert(alertData) {
    const { data, error } = await supabase
        .from('panic_alerts')
        .insert(alertData)
        .select().single();
    if (error) throw error;
    return data;
}

export async function fetchAlerts(statusFilter) {
    let query = supabase
        .from('panic_alerts')
        .select('*, reporter:portal_users!reporter_id(full_name, blok, nomor), responder:portal_users!responded_by(full_name)')
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
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
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

// ==================== INCIDENT REPORTS ====================

export async function createIncident(incidentData) {
    const { data, error } = await supabase
        .from('incident_reports')
        .insert(incidentData)
        .select().single();
    if (error) throw error;
    return data;
}

export async function fetchIncidents(statusFilter) {
    let query = supabase
        .from('incident_reports')
        .select('*, reporter:portal_users!reporter_id(full_name, blok, nomor)')
        .order('created_at', { ascending: false });
    if (statusFilter) query = query.eq('status', statusFilter);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function updateIncidentStatus(id, status, resolvedBy = null) {
    const updateData = { status };
    if (status === 'resolved' && resolvedBy) {
        updateData.resolved_by = resolvedBy;
        updateData.resolved_at = new Date().toISOString();
    }
    const { error } = await supabase
        .from('incident_reports')
        .update(updateData)
        .eq('id', id);
    if (error) throw error;
}

// ==================== ANALYTICS ====================

export async function fetchSecurityStats() {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const [alertsRes, incidentsRes, schedulesRes, checkinsRes] = await Promise.all([
        supabase.from('panic_alerts').select('id, status, created_at, responded_at').gte('created_at', monthStart),
        supabase.from('incident_reports').select('id, status, incident_type, created_at').gte('created_at', monthStart),
        supabase.from('security_schedules').select('id, status').gte('schedule_date', monthStart),
        supabase.from('security_checkins').select('id, checkin_time, checkout_time').gte('checkin_time', monthStart),
    ]);

    const alerts = alertsRes.data || [];
    const incidents = incidentsRes.data || [];
    const schedules = schedulesRes.data || [];
    const checkins = checkinsRes.data || [];

    // Average response time
    const responded = alerts.filter(a => a.responded_at);
    const avgResponseMs = responded.length > 0
        ? responded.reduce((s, a) => s + (new Date(a.responded_at) - new Date(a.created_at)), 0) / responded.length
        : 0;
    const avgResponseMin = Math.round(avgResponseMs / 60000);

    // Coverage
    const totalShifts = schedules.length;
    const coveredShifts = schedules.filter(s => s.status === 'completed').length;
    const coverage = totalShifts > 0 ? Math.round((coveredShifts / totalShifts) * 100) : 0;

    // Incident breakdown
    const incidentTypes = {};
    for (const inc of incidents) {
        incidentTypes[inc.incident_type] = (incidentTypes[inc.incident_type] || 0) + 1;
    }

    return {
        totalAlerts: alerts.length,
        activeAlerts: alerts.filter(a => a.status === 'active').length,
        resolvedAlerts: alerts.filter(a => a.status === 'resolved').length,
        totalIncidents: incidents.length,
        avgResponseMin,
        coverage,
        totalShifts,
        coveredShifts,
        totalCheckins: checkins.length,
        incidentTypes,
    };
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

// ==================== GEOLOCATION ====================

export function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation tidak didukung'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
            }),
            (err) => {
                if (err.code === 1) reject(new Error('Izin lokasi ditolak'));
                else if (err.code === 2) reject(new Error('Lokasi tidak tersedia'));
                else reject(new Error('Timeout mendapatkan lokasi'));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}

/**
 * Get Google Maps static URL for coordinates
 */
export function getMapUrl(lat, lng) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function getStaticMapUrl(lat, lng, zoom = 16) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=400x200&markers=color:red|${lat},${lng}`;
}

// ==================== HELPERS ====================

export const ALERT_TYPES = [
    { value: 'emergency', label: 'Darurat', icon: '🚨', color: '#ef4444' },
    { value: 'suspicious', label: 'Mencurigakan', icon: '👁️', color: '#f59e0b' },
    { value: 'fire', label: 'Kebakaran', icon: '🔥', color: '#dc2626' },
    { value: 'medical', label: 'Medis', icon: '🏥', color: '#3b82f6' },
    { value: 'other', label: 'Lainnya', icon: '⚠️', color: '#6b7280' },
];

export const INCIDENT_TYPES = [
    { value: 'theft', label: 'Pencurian', icon: '🔓' },
    { value: 'vandalism', label: 'Vandalisme', icon: '💥' },
    { value: 'noise', label: 'Kebisingan', icon: '🔊' },
    { value: 'parking', label: 'Parkir Liar', icon: '🚗' },
    { value: 'stray_animal', label: 'Hewan Liar', icon: '🐕' },
    { value: 'flood', label: 'Banjir', icon: '🌊' },
    { value: 'other', label: 'Lainnya', icon: '📋' },
];

export const SHIFTS = [
    { value: 'malam_1', label: 'Malam I (20:00 - 00:00)', icon: '🌙' },
    { value: 'malam_2', label: 'Malam II (00:00 - 04:00)', icon: '🌑' },
    { value: 'subuh', label: 'Subuh (04:00 - 06:00)', icon: '🌅' },
];

export function getAlertType(value) {
    return ALERT_TYPES.find(t => t.value === value) || ALERT_TYPES[4];
}

export function getIncidentType(value) {
    return INCIDENT_TYPES.find(t => t.value === value) || INCIDENT_TYPES[6];
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
