import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MessageCircle, Plus, Users, ChevronRight, Search
} from 'lucide-react';
import { fetchRooms, fetchLastMessages, joinDefaultRoom, fetchMembers, formatChatTime } from '../services/chatService';
import '../chat.css';

export default function ChatList() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [lastMessages, setLastMessages] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    useEffect(() => {
        if (user) {
            joinDefaultRoom(user.id).then(loadRooms);
        } else {
            setLoading(false);
        }
    }, []);

    async function loadRooms() {
        setLoading(true);
        try {
            const roomData = await fetchRooms(user.id);
            setRooms(roomData);

            // Fetch last messages and member names for private rooms
            const msgs = await fetchLastMessages(roomData.map(r => r.id));
            setLastMessages(msgs);

            // For private rooms, fetch other member's name
            for (const room of roomData) {
                if (room.room_type === 'private' && !room.name) {
                    const members = await fetchMembers(room.id);
                    const other = members.find(m => m.user_id !== user.id);
                    if (other?.user) {
                        room._displayName = `${other.user.full_name}`;
                        room._displaySub = other.user.blok ? `Blok ${other.user.blok}${other.user.nomor}` : '';
                    }
                }
            }
            setRooms([...roomData]); // trigger re-render
        } catch (err) {
            console.error('Load rooms error:', err);
        }
        setLoading(false);
    }

    if (!user) return (
        <div className="chat-container">
            <div className="chat-login-prompt">
                <MessageCircle size={48} />
                <h3>Login untuk Chat</h3>
                <p>Silakan login melalui portal warga untuk mengakses fitur chat.</p>
            </div>
        </div>
    );

    const filtered = rooms.filter(r => {
        const name = r.name || r._displayName || '';
        return name.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="chat-container">
            <header className="chat-header">
                <button className="btn-back" onClick={() => navigate('/komunitas')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <MessageCircle size={24} />
                    <h1>Chat Warga</h1>
                </div>
                <button className="btn-new-chat" onClick={() => navigate('/chat/baru')}>
                    <Plus size={18} />
                </button>
            </header>

            {/* Search */}
            <div className="chat-search">
                <Search size={16} />
                <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cari percakapan..."
                />
            </div>

            {loading ? (
                <div className="loading-state"><div className="loading-spinner"></div><p>Memuat chat...</p></div>
            ) : (
                <div className="room-list">
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <MessageCircle size={48} />
                            <h3>Belum ada percakapan</h3>
                            <p>Mulai chat baru dengan warga lain.</p>
                            <button className="btn-start-chat" onClick={() => navigate('/chat/baru')}>
                                <Plus size={16} /> Mulai Chat
                            </button>
                        </div>
                    ) : filtered.map(room => {
                        const displayName = room.name || room._displayName || 'Private Chat';
                        const lastMsg = lastMessages[room.id];
                        const isGroup = room.room_type === 'group' || room.room_type === 'announcement';

                        return (
                            <div key={room.id} className="room-card" onClick={() => navigate(`/chat/${room.id}`)}>
                                <div className={`room-avatar ${isGroup ? 'group' : 'private'}`}>
                                    {isGroup ? <Users size={20} /> : displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="room-info">
                                    <div className="room-top-row">
                                        <h3>{displayName}</h3>
                                        {lastMsg && <span className="room-time">{formatChatTime(lastMsg.created_at)}</span>}
                                    </div>
                                    <p className="room-last-msg">
                                        {lastMsg
                                            ? `${lastMsg.sender?.full_name || ''}: ${lastMsg.content}`.slice(0, 50)
                                            : 'Belum ada pesan'
                                        }
                                    </p>
                                </div>
                                <ChevronRight size={16} className="room-arrow" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
