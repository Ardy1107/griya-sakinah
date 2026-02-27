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
        .select().single();
    if (error) throw error;
    return data;
}

export async function updateEvent(id, updates) {
    const { data, error } = await supabase
        .from('community_events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select().single();
    if (error) throw error;
    return data;
}

export async function deleteEvent(id) {
    const { error } = await supabase.from('community_events').delete().eq('id', id);
    if (error) throw error;
}

// ==================== RSVP ====================

export async function fetchRsvps(eventId) {
    const { data, error } = await supabase
        .from('event_rsvps')
        .select('*, user:portal_users!user_id(full_name, blok, nomor)')
        .eq('event_id', eventId);
    if (error) throw error;
    return data || [];
}

export async function submitRsvp(eventId, userId, status) {
    const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: 'event_id,user_id' })
        .select().single();
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

// ==================== COMMENTS ====================

export async function fetchComments(eventId) {
    const { data, error } = await supabase
        .from('event_comments')
        .select('*, user:portal_users!user_id(full_name, blok, nomor)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function addComment(eventId, userId, content) {
    const { data, error } = await supabase
        .from('event_comments')
        .insert({ event_id: eventId, user_id: userId, content })
        .select('*, user:portal_users!user_id(full_name, blok, nomor)')
        .single();
    if (error) throw error;
    return data;
}

export async function deleteComment(commentId) {
    const { error } = await supabase.from('event_comments').delete().eq('id', commentId);
    if (error) throw error;
}

// ==================== PHOTOS ====================

export async function fetchEventPhotos(eventId) {
    const { data, error } = await supabase
        .from('event_photos')
        .select('*, uploader:portal_users!uploaded_by(full_name)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function addEventPhoto(eventId, userId, photoUrl, thumbnailUrl, caption) {
    const { data, error } = await supabase
        .from('event_photos')
        .insert({
            event_id: eventId,
            uploaded_by: userId,
            photo_url: photoUrl,
            thumbnail_url: thumbnailUrl,
            caption: caption || null,
        })
        .select().single();
    if (error) throw error;
    return data;
}

export async function deleteEventPhoto(photoId) {
    const { error } = await supabase.from('event_photos').delete().eq('id', photoId);
    if (error) throw error;
}

// ==================== ATTENDANCE ====================

export async function fetchAttendance(eventId) {
    const { data, error } = await supabase
        .from('event_attendance')
        .select('*, user:portal_users!user_id(full_name, blok, nomor)')
        .eq('event_id', eventId)
        .order('checked_in_at');
    if (error) throw error;
    return data || [];
}

export async function checkinEvent(eventId, userId) {
    const { data, error } = await supabase
        .from('event_attendance')
        .upsert({ event_id: eventId, user_id: userId }, { onConflict: 'event_id,user_id' })
        .select().single();
    if (error) throw error;
    return data;
}

export async function hasCheckedIn(eventId, userId) {
    const { data } = await supabase
        .from('event_attendance')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();
    return !!data;
}

// ==================== REALTIME ====================

export function subscribeToRsvps(eventId, callback) {
    const channel = supabase
        .channel(`rsvp-${eventId}`)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'event_rsvps', filter: `event_id=eq.${eventId}` },
            () => callback()
        )
        .subscribe();
    return () => supabase.removeChannel(channel);
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

export function formatShortDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function isEventPast(event) {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
}

export function getEventStatus(event) {
    if (event.status === 'cancelled') return 'cancelled';
    if (event.status === 'completed') return 'completed';
    if (isEventPast(event)) return 'completed';
    const today = new Date().toISOString().split('T')[0];
    if (event.event_date === today) return 'ongoing';
    return 'upcoming';
}

export function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins}m lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j lalu`;
    return `${Math.floor(hours / 24)}h lalu`;
}
