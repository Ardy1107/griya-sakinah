import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { sendPanicAlert, ALERT_TYPES } from '../services/keamananService';
import '../keamanan.css';

export default function PanicButton() {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState('emergency');
    const [description, setDescription] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [holdTimer, setHoldTimer] = useState(null);
    const [user] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('portal_user'))
                || JSON.parse(localStorage.getItem('portal_user'));
        } catch { return null; }
    });

    const blok = (() => {
        if (user?.blok) return `${user.blok}${user.nomor || ''}`.toUpperCase();
        // Try warga_users session as fallback
        try {
            const warga = JSON.parse(sessionStorage.getItem('warga_user') || localStorage.getItem('warga_user'));
            if (warga?.blok) return warga.blok.toUpperCase();
        } catch { }
        return user?.full_name || 'Warga';
    })();

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
            await sendPanicAlert({
                reporter_id: user?.id,
                reporter_blok: blok,
                alert_type: selectedType,
                description: description || null,
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

                {/* Optional Description */}
                <div className="panic-desc-section">
                    <label>Keterangan (opsional)</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
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
                        onMouseDown={startHold}
                        onMouseUp={cancelHold}
                        onMouseLeave={cancelHold}
                        onTouchStart={startHold}
                        onTouchEnd={cancelHold}
                        disabled={sending}
                    >
                        {sending ? (
                            <div className="loading-spinner"></div>
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
