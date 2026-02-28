import { supabase } from '../lib/supabase';

// ==================== NOTIFICATIONS ====================

export async function fetchNotifications(userId, limit = 30) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data || [];
}

export async function fetchUnreadCount(userId) {
    const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    if (error) throw error;
    return count || 0;
}

export async function markAsRead(notificationId) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    if (error) throw error;
}

export async function markAllAsRead(userId) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    if (error) throw error;
}

export async function deleteNotification(notificationId) {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
    if (error) throw error;
}

// ==================== ACTIVITY FEED ====================

export async function fetchActivityFeed(userId, limit = 20) {
    const [alertsRes, rsvpsRes, votesRes, messagesRes] = await Promise.all([
        supabase.from('panic_alerts')
            .select('id, alert_type, reporter_blok, status, created_at')
            .order('created_at', { ascending: false }).limit(5),
        supabase.from('event_rsvps')
            .select('id, status, created_at, event:community_events!event_id(title)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }).limit(5),
        supabase.from('poll_votes')
            .select('id, created_at, poll:polls!poll_id(title)')
            .eq('voter_id', userId)
            .order('created_at', { ascending: false }).limit(5),
        supabase.from('chat_messages')
            .select('id, content, message_type, created_at, room:chat_rooms!room_id(name)')
            .eq('sender_id', userId)
            .order('created_at', { ascending: false }).limit(5),
    ]);

    const activities = [];

    for (const alert of (alertsRes.data || [])) {
        activities.push({
            id: `alert-${alert.id}`, type: 'alert',
            icon: '🚨', title: `Alert ${alert.alert_type} dari Blok ${alert.reporter_blok}`,
            subtitle: alert.status, created_at: alert.created_at, link: '/keamanan/riwayat',
        });
    }
    for (const rsvp of (rsvpsRes.data || [])) {
        const label = rsvp.status === 'going' ? 'Hadir' : rsvp.status === 'maybe' ? 'Mungkin' : 'Tidak';
        activities.push({
            id: `rsvp-${rsvp.id}`, type: 'rsvp',
            icon: '📅', title: `RSVP "${label}" untuk ${rsvp.event?.title || 'Event'}`,
            subtitle: '', created_at: rsvp.created_at, link: '/kalender',
        });
    }
    for (const vote of (votesRes.data || [])) {
        activities.push({
            id: `vote-${vote.id}`, type: 'vote',
            icon: '🗳️', title: `Voted di "${vote.poll?.title || 'Polling'}"`,
            subtitle: '', created_at: vote.created_at, link: '/voting',
        });
    }
    for (const msg of (messagesRes.data || [])) {
        activities.push({
            id: `msg-${msg.id}`, type: 'message',
            icon: msg.message_type === 'image' ? '📷' : '💬',
            title: `Chat di ${msg.room?.name || 'Room'}`,
            subtitle: msg.message_type === 'image' ? 'Foto' : (msg.content || '').substring(0, 50),
            created_at: msg.created_at, link: '/chat',
        });
    }

    return activities
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
}

// ==================== REALTIME ====================

export function subscribeToNotifications(userId, callback) {
    const channel = supabase
        .channel(`notifications-${userId}`)
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
            payload => callback(payload.new)
        )
        .subscribe();
    return () => supabase.removeChannel(channel);
}

// ==================== HELPERS ====================

export const NOTIF_ICONS = { alert: '🚨', event: '📅', vote: '🗳️', chat: '💬', announcement: '📢', system: '⚙️' };

export function getNotifIcon(type) { return NOTIF_ICONS[type] || '🔔'; }

export function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// ==================== INITIALIZATION (for native/PWA) ====================

export function initializeNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

