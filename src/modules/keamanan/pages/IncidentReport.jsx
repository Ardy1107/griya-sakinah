import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, MapPin, Camera, Send, Navigation } from 'lucide-react';
import { createIncident, INCIDENT_TYPES, getCurrentPosition } from '../services/keamananService';
import { uploadImage, isGDriveConfigured, DRIVE_FOLDERS } from '../../../services/googleDriveService';
import '../keamanan.css';

export default function IncidentReport() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        incident_type: '',
        title: '',
        description: '',
    });
    const [location, setLocation] = useState(null);
    const [locating, setLocating] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const fileInputRef = useRef(null);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });
    const blok = user ? `${user.blok || ''}${user.nomor || ''}`.toUpperCase() : '';

    useEffect(() => { getLocation(); }, []);

    async function getLocation() {
        setLocating(true);
        try {
            const pos = await getCurrentPosition();
            setLocation(pos);
        } catch { }
        setLocating(false);
    }

    function handlePhoto(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhoto(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.incident_type || !form.title) { alert('Lengkapi tipe dan judul laporan'); return; }
        if (!user) { alert('Silakan login terlebih dahulu'); return; }

        setSending(true);
        try {
            let photoUrl = null;
            if (photo && isGDriveConfigured()) {
                const result = await uploadImage(photo, DRIVE_FOLDERS.INCIDENT_PHOTOS);
                photoUrl = result.directUrl;
            }

            await createIncident({
                reporter_id: user.id,
                reporter_blok: blok,
                incident_type: form.incident_type,
                title: form.title,
                description: form.description || null,
                photo_url: photoUrl,
                latitude: location?.latitude || null,
                longitude: location?.longitude || null,
            });
            setSent(true);
        } catch (err) {
            alert('Gagal mengirim laporan: ' + err.message);
        }
        setSending(false);
    }

    if (sent) {
        return (
            <div className="keamanan-container">
                <div className="panic-sent">
                    <div className="panic-sent-icon"><FileText size={64} /></div>
                    <h2>Laporan Terkirim! ✅</h2>
                    <p>Laporan insiden akan ditindaklanjuti oleh petugas.</p>
                    <button className="btn-back-home" onClick={() => navigate('/keamanan')}>
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="keamanan-container">
            <header className="keamanan-header">
                <button className="btn-back" onClick={() => navigate('/keamanan')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <FileText size={24} />
                    <h1>Lapor Insiden</h1>
                </div>
            </header>

            <form className="incident-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Jenis Insiden *</label>
                    <div className="incident-types-grid">
                        {INCIDENT_TYPES.map(t => (
                            <button key={t.value} type="button"
                                className={`incident-type-btn ${form.incident_type === t.value ? 'active' : ''}`}
                                onClick={() => setForm(f => ({ ...f, incident_type: t.value }))}>
                                <span>{t.icon}</span>
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Judul Laporan *</label>
                    <input type="text" value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Contoh: Motor hilang dari parkiran" required />
                </div>

                <div className="form-group">
                    <label>Deskripsi</label>
                    <textarea value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Ceritakan detail kejadian..." rows={3} />
                </div>

                <div className="form-group">
                    <label><Camera size={14} /> Foto Bukti</label>
                    <div className="photo-upload-area">
                        {photoPreview ? (
                            <div className="photo-preview">
                                <img src={photoPreview} alt="bukti" />
                                <button type="button" className="photo-remove"
                                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}>✕</button>
                            </div>
                        ) : (
                            <button type="button" className="photo-upload-btn"
                                onClick={() => fileInputRef.current?.click()}>
                                <Camera size={24} />
                                <span>Ambil Foto</span>
                            </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
                            onChange={handlePhoto} style={{ display: 'none' }} />
                    </div>
                </div>

                <div className="form-group">
                    <label><MapPin size={14} /> Lokasi</label>
                    <div className="gps-status">
                        {locating ? (
                            <div className="gps-loading"><Navigation size={16} className="gps-spin" /><span>Mendapatkan lokasi...</span></div>
                        ) : location ? (
                            <div className="gps-found"><span className="gps-dot" /><span>Lokasi terdeteksi</span></div>
                        ) : (
                            <div className="gps-error"><span>Lokasi tidak tersedia</span><button type="button" onClick={getLocation}>Coba Lagi</button></div>
                        )}
                    </div>
                </div>

                <button type="submit" className="btn-submit-incident" disabled={sending}>
                    <Send size={18} />
                    {sending ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
            </form>
        </div>
    );
}
