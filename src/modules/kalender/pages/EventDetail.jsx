import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle,
    HelpCircle, XCircle, Edit, MessageCircle, Image, Send,
    Camera, Trash2, UserCheck
} from 'lucide-react';
import {
    fetchEventById, fetchRsvps, submitRsvp, getUserRsvp,
    getEventType, formatDate, formatTime, getEventStatus, timeAgo,
    fetchComments, addComment, deleteComment,
    fetchEventPhotos, addEventPhoto, deleteEventPhoto,
    fetchAttendance, checkinEvent, hasCheckedIn,
    subscribeToRsvps
} from '../services/kalenderService';
import { uploadImage, isGDriveConfigured, DRIVE_FOLDERS } from '../../../services/googleDriveService';
import '../kalender.css';

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [rsvps, setRsvps] = useState([]);
    const [myRsvp, setMyRsvp] = useState(null);
    const [comments, setComments] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [checkedIn, setCheckedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [sendingComment, setSendingComment] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [lightboxPhoto, setLightboxPhoto] = useState(null);
    const fileInputRef = useRef(null);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });
    const isAdmin = user?.role === 'superadmin' || user?.role === 'super_admin' || user?.role === 'admin';

    useEffect(() => {
        loadEvent();
        const unsub = subscribeToRsvps(id, () => refreshRsvps());
        return unsub;
    }, [id]);

    async function loadEvent() {
        setLoading(true);
        try {
            const [eventData, rsvpData, commentData, photoData, attendanceData] = await Promise.all([
                fetchEventById(id),
                fetchRsvps(id),
                fetchComments(id),
                fetchEventPhotos(id),
                fetchAttendance(id),
            ]);
            setEvent(eventData);
            setRsvps(rsvpData);
            setComments(commentData);
            setPhotos(photoData);
            setAttendance(attendanceData);
            if (user) {
                const mine = await getUserRsvp(id, user.id);
                setMyRsvp(mine);
                const alreadyIn = await hasCheckedIn(id, user.id);
                setCheckedIn(alreadyIn);
            }
        } catch (err) {
            console.error('Load event error:', err);
        }
        setLoading(false);
    }

    async function refreshRsvps() {
        const data = await fetchRsvps(id);
        setRsvps(data);
    }

    async function handleRsvp(status) {
        if (!user) { alert('Silakan login terlebih dahulu'); return; }
        setRsvpLoading(true);
        try {
            await submitRsvp(id, user.id, status);
            setMyRsvp({ status });
            await refreshRsvps();
        } catch (err) { alert('Gagal RSVP: ' + err.message); }
        setRsvpLoading(false);
    }

    async function handleComment() {
        if (!commentText.trim() || !user) return;
        setSendingComment(true);
        try {
            const newComment = await addComment(id, user.id, commentText.trim());
            setComments(prev => [...prev, newComment]);
            setCommentText('');
        } catch (err) { alert('Gagal mengirim komentar: ' + err.message); }
        setSendingComment(false);
    }

    async function handleDeleteComment(commentId) {
        if (!confirm('Hapus komentar?')) return;
        try {
            await deleteComment(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) { alert('Gagal: ' + err.message); }
    }

    async function handlePhotoUpload(e) {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        if (!isGDriveConfigured()) { alert('Google Drive belum dikonfigurasi'); return; }
        setUploadingPhoto(true);
        try {
            const result = await uploadImage(file, DRIVE_FOLDERS.EVENT_PHOTOS);
            const photo = await addEventPhoto(id, user.id, result.directUrl, result.thumbnailUrl, '');
            setPhotos(prev => [photo, ...prev]);
        } catch (err) { alert('Gagal upload foto: ' + err.message); }
        setUploadingPhoto(false);
        e.target.value = '';
    }

    async function handleCheckin() {
        if (!user) { alert('Silakan login'); return; }
        try {
            await checkinEvent(id, user.id);
            setCheckedIn(true);
            const updated = await fetchAttendance(id);
            setAttendance(updated);
        } catch (err) { alert('Gagal check-in: ' + err.message); }
    }

    if (loading) return (
        <div className="kalender-container">
            <div className="loading-state"><div className="loading-spinner" /><p>Memuat...</p></div>
        </div>
    );
    if (!event) return (
        <div className="kalender-container">
            <div className="empty-state"><h3>Event tidak ditemukan</h3></div>
        </div>
    );

    const type = getEventType(event.event_type);
    const status = getEventStatus(event);
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
                    <span className={`event-status-badge ${status}`}>
                        {status === 'upcoming' ? '📅 Akan datang' : status === 'ongoing' ? '🔴 Berlangsung' : '✅ Selesai'}
                    </span>
                </div>

                <div className="event-detail-body">
                    <h2>{event.title}</h2>
                    {event.description && <p className="event-description">{event.description}</p>}
                    {event.is_recurring && <span className="recurring-badge">🔄 Berulang: {event.recurring_pattern}</span>}

                    <div className="event-detail-meta">
                        <div className="meta-item"><Calendar size={18} /><span>{formatDate(event.event_date)}</span></div>
                        {event.start_time && (
                            <div className="meta-item"><Clock size={18} /><span>{formatTime(event.start_time)}{event.end_time && ` - ${formatTime(event.end_time)}`}</span></div>
                        )}
                        {event.location && <div className="meta-item"><MapPin size={18} /><span>{event.location}</span></div>}
                        <div className="meta-item"><Users size={18} /><span>{going.length} hadir{maybe.length > 0 ? `, ${maybe.length} mungkin` : ''}</span></div>
                    </div>

                    {/* RSVP Buttons */}
                    {user && (status === 'upcoming' || status === 'ongoing') && (
                        <div className="rsvp-section">
                            <h3>Konfirmasi Kehadiran</h3>
                            <div className="rsvp-buttons">
                                <button className={`rsvp-btn going ${myRsvp?.status === 'going' ? 'active' : ''}`}
                                    onClick={() => handleRsvp('going')} disabled={rsvpLoading}>
                                    <CheckCircle size={18} /> Hadir
                                </button>
                                <button className={`rsvp-btn maybe ${myRsvp?.status === 'maybe' ? 'active' : ''}`}
                                    onClick={() => handleRsvp('maybe')} disabled={rsvpLoading}>
                                    <HelpCircle size={18} /> Mungkin
                                </button>
                                <button className={`rsvp-btn not-going ${myRsvp?.status === 'not_going' ? 'active' : ''}`}
                                    onClick={() => handleRsvp('not_going')} disabled={rsvpLoading}>
                                    <XCircle size={18} /> Tidak
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Check-in for ongoing events */}
                    {user && status === 'ongoing' && (
                        <div className="checkin-section">
                            {checkedIn ? (
                                <div className="checkin-done"><UserCheck size={18} /> Sudah check-in ✅</div>
                            ) : (
                                <button className="btn-event-checkin" onClick={handleCheckin}>
                                    <UserCheck size={18} /> Check-in Kehadiran
                                </button>
                            )}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="event-tabs">
                        <button className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}>
                            <Users size={14} /> Peserta ({going.length})
                        </button>
                        <button className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('comments')}>
                            <MessageCircle size={14} /> Diskusi ({comments.length})
                        </button>
                        <button className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('photos')}>
                            <Image size={14} /> Foto ({photos.length})
                        </button>
                    </div>

                    {/* TAB: Attendees */}
                    {activeTab === 'info' && (
                        <div className="tab-content">
                            {going.length > 0 && (
                                <div className="attendees-section">
                                    <h4>✅ Akan Hadir ({going.length})</h4>
                                    <div className="attendees-list">
                                        {going.map(r => (
                                            <div key={r.id} className="attendee-chip">
                                                {r.user?.full_name || 'Warga'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {maybe.length > 0 && (
                                <div className="attendees-section">
                                    <h4>🤔 Mungkin ({maybe.length})</h4>
                                    <div className="attendees-list">
                                        {maybe.map(r => (
                                            <div key={r.id} className="attendee-chip maybe">
                                                {r.user?.full_name || 'Warga'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {attendance.length > 0 && (
                                <div className="attendees-section">
                                    <h4>📋 Sudah Check-in ({attendance.length})</h4>
                                    <div className="attendees-list">
                                        {attendance.map(a => (
                                            <div key={a.id} className="attendee-chip checked-in">
                                                {a.user?.full_name || 'Warga'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: Comments/Discussion */}
                    {activeTab === 'comments' && (
                        <div className="tab-content">
                            <div className="comments-list">
                                {comments.length === 0 ? (
                                    <p className="empty-mini">Belum ada komentar. Mulai diskusi!</p>
                                ) : comments.map(c => (
                                    <div key={c.id} className="comment-item">
                                        <div className="comment-header">
                                            <strong>{c.user?.full_name || 'Warga'}</strong>
                                            <span className="comment-time">{timeAgo(c.created_at)}</span>
                                            {user && (c.user_id === user.id || isAdmin) && (
                                                <button className="btn-del-comment" onClick={() => handleDeleteComment(c.id)}>
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="comment-text">{c.content}</p>
                                    </div>
                                ))}
                            </div>
                            {user && (
                                <div className="comment-input-area">
                                    <input
                                        value={commentText} onChange={e => setCommentText(e.target.value)}
                                        placeholder="Tulis komentar..."
                                        onKeyDown={e => e.key === 'Enter' && handleComment()}
                                    />
                                    <button onClick={handleComment} disabled={sendingComment || !commentText.trim()}>
                                        <Send size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: Photo Gallery */}
                    {activeTab === 'photos' && (
                        <div className="tab-content">
                            {user && (
                                <div className="photo-upload-row">
                                    <button className="btn-upload-photo"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingPhoto}>
                                        <Camera size={16} />
                                        {uploadingPhoto ? 'Uploading...' : 'Upload Foto'}
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*"
                                        onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                </div>
                            )}
                            {photos.length === 0 ? (
                                <p className="empty-mini">Belum ada foto dokumentasi.</p>
                            ) : (
                                <div className="photo-gallery">
                                    {photos.map(p => (
                                        <div key={p.id} className="gallery-item"
                                            onClick={() => setLightboxPhoto(p)}>
                                            <img src={p.thumbnail_url || p.photo_url} alt={p.caption || 'foto'} loading="lazy" />
                                            {user && (p.uploaded_by === user.id || isAdmin) && (
                                                <button className="gallery-delete" onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Hapus foto?')) {
                                                        deleteEventPhoto(p.id);
                                                        setPhotos(prev => prev.filter(x => x.id !== p.id));
                                                    }
                                                }}><Trash2 size={12} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {lightboxPhoto && (
                <div className="lightbox" onClick={() => setLightboxPhoto(null)}>
                    <img src={lightboxPhoto.photo_url} alt="" />
                    {lightboxPhoto.caption && <p>{lightboxPhoto.caption}</p>}
                    <span className="lightbox-uploader">
                        📷 {lightboxPhoto.uploader?.full_name} • {timeAgo(lightboxPhoto.created_at)}
                    </span>
                </div>
            )}
        </div>
    );
}
