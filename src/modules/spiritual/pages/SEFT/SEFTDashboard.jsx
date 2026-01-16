import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Minus, Plus, TrendingUp, Flame, Calendar, X, ChevronRight, BarChart3 } from 'lucide-react';
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
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('all'); // 'release', 'amplify', 'all', 'wound'
    const [selectedWound, setSelectedWound] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Mock sessions data - will be replaced with real data from database
            const sessions = [
                { id: 1, mode: 'release', emosi_nama: 'Cemas', kategori: 'Takut', rating_sebelum: 8, rating_sesudah: 3, tanggal: '2026-01-11' },
                { id: 2, mode: 'amplify', emosi_nama: 'Syukur', kategori: 'Positif', rating_sebelum: 5, rating_sesudah: 9, tanggal: '2026-01-11' },
                { id: 3, mode: 'release', emosi_nama: 'Takut Gagal', kategori: 'Takut', rating_sebelum: 7, rating_sesudah: 2, tanggal: '2026-01-10' },
                { id: 4, mode: 'release', emosi_nama: 'Marah', kategori: 'Marah', rating_sebelum: 9, rating_sesudah: 4, tanggal: '2026-01-10' },
                { id: 5, mode: 'amplify', emosi_nama: 'Percaya Diri', kategori: 'Positif', rating_sebelum: 4, rating_sesudah: 8, tanggal: '2026-01-10' },
                { id: 6, mode: 'release', emosi_nama: 'Sedih', kategori: 'Sedih', rating_sebelum: 8, rating_sesudah: 3, tanggal: '2026-01-09' },
                { id: 7, mode: 'release', emosi_nama: 'Stres Keuangan', kategori: 'Finansial', rating_sebelum: 9, rating_sesudah: 5, tanggal: '2026-01-09' },
                { id: 8, mode: 'amplify', emosi_nama: 'Bahagia', kategori: 'Positif', rating_sebelum: 6, rating_sesudah: 9, tanggal: '2026-01-09' },
                { id: 9, mode: 'release', emosi_nama: 'Rasa Bersalah', kategori: 'Bersalah', rating_sebelum: 7, rating_sesudah: 2, tanggal: '2026-01-08' },
                { id: 10, mode: 'release', emosi_nama: 'Cemas', kategori: 'Takut', rating_sebelum: 8, rating_sesudah: 4, tanggal: '2026-01-08' },
            ];

            setRecentSessions(sessions);

            // Calculate stats from sessions data (synced!)
            const releaseCount = sessions.filter(s => s.mode === 'release').length;
            const amplifyCount = sessions.filter(s => s.mode === 'amplify').length;
            const releaseSessions = sessions.filter(s => s.mode === 'release');
            const avgImprovement = releaseSessions.length > 0
                ? releaseSessions.reduce((acc, s) => acc + (s.rating_sebelum - s.rating_sesudah), 0) / releaseSessions.length
                : 0;

            setStats({
                totalSessions: sessions.length,
                releaseCount,
                amplifyCount,
                avgImprovement: Math.round(avgImprovement * 10) / 10
            });
        } catch (error) {
            console.error('Failed to load SEFT data:', error);
        }
    };

    const openModal = (type, wound = null) => {
        setModalType(type);
        setSelectedWound(wound);
        setShowModal(true);
    };

    // Filter sessions based on modal type
    const filteredSessions = modalType === 'wound' && selectedWound
        ? recentSessions.filter(s => s.emosi_nama === selectedWound)
        : modalType === 'all'
            ? recentSessions
            : recentSessions.filter(s => s.mode === modalType);

    return (
        <div className="spiritual-container" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Premium Healing Background */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 0,
                background: `
                    radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
                    radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.04) 0%, transparent 60%),
                    linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 1) 100%)
                `
            }}>
                {/* Floating healing orbs */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: `${60 + i * 20}px`,
                        height: `${60 + i * 20}px`,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${['rgba(139,92,246,0.15)', 'rgba(59,130,246,0.12)', 'rgba(16,185,129,0.1)',
                            'rgba(239,68,68,0.08)', 'rgba(234,179,8,0.1)', 'rgba(236,72,153,0.08)'][i]
                            } 0%, transparent 70%)`,
                        filter: 'blur(20px)',
                        top: `${[10, 30, 60, 15, 70, 45][i]}%`,
                        left: `${[5, 70, 20, 85, 50, 10][i]}%`,
                        animation: `floatOrb ${8 + i * 2}s ease-in-out infinite`,
                        animationDelay: `${i * 0.5}s`
                    }} />
                ))}
            </div>

            {/* Subtle grid texture */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0.03,
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
            }} />

            {/* CSS animations for floating orbs */}
            <style>{`
                @keyframes floatOrb {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
                    25% { transform: translate(10px, -20px) scale(1.1); opacity: 0.8; }
                    50% { transform: translate(-5px, -10px) scale(0.95); opacity: 0.5; }
                    75% { transform: translate(15px, 5px) scale(1.05); opacity: 0.7; }
                }
            `}</style>

            {/* Main content with z-index */}
            <div style={{ position: 'relative', zIndex: 1 }}>
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

                {/* Stats with Indonesian Labels - CLICKABLE */}
                <div className="spiritual-stats-grid">
                    <div
                        className="spiritual-stat-card"
                        style={{ position: 'relative', cursor: 'pointer' }}
                        onClick={() => openModal('release')}
                    >
                        <div className="spiritual-stat-value" style={{ color: '#ef4444' }}>
                            {stats.releaseCount}
                        </div>
                        <div className="spiritual-stat-label">Sesi Release</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                            Melepas Negatif
                        </div>
                        <ChevronRight size={14} style={{ position: 'absolute', top: '12px', right: '12px', opacity: 0.4 }} />
                    </div>
                    <div
                        className="spiritual-stat-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => openModal('amplify')}
                    >
                        <div className="spiritual-stat-value" style={{ color: '#22c55e' }}>
                            {stats.amplifyCount}
                        </div>
                        <div className="spiritual-stat-label">Sesi Amplify</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                            Perkuat Positif
                        </div>
                        <ChevronRight size={14} style={{ position: 'absolute', top: '12px', right: '12px', opacity: 0.4 }} />
                    </div>
                    <div
                        className="spiritual-stat-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => openModal('all')}
                    >
                        <div className="spiritual-stat-value" style={{ color: '#3b82f6' }}>
                            -{stats.avgImprovement}
                        </div>
                        <div className="spiritual-stat-label">Rata-rata</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                            Penurunan Stres
                        </div>
                    </div>
                    <div
                        className="spiritual-stat-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => openModal('all')}
                    >
                        <div className="spiritual-stat-value">
                            <TrendingUp size={24} style={{ color: '#10b981' }} />
                        </div>
                        <div className="spiritual-stat-label">Progress</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                            Perkembangan
                        </div>
                    </div>
                </div>

                {/* PREMIUM Wounds Infographic */}
                {recentSessions.filter(s => s.mode === 'release').length > 0 && (
                    <div style={{
                        background: 'linear-gradient(145deg, rgba(15,23,42,0.9), rgba(30,41,59,0.95))',
                        borderRadius: '24px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '1px solid rgba(139,92,246,0.3)',
                        boxShadow: '0 8px 32px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Ambient glow effect */}
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-20%',
                            width: '300px',
                            height: '300px',
                            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }} />

                        <h3 style={{
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: '#fff',
                            fontSize: '17px',
                            fontWeight: '700',
                            letterSpacing: '-0.02em'
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 15px rgba(239,68,68,0.4)'
                            }}>
                                <Flame size={18} />
                            </div>
                            Luka Yang Sudah Dilepas
                        </h3>

                        {/* Calculate and render premium chart */}
                        {(() => {
                            const woundCounts = {};
                            const categoryCounts = {};
                            recentSessions
                                .filter(s => s.mode === 'release')
                                .forEach(s => {
                                    const key = s.emosi_nama;
                                    woundCounts[key] = woundCounts[key] || { count: 0, kategori: s.kategori };
                                    woundCounts[key].count++;
                                    categoryCounts[s.kategori] = (categoryCounts[s.kategori] || 0) + 1;
                                });

                            const sorted = Object.entries(woundCounts)
                                .sort((a, b) => b[1].count - a[1].count)
                                .slice(0, 5);

                            const totalReleased = recentSessions.filter(s => s.mode === 'release').length;
                            const maxCount = sorted[0]?.[1]?.count || 1;

                            const categoryColors = {
                                'Takut': { main: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', glow: 'rgba(139,92,246,0.5)' },
                                'Marah': { main: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #f87171)', glow: 'rgba(239,68,68,0.5)' },
                                'Sedih': { main: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', glow: 'rgba(59,130,246,0.5)' },
                                'Bersalah': { main: '#6b7280', gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)', glow: 'rgba(107,114,128,0.5)' },
                                'Finansial': { main: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #4ade80)', glow: 'rgba(34,197,94,0.5)' },
                                'Positif': { main: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)', glow: 'rgba(16,185,129,0.5)' },
                                'Stres': { main: '#eab308', gradient: 'linear-gradient(135deg, #eab308, #facc15)', glow: 'rgba(234,179,8,0.5)' }
                            };

                            // Calculate donut segments
                            const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
                            let currentAngle = 0;
                            const segments = categoryEntries.map(([cat, count]) => {
                                const angle = (count / totalReleased) * 360;
                                const segment = { cat, count, startAngle: currentAngle, endAngle: currentAngle + angle };
                                currentAngle += angle;
                                return segment;
                            });

                            return (
                                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

                                    {/* Donut Chart */}
                                    <div style={{
                                        flex: '0 0 140px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            position: 'relative',
                                            background: `conic-gradient(${segments.map(s => {
                                                const colors = categoryColors[s.cat] || categoryColors['Stres'];
                                                return `${colors.main} ${s.startAngle}deg ${s.endAngle}deg`;
                                            }).join(', ')})`,
                                            boxShadow: '0 0 40px rgba(139,92,246,0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {/* Inner circle for donut effect */}
                                            <div style={{
                                                width: '70px',
                                                height: '70px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                                            }}>
                                                <span style={{
                                                    fontSize: '24px',
                                                    fontWeight: '800',
                                                    color: '#fff',
                                                    lineHeight: 1
                                                }}>{totalReleased}</span>
                                                <span style={{
                                                    fontSize: '9px',
                                                    color: 'rgba(255,255,255,0.5)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>Released</span>
                                            </div>
                                        </div>

                                        {/* Category Pills */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                                            {categoryEntries.slice(0, 4).map(([cat, count]) => {
                                                const colors = categoryColors[cat] || categoryColors['Stres'];
                                                return (
                                                    <div key={cat} style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '20px',
                                                        background: `${colors.main}22`,
                                                        border: `1px solid ${colors.main}44`,
                                                        fontSize: '10px',
                                                        color: colors.main,
                                                        fontWeight: '600'
                                                    }}>
                                                        {cat} ({count})
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Premium Bar Chart */}
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {sorted.map(([name, data], idx) => {
                                                const colors = categoryColors[data.kategori] || categoryColors['Stres'];
                                                const percentage = (data.count / maxCount) * 100;

                                                return (
                                                    <div
                                                        key={idx}
                                                        style={{ position: 'relative', cursor: 'pointer' }}
                                                        onClick={() => openModal('wound', name)}
                                                    >
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            marginBottom: '6px'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '6px',
                                                                    background: colors.gradient,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    color: '#fff',
                                                                    boxShadow: `0 2px 8px ${colors.glow}`
                                                                }}>
                                                                    {idx + 1}
                                                                </div>
                                                                <span style={{
                                                                    color: '#fff',
                                                                    fontWeight: '600',
                                                                    fontSize: '13px'
                                                                }}>{name}</span>
                                                            </div>
                                                            <div style={{
                                                                padding: '2px 10px',
                                                                borderRadius: '12px',
                                                                background: `${colors.main}22`,
                                                                color: colors.main,
                                                                fontSize: '12px',
                                                                fontWeight: '700'
                                                            }}>
                                                                {data.count}x
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            height: '8px',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                            position: 'relative'
                                                        }}>
                                                            <div style={{
                                                                position: 'absolute',
                                                                height: '100%',
                                                                width: `${percentage}%`,
                                                                background: colors.gradient,
                                                                borderRadius: '4px',
                                                                boxShadow: `0 0 15px ${colors.glow}`,
                                                                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                                                            }} />
                                                            {/* Shimmer effect */}
                                                            <div style={{
                                                                position: 'absolute',
                                                                height: '100%',
                                                                width: '50%',
                                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                                                animation: 'shimmer 2s infinite',
                                                                transform: 'translateX(-100%)'
                                                            }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* CSS Animation for shimmer */}
                        <style>{`
                        @keyframes shimmer {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(300%); }
                        }
                    `}</style>
                    </div>
                )}

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

                {/* Recent Sessions - Compact View */}
                <div className="spiritual-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0 }}>Sesi Terakhir</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                            {recentSessions.length} sesi
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {recentSessions.slice(0, 3).map((session) => (
                            <div
                                key={session.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    background: 'var(--spiritual-bg)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--spiritual-border)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: session.mode === 'release'
                                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                        }}
                                    >
                                        {session.mode === 'release' ? <Minus size={14} /> : <Plus size={14} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{session.emosi_nama}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>
                                            {session.tanggal}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.8rem'
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
                    {recentSessions.length > 3 && (
                        <button
                            onClick={() => {
                                setModalType('release');
                                setShowModal(true);
                            }}
                            style={{
                                width: '100%',
                                marginTop: '12px',
                                padding: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'var(--spiritual-text-muted)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            Lihat Semua ({recentSessions.length} sesi)
                        </button>
                    )}
                </div>

                {/* Detail Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }} onClick={() => setShowModal(false)}>
                        <div style={{
                            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                            borderRadius: '20px',
                            padding: '24px',
                            maxWidth: '500px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {modalType === 'release' && <><Minus size={20} style={{ color: '#ef4444' }} /> Riwayat Release</>}
                                    {modalType === 'amplify' && <><Plus size={20} style={{ color: '#22c55e' }} /> Riwayat Amplify</>}
                                    {modalType === 'all' && <><TrendingUp size={20} style={{ color: '#3b82f6' }} /> Semua Riwayat</>}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#fff'
                                    }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                                Total: {filteredSessions.length} sesi
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {filteredSessions.map(session => (
                                    <div key={session.id} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        padding: '14px',
                                        borderLeft: `3px solid ${session.mode === 'release' ? '#ef4444' : '#22c55e'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                    {session.emosi_nama}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                                                    {session.kategori} • {session.tanggal}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                                                    <span style={{ color: session.mode === 'release' ? '#ef4444' : '#fbbf24' }}>
                                                        {session.rating_sebelum}
                                                    </span>
                                                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>→</span>
                                                    <span style={{ color: '#22c55e' }}>
                                                        {session.rating_sesudah}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: session.mode === 'release' ? '#22c55e' : '#3b82f6'
                                                }}>
                                                    {session.mode === 'release'
                                                        ? `↓ ${session.rating_sebelum - session.rating_sesudah}`
                                                        : `↑ ${session.rating_sesudah - session.rating_sebelum}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredSessions.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)' }}>
                                    Belum ada riwayat sesi
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
