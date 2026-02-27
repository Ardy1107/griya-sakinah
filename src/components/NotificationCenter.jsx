import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Bell, Check, CheckCheck, Trash2, X
} from 'lucide-react';
import {
    fetchNotifications, fetchUnreadCount, markAsRead,
    markAllAsRead, deleteNotification, subscribeToNotifications,
    getNotifIcon, timeAgo
} from '../../services/notificationService';

export default function NotificationCenter({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    useEffect(() => {
        if (!user || !isOpen) return;
        loadNotifications();
        const unsub = subscribeToNotifications(user.id, (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(c => c + 1);
        });
        return unsub;
    }, [isOpen]);

    async function loadNotifications() {
        setLoading(true);
        try {
            const [notifs, count] = await Promise.all([
                fetchNotifications(user.id),
                fetchUnreadCount(user.id),
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (err) {
            console.error('Load notifs error:', err);
        }
        setLoading(false);
    }

    async function handleMarkRead(id) {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
    }

    async function handleMarkAllRead() {
        await markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    }

    async function handleDelete(id) {
        await deleteNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    }

    function handleClick(notif) {
        if (!notif.is_read) handleMarkRead(notif.id);
        if (notif.action_url) {
            navigate(notif.action_url);
            onClose?.();
        }
    }

    if (!isOpen) return null;

    return (
        <div className="notif-overlay" onClick={onClose}>
            <div className="notif-panel" onClick={e => e.stopPropagation()}>
                <div className="notif-header">
                    <h3><Bell size={18} /> Notifikasi</h3>
                    <div className="notif-header-actions">
                        {unreadCount > 0 && (
                            <button className="btn-mark-all" onClick={handleMarkAllRead}>
                                <CheckCheck size={14} /> Baca Semua
                            </button>
                        )}
                        <button className="btn-close-notif" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="notif-loading">
                        <div className="loading-spinner" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notif-empty">
                        <Bell size={32} />
                        <p>Tidak ada notifikasi</p>
                    </div>
                ) : (
                    <div className="notif-list">
                        {notifications.map(notif => (
                            <div key={notif.id}
                                className={`notif-item ${notif.is_read ? '' : 'unread'}`}
                                onClick={() => handleClick(notif)}>
                                <span className="notif-icon">{getNotifIcon(notif.type)}</span>
                                <div className="notif-content">
                                    <p className="notif-title">{notif.title}</p>
                                    {notif.body && <p className="notif-body">{notif.body}</p>}
                                    <span className="notif-time">{timeAgo(notif.created_at)}</span>
                                </div>
                                <div className="notif-actions">
                                    {!notif.is_read && (
                                        <button onClick={e => { e.stopPropagation(); handleMarkRead(notif.id); }}>
                                            <Check size={14} />
                                        </button>
                                    )}
                                    <button onClick={e => { e.stopPropagation(); handleDelete(notif.id); }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Notification Bell Button (for use in headers)
export function NotifBell({ onClick }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    useEffect(() => {
        if (!user) return;
        fetchUnreadCount(user.id).then(setUnreadCount).catch(() => { });
        const unsub = subscribeToNotifications(user.id, () => {
            setUnreadCount(c => c + 1);
        });
        return unsub;
    }, []);

    return (
        <button className="notif-bell" onClick={onClick}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
    );
}
