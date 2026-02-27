import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MessageCircle, Plus, Search, Users, Bell,
    Hash, Lock, Megaphone, ShoppingBag
} from 'lucide-react';
import {
    fetchRooms, fetchLastMessages, fetchUnreadCounts,
    joinDefaultRoom, formatChatTime, ROOM_CATEGORIES
} from '../services/chatService';
import '../chat.css';

const CATEGORY_ICONS = {
    umum: <Hash size={16} />,
    blok: <Users size={16} />,
    marketplace: <ShoppingBag size={16} />,
    admin: <Megaphone size={16} />,
    custom: <MessageCircle size={16} />,
};

export default function ChatList() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [lastMessages, setLastMessages] = useState({});
    const [unreadCounts, setUnreadCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    useEffect(() => {
        if (user) {
            joinDefaultRoom(user.id);
            loadRooms();
        } else {
            setLoading(false);
        }
    }, []);

    async function loadRooms() {
        setLoading(true);
        try {
            const data = await fetchRooms(user.id);
            setRooms(data);
            if (data.length > 0) {
                const roomIds = data.map(r => r.id);
                const [msgs, unreads] = await Promise.all([
                    fetchLastMessages(roomIds),
                    fetchUnreadCounts(user.id, roomIds),
                ]);
                setLastMessages(msgs);
                setUnreadCounts(unreads);
            }
        } catch (err) {
            console.error('Load rooms error:', err);
        }
        setLoading(false);
    }

    const totalUnread = Object.values(unreadCounts).reduce((s, c) => s + c, 0);

    const categorized = rooms.reduce((acc, room) => {
        const cat = room.category || 'umum';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(room);
        return acc;
    }, {});

    const filteredRooms = filter === 'all'
        ? rooms
        : rooms.filter(r => (r.category || 'umum') === filter);

    const searchedRooms = search
        ? filteredRooms.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()))
        : filteredRooms;

    if (!user) {
        return (
            <div className="chat-container">
                <div className="empty-state">
                    <MessageCircle size={48} />
                    <h3>Login untuk mengakses Chat Warga</h3>
                    <p>Silakan login melalui Portal Warga terlebih dahulu.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <header className="chat-header">
                <button className="btn-back" onClick={() => navigate('/komunitas')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <MessageCircle size={24} />
                    <h1>Chat Warga</h1>
                    {totalUnread > 0 && <span className="total-unread-badge">{totalUnread}</span>}
                </div>
                <div className="header-actions">
                    <button className="btn-icon" onClick={() => navigate('/chat/baru')}>
                        <Plus size={20} />
                    </button>
                </div>
            </header>

            {/* Search */}
            <div className="chat-search">
                <Search size={16} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cari channel atau chat..." />
            </div>

            {/* Category Filter Tabs */}
            <div className="chat-filter-tabs">
                <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}>
                    Semua
                    {totalUnread > 0 && <span className="tab-badge">{totalUnread}</span>}
                </button>
                {Object.entries(ROOM_CATEGORIES).map(([key, cat]) => {
                    const catUnread = rooms.filter(r => (r.category || 'umum') === key)
                        .reduce((s, r) => s + (unreadCounts[r.id] || 0), 0);
                    return (
                        <button key={key} className={`filter-tab ${filter === key ? 'active' : ''}`}
                            onClick={() => setFilter(key)}>
                            {cat.icon} {cat.label}
                            {catUnread > 0 && <span className="tab-badge">{catUnread}</span>}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <p>Memuat chat...</p>
                </div>
            ) : searchedRooms.length === 0 ? (
                <div className="empty-state">
                    <MessageCircle size={48} />
                    <h3>{search ? 'Tidak ditemukan' : 'Belum ada chat'}</h3>
                    <p>{search ? 'Coba kata kunci lain' : 'Buat chat baru untuk mulai!'}</p>
                </div>
            ) : (
                <div className="rooms-list">
                    {searchedRooms.map(room => {
                        const last = lastMessages[room.id];
                        const unread = unreadCounts[room.id] || 0;
                        const catIcon = CATEGORY_ICONS[room.category || 'umum'];

                        return (
                            <div key={room.id}
                                className={`room-card ${unread > 0 ? 'has-unread' : ''}`}
                                onClick={() => navigate(`/chat/${room.id}`)}>

                                <div className="room-avatar">
                                    <span className="room-avatar-icon">{room.icon || '💬'}</span>
                                </div>

                                <div className="room-info">
                                    <div className="room-top-row">
                                        <h3 className="room-name">
                                            {room.room_type === 'announcement' && <Lock size={12} />}
                                            {room.name || 'Chat'}
                                        </h3>
                                        <span className="room-time">
                                            {last ? formatChatTime(last.created_at) : ''}
                                        </span>
                                    </div>
                                    <div className="room-bottom-row">
                                        <p className="room-last-msg">
                                            {last ? (
                                                <>
                                                    {last.sender?.full_name && <strong>{last.sender.full_name}: </strong>}
                                                    {last.message_type === 'image' ? '📷 Foto' : last.content}
                                                </>
                                            ) : (
                                                <em>Belum ada pesan</em>
                                            )}
                                        </p>
                                        <div className="room-badges">
                                            {unread > 0 && <span className="unread-badge">{unread > 99 ? '99+' : unread}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
