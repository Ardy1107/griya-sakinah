import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search, Pin, Image, Send, X, Reply, Smile, ChevronDown } from 'lucide-react';
import {
    fetchMessages, sendMessage, sendImageMessage, sendReply, subscribeToMessages, subscribeToReactions,
    updateLastRead, fetchMembers, fetchReactions, addReaction, removeReaction,
    joinPresence, setTyping, onPresenceChange, leavePresence,
    formatChatTime, REACTION_EMOJIS, searchMessages, pinMessage
} from '../services/chatService';
import { uploadImage, isGDriveConfigured, formatFileSize, DRIVE_FOLDERS } from '../../../services/googleDriveService';
import { supabase } from '../../../lib/supabase';
import '../chat.css';

export default function ChatRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [room, setRoom] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [replyTo, setReplyTo] = useState(null);
    const [showReactions, setShowReactions] = useState(null);
    const [reactions, setReactions] = useState({});
    const [typingUsers, setTypingUsers] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const bottomRef = useRef(null);
    const messagesRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeout = useRef(null);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    useEffect(() => {
        loadRoom();
        const unsubMsg = subscribeToMessages(id, (newMsg) => {
            setMessages(prev => {
                if (prev.find(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
        });
        const unsubReact = subscribeToReactions(id, () => loadReactions());

        if (user) {
            const channel = joinPresence(id, user);
            onPresenceChange((state) => {
                const typing = [];
                for (const [key, presences] of Object.entries(state)) {
                    if (key !== user.id) {
                        for (const p of presences) {
                            if (p.is_typing) typing.push(p.user_name || 'Seseorang');
                        }
                    }
                }
                setTypingUsers(typing);
            });
        }

        return () => { unsubMsg(); unsubReact(); leavePresence(); };
    }, [id]);

    useEffect(() => {
        if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    async function loadRoom() {
        setLoading(true);
        try {
            const [msgs, mems] = await Promise.all([fetchMessages(id), fetchMembers(id)]);
            setMessages(msgs);
            setMembers(mems);
            setHasMore(msgs.length >= 50);

            const { data: roomData } = await supabase.from('chat_rooms').select('*').eq('id', id).single();
            if (roomData) {
                if (!roomData.name && roomData.room_type === 'private') {
                    const other = mems.find(m => m.user_id !== user?.id);
                    roomData.name = other?.user?.full_name || 'Private Chat';
                }
                setRoom(roomData);
            }

            if (msgs.length > 0) {
                const msgIds = msgs.map(m => m.id);
                const reacts = await fetchReactions(msgIds);
                setReactions(reacts);
            }

            if (user) updateLastRead(id, user.id);
        } catch (err) {
            console.error('Load room error:', err);
        }
        setLoading(false);
    }

    async function loadReactions() {
        if (messages.length === 0) return;
        const msgIds = messages.map(m => m.id);
        const reacts = await fetchReactions(msgIds);
        setReactions(reacts);
    }

    async function loadOlderMessages() {
        if (loadingMore || !hasMore || messages.length === 0) return;
        setLoadingMore(true);
        try {
            const oldest = messages[0].created_at;
            const older = await fetchMessages(id, 50, oldest);
            if (older.length < 50) setHasMore(false);
            if (older.length > 0) {
                setMessages(prev => [...older, ...prev]);
                const msgIds = older.map(m => m.id);
                const reacts = await fetchReactions(msgIds);
                setReactions(prev => ({ ...prev, ...reacts }));
            }
        } catch (err) {
            console.error('Load older:', err);
        }
        setLoadingMore(false);
    }

    async function handleSend() {
        if (!input.trim() || !user || sending) return;
        const text = input.trim();
        setInput('');
        setSending(true);
        setTyping(false);
        try {
            if (replyTo) {
                await sendReply(id, user.id, text, replyTo.id);
                setReplyTo(null);
            } else {
                await sendMessage(id, user.id, text);
            }
        } catch (err) {
            setInput(text);
            alert('Gagal mengirim: ' + err.message);
        }
        setSending(false);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    }

    function handleInputChange(e) {
        setInput(e.target.value);
        setTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(false), 2000);
    }

    async function handleImageUpload(e) {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        if (!isGDriveConfigured()) { alert('Google Drive belum dikonfigurasi'); return; }
        setUploading(true);
        try {
            const result = await uploadImage(file, DRIVE_FOLDERS.CHAT_IMAGES);
            await sendImageMessage(id, user.id, result.directUrl, result.fileName, result.fileSize);
        } catch (err) {
            alert('Gagal upload: ' + err.message);
        }
        setUploading(false);
        e.target.value = '';
    }

    async function handleReaction(messageId, emoji) {
        if (!user) return;
        const existing = (reactions[messageId] || []).find(r => r.user_id === user.id && r.emoji === emoji);
        if (existing) {
            await removeReaction(messageId, user.id, emoji);
        } else {
            await addReaction(messageId, user.id, emoji);
        }
        setShowReactions(null);
        loadReactions();
    }

    async function handleSearch() {
        if (!searchQuery.trim()) return;
        const results = await searchMessages(id, searchQuery.trim());
        setSearchResults(results);
    }

    const handleScroll = useCallback(() => {
        const el = messagesRef.current;
        if (!el) return;
        if (el.scrollTop < 100) loadOlderMessages();
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
        setShowScrollDown(!nearBottom);
    }, [messages.length, loadingMore]);

    function scrollToBottom() {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    function groupMessagesByDate(msgs) {
        const groups = [];
        let currentDate = '';
        for (const msg of msgs) {
            const d = new Date(msg.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
            if (d !== currentDate) { currentDate = d; groups.push({ type: 'date', date: d }); }
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
                <div className="header-title" onClick={() => { }}>
                    {room?.icon && <span className="room-icon">{room.icon}</span>}
                    <div>
                        <h1>{room?.name || 'Chat'}</h1>
                        <small>
                            {typingUsers.length > 0
                                ? <span className="typing-indicator">{typingUsers.join(', ')} mengetik<span className="typing-dots">...</span></span>
                                : `${members.length} anggota`}
                        </small>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-icon" onClick={() => setShowSearch(!showSearch)}>
                        <Search size={18} />
                    </button>
                </div>
            </header>

            {/* Search Bar */}
            {showSearch && (
                <div className="chat-search-bar">
                    <input
                        type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari pesan..." onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        autoFocus
                    />
                    <button onClick={handleSearch}><Search size={16} /></button>
                    <button onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(''); }}><X size={16} /></button>
                </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="search-results">
                    <div className="search-results-header">{searchResults.length} hasil ditemukan</div>
                    {searchResults.map(msg => (
                        <div key={msg.id} className="search-result-item">
                            <span className="search-sender">{msg.sender?.full_name}</span>
                            <p>{msg.content}</p>
                            <small>{formatChatTime(msg.created_at)}</small>
                        </div>
                    ))}
                </div>
            )}

            {/* Pinned Message */}
            {room?.pinned_message_id && messages.find(m => m.id === room.pinned_message_id) && (
                <div className="pinned-message">
                    <Pin size={14} />
                    <span>{messages.find(m => m.id === room.pinned_message_id)?.content}</span>
                </div>
            )}

            {/* Messages Area */}
            <div className="messages-area" ref={messagesRef} onScroll={handleScroll}>
                {loadingMore && <div className="loading-more"><div className="loading-spinner small" /></div>}
                {!hasMore && messages.length > 0 && (
                    <div className="chat-start-marker">💬 Awal percakapan</div>
                )}

                {loading ? (
                    <div className="loading-state"><div className="loading-spinner" /><p>Memuat...</p></div>
                ) : messages.length === 0 ? (
                    <div className="empty-chat">
                        <div className="empty-chat-icon">💬</div>
                        <p>Mulai percakapan!</p>
                    </div>
                ) : grouped.map((item, i) => {
                    if (item.type === 'date') {
                        return <div key={`date-${i}`} className="date-divider"><span>{item.date}</span></div>;
                    }
                    const isMe = item.sender_id === user?.id;
                    const msgReactions = reactions[item.id] || [];

                    return (
                        <div key={item.id} className={`message-bubble ${isMe ? 'me' : 'other'}`}>
                            {/* Reply Preview */}
                            {item.reply && item.reply[0] && (
                                <div className="reply-preview">
                                    <div className="reply-bar" />
                                    <div>
                                        <span className="reply-name">{item.reply[0].sender?.full_name}</span>
                                        <p>{item.reply[0].content?.substring(0, 80)}</p>
                                    </div>
                                </div>
                            )}

                            {!isMe && (
                                <span className="bubble-sender">
                                    {item.sender?.full_name || 'Warga'}
                                    {item.sender?.blok && <small> ({item.sender.blok}{item.sender.nomor})</small>}
                                </span>
                            )}

                            {/* Image Message */}
                            {item.message_type === 'image' && item.image_url && (
                                <div className="bubble-image">
                                    <img src={item.image_url} alt={item.file_name || 'foto'} loading="lazy"
                                        onClick={() => window.open(item.image_url, '_blank')} />
                                </div>
                            )}

                            {/* Text Content */}
                            {item.content && !(item.message_type === 'image' && item.content === '📷 Foto') && (
                                <p className="bubble-content">{item.content}</p>
                            )}

                            {/* Reactions */}
                            {msgReactions.length > 0 && (
                                <div className="bubble-reactions">
                                    {Object.entries(
                                        msgReactions.reduce((acc, r) => {
                                            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ).map(([emoji, count]) => (
                                        <button key={emoji} className={`reaction-badge ${msgReactions.find(r => r.user_id === user?.id && r.emoji === emoji) ? 'my-reaction' : ''}`}
                                            onClick={() => handleReaction(item.id, emoji)}>
                                            {emoji} {count}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="bubble-footer">
                                <span className="bubble-time">{formatChatTime(item.created_at)}</span>
                                <div className="bubble-actions">
                                    <button className="btn-micro" onClick={() => setShowReactions(showReactions === item.id ? null : item.id)} title="Reaksi">
                                        <Smile size={12} />
                                    </button>
                                    <button className="btn-micro" onClick={() => setReplyTo(item)} title="Balas">
                                        <Reply size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* Reaction Picker */}
                            {showReactions === item.id && (
                                <div className="reaction-picker">
                                    {REACTION_EMOJIS.map(emoji => (
                                        <button key={emoji} onClick={() => handleReaction(item.id, emoji)}>{emoji}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Scroll to bottom */}
            {showScrollDown && (
                <button className="btn-scroll-down" onClick={scrollToBottom}>
                    <ChevronDown size={20} />
                </button>
            )}

            {/* Reply Preview */}
            {replyTo && (
                <div className="reply-input-preview">
                    <div className="reply-bar" />
                    <div className="reply-content">
                        <span>Membalas <strong>{replyTo.sender?.full_name || 'Pesan'}</strong></span>
                        <p>{replyTo.content?.substring(0, 60)}</p>
                    </div>
                    <button onClick={() => setReplyTo(null)}><X size={16} /></button>
                </div>
            )}

            {/* Input Area */}
            <div className="chat-input-area">
                <button className="btn-attach" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? '⏳' : <Image size={20} />}
                </button>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <textarea
                    value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                    placeholder="Ketik pesan..." rows={1} disabled={!user}
                />
                <button className="btn-send" onClick={handleSend} disabled={!input.trim() || sending}>
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
