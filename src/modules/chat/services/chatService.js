import { supabase } from '../../../lib/supabase';

// ==================== ROOMS ====================

export async function fetchRooms(userId) {
    const { data: memberOf } = await supabase
        .from('chat_members')
        .select('room_id')
        .eq('user_id', userId);

    const memberRoomIds = (memberOf || []).map(m => m.room_id);

    const { data: defaultRooms } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_default', true);

    const defaultIds = (defaultRooms || []).map(r => r.id);
    const allRoomIds = [...new Set([...memberRoomIds, ...defaultIds])];

    if (allRoomIds.length === 0) return defaultRooms || [];

    const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .in('id', allRoomIds)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function fetchOrCreatePrivateRoom(userId, otherUserId) {
    const { data: myRooms } = await supabase
        .from('chat_members').select('room_id').eq('user_id', userId);
    const { data: otherRooms } = await supabase
        .from('chat_members').select('room_id').eq('user_id', otherUserId);

    const myRoomIds = new Set((myRooms || []).map(m => m.room_id));
    const commonRoomIds = (otherRooms || []).filter(m => myRoomIds.has(m.room_id)).map(m => m.room_id);

    if (commonRoomIds.length > 0) {
        const { data: privateRooms } = await supabase
            .from('chat_rooms').select('*').in('id', commonRoomIds).eq('room_type', 'private');
        if (privateRooms?.length > 0) return privateRooms[0];
    }

    const { data: room, error } = await supabase
        .from('chat_rooms')
        .insert({ room_type: 'private', created_by: userId })
        .select().single();
    if (error) throw error;

    await supabase.from('chat_members').insert([
        { room_id: room.id, user_id: userId, role: 'admin' },
        { room_id: room.id, user_id: otherUserId, role: 'member' },
    ]);
    return room;
}

export async function createRoom({ name, description, roomType = 'group', category = 'custom', icon = '💬', blok = null, createdBy }) {
    const { data, error } = await supabase
        .from('chat_rooms')
        .insert({ name, description, room_type: roomType, category, icon, blok, created_by: createdBy })
        .select().single();
    if (error) throw error;
    // Auto-add creator
    await supabase.from('chat_members').insert({ room_id: data.id, user_id: createdBy, role: 'admin' });
    return data;
}

export async function joinDefaultRoom(userId) {
    const { data: defaultRoom } = await supabase
        .from('chat_rooms').select('id').eq('is_default', true).single();
    if (!defaultRoom) return;
    const { data: existing } = await supabase
        .from('chat_members').select('id')
        .eq('room_id', defaultRoom.id).eq('user_id', userId).maybeSingle();
    if (!existing) {
        await supabase.from('chat_members').insert({ room_id: defaultRoom.id, user_id: userId });
    }
}

export async function pinMessage(roomId, messageId) {
    const { error } = await supabase
        .from('chat_rooms')
        .update({ pinned_message_id: messageId })
        .eq('id', roomId);
    if (error) throw error;
}

export async function unpinMessage(roomId) {
    const { error } = await supabase
        .from('chat_rooms')
        .update({ pinned_message_id: null })
        .eq('id', roomId);
    if (error) throw error;
}

// ==================== MESSAGES ====================

export async function fetchMessages(roomId, limit = 50, before = null) {
    let query = supabase
        .from('chat_messages')
        .select(`
            *,
            sender:portal_users!sender_id(id, full_name, blok, nomor),
            reply:chat_messages!reply_to(id, content, sender:portal_users!sender_id(full_name))
        `)
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (before) query = query.lt('created_at', before);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).reverse();
}

export async function sendMessage(roomId, senderId, content, messageType = 'text', extras = {}) {
    const insertData = {
        room_id: roomId,
        sender_id: senderId,
        content,
        message_type: messageType,
        ...extras,
    };

    const { data, error } = await supabase
        .from('chat_messages')
        .insert(insertData)
        .select(`
            *,
            sender:portal_users!sender_id(id, full_name, blok, nomor)
        `)
        .single();
    if (error) throw error;
    return data;
}

export async function sendImageMessage(roomId, senderId, imageUrl, fileName, fileSize, caption = '') {
    return sendMessage(roomId, senderId, caption || '📷 Foto', 'image', {
        image_url: imageUrl,
        file_name: fileName,
        file_size: fileSize,
    });
}

export async function sendReply(roomId, senderId, content, replyToId) {
    return sendMessage(roomId, senderId, content, 'text', { reply_to: replyToId });
}

export async function deleteMessage(messageId) {
    const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId);
    if (error) throw error;
}

export async function searchMessages(roomId, query) {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*, sender:portal_users!sender_id(full_name)')
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(30);
    if (error) throw error;
    return data || [];
}

// ==================== REACTIONS ====================

export async function addReaction(messageId, userId, emoji) {
    const { error } = await supabase
        .from('chat_reactions')
        .upsert({ message_id: messageId, user_id: userId, emoji }, { onConflict: 'message_id,user_id,emoji' });
    if (error) throw error;
}

export async function removeReaction(messageId, userId, emoji) {
    const { error } = await supabase
        .from('chat_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji);
    if (error) throw error;
}

export async function fetchReactions(messageIds) {
    if (!messageIds?.length) return {};
    const { data, error } = await supabase
        .from('chat_reactions')
        .select('*, user:portal_users!user_id(full_name)')
        .in('message_id', messageIds);
    if (error) throw error;

    const grouped = {};
    for (const r of (data || [])) {
        if (!grouped[r.message_id]) grouped[r.message_id] = [];
        grouped[r.message_id].push(r);
    }
    return grouped;
}

// ==================== MEMBERS ====================

export async function fetchMembers(roomId) {
    const { data, error } = await supabase
        .from('chat_members')
        .select('*, user:portal_users!user_id(id, full_name, blok, nomor)')
        .eq('room_id', roomId);
    if (error) throw error;
    return data || [];
}

export async function updateLastRead(roomId, userId) {
    await supabase
        .from('chat_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('room_id', roomId)
        .eq('user_id', userId);
}

export async function fetchAllWarga() {
    const { data, error } = await supabase
        .from('portal_users')
        .select('id, full_name, blok, nomor, role')
        .eq('is_active', true)
        .order('blok').order('nomor');
    if (error) throw error;
    return data || [];
}

// ==================== LAST MESSAGE (optimized - no N+1) ====================

export async function fetchLastMessages(roomIds) {
    if (!roomIds?.length) return {};
    const results = {};
    // Use parallel queries instead of sequential loop
    const promises = roomIds.map(async (roomId) => {
        const { data } = await supabase
            .from('chat_messages')
            .select('content, created_at, message_type, sender:portal_users!sender_id(full_name)')
            .eq('room_id', roomId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        results[roomId] = data;
    });
    await Promise.all(promises);
    return results;
}

// ==================== UNREAD COUNT ====================

export async function fetchUnreadCounts(userId, roomIds) {
    if (!roomIds?.length) return {};
    const counts = {};

    const { data: memberships } = await supabase
        .from('chat_members')
        .select('room_id, last_read_at')
        .eq('user_id', userId)
        .in('room_id', roomIds);

    const memberMap = {};
    for (const m of (memberships || [])) {
        memberMap[m.room_id] = m.last_read_at;
    }

    const promises = roomIds.map(async (roomId) => {
        const lastRead = memberMap[roomId];
        if (!lastRead) { counts[roomId] = 0; return; }

        const { count } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('room_id', roomId)
            .eq('is_deleted', false)
            .gt('created_at', lastRead);

        counts[roomId] = count || 0;
    });

    await Promise.all(promises);
    return counts;
}

// ==================== REALTIME ====================

export function subscribeToMessages(roomId, callback) {
    const channel = supabase
        .channel(`chat-room-${roomId}`)
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
            async (payload) => {
                const { data } = await supabase
                    .from('chat_messages')
                    .select('*, sender:portal_users!sender_id(id, full_name, blok, nomor)')
                    .eq('id', payload.new.id)
                    .single();
                if (data) callback(data);
            }
        )
        .subscribe();
    return () => supabase.removeChannel(channel);
}

export function subscribeToReactions(roomId, callback) {
    const channel = supabase
        .channel(`chat-reactions-${roomId}`)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'chat_reactions' },
            () => callback()
        )
        .subscribe();
    return () => supabase.removeChannel(channel);
}

// ==================== PRESENCE (Typing Indicators) ====================

let presenceChannel = null;

export function joinPresence(roomId, user) {
    if (presenceChannel) supabase.removeChannel(presenceChannel);
    presenceChannel = supabase.channel(`presence-${roomId}`, {
        config: { presence: { key: user.id } },
    });
    presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
            await presenceChannel.track({
                user_id: user.id,
                user_name: user.full_name,
                online_at: new Date().toISOString(),
                is_typing: false,
            });
        }
    });
    return presenceChannel;
}

export function setTyping(isTyping) {
    if (!presenceChannel) return;
    presenceChannel.track({
        is_typing: isTyping,
        typing_at: isTyping ? new Date().toISOString() : null,
    });
}

export function onPresenceChange(callback) {
    if (!presenceChannel) return () => { };
    presenceChannel.on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        callback(state);
    });
    return () => { };
}

export function leavePresence() {
    if (presenceChannel) {
        supabase.removeChannel(presenceChannel);
        presenceChannel = null;
    }
}

// ==================== HELPERS ====================

export function formatChatTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🙏', '🔥'];

export const ROOM_CATEGORIES = {
    umum: { label: 'Umum', icon: '💬' },
    blok: { label: 'Per Blok', icon: '🏠' },
    marketplace: { label: 'Jual Beli', icon: '🛒' },
    admin: { label: 'Admin', icon: '📢' },
    custom: { label: 'Lainnya', icon: '⚡' },
};
