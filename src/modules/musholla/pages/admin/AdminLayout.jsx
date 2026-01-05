import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Heart,
    Banknote,
    Image as ImageIcon,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ExternalLink,
    User,
    Sun,
    Moon
} from 'lucide-react';
import { getCurrentUser, signOut } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/ui';

// Theme Context
export const ThemeContext = createContext({
    darkMode: true,
    setDarkMode: () => { },
    colors: {}
});

export function useTheme() {
    return useContext(ThemeContext);
}

const NAV_ITEMS = [
    { path: '/musholla/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/musholla/admin/donasi', icon: Heart, label: 'Donasi' },
    { path: '/musholla/admin/pengeluaran', icon: Banknote, label: 'Pengeluaran' },
    { path: '/musholla/admin/galeri', icon: ImageIcon, label: 'Galeri Progres' },
    { path: '/musholla/admin/laporan', icon: FileText, label: 'Laporan & Export' }
];

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Theme state
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        // 1. Check Global Admin Portal Session
        const adminSession = localStorage.getItem('griya_admin_session');
        if (adminSession) {
            try {
                const admin = JSON.parse(adminSession);
                // Allow if role is super_admin or admin_musholla
                if (admin.role === 'super_admin' || admin.role === 'admin_musholla') {
                    setUser({
                        id: admin.id,
                        email: admin.email,
                        ...admin
                    });
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.error('Invalid admin session', e);
            }
        }

        // 2. Fallback to Module Supabase Auth
        const { data } = await getCurrentUser();
        if (!data) {
            // Redirect to appropriate login based on context
            if (location.pathname.includes('/musholla/admin')) {
                // If trying to access via direct link without auth, go to module login
                // But if we want unified experience, maybe redirect to main admin login?
                // For now, keep module login as fallback
                navigate('/musholla/login');
            } else {
                navigate('/musholla/login');
            }
        } else {
            setUser(data);
        }
        setLoading(false);
    }

    async function handleLogout() {
        // Clear global session if exists
        localStorage.removeItem('griya_admin_session');

        // Clear Supabase session
        await signOut();

        // Redirect to main admin login if was global admin, else module login
        navigate('/admin/dashboard');
    }

    function isActive(item) {
        if (item.exact) {
            return location.pathname === item.path;
        }
        return location.pathname.startsWith(item.path);
    }

    // Theme-aware colors
    const colors = {
        text: darkMode ? '#ffffff' : '#1f2937',
        textSecondary: darkMode ? 'rgba(255,255,255,0.8)' : '#374151',
        textMuted: darkMode ? 'rgba(255,255,255,0.5)' : '#6b7280',
        cardBg: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)',
        cardBorder: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        sidebarBg: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.95)',
        mainBg: darkMode
            ? 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #064E3B 100%)'
            : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #ecfdf5 100%)',
        greenText: darkMode ? '#34D399' : '#059669',
        greenBg: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
        roseText: darkMode ? '#FB7185' : '#E11D48',
        blueText: darkMode ? '#60A5FA' : '#2563EB',
        goldText: darkMode ? '#FCD34D' : '#D97706'
    };

    if (loading) {
        return (
            <div
                className="flex items-center justify-center"
                style={{
                    minHeight: '100vh',
                    background: colors.mainBg
                }}
            >
                <LoadingSpinner size={48} />
            </div>
        );
    }

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode, colors }}>
            <div style={{
                display: 'flex',
                minHeight: '100vh',
                background: colors.mainBg,
                transition: 'background 0.5s ease'
            }}>
                {/* Sidebar */}
                <aside
                    style={{
                        width: '280px',
                        background: colors.sidebarBg,
                        backdropFilter: 'blur(20px)',
                        borderRight: `1px solid ${colors.cardBorder}`,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 50,
                        transition: 'transform 0.3s ease, background 0.3s ease'
                    }}
                    className="sidebar-desktop"
                >
                    {/* Logo */}
                    <div style={{
                        padding: '24px 20px',
                        borderBottom: `1px solid ${colors.cardBorder}`
                    }}>
                        <Link
                            to="/musholla/admin"
                            className="flex items-center gap-md"
                            style={{ textDecoration: 'none' }}
                        >
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                            }}>
                                <span style={{ fontSize: '24px' }}>🕌</span>
                            </div>
                            <div>
                                <h2 style={{
                                    fontWeight: 800,
                                    fontSize: '16px',
                                    color: colors.text,
                                    lineHeight: 1.2
                                }}>
                                    Musholla
                                </h2>
                                <p style={{ fontSize: '12px', color: colors.textMuted }}>
                                    As-Sakinah Admin
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* User Info + Theme Toggle */}
                    {user && (
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: `1px solid ${colors.cardBorder}`,
                            background: colors.greenBg
                        }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-md">
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <User size={20} style={{ color: colors.textSecondary }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            color: colors.text,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {user.email?.split('@')[0] || 'Admin'}
                                        </p>
                                        <p style={{ fontSize: '12px', color: colors.textMuted }}>
                                            Administrator
                                        </p>
                                    </div>
                                </div>

                                {/* Theme Toggle Button */}
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        border: 'none',
                                        background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                        color: darkMode ? '#FCD34D' : '#065F46',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s'
                                    }}
                                    title={darkMode ? 'Mode Siang' : 'Mode Malam'}
                                >
                                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {NAV_ITEMS.map(item => {
                                const Icon = item.icon;
                                const active = isActive(item);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-md"
                                        style={{
                                            padding: '14px 16px',
                                            borderRadius: '12px',
                                            textDecoration: 'none',
                                            background: active
                                                ? (darkMode
                                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.1))'
                                                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))')
                                                : 'transparent',
                                            border: active
                                                ? `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)'}`
                                                : '1px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            background: active
                                                ? 'linear-gradient(135deg, #059669, #10B981)'
                                                : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: active ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                                            transition: 'all 0.2s'
                                        }}>
                                            <Icon size={18} color={active ? 'white' : colors.textMuted} />
                                        </div>
                                        <span style={{
                                            flex: 1,
                                            fontWeight: active ? 700 : 500,
                                            fontSize: '14px',
                                            color: active ? colors.greenText : colors.textSecondary
                                        }}>
                                            {item.label}
                                        </span>
                                        {active && (
                                            <ChevronRight size={16} style={{ color: colors.greenText }} />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Footer Actions */}
                    <div style={{
                        padding: '16px 12px',
                        borderTop: `1px solid ${colors.cardBorder}`
                    }}>
                        <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-md"
                            style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
                                border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.4)'}`,
                                marginBottom: '8px',
                                color: colors.blueText,
                                fontSize: '14px',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            <LayoutDashboard size={18} />
                            <span>Admin Portal</span>
                        </Link>

                        <Link
                            to="/musholla"
                            target="_blank"
                            className="flex items-center gap-md"
                            style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                marginBottom: '8px',
                                color: colors.textSecondary,
                                fontSize: '14px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <ExternalLink size={18} />
                            <span>Lihat Halaman Publik</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-md"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: darkMode ? 'rgba(225, 29, 72, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                                border: `1px solid ${darkMode ? 'rgba(225, 29, 72, 0.2)' : 'rgba(225, 29, 72, 0.3)'}`,
                                color: colors.roseText,
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LogOut size={18} />
                            <span>Keluar</span>
                        </button>
                    </div>
                </aside>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="mobile-menu-btn"
                    style={{
                        position: 'fixed',
                        top: '16px',
                        left: '16px',
                        zIndex: 60,
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${colors.cardBorder}`,
                        color: colors.text,
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Overlay */}
                {mobileMenuOpen && (
                    <div
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 40,
                            display: 'none'
                        }}
                        className="mobile-overlay"
                    />
                )}

                {/* Main Content */}
                <main style={{
                    flex: 1,
                    marginLeft: '280px',
                    padding: '24px',
                    minHeight: '100vh'
                }}>
                    <Outlet context={{ darkMode, colors }} />
                </main>

                {/* Responsive Styles */}
                <style>{`
                    @media (max-width: 1024px) {
                        .sidebar-desktop {
                            transform: ${mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'};
                        }
                        .mobile-menu-btn {
                            display: flex !important;
                        }
                        .mobile-overlay {
                            display: ${mobileMenuOpen ? 'block' : 'none'} !important;
                        }
                        main {
                            margin-left: 0 !important;
                            padding-top: 80px !important;
                        }
                    }
                `}</style>
            </div>
        </ThemeContext.Provider>
    );
}
