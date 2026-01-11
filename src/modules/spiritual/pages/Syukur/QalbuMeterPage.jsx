import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Save } from 'lucide-react';

export default function QalbuMeterPage() {
    const [qalbu, setQalbu] = useState({
        ketenangan: 7,
        syukur: 8,
        cinta_allah: 6,
        welas_asih: 7,
        keikhlasan: 5
    });
    const [saved, setSaved] = useState(false);

    const indicators = [
        { key: 'ketenangan', label: 'Ketenangan Hati', color: '#3b82f6', emoji: '🧘' },
        { key: 'syukur', label: 'Rasa Syukur', color: '#22c55e', emoji: '🙏' },
        { key: 'cinta_allah', label: 'Cinta pada Allah', color: '#ec4899', emoji: '❤️' },
        { key: 'welas_asih', label: 'Welas Asih', color: '#f97316', emoji: '🤗' },
        { key: 'keikhlasan', label: 'Keikhlasan', color: '#8b5cf6', emoji: '✨' },
    ];

    const getAverage = () => {
        const values = Object.values(qalbu);
        return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    };

    const handleChange = (key, value) => {
        setQalbu(prev => ({ ...prev, [key]: parseInt(value) }));
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual/syukur" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <div>
                    <h1>
                        <Heart size={28} />
                        Qalbu Meter
                    </h1>
                    <p className="subtitle">Ukur Kesehatan Hati Anda</p>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '12px 20px',
                    borderRadius: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{getAverage()}</div>
                    <div style={{ fontSize: '0.7rem' }}>Rata-rata</div>
                </div>
            </div>

            {/* Qalbu Indicators */}
            <div className="spiritual-card">
                <h3 style={{ marginBottom: '24px' }}>Bagaimana kondisi hati Anda hari ini?</h3>

                <div className="spiritual-qalbu-meter">
                    {indicators.map(ind => (
                        <div key={ind.key} style={{ marginBottom: '24px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px'
                            }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1.25rem' }}>{ind.emoji}</span>
                                    {ind.label}
                                </span>
                                <span style={{
                                    fontWeight: '700',
                                    fontSize: '1.25rem',
                                    color: ind.color
                                }}>
                                    {qalbu[ind.key]}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={qalbu[ind.key]}
                                onChange={(e) => handleChange(ind.key, e.target.value)}
                                className="spiritual-rating-slider"
                                style={{
                                    width: '100%',
                                    accentColor: ind.color
                                }}
                            />

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.7rem',
                                color: 'var(--spiritual-text-muted)'
                            }}>
                                <span>Rendah</span>
                                <span>Tinggi</span>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="spiritual-btn spiritual-btn-primary"
                    style={{ width: '100%', marginTop: '16px' }}
                    onClick={handleSave}
                >
                    <Save size={18} />
                    {saved ? 'Tersimpan! ✓' : 'Simpan Qalbu Meter'}
                </button>
            </div>

            {/* Summary Visual */}
            <div className="spiritual-card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Ringkasan Hari Ini</h3>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    {indicators.map(ind => (
                        <div
                            key={ind.key}
                            style={{
                                textAlign: 'center',
                                padding: '16px',
                                background: 'var(--spiritual-bg)',
                                borderRadius: '12px',
                                minWidth: '80px'
                            }}
                        >
                            <div style={{ fontSize: '2rem' }}>{ind.emoji}</div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: ind.color
                            }}>
                                {qalbu[ind.key]}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>
                                /10
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ayat */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'var(--spiritual-card)',
                borderRadius: '12px',
                fontSize: '0.875rem'
            }}>
                <strong>QS. Ar-Ra'd 13:28</strong>
                <p style={{ marginTop: '8px', fontStyle: 'italic', color: 'var(--spiritual-text-muted)' }}>
                    "Ingatlah, hanya dengan mengingat Allah-lah hati menjadi tenteram."
                </p>
            </div>
        </div>
    );
}
