import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Sparkles, Target, BookOpen, Moon, CheckSquare,
    Search, Heart, Sun, ArrowLeft, Flame, TrendingUp,
    Clock, RefreshCw, Coins, Gift, Eye, Activity, Play
} from 'lucide-react';

export default function Dashboard() {
    const [greeting, setGreeting] = useState('');
    const [todayDate, setTodayDate] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Selamat Pagi');
        else if (hour < 15) setGreeting('Selamat Siang');
        else if (hour < 18) setGreeting('Selamat Sore');
        else setGreeting('Selamat Malam');

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setTodayDate(new Date().toLocaleDateString('id-ID', options));

        // Update clock every second
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Format time with leading zeros
    const formatTime = (date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');
        return { h, m, s };
    };

    const time = formatTime(currentTime);

    // UTAMA - Program Inti (Abundance, SEFT, Health Scan, Videos)
    const utamaItems = [
        {
            id: 'abundance',
            title: 'Full Abundance (AFZ)',
            description: 'Program 38 hari Financial & Spiritual Abundance',
            icon: Sparkles,
            iconClass: 'abundance',
            link: '/spiritual/abundance',
            stats: '7 Prinsip'
        },
        {
            id: 'seft',
            title: 'SEFT Tracker',
            description: 'Release negatif, Amplify positif dengan 18 titik',
            icon: Target,
            iconClass: 'seft',
            link: '/spiritual/seft',
            stats: '300+ Emosi'
        },
        {
            id: 'health-scan',
            title: 'Multi-Modal Health Scan',
            description: '5 Metode: Iris + Lidah + Kuku + Wajah + Kuesioner',
            icon: Activity,
            iconClass: 'health-scan',
            link: '/spiritual/health-scan',
            stats: '~95% Akurasi'
        },
        {
            id: 'videos',
            title: 'Video Mentoring',
            description: 'Koleksi Video Spiritual Abundance & SEFT',
            icon: Play,
            iconClass: 'videos',
            link: '/spiritual/videos',
            stats: '73+ Video'
        }
    ];

    // IBADAH HARIAN
    const ibadahItems = [
        {
            id: 'shalat',
            title: 'Shalat',
            icon: Clock,
            link: '/spiritual/shalat',
            color: '#6366f1'
        },
        {
            id: 'tilawah',
            title: 'Tilawah',
            icon: BookOpen,
            link: '/spiritual/tilawah',
            color: '#0ea5e9'
        },
        {
            id: 'zikir',
            title: 'Zikir',
            icon: Moon,
            link: '/spiritual/zikir',
            color: '#14b8a6'
        },
        {
            id: 'istighfar',
            title: 'Istighfar',
            icon: RefreshCw,
            link: '/spiritual/istighfar',
            color: '#8b5cf6'
        }
    ];

    // AMALAN SUNNAH
    const amalanItems = [
        {
            id: 'puasa',
            title: 'Puasa',
            icon: Moon,
            link: '/spiritual/puasa',
            color: '#f59e0b'
        },
        {
            id: 'sedekah',
            title: 'Sedekah',
            icon: Coins,
            link: '/spiritual/sedekah',
            color: '#10b981'
        },
        {
            id: 'kebaikan',
            title: 'Kebaikan',
            icon: Heart,
            link: '/spiritual/kebaikan',
            color: '#14b8a6'
        },
        {
            id: 'doa',
            title: 'Doa',
            icon: BookOpen,
            link: '/spiritual/doa',
            color: '#f97316'
        }
    ];

    // REFLEKSI & HATI
    const refleksiItems = [
        {
            id: 'muhasabah',
            title: 'Muhasabah',
            icon: Search,
            link: '/spiritual/muhasabah',
            color: '#a855f7'
        },
        {
            id: 'syukur',
            title: 'Syukur',
            icon: Sun,
            link: '/spiritual/syukur',
            color: '#f59e0b'
        },
        {
            id: 'qalbu',
            title: 'Qalbu Meter',
            icon: Heart,
            link: '/spiritual/syukur/qalbu',
            color: '#ec4899'
        },
        {
            id: 'motivasi',
            title: 'Motivasi',
            icon: Sparkles,
            link: '/spiritual/motivasi',
            color: '#ec4899'
        }
    ];

    return (
        <div className="spiritual-container">
            {/* Back Button */}
            <Link to="/superadmin" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali ke Portal
            </Link>

            {/* Header with Digital Clock */}
            <div className="spiritual-header" style={{ position: 'relative' }}>
                <div>
                    <h1>
                        <Sparkles size={28} />
                        Spiritual Abundance
                    </h1>
                    <p className="subtitle">{greeting}! {todayDate}</p>
                </div>

                {/* Premium Digital Clock */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '10px 16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.15)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: "'SF Mono', 'Monaco', 'Consolas', monospace"
                    }}>
                        <span style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#fff',
                            textShadow: '0 0 20px rgba(139,92,246,0.5)'
                        }}>{time.h}</span>
                        <span style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#a78bfa',
                            animation: 'pulse 1s infinite'
                        }}>:</span>
                        <span style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#fff',
                            textShadow: '0 0 20px rgba(139,92,246,0.5)'
                        }}>{time.m}</span>
                        <span style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#a78bfa',
                            animation: 'pulse 1s infinite'
                        }}>:</span>
                        <span style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: 'rgba(255,255,255,0.7)',
                            minWidth: '28px'
                        }}>{time.s}</span>
                    </div>
                    <div style={{
                        marginLeft: '8px',
                        paddingLeft: '8px',
                        borderLeft: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <Flame size={16} style={{ color: '#f59e0b' }} />
                        <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            marginLeft: '4px'
                        }}>7 hari</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>

            {/* Quick Stats */}
            <div className="spiritual-stats-grid">
                <div className="spiritual-stat-card">
                    <div className="spiritual-stat-value">28</div>
                    <div className="spiritual-stat-label">Sesi SEFT</div>
                </div>
                <div className="spiritual-stat-card">
                    <div className="spiritual-stat-value">85%</div>
                    <div className="spiritual-stat-label">Progress</div>
                </div>
                <div className="spiritual-stat-card">
                    <div className="spiritual-stat-value">77</div>
                    <div className="spiritual-stat-label">Didoakan</div>
                </div>
                <div className="spiritual-stat-card">
                    <div className="spiritual-stat-value">
                        <TrendingUp size={24} />
                    </div>
                    <div className="spiritual-stat-label">Qalbu</div>
                </div>
            </div>

            {/* ========== UTAMA - Program Inti ========== */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                    fontSize: '0.875rem',
                    color: 'var(--spiritual-accent)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    🌟 UTAMA - Program Inti
                </h3>
                <div className="spiritual-menu-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {utamaItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.link}
                            className="spiritual-menu-card spiritual-card"
                        >
                            <div className="spiritual-card-header">
                                <div className={`spiritual-card-icon ${item.iconClass}`}>
                                    <item.icon size={24} />
                                </div>
                                <div>
                                    <div className="spiritual-card-title">{item.title}</div>
                                    <div className="spiritual-card-subtitle">{item.description}</div>
                                </div>
                            </div>
                            <div className="spiritual-progress">
                                <div className="spiritual-progress-bar" style={{ width: '60%' }} />
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                {item.stats}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ========== IBADAH HARIAN ========== */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                    fontSize: '0.875rem',
                    color: 'var(--spiritual-accent)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    🕌 IBADAH HARIAN
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {ibadahItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.link}
                            className="spiritual-card"
                            style={{ textAlign: 'center', padding: '16px 8px', textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 8px'
                            }}>
                                <item.icon size={24} style={{ color: item.color }} />
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{item.title}</div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ========== AMALAN SUNNAH ========== */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                    fontSize: '0.875rem',
                    color: 'var(--spiritual-accent)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    🤲 AMALAN SUNNAH
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {amalanItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.link}
                            className="spiritual-card"
                            style={{ textAlign: 'center', padding: '16px 8px', textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 8px'
                            }}>
                                <item.icon size={24} style={{ color: item.color }} />
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{item.title}</div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ========== REFLEKSI & HATI ========== */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                    fontSize: '0.875rem',
                    color: 'var(--spiritual-accent)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    💝 REFLEKSI & HATI
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {refleksiItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.link}
                            className="spiritual-card"
                            style={{ textAlign: 'center', padding: '16px 8px', textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `linear-gradient(135deg, ${item.color}20, ${item.color}40)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 8px'
                            }}>
                                <item.icon size={24} style={{ color: item.color }} />
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{item.title}</div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Habit Tracker Link */}
            <Link
                to="/spiritual/habit"
                className="spiritual-card"
                style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}
            >
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #22c55e20, #22c55e40)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <CheckSquare size={24} style={{ color: '#22c55e' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>Habit Tracker</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                        Checklist amalan harian lengkap
                    </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>20+ Amalan</div>
            </Link>
        </div>
    );
}

