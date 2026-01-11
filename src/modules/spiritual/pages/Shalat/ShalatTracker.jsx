import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Check, Users, User, Flame } from 'lucide-react';

const SHALAT_WAJIB = [
    { id: 'subuh', nama: 'Subuh', waktu: '04:30', rakaat: 2 },
    { id: 'dzuhur', nama: 'Dzuhur', waktu: '12:00', rakaat: 4 },
    { id: 'ashar', nama: 'Ashar', waktu: '15:15', rakaat: 4 },
    { id: 'maghrib', nama: 'Maghrib', waktu: '18:00', rakaat: 3 },
    { id: 'isya', nama: 'Isya', waktu: '19:15', rakaat: 4 },
];

const SHALAT_SUNNAH = [
    { id: 'tahajud', nama: 'Tahajud', waktu: 'Malam', rakaat: 2 },
    { id: 'dhuha', nama: 'Dhuha', waktu: '07:00-11:00', rakaat: 2 },
    { id: 'rawatib_subuh', nama: 'Rawatib Subuh', waktu: 'Sebelum Subuh', rakaat: 2 },
    { id: 'rawatib_dzuhur_sebelum', nama: 'Rawatib Dzuhur (Sebelum)', waktu: 'Sebelum Dzuhur', rakaat: 2 },
    { id: 'rawatib_dzuhur_sesudah', nama: 'Rawatib Dzuhur (Sesudah)', waktu: 'Sesudah Dzuhur', rakaat: 2 },
    { id: 'rawatib_maghrib', nama: 'Rawatib Maghrib', waktu: 'Sesudah Maghrib', rakaat: 2 },
    { id: 'rawatib_isya', nama: 'Rawatib Isya', waktu: 'Sesudah Isya', rakaat: 2 },
    { id: 'witir', nama: 'Witir', waktu: 'Sesudah Isya', rakaat: 3 },
];

export default function ShalatTracker() {
    const [wajibStatus, setWajibStatus] = useState({});
    const [sunnahStatus, setSunnahStatus] = useState({});
    const [jamaahMode, setJamaahMode] = useState({});
    const [streak, setStreak] = useState(7);
    const [showSunnah, setShowSunnah] = useState(false);

    const wajibCompleted = Object.values(wajibStatus).filter(Boolean).length;
    const sunnahCompleted = Object.values(sunnahStatus).filter(Boolean).length;

    const toggleWajib = (id) => {
        setWajibStatus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSunnah = (id) => {
        setSunnahStatus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleJamaah = (id, e) => {
        e.stopPropagation();
        setJamaahMode(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                <div>
                    <h1>
                        <Clock size={28} />
                        Shalat Tracker
                    </h1>
                    <p className="subtitle">5 Waktu + Sunnah Rawatib</p>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Flame size={16} />
                    {streak} hari
                </div>
            </div>

            {/* Hadis-Hadis Tentang Shalat */}
            <div style={{
                background: 'rgba(99, 102, 241, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
                <h4 style={{ marginBottom: '16px', color: '#a78bfa' }}>📖 Hadis Tentang Shalat</h4>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: '4px' }}>HR. Ahmad</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Shalat adalah <strong>tiang agama</strong>. Barangsiapa menegakkannya berarti ia menegakkan agama."
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: '4px' }}>HR. Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Shalat berjamaah <strong>lebih utama 27 derajat</strong> daripada shalat sendirian."
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: '4px' }}>HR. Bukhari & Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Yang pertama kali dihisab dari amalan seorang hamba pada hari kiamat adalah <strong>shalatnya</strong>."
                    </p>
                </div>

                <div>
                    <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: '4px' }}>QS. Al-Ankabut 29:45</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Dirikanlah shalat. Sesungguhnya shalat itu <strong>mencegah dari perbuatan keji dan mungkar</strong>."
                    </p>
                </div>
            </div>

            {/* Progress */}
            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#6366f1' }}>
                            {wajibCompleted}/5
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>Wajib</div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--spiritual-border)', paddingLeft: '24px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>
                            {sunnahCompleted}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>Sunnah</div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--spiritual-border)', paddingLeft: '24px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                            {Object.values(jamaahMode).filter(Boolean).length}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>Jamaah</div>
                    </div>
                </div>
                {wajibCompleted === 5 && (
                    <div style={{
                        marginTop: '16px',
                        textAlign: 'center',
                        padding: '12px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '8px',
                        color: '#22c55e'
                    }}>
                        🎉 Alhamdulillah! 5 waktu lengkap hari ini!
                    </div>
                )}
            </div>

            {/* Shalat Wajib */}
            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '16px' }}>🕌 Shalat 5 Waktu</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {SHALAT_WAJIB.map(shalat => (
                        <div
                            key={shalat.id}
                            onClick={() => toggleWajib(shalat.id)}
                            className={`spiritual-check-item ${wajibStatus[shalat.id] ? 'completed' : ''}`}
                        >
                            <div className="spiritual-checkbox">
                                {wajibStatus[shalat.id] && <Check size={14} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="spiritual-check-text">{shalat.nama}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>
                                    {shalat.rakaat} rakaat • ~{shalat.waktu}
                                </div>
                            </div>
                            {wajibStatus[shalat.id] && (
                                <button
                                    onClick={(e) => toggleJamaah(shalat.id, e)}
                                    style={{
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: jamaahMode[shalat.id] ? 'rgba(34, 197, 94, 0.2)' : 'var(--spiritual-bg)',
                                        color: jamaahMode[shalat.id] ? '#22c55e' : 'var(--spiritual-text-muted)'
                                    }}
                                >
                                    {jamaahMode[shalat.id] ? <Users size={12} /> : <User size={12} />}
                                    {jamaahMode[shalat.id] ? 'Jamaah' : 'Sendiri'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Shalat Sunnah Toggle */}
            <button
                onClick={() => setShowSunnah(!showSunnah)}
                className="spiritual-btn spiritual-btn-secondary"
                style={{ width: '100%', marginBottom: '16px' }}
            >
                {showSunnah ? 'Sembunyikan' : 'Tampilkan'} Shalat Sunnah ({sunnahCompleted}/{SHALAT_SUNNAH.length})
            </button>

            {/* Shalat Sunnah */}
            {showSunnah && (
                <div className="spiritual-card">
                    <h4 style={{ marginBottom: '16px' }}>✨ Shalat Sunnah</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {SHALAT_SUNNAH.map(shalat => (
                            <div
                                key={shalat.id}
                                onClick={() => toggleSunnah(shalat.id)}
                                className={`spiritual-check-item ${sunnahStatus[shalat.id] ? 'completed' : ''}`}
                            >
                                <div className="spiritual-checkbox">
                                    {sunnahStatus[shalat.id] && <Check size={14} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="spiritual-check-text">{shalat.nama}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>
                                        {shalat.rakaat} rakaat • {shalat.waktu}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '8px',
                        fontSize: '0.8rem'
                    }}>
                        <strong>HR. Bukhari & Muslim:</strong> "12 rakaat sunnah rawatib → rumah di surga"
                    </div>
                </div>
            )}
        </div>
    );
}
