import { useState } from 'react';
import {
    LayoutDashboard,
    Wifi,
    Home,
    Zap,
    LogOut,
    User,
    ChevronRight,
    Search,
    RefreshCw,
    Moon,
    Sun,
    Star
} from 'lucide-react';
import './Portal.css';

const PortalUI = () => {
    const [tasbihValue, setTasbihValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const modules = [
        {
            id: 'web',
            title: 'Sakinah Web',
            sub: 'Estate Management',
            desc: 'Manajemen unit, data warga, dan sistem iuran kebersihan/keamanan.',
            icon: LayoutDashboard,
            color: '#3b82f6',
            class: 'card-web'
        },
        {
            id: 'net',
            title: 'Sakinah Net',
            sub: 'Internet Service',
            desc: 'Monitoring billing internet, manajemen bandwidth, dan ticketing pelanggan.',
            icon: Wifi,
            color: '#10b981',
            class: 'card-net'
        },
        {
            id: 'musholla',
            title: 'Musholla As Sakinah',
            sub: 'Social & Religious',
            desc: 'Laporan keuangan masjid, agenda kegiatan, dan sistem donasi transparan.',
            icon: Home,
            color: '#f59e0b',
            class: 'card-musholla'
        }
    ];

    const dhikrs = [
        {
            arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
            latin: 'Subhanallahi wa bihamdihi',
            meaning: 'Maha Suci Allah dan segala puji bagi-Nya.'
        },
        {
            arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
            latin: 'Astaghfirullah wa atubu ilaih',
            meaning: 'Aku memohon ampun kepada Allah dan bertaubat kepada-Nya.'
        },
        {
            arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
            latin: 'La hawla wala quwwata illa billah',
            meaning: 'Tiada daya dan upaya kecuali dengan kekuatan Allah.'
        }
    ];

    return (
        <div className="portal-wrapper">
            <div className="portal-container">
                {/* Navbar */}
                <nav className="portal-nav">
                    <div className="brand-section">
                        <h1>SAKINAH HUB</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div className="search-bar" style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="Cari layanan..."
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '12px', color: 'white', width: '200px' }}
                            />
                        </div>
                        <div className="user-quick-info">
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Hi, Boss</span>
                            <div className="avatar-mini"><User size={16} color="white" /></div>
                        </div>
                    </div>
                </nav>

                {/* Welcome */}
                <header className="portal-welcome">
                    <h2>Welcome to Sakinah</h2>
                    <p>Command center untuk semua layanan dalam satu genggaman.</p>
                </header>

                {/* Apps Grid */}
                <main className="apps-grid">
                    {modules.map((mod) => (
                        <div key={mod.id} className={`app-card-premium ${mod.class}`}>
                            <div className="app-icon-lrg">
                                <mod.icon size={42} color="white" strokeWidth={1.5} />
                            </div>
                            <div style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.15em', color: mod.color, fontWeight: 800, marginBottom: '0.5rem' }}>
                                {mod.sub}
                            </div>
                            <h3>{mod.title}</h3>
                            <p>{mod.desc}</p>
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                                <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    Masuk <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </main>

                {/* Productivity Section */}
                <section className="tools-section">
                    <div className="section-label">
                        <span className="label-text">Productivity & Spiritual Hub</span>
                        <div className="line"></div>
                    </div>

                    <div className="tools-grid">
                        {/* Tasbih */}
                        <div className="widget-premium">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: 0, fontWeight: 700 }}>Tasbih Digital Premium</h4>
                                <RefreshCw size={18} style={{ color: '#64748b', cursor: 'pointer' }} onClick={() => setTasbihValue(0)} />
                            </div>
                            <div className="tasbih-display">
                                <div className="counter-circle">
                                    <div className="count-num">{tasbihValue}</div>
                                    <div className="count-label">Subhanallah</div>
                                </div>
                                <div className="tasbih-controls">
                                    <button className="btn-premium-count" onClick={() => setTasbihValue(v => v + 1)}>
                                        HITUNG
                                    </button>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                                        Target: 33x Zikir
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dhikr List */}
                        <div className="widget-premium">
                            <h4 style={{ margin: '0 0 1.5rem 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Star size={18} fill="#f59e0b" color="#f59e0b" /> Daily Dhikr
                            </h4>
                            <div className="dhikr-premium-list">
                                {dhikrs.map((d, i) => (
                                    <div key={i} className="dhikr-card-sm">
                                        <div className="arb">{d.arabic}</div>
                                        <div className="mng">{d.latin} - {d.meaning}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <footer style={{ marginTop: '6rem', textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#475569', fontSize: '0.85rem' }}>© 2025 SAKINAH ECOSYSTEM • Version 2.0.0-Beta</p>
                </footer>
            </div>
        </div>
    );
};

export default PortalUI;
