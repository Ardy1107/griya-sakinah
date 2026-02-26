import { supabase } from '../../../lib/supabase';

// ==================== EVENTS ====================

export async function fetchEvents(filters = {}) {
    let query = supabase
        .from('community_events')
        .select('*, creator:portal_users!created_by(full_name)')
        .order('event_date', { ascending: true });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('event_type', filters.type);
    if (filters.month && filters.year) {
        const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
        const end = new Date(filters.year, filters.month, 0).toISOString().split('T')[0];
        query = query.gte('event_date', start).lte('event_date', end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function fetchEventById(id) {
    const { data, error } = await supabase
        .from('community_events')
        .select('*, creator:portal_users!created_by(full_name)')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

export async function createEvent(eventData) {
    const { data, error } = await supabase
        .from('community_events')
        .insert(eventData)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateEvent(id, updates) {
    const { data, error } = await supabase
        .from('community_events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteEvent(id) {
    const { error } = await supabase
        .from('community_events')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ==================== RSVP ====================

export async function fetchRsvps(eventId) {
    const { data, error } = await supabase
        .from('event_rsvps')
        .select('*, user:portal_users!user_id(full_name)')
        .eq('event_id', eventId);
    if (error) throw error;
    return data || [];
}

export async function submitRsvp(eventId, userId, status) {
    const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: 'event_id,user_id' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getUserRsvp(eventId, userId) {
    const { data } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();
    return data;
}

// ==================== HELPERS ====================

export const EVENT_TYPES = [
    { value: 'pengajian', label: 'Pengajian', icon: '🕌', color: '#10b981' },
    { value: 'kerja_bakti', label: 'Kerja Bakti', icon: '🧹', color: '#f59e0b' },
    { value: 'rapat', label: 'Rapat RT', icon: '📋', color: '#3b82f6' },
    { value: 'arisan', label: 'Arisan', icon: '💰', color: '#8b5cf6' },
    { value: 'sosial', label: 'Sosial', icon: '🤝', color: '#ec4899' },
    { value: 'olahraga', label: 'Olahraga', icon: '⚽', color: '#ef4444' },
    { value: 'lainnya', label: 'Lainnya', icon: '📌', color: '#6b7280' },
];

export function getEventType(value) {
    return EVENT_TYPES.find(t => t.value === value) || EVENT_TYPES[6];
}

export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}

export function formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
}
