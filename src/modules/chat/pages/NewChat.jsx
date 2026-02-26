import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Search, User } from 'lucide-react';
import { fetchAllWarga, fetchOrCreatePrivateRoom } from '../services/chatService';
import '../chat.css';

export default function NewChat() {
    const navigate = useNavigate();
    const [warga, setWarga] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    useEffect(() => { loadWarga(); }, []);

    async function loadWarga() {
        setLoading(true);
        try {
            const data = await fetchAllWarga();
            setWarga(data.filter(w => w.id !== user?.id));
        } catch (err) { console.error(err); }
        setLoading(false);
    }

    async function startChat(otherUserId) {
        if (!user) return;
        setStarting(true);
        try {
            const room = await fetchOrCreatePrivateRoom(user.id, otherUserId);
            navigate(`/chat/${room.id}`);
        } catch (err) {
            alert('Gagal memulai chat: ' + err.message);
        }
        setStarting(false);
    }

    const filtered = warga.filter(w =>
        w.full_name.toLowerCase().includes(search.toLowerCase()) ||
        `${w.blok || ''}${w.nomor || ''}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="chat-container">
            <header className="chat-header">
                <button className="btn-back" onClick={() => navigate('/chat')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <MessageCircle size={24} />
                    <h1>Chat Baru</h1>
                </div>
            </header>

            <div className="chat-search">
                <Search size={16} />
                <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Cari warga..."
                />
            </div>

            {loading ? (
                <div className="loading-state"><div className="loading-spinner"></div></div>
            ) : (
                <div className="warga-list">
                    {filtered.map(w => (
                        <div
                            key={w.id}
                            className="warga-item"
                            onClick={() => !starting && startChat(w.id)}
                        >
                            <div className="warga-avatar">
                                <User size={18} />
                            </div>
                            <div className="warga-info">
                                <h4>{w.full_name}</h4>
                                <small>
                                    {w.blok && `Blok ${w.blok}${w.nomor}`}
                                    {w.role && ` · ${w.role}`}
                                </small>
                            </div>
                            <MessageCircle size={16} className="warga-chat-icon" />
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="empty-state"><p>Tidak ada warga ditemukan</p></div>
                    )}
                </div>
            )}
        </div>
    );
}
