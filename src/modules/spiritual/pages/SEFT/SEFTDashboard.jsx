import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Minus, Plus, TrendingUp, Flame, Calendar } from 'lucide-react';
import { getSeftStats, getSeftSessions } from '../../services/spiritualService';

// Program Selection Component
function ProgramSelection() {
    const [selected, setSelected] = useState(() => {
        return localStorage.getItem('seft_program') || '14';
    });

    const handleSelect = (days) => {
        setSelected(days);
        localStorage.setItem('seft_program', days);
    };

    const programs = [
        { days: '7', label: '7 Hari', desc: 'Quick Start' },
        { days: '14', label: '14 Hari', desc: 'Recommended' },
        { days: '30', label: '30 Hari', desc: 'Deep Healing' }
    ];

    return (
        <div style={{
            background: 'linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <h3 style={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600'
            }}>
                <Calendar size={20} style={{ color: '#f59e0b' }} />
                Pilih Program SEFT
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {programs.map(({ days, label, desc }) => (
                    <button
                        key={days}
                        onClick={() => handleSelect(days)}
                        style={{
                            padding: '16px 12px',
                            background: selected === days
                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                : 'rgba(255,255,255,0.05)',
                            border: selected === days
                                ? '2px solid #10b981'
                                : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#fff',
                            marginBottom: '4px'
                        }}>
                            {label}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: selected === days ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'
                        }}>
                            {desc}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function SEFTDashboard() {
    const [stats, setStats] = useState({
        totalSessions: 0,
        releaseCount: 0,
        amplifyCount: 0,
        avgImprovement: 0
    });
    const [recentSessions, setRecentSessions] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // For now, use mock data until auth is set up
            setStats({
                totalSessions: 28,
                releaseCount: 18,
                amplifyCount: 10,
                avgImprovement: 4.2
            });

            setRecentSessions([
                { id: 1, mode: 'release', emosi_nama: 'Cemas', rating_sebelum: 8, rating_sesudah: 3, tanggal: '2026-01-11' },
                { id: 2, mode: 'amplify', emosi_nama: 'Syukur', rating_sebelum: 5, rating_sesudah: 9, tanggal: '2026-01-11' },
                { id: 3, mode: 'release', emosi_nama: 'Takut', rating_sebelum: 7, rating_sesudah: 2, tanggal: '2026-01-10' },
            ]);
        } catch (error) {
            console.error('Failed to load SEFT data:', error);
        }
    };

    return (
        <div className="spiritual-container">
            {/* Back Button */}
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali ke Dashboard
            </Link>

            {/* Header with Explanation */}
            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <div>
                    <h1>
                        <Target size={28} />
                        SEFT Tracker
                    </h1>
                    <p className="subtitle">Teknik Terapi Emosi dengan Ketukan pada 18 Titik Meridian</p>
                </div>
                <div className="spiritual-streak">
                    <Flame size={18} />
                    <span>{stats.totalSessions} sesi</span>
                </div>
            </div>

            {/* Info Box */}
            <div style={{
                background: 'linear-gradient(145deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid rgba(239,68,68,0.2)'
            }}>
                <p style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: '1.6',
                    margin: 0
                }}>
                    💡 <strong>Apa itu SEFT?</strong><br />
                    SEFT (Spiritual Emotional Freedom Technique) adalah teknik terapi untuk menghilangkan
                    emosi negatif dan memperkuat emosi positif dengan ketukan pada titik-titik meridian tubuh
                    sambil mengucapkan doa/afirmasi.
                </p>
            </div>

            {/* Stats with Indonesian Labels */}
            <div className="spiritual-stats-grid">
                <div className="spiritual-stat-card" style={{ position: 'relative' }}>
                    <div className="spiritual-stat-value" style={{ color: '#ef4444' }}>
                        {stats.releaseCount}
                    </div>
                    <div className="spiritual-stat-label">Sesi Release</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                        Melepas Negatif
                    </div>
                </div>
                <div className="spiritual-stat-card">
                    <div className="spiritual-stat-value" style={{ color: '#22c55e' }}>
                        {stats.amplifyCount}
                    </div>
                    <div className="spiritual-stat-label">Sesi Amplify</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                        Perkuat Positif
                    </div>
                </div>
                <div className="spiritual-stat-card">
                    <div className="spiritual-stat-value" style={{ color: '#3b82f6' }}>
                        -{stats.avgImprovement}
                    </div>
                    <div className="spiritual-stat-label">Rata-rata</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                        Penurunan Stres
                    </div>
                </div>
                <div className="spiritual-stat-card">
                    <div className="spiritual-stat-value">
                        <TrendingUp size={24} style={{ color: '#10b981' }} />
                    </div>
                    <div className="spiritual-stat-label">Progress</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                        Perkembangan
                    </div>
                </div>
            </div>

            {/* Action Buttons with Description */}
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                <Link
                    to="/spiritual/seft/release"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderRadius: '16px',
                        color: '#fff',
                        textDecoration: 'none',
                        boxShadow: '0 4px 20px rgba(239,68,68,0.3)'
                    }}
                >
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <Minus size={22} />
                            <span style={{ fontSize: '18px', fontWeight: '700' }}>SEFT Release</span>
                        </div>
                        <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                            Lepaskan emosi negatif: marah, takut, sedih, trauma
                        </p>
                    </div>
                    <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                </Link>

                <Link
                    to="/spiritual/seft/amplify"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        borderRadius: '16px',
                        color: '#fff',
                        textDecoration: 'none',
                        boxShadow: '0 4px 20px rgba(34,197,94,0.3)'
                    }}
                >
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <Plus size={22} />
                            <span style={{ fontSize: '18px', fontWeight: '700' }}>SEFT Amplify</span>
                        </div>
                        <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                            Perkuat emosi positif: syukur, percaya diri, bahagia
                        </p>
                    </div>
                    <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                </Link>
            </div>

            {/* SEFT Proxy Section - For Others */}
            <div style={{
                background: 'linear-gradient(145deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid rgba(139,92,246,0.2)'
            }}>
                <h4 style={{
                    color: '#fff',
                    fontSize: '15px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    👥 SEFT untuk Orang Lain (Proxy)
                </h4>
                <p style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '14px',
                    lineHeight: '1.5'
                }}>
                    Lakukan SEFT untuk orang tersayang yang tidak bisa melakukan sendiri
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Link
                        to="/spiritual/seft/proxy"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            borderRadius: '12px',
                            color: '#fff',
                            textDecoration: 'none',
                            textAlign: 'center'
                        }}
                    >
                        <span style={{ fontSize: '24px', marginBottom: '6px' }}>🧑‍🤝‍🧑</span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Dewasa</span>
                        <span style={{ fontSize: '10px', opacity: 0.8 }}>Pasangan, Orang Tua, dll</span>
                    </Link>
                    <Link
                        to="/spiritual/seft/proxy-child"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                            borderRadius: '12px',
                            color: '#fff',
                            textDecoration: 'none',
                            textAlign: 'center'
                        }}
                    >
                        <span style={{ fontSize: '24px', marginBottom: '6px' }}>👶</span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Anak & Bayi</span>
                        <span style={{ fontSize: '10px', opacity: 0.8 }}>Balita, Anak-anak</span>
                    </Link>
                </div>
            </div>

            {/* Program Selection */}
            <ProgramSelection />

            {/* Recent Sessions */}
            <div className="spiritual-card">
                <h3 style={{ marginBottom: '16px' }}>Sesi Terakhir</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recentSessions.map((session) => (
                        <div
                            key={session.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'var(--spiritual-bg)',
                                borderRadius: '8px',
                                border: '1px solid var(--spiritual-border)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: session.mode === 'release'
                                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                            : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                    }}
                                >
                                    {session.mode === 'release' ? <Minus size={18} /> : <Plus size={18} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{session.emosi_nama}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                        {session.tanggal}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.875rem'
                            }}>
                                <span style={{ color: '#ef4444' }}>{session.rating_sebelum}</span>
                                <span>→</span>
                                <span style={{ color: '#22c55e' }}>{session.rating_sesudah}</span>
                                <span style={{
                                    color: session.mode === 'release' ? '#22c55e' : '#3b82f6',
                                    fontWeight: '600'
                                }}>
                                    ({session.mode === 'release'
                                        ? `-${session.rating_sebelum - session.rating_sesudah}`
                                        : `+${session.rating_sesudah - session.rating_sebelum}`})
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
