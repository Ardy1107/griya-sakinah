// Header Component - Internet Sakinah
import { Link, useLocation } from 'react-router-dom'
import { Home, Shield, Moon, Sun, Menu } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function Header() {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'
    const location = useLocation()
    const { isAuthenticated, signOut } = useAuth()
    const isAdmin = location.pathname.startsWith('/internet/admin')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/internet" className="logo">
                    <div className="logo-icon-text">
                        <span className="logo-text-main">INTERNET SAKINAH</span>
                    </div>
                </Link>

                <nav className="nav-desktop">
                    <a href="/" className="portal-return-btn">
                        ← Kembali ke Portal Griya Sakinah
                    </a>

                    <Link to="/internet" className={`nav-link ${location.pathname === '/internet' ? 'active' : ''}`}>
                        <Home size={16} />
                        Dashboard
                    </Link>

                    <Link to="/internet/cek-status" className={`nav-link ${location.pathname === '/internet/cek-status' ? 'active' : ''}`}>
                        Cek Status
                    </Link>

                    {isAuthenticated ? (
                        <>
                            {!isAdmin && (
                                <Link to="/internet/admin" className="btn btn-primary btn-sm">
                                    <Shield size={16} />
                                    Admin
                                </Link>
                            )}
                            {isAdmin && (
                                <button onClick={signOut} className="btn btn-secondary btn-sm">
                                    Logout
                                </button>
                            )}
                        </>
                    ) : null}

                </nav>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="btn btn-icon btn-secondary"
                        title={isDark ? 'Mode Siang' : 'Mode Malam'}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        className="btn btn-icon btn-secondary mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <nav className="nav-mobile">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                        Portal Griya Sakinah
                    </Link>
                    <Link to="/internet" onClick={() => setMobileMenuOpen(false)}>
                        <Home size={16} /> Dashboard
                    </Link>
                    <Link to="/internet/cek-status" onClick={() => setMobileMenuOpen(false)}>
                        Cek Status
                    </Link>
                    {isAuthenticated && !isAdmin && (
                        <Link to="/internet/admin" onClick={() => setMobileMenuOpen(false)}>
                            <Shield size={16} /> Admin Panel
                        </Link>
                    )}
                </nav>
            )}
        </header>
    )
}
