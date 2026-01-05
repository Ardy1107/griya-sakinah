import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wifi,
    Heart,
    Moon,
    Sun,
    ArrowRight,
    Users,
    Shield,
    Sparkles,
    Phone,
    Mail,
    MapPin,
    ChevronRight,
    Gift,
    Search,
    Home
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => {
        // Check saved theme preference immediately
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'dark'; // Default to dark for premium look
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // Secret access - long press on logo
    // 3 seconds = auto-login as devi (developer)
    // 5 seconds = go to superadmin login
    const pressTimer = useRef(null);
    const [pressProgress, setPressProgress] = useState(0);
    const secretLoginTriggered = useRef(false);

    const handleLogoMouseDown = () => {
        let progress = 0;
        secretLoginTriggered.current = false;
        pressTimer.current = setInterval(() => {
            progress += 2; // 2% every 100ms
            setPressProgress(progress);

            // At 60% (3 seconds) = auto-login as devi developer
            if (progress >= 60 && !secretLoginTriggered.current) {
                secretLoginTriggered.current = true;
                clearInterval(pressTimer.current);
                setPressProgress(0);

                // Set developer session and go to dashboard
                const deviSession = {
                    id: 'dev-devi',
                    username: 'devi',
                    name: 'Developer Devi',
                    role: 'developer',
                    moduleAccess: ['angsuran']
                };
                sessionStorage.setItem('angsuran_user', JSON.stringify(deviSession));
                localStorage.setItem('angsuran_user', JSON.stringify(deviSession));
                navigate('/angsuran/admin/dashboard');
            }

            // At 100% (5 seconds) = superadmin login
            if (progress >= 100) {
                clearInterval(pressTimer.current);
                setPressProgress(0);
                navigate('/superadmin/login');
            }
        }, 100);
    };

    const handleLogoMouseUp = () => {
        if (pressTimer.current) {
            clearInterval(pressTimer.current);
            pressTimer.current = null;
        }
        setPressProgress(0);
    };

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Trigger animations after mount
        setTimeout(() => setIsLoaded(true), 100);

        // Cleanup on unmount
        return () => {
            if (pressTimer.current) clearInterval(pressTimer.current);
        };
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const portalCards = [
        {
            id: 'angsuran',
            title: 'Angsuran Sakinah',
            subtitle: 'Kelola Cicilan Rumah',
            description: 'Pantau status cicilan, riwayat pembayaran, dan reminder jatuh tempo dengan mudah.',
            icon: Home,
            color: 'emerald',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            link: '/angsuran',
            features: ['Status Cicilan', 'Riwayat Bayar', 'Reminder']
        },
        {
            id: 'internet',
            title: 'Internet Sakinah',
            subtitle: 'Layanan Internet Komunitas',
            description: 'Akses internet cepat dan terjangkau untuk warga Griya Sakinah.',
            icon: Wifi,
            color: 'blue',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            link: '/internet',
            features: ['Cek Tagihan', 'Info Paket', 'Riwayat']
        },
        {
            id: 'musholla',
            title: 'Musholla Sakinah',
            subtitle: 'Donasi & Kegiatan',
            description: 'Transparansi keuangan musholla dan informasi kegiatan keagamaan.',
            icon: Heart,
            color: 'purple',
            gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            link: '/musholla',
            features: ['Donasi', 'Laporan', 'Kegiatan']
        },
        {
            id: 'komunitas',
            title: 'Komunitas Sakinah',
            subtitle: 'Fitur Warga',
            description: 'Arisan, jadwal takjil Ramadan, bantuan warga, dan direktori kontak warga.',
            icon: Gift,
            color: 'amber',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            link: '/komunitas',
            features: ['Arisan', 'Takjil', 'Peduli', 'Direktori']
        }
    ];

    const stats = [
        { value: '38+', label: 'Kepala Keluarga', icon: Users },
        { value: '24/7', label: 'Layanan Online', icon: Shield },
        { value: '100%', label: 'Transparansi', icon: Sparkles }
    ];

    return (
        <div className={`landing-page ${isLoaded ? 'loaded' : ''}`}>
            {/* Background Effects */}
            <div className="bg-effects">
                <div className="bg-gradient"></div>
                <div className="bg-grid"></div>
                <div className="bg-glow bg-glow-1"></div>
                <div className="bg-glow bg-glow-2"></div>
                <div className="bg-glow bg-glow-3"></div>
            </div>

            {/* Header */}
            <header className="landing-header">
                <div className="container">
                    <div className="header-content">
                        <div
                            className="logo"
                            onMouseDown={handleLogoMouseDown}
                            onMouseUp={handleLogoMouseUp}
                            onMouseLeave={handleLogoMouseUp}
                            onTouchStart={handleLogoMouseDown}
                            onTouchEnd={handleLogoMouseUp}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            <img
                                src="/logo-griya-sakinah.png"
                                alt="Griya Sakinah"
                                className="logo-image"
                                draggable="false"
                            />
                            {/* Secret progress indicator */}
                            {pressProgress > 0 && (
                                <div
                                    className="secret-progress"
                                    style={{
                                        position: 'absolute',
                                        bottom: -4,
                                        left: 0,
                                        width: `${pressProgress}%`,
                                        height: 3,
                                        background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                                        borderRadius: 2,
                                        transition: 'width 0.1s linear'
                                    }}
                                />
                            )}
                        </div>

                        <nav className="header-nav">
                            <a href="#layanan" className="nav-link">Layanan</a>
                            <a href="#tentang" className="nav-link">Tentang</a>
                            <button
                                className="theme-toggle"
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge animate-slide-down">
                            <Sparkles size={14} />
                            <span>Portal Terintegrasi Warga</span>
                        </div>

                        <div className="hero-title animate-slide-up">
                            <span className="hero-title-line">Selamat Datang di</span>
                            <img
                                src="/logo-griya-sakinah.png"
                                alt="Griya Sakinah"
                                className="hero-logo"
                            />
                        </div>

                        <p className="hero-description animate-slide-up delay-100">
                            Hunian nyaman, komunitas barokah. Akses semua layanan perumahan
                            dalam satu platform terpadu.
                        </p>

                        <div className="hero-cta animate-slide-up delay-200">
                            <a href="#layanan" className="btn btn-primary btn-lg">
                                Jelajahi Layanan
                                <ArrowRight size={20} />
                            </a>
                            <a href="#tentang" className="btn btn-secondary btn-lg">
                                Pelajari Lebih Lanjut
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="hero-stats animate-slide-up delay-300">
                            {stats.map((stat, index) => (
                                <div key={index} className="stat-item">
                                    <stat.icon size={20} className="stat-icon" />
                                    <div className="stat-content">
                                        <span className="stat-value">{stat.value}</span>
                                        <span className="stat-label">{stat.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="layanan" className="services-section">
                <div className="container">
                    <div className="section-header animate-slide-up">
                        <h2 className="section-title">Layanan Kami</h2>
                        <p className="section-subtitle">
                            Pilih layanan yang Anda butuhkan
                        </p>
                    </div>

                    <div className="portal-cards">
                        {portalCards.map((card, index) => (
                            <a
                                key={card.id}
                                href={card.link}
                                className={`portal-card portal-card-${card.color} animate-scale-in delay-${(index + 1) * 100}`}
                            >
                                <div className="card-glow" style={{ background: card.gradient }}></div>

                                <div className="card-header">
                                    <div className="card-icon" style={{ background: card.gradient }}>
                                        <card.icon size={28} />
                                    </div>
                                    <ChevronRight size={24} className="card-arrow" />
                                </div>

                                <div className="card-body">
                                    <span className="card-subtitle">{card.subtitle}</span>
                                    <h3 className="card-title">{card.title}</h3>
                                    <p className="card-description">{card.description}</p>
                                </div>

                                <div className="card-features">
                                    {card.features.map((feature, i) => (
                                        <span key={i} className="feature-tag">{feature}</span>
                                    ))}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="tentang" className="about-section">
                <div className="container">
                    <div className="about-content">
                        <div className="about-text animate-slide-up">
                            <h2 className="section-title">Tentang Portal</h2>
                            <p className="about-description">
                                Portal Griya Sakinah adalah platform digital terpadu yang memudahkan
                                warga dalam mengakses berbagai layanan perumahan. Dari pengelolaan
                                angsuran, internet komunitas, hingga transparansi keuangan musholla.
                            </p>
                            <p className="about-description">
                                Kami berkomitmen untuk menghadirkan kemudahan dan transparansi
                                dalam setiap layanan untuk membangun komunitas yang lebih baik.
                            </p>
                        </div>

                        <div className="about-features animate-slide-up delay-100">
                            <div className="feature-card">
                                <Shield size={24} />
                                <h4>Aman & Terpercaya</h4>
                                <p>Data Anda dilindungi dengan enkripsi tingkat tinggi</p>
                            </div>
                            <div className="feature-card">
                                <Sparkles size={24} />
                                <h4>Mudah Digunakan</h4>
                                <p>Antarmuka yang intuitif dan ramah pengguna</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="kontak" className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-bottom">
                            <p>&copy; 2026 Portal Griya Sakinah. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
