import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, MapPin, Camera, Navigation } from 'lucide-react';
import { sendPanicAlert, ALERT_TYPES, getCurrentPosition, getMapUrl } from '../services/keamananService';
import { uploadImage, isGDriveConfigured, DRIVE_FOLDERS } from '../../../services/googleDriveService';
import '../keamanan.css';

export default function PanicButton() {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState('emergency');
    const [description, setDescription] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [holdTimer, setHoldTimer] = useState(null);
    const [location, setLocation] = useState(null);
    const [locating, setLocating] = useState(false);
    const [locError, setLocError] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [user] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('portal_user'))
                || JSON.parse(localStorage.getItem('portal_user'));
        } catch { return null; }
    });

    const blok = (() => {
        if (user?.blok) return `${user.blok}${user.nomor || ''}`.toUpperCase();
        try {
            const warga = JSON.parse(sessionStorage.getItem('warga_user') || localStorage.getItem('warga_user'));
            if (warga?.blok) return warga.blok.toUpperCase();
        } catch { }
        return user?.full_name || 'Warga';
    })();

    // Auto-get GPS on mount
    useEffect(() => { getLocation(); }, []);

    async function getLocation() {
        setLocating(true);
        setLocError('');
        try {
            const pos = await getCurrentPosition();
            setLocation(pos);
        } catch (err) {
            setLocError(err.message);
        }
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

    function startHold() {
        setCountdown(3);
        let c = 3;
        const timer = setInterval(() => {
            c--;
            setCountdown(c);
            if (c <= 0) {
                clearInterval(timer);
                triggerAlert();
            }
        }, 1000);
        setHoldTimer(timer);
    }

    function cancelHold() {
        if (holdTimer) clearInterval(holdTimer);
        setHoldTimer(null);
        setCountdown(0);
    }

    async function triggerAlert() {
        setHoldTimer(null);
        setCountdown(0);
        setSending(true);

        try {
            let photoUrl = null;
            if (photo && isGDriveConfigured()) {
                setUploading(true);
                const result = await uploadImage(photo, DRIVE_FOLDERS.KEAMANAN_EVIDENCE);
                photoUrl = result.directUrl;
                setUploading(false);
            }

            await sendPanicAlert({
                reporter_id: user?.id,
                reporter_blok: blok,
                alert_type: selectedType,
                description: description || null,
                latitude: location?.latitude || null,
                longitude: location?.longitude || null,
                photo_url: photoUrl,
            });
            setSent(true);
        } catch (err) {
            alert('Gagal mengirim alert: ' + err.message);
        }
        setSending(false);
    }

    if (sent) {
        return (
            <div className="keamanan-container">
                <div className="panic-sent">
                    <div className="panic-sent-icon">
                        <CheckCircle size={64} />
                    </div>
                    <h2>Alert Terkirim! 🚨</h2>
                    <p>Admin/satpam sudah menerima notifikasi dari <strong>Blok {blok}</strong></p>
                    {location && (
                        <a href={getMapUrl(location.latitude, location.longitude)}
                            target="_blank" rel="noopener" className="location-link">
                            <MapPin size={14} /> Lokasi terkirim
                        </a>
                    )}
                    <p className="panic-sent-sub">Bantuan sedang dalam perjalanan. Tetap tenang.</p>
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
                    <AlertTriangle size={24} />
                    <h1>Tombol Darurat</h1>
                </div>
            </header>

            <div className="panic-page">
                {/* Alert Type Selection */}
                <div className="panic-type-section">
                    <label>Jenis Keadaan Darurat</label>
                    <div className="panic-types">
                        {ALERT_TYPES.map(t => (
                            <button
                                key={t.value}
                                className={`panic-type-btn ${selectedType === t.value ? 'active' : ''}`}
                                style={selectedType === t.value ? { borderColor: t.color, background: `${t.color}15` } : {}}
                                onClick={() => setSelectedType(t.value)}
                            >
                                <span className="panic-type-icon">{t.icon}</span>
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* GPS Location */}
                <div className="panic-gps-section">
                    <label><MapPin size={14} /> Lokasi GPS</label>
                    <div className="gps-status">
                        {locating ? (
                            <div className="gps-loading">
                                <Navigation size={16} className="gps-spin" />
                                <span>Mendapatkan lokasi...</span>
                            </div>
                        ) : location ? (
                            <div className="gps-found">
                                <span className="gps-dot" />
                                <span>Lokasi terdeteksi ({location.latitude.toFixed(5)}, {location.longitude.toFixed(5)})</span>
                                <a href={getMapUrl(location.latitude, location.longitude)} target="_blank" rel="noopener">
                                    Lihat Peta ↗
                                </a>
                            </div>
                        ) : (
                            <div className="gps-error">
                                <span>{locError || 'Lokasi tidak tersedia'}</span>
                                <button onClick={getLocation}>Coba Lagi</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Photo Evidence */}
                <div className="panic-photo-section">
                    <label><Camera size={14} /> Foto Bukti (opsional)</label>
                    <div className="photo-upload-area">
                        {photoPreview ? (
                            <div className="photo-preview">
                                <img src={photoPreview} alt="bukti" />
                                <button className="photo-remove" onClick={() => { setPhoto(null); setPhotoPreview(null); }}>✕</button>
                            </div>
                        ) : (
                            <button className="photo-upload-btn" onClick={() => fileInputRef.current?.click()}>
                                <Camera size={24} />
                                <span>Ambil Foto</span>
                            </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
                    </div>
                </div>

                {/* Optional Description */}
                <div className="panic-desc-section">
                    <label>Keterangan (opsional)</label>
                    <textarea
                        value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="Jelaskan situasi jika memungkinkan..."
                        rows={2}
                    />
                </div>

                {/* Location Info */}
                <div className="panic-location">
                    📍 Lokasi: <strong>Blok {blok}</strong>, Perumahan Griya Sakinah
                </div>

                {/* THE PANIC BUTTON */}
                <div className="panic-button-wrapper">
                    <button
                        className={`panic-button ${countdown > 0 ? 'holding' : ''} ${sending ? 'sending' : ''}`}
                        onMouseDown={startHold} onMouseUp={cancelHold} onMouseLeave={cancelHold}
                        onTouchStart={startHold} onTouchEnd={cancelHold}
                        disabled={sending}
                    >
                        {sending ? (
                            <>{uploading ? '📤 Upload foto...' : <div className="loading-spinner" />}</>
                        ) : countdown > 0 ? (
                            <span className="countdown">{countdown}</span>
                        ) : (
                            <>
                                <span className="panic-btn-icon">🚨</span>
                                <span className="panic-btn-text">TEKAN & TAHAN</span>
                            </>
                        )}
                    </button>
                    <p className="panic-hint">Tekan dan tahan 3 detik untuk mengirim alert</p>
                </div>

                <div className="panic-warning">
                    <AlertTriangle size={16} />
                    <span>Alert palsu dapat mengganggu keamanan. Gunakan dengan bijak.</span>
                </div>
            </div>
        </div>
    );
}
