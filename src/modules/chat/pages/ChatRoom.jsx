import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Info } from 'lucide-react';
import {
    fetchMessages, sendMessage, subscribeToMessages, updateLastRead,
    fetchMembers, formatChatTime
} from '../services/chatService';
import { supabase } from '../../../lib/supabase';
import '../chat.css';

export default function ChatRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [roomName, setRoomName] = useState('Chat');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    useEffect(() => {
        loadRoom();
        const unsub = subscribeToMessages(id, (newMsg) => {
            setMessages(prev => {
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        });
        return unsub;
    }, [id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function loadRoom() {
        setLoading(true);
        try {
            const [msgs, mems] = await Promise.all([
                fetchMessages(id),
                fetchMembers(id),
            ]);
            setMessages(msgs);
            setMembers(mems);

            // Get room info
            const { data: room } = await supabase
                .from('chat_rooms')
                .select('*')
                .eq('id', id)
                .single();

            if (room) {
                if (room.name) {
                    setRoomName(room.name);
                } else if (room.room_type === 'private') {
                    const other = mems.find(m => m.user_id !== user?.id);
                    setRoomName(other?.user?.full_name || 'Private Chat');
                }
            }

            if (user) updateLastRead(id, user.id);
        } catch (err) {
            console.error('Load room error:', err);
        }
        setLoading(false);
    }

    async function handleSend() {
        if (!input.trim() || !user || sending) return;
        const text = input.trim();
        setInput('');
        setSending(true);
        try {
            await sendMessage(id, user.id, text);
        } catch (err) {
            setInput(text);
            alert('Gagal mengirim: ' + err.message);
        }
        setSending(false);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function groupMessagesByDate(msgs) {
        const groups = [];
        let currentDate = '';
        for (const msg of msgs) {
            const d = new Date(msg.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
            if (d !== currentDate) {
                currentDate = d;
                groups.push({ type: 'date', date: d });
            }
            groups.push({ type: 'msg', ...msg });
        }
        return groups;
    }

    const grouped = groupMessagesByDate(messages);

    return (
        <div className="chat-container chat-room-page">
            <header className="chat-header room-header">
                <button className="btn-back" onClick={() => navigate('/chat')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <h1>{roomName}</h1>
                    <small>{members.length} anggota</small>
                </div>
                <div className="header-actions">
                    <span className="member-count"><Users size={16} /> {members.length}</span>
                </div>
            </header>

            {/* Messages Area */}
            <div className="messages-area">
                {loading ? (
                    <div className="loading-state"><div className="loading-spinner"></div></div>
                ) : messages.length === 0 ? (
                    <div className="empty-chat">
                        <p>Mulai percakapan! 💬</p>
                    </div>
                ) : grouped.map((item, i) => {
                    if (item.type === 'date') {
                        return <div key={`date-${i}`} className="date-divider"><span>{item.date}</span></div>;
                    }
                    const isMe = item.sender_id === user?.id;
                    return (
                        <div key={item.id} className={`message-bubble ${isMe ? 'me' : 'other'}`}>
                            {!isMe && (
                                <span className="bubble-sender">
                                    {item.sender?.full_name || 'Warga'}
                                    {item.sender?.blok && <small> ({item.sender.blok}{item.sender.nomor})</small>}
                                </span>
                            )}
                            <p className="bubble-content">{item.content}</p>
                            <span className="bubble-time">{formatChatTime(item.created_at)}</span>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik pesan..."
                    rows={1}
                    disabled={!user}
                />
                <button
                    className="btn-send"
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                >
                    {sending ? '⏳' : '➤'}
                </button>
            </div>
        </div>
    );
}
