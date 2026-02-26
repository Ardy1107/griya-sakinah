import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Home,
    LayoutDashboard,
    Building2,
    CreditCard,
    FileText,
    LogOut,
    Menu,
    X,
    User,
    ChevronDown,
    Settings,
    Activity,
    Wallet,
    Sun,
    Moon,
    Info,
    Map
} from 'lucide-react';
import './Layout.css';

const Layout = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true; // Default dark
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const handleLogout = () => {
        logout();
        navigate('/angsuran/admin/login');
    };

    // NavTooltip component with fixed positioning
    const NavTooltip = ({ text }) => {
        const [isVisible, setIsVisible] = useState(false);
        const [position, setPosition] = useState({ top: 0, left: 0 });
        const triggerRef = useRef(null);

        const handleMouseEnter = () => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setPosition({
                    top: rect.top + rect.height / 2,
                    left: rect.right + 12
                });
            }
            setIsVisible(true);
        };

        return (
            <span
                ref={triggerRef}
                className="nav-tooltip-trigger"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsVisible(false)}
            >
                <Info size={14} />
                {isVisible && (
                    <div
                        className="nav-tooltip-popup"
                        style={{
                            position: 'fixed',
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                            transform: 'translateY(-50%)',
                            zIndex: 99999
                        }}
                    >
                        {text}
                    </div>
                )}
            </span>
        );
    };

    const menuItems = [
        {
            path: '/angsuran/admin/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
            tooltip: 'Lihat ringkasan pemasukan, pengeluaran, dan statistik bulanan',
            roles: ['admin', 'developer', 'superadmin']
        },
        {
            path: '/angsuran/admin/monitoring',
            icon: Activity,
            label: 'Monitoring',
            tooltip: 'Pantau status pembayaran setiap unit rumah',
            roles: ['admin', 'developer', 'superadmin']
        },
        {
            path: '/angsuran/admin/map',
            icon: Map,
            label: 'Peta Blok',
            tooltip: 'Visualisasi status pembayaran per blok rumah',
            roles: ['admin', 'developer', 'superadmin']
        },
        {
            path: '/angsuran/admin/history',
            icon: CreditCard,
            label: 'Riwayat Transaksi',
            tooltip: 'Lihat detail semua pembayaran yang sudah masuk',
            roles: ['admin', 'developer', 'superadmin']
        },
        {
            path: '/angsuran/admin/units',
            icon: Building2,
            label: 'Data Unit',
            tooltip: 'Kelola data penghuni dan unit rumah',
            roles: ['admin', 'developer', 'superadmin']
        },
        {
            path: '/angsuran/admin/payments',
            icon: CreditCard,
            label: 'Pembayaran',
            tooltip: 'Input dan kelola pembayaran dari penghuni',
            roles: ['admin', 'superadmin']
        },
        {
            path: '/angsuran/admin/expenses',
            icon: Wallet,
            label: 'Pengeluaran',
            tooltip: 'Lihat dan kelola pengeluaran dana',
            roles: ['admin', 'developer', 'superadmin']
        },
        {
            path: '/angsuran/admin/reports',
            icon: FileText,
            label: 'Laporan',
            tooltip: 'Buat dan unduh laporan keuangan',
            roles: ['admin', 'superadmin']
        },
        {
            path: '/angsuran/admin/audit',
            icon: FileText,
            label: 'Audit Log',
            tooltip: 'Riwayat aktivitas sistem',
            roles: ['admin', 'superadmin']
        },
        {
            path: '/angsuran/admin/settings',
            icon: Settings,
            label: 'Pengaturan',
            tooltip: 'Atur backup data dan preferensi sistem',
            roles: ['admin', 'superadmin']
        },
    ];

    const filteredMenu = menuItems.filter(item =>
        item.roles.includes(user?.role)
    );

    return (
        <div className="layout">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <Home size={24} />
                        {sidebarOpen && <span>Griya Sakinah</span>}
                    </div>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {filteredMenu.map(item => (
                        <NavLink
                            key={item.path + item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={() => {
                                // Auto close sidebar on mobile after navigation
                                if (window.innerWidth <= 768) {
                                    setSidebarOpen(false);
                                }
                            }}
                        >
                            <item.icon size={20} />
                            {sidebarOpen && (
                                <>
                                    <span>{item.label}</span>
                                    <NavTooltip text={item.tooltip} />
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {user?.role === 'superadmin' && (
                        <Link to="/admin/dashboard" className="admin-portal-button">
                            <Home size={20} />
                            {sidebarOpen && <span>Admin Portal</span>}
                        </Link>
                    )}
                    <Link to="/" className="portal-back-button">
                        <Home size={20} />
                        {sidebarOpen && <span>Kembali ke Portal</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`main-wrapper ${sidebarOpen ? '' : 'expanded'}`}>
                {/* Header */}
                <header className="header">
                    <div className="header-left">
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="header-right">
                        <button
                            className="theme-toggle"
                            onClick={() => setDarkMode(!darkMode)}
                            title={darkMode ? 'Mode Siang' : 'Mode Malam'}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="user-menu">
                            <button
                                className="user-button"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="user-avatar">
                                    <User size={18} />
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user?.name}</span>
                                    <span className="user-role">
                                        {user?.role === 'admin' ? 'Administrator' : user?.role === 'developer' ? 'Developer' : user?.role === 'superadmin' ? 'Super Admin' : 'User'}
                                    </span>
                                </div>
                                <ChevronDown size={16} className={userMenuOpen ? 'rotated' : ''} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
