import { supabase } from '../../../lib/supabase';

// ==================== ROOMS ====================

export async function fetchRooms(userId) {
    // Fetch rooms where user is a member (or default rooms)
    const { data: memberOf } = await supabase
        .from('chat_members')
        .select('room_id')
        .eq('user_id', userId);

    const memberRoomIds = (memberOf || []).map(m => m.room_id);

    // Also fetch default rooms
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
    // Check if private room already exists
    const { data: myRooms } = await supabase
        .from('chat_members')
        .select('room_id')
        .eq('user_id', userId);

    const { data: otherRooms } = await supabase
        .from('chat_members')
        .select('room_id')
        .eq('user_id', otherUserId);

    const myRoomIds = new Set((myRooms || []).map(m => m.room_id));
    const commonRoomIds = (otherRooms || []).filter(m => myRoomIds.has(m.room_id)).map(m => m.room_id);

    if (commonRoomIds.length > 0) {
        const { data: privateRooms } = await supabase
            .from('chat_rooms')
            .select('*')
            .in('id', commonRoomIds)
            .eq('room_type', 'private');

        if (privateRooms?.length > 0) return privateRooms[0];
    }

    // Create new private room
    const { data: room, error } = await supabase
        .from('chat_rooms')
        .insert({ room_type: 'private', created_by: userId })
        .select()
        .single();
    if (error) throw error;

    // Add both users
    await supabase.from('chat_members').insert([
        { room_id: room.id, user_id: userId, role: 'admin' },
        { room_id: room.id, user_id: otherUserId, role: 'member' },
    ]);

    return room;
}

export async function joinDefaultRoom(userId) {
    const { data: defaultRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('is_default', true)
        .single();

    if (!defaultRoom) return;

    const { data: existing } = await supabase
        .from('chat_members')
        .select('id')
        .eq('room_id', defaultRoom.id)
        .eq('user_id', userId)
        .maybeSingle();

    if (!existing) {
        await supabase.from('chat_members').insert({
            room_id: defaultRoom.id,
            user_id: userId,
        });
    }
}

// ==================== MESSAGES ====================

export async function fetchMessages(roomId, limit = 50) {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*, sender:portal_users!sender_id(full_name)')
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

export async function sendMessage(roomId, senderId, content, messageType = 'text') {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({
            room_id: roomId,
            sender_id: senderId,
            content,
            message_type: messageType,
        })
        .select('*, sender:portal_users!sender_id(full_name)')
        .single();

    if (error) throw error;
    return data;
}

export async function deleteMessage(messageId) {
    const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId);
    if (error) throw error;
}

// ==================== MEMBERS ====================

export async function fetchMembers(roomId) {
    const { data, error } = await supabase
        .from('chat_members')
        .select('*, user:portal_users!user_id(full_name)')
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

// ==================== USERS (for new chat) ====================

export async function fetchAllWarga() {
    const { data, error } = await supabase
        .from('portal_users')
        .select('id, full_name, blok, nomor, role')
        .eq('is_active', true)
        .order('blok')
        .order('nomor');
    if (error) throw error;
    return data || [];
}

// ==================== LAST MESSAGE (for room list) ====================

export async function fetchLastMessages(roomIds) {
    const results = {};
    for (const roomId of roomIds) {
        const { data } = await supabase
            .from('chat_messages')
            .select('content, created_at, sender:portal_users!sender_id(full_name)')
            .eq('room_id', roomId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        results[roomId] = data;
    }
    return results;
}

// ==================== REALTIME ====================

export function subscribeToMessages(roomId, callback) {
    const channel = supabase
        .channel(`chat-room-${roomId}`)
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
            async (payload) => {
                // Fetch full message with sender info
                const { data } = await supabase
                    .from('chat_messages')
                    .select('*, sender:portal_users!sender_id(full_name)')
                    .eq('id', payload.new.id)
                    .single();
                if (data) callback(data);
            }
        )
        .subscribe();

    return () => supabase.removeChannel(channel);
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
