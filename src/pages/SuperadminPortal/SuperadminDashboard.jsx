import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Home,
    Wifi,
    Heart,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    Shield,
    TrendingUp,
    Activity,
    Gift
} from 'lucide-react';
import { useSuperadmin } from '../../contexts/SuperadminContext';
import './SuperadminPortal.css';

export default function SuperadminDashboard() {
    const { isAuthenticated, user, logout, loading } = useSuperadmin();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/superadmin/login');
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner-lg" />
                <p>Memuat...</p>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        navigate('/superadmin/login');
    };

    const adminCards = [
        {
            id: 'angsuran',
            title: 'Angsuran Admin',
            description: 'Kelola cicilan dan pembayaran warga',
            icon: Home,
            color: 'emerald',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            link: '/angsuran/admin/dashboard',
            stats: '28 Kepala Keluarga'
        },
        {
            id: 'internet',
            title: 'Internet Admin',
            description: 'Kelola iuran dan status internet',
            icon: Wifi,
            color: 'blue',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            link: '/internet/admin',
            stats: 'Dashboard'
        },
        {
            id: 'musholla',
            title: 'Musholla Admin',
            description: 'Kelola donasi dan laporan keuangan',
            icon: Heart,
            color: 'purple',
            gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            link: '/musholla',
            stats: 'Transparansi'
        },
        {
            id: 'komunitas',
            title: 'Komunitas Admin',
            description: 'Kelola arisan, takjil, dan peduli warga',
            icon: Gift,
            color: 'amber',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            link: '/komunitas',
            stats: 'Multi Fitur'
        },
        {
            id: 'warga',
            title: 'Kelola Warga',
            description: 'Manage akses warga per blok',
            icon: Users,
            color: 'cyan',
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            link: '/superadmin/warga',
            stats: 'Access Control'
        }
    ];

    return (
        <div className="superadmin-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="header-logo">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1>Superadmin Portal</h1>
                        <p>Griya Sakinah Management</p>
                    </div>
                </div>
                <div className="header-right">
                    <div className="user-info">
                        <span className="user-name">{user?.username}</span>
                        <span className="user-role">Superadmin</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="quick-stats">
                <div className="stat-card">
                    <div className="stat-icon emerald">
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">5</span>
                        <span className="stat-label">Modul Aktif</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Users size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">28</span>
                        <span className="stat-label">Kepala Keluarga</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Activity size={20} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">24/7</span>
                        <span className="stat-label">Sistem Online</span>
                    </div>
                </div>
            </div>

            {/* Admin Cards */}
            <section className="admin-section">
                <h2>
                    <Settings size={20} />
                    Panel Admin
                </h2>
                <div className="admin-cards">
                    {adminCards.map((card) => (
                        <Link key={card.id} to={card.link} className={`admin-card ${card.color}`}>
                            <div className="card-icon" style={{ background: card.gradient }}>
                                <card.icon size={28} />
                            </div>
                            <div className="card-content">
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                                <span className="card-stats">{card.stats}</span>
                            </div>
                            <ChevronRight size={20} className="card-arrow" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* Back to Portal */}
            <div className="back-section">
                <Link to="/" className="back-link">
                    ← Kembali ke Portal Utama
                </Link>
            </div>
        </div>
    );
}
