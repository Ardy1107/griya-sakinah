import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle,
    HelpCircle, XCircle, Share2, Edit
} from 'lucide-react';
import { fetchEventById, fetchRsvps, submitRsvp, getUserRsvp, getEventType, formatDate, formatTime } from '../services/kalenderService';
import '../kalender.css';

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [rsvps, setRsvps] = useState([]);
    const [myRsvp, setMyRsvp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });
    const isAdmin = user?.role === 'superadmin' || user?.role === 'super_admin' || user?.role === 'admin';

    useEffect(() => { loadEvent(); }, [id]);

    async function loadEvent() {
        setLoading(true);
        try {
            const [eventData, rsvpData] = await Promise.all([
                fetchEventById(id),
                fetchRsvps(id),
            ]);
            setEvent(eventData);
            setRsvps(rsvpData);
            if (user) {
                const mine = await getUserRsvp(id, user.id);
                setMyRsvp(mine);
            }
        } catch (err) {
            console.error('Load event error:', err);
        }
        setLoading(false);
    }

    async function handleRsvp(status) {
        if (!user) { alert('Silakan login terlebih dahulu'); return; }
        setRsvpLoading(true);
        try {
            await submitRsvp(id, user.id, status);
            setMyRsvp({ status });
            const updated = await fetchRsvps(id);
            setRsvps(updated);
        } catch (err) {
            alert('Gagal RSVP: ' + err.message);
        }
        setRsvpLoading(false);
    }

    if (loading) return (
        <div className="kalender-container">
            <div className="loading-state"><div className="loading-spinner"></div><p>Memuat...</p></div>
        </div>
    );
    if (!event) return (
        <div className="kalender-container">
            <div className="empty-state"><h3>Event tidak ditemukan</h3></div>
        </div>
    );

    const type = getEventType(event.event_type);
    const going = rsvps.filter(r => r.status === 'going');
    const maybe = rsvps.filter(r => r.status === 'maybe');

    return (
        <div className="kalender-container">
            <header className="kalender-header">
                <button className="btn-back" onClick={() => navigate('/kalender')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <span style={{ fontSize: '1.5rem' }}>{type.icon}</span>
                    <h1>Detail Event</h1>
                </div>
                {isAdmin && (
                    <button className="btn-edit" onClick={() => navigate(`/kalender/edit/${event.id}`)}>
                        <Edit size={18} />
                    </button>
                )}
            </header>

            <div className="event-detail-card">
                <div className="event-detail-banner" style={{ background: `linear-gradient(135deg, ${type.color}, ${type.color}cc)` }}>
                    <span className="event-detail-icon">{type.icon}</span>
                    <div className="event-detail-badge">{type.label}</div>
                </div>

                <div className="event-detail-body">
                    <h2>{event.title}</h2>
                    {event.description && <p className="event-description">{event.description}</p>}

                    <div className="event-detail-meta">
                        <div className="meta-item">
                            <Calendar size={18} />
                            <span>{formatDate(event.event_date)}</span>
                        </div>
                        {event.start_time && (
                            <div className="meta-item">
                                <Clock size={18} />
                                <span>{formatTime(event.start_time)}{event.end_time && ` - ${formatTime(event.end_time)}`}</span>
                            </div>
                        )}
                        {event.location && (
                            <div className="meta-item">
                                <MapPin size={18} />
                                <span>{event.location}</span>
                            </div>
                        )}
                        <div className="meta-item">
                            <Users size={18} />
                            <span>{going.length} hadir{maybe.length > 0 ? `, ${maybe.length} mungkin` : ''}</span>
                        </div>
                    </div>

                    {/* RSVP Buttons */}
                    {user && event.status === 'upcoming' && (
                        <div className="rsvp-section">
                            <h3>Konfirmasi Kehadiran</h3>
                            <div className="rsvp-buttons">
                                <button
                                    className={`rsvp-btn going ${myRsvp?.status === 'going' ? 'active' : ''}`}
                                    onClick={() => handleRsvp('going')}
                                    disabled={rsvpLoading}
                                >
                                    <CheckCircle size={18} /> Hadir
                                </button>
                                <button
                                    className={`rsvp-btn maybe ${myRsvp?.status === 'maybe' ? 'active' : ''}`}
                                    onClick={() => handleRsvp('maybe')}
                                    disabled={rsvpLoading}
                                >
                                    <HelpCircle size={18} /> Mungkin
                                </button>
                                <button
                                    className={`rsvp-btn not-going ${myRsvp?.status === 'not_going' ? 'active' : ''}`}
                                    onClick={() => handleRsvp('not_going')}
                                    disabled={rsvpLoading}
                                >
                                    <XCircle size={18} /> Tidak
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Attendees */}
                    {going.length > 0 && (
                        <div className="attendees-section">
                            <h3><Users size={18} /> Akan Hadir ({going.length})</h3>
                            <div className="attendees-list">
                                {going.map(r => (
                                    <div key={r.id} className="attendee-chip">
                                        {r.user?.full_name || 'Warga'}
                                        {r.user?.blok && <small> ({r.user.blok}{r.user.nomor})</small>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
