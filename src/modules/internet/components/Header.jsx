// Header Component - Internet Sakinah
import { Link, useLocation } from 'react-router-dom'
import { Home, Shield, Moon, Sun, Menu, X, Search } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useBlock } from '../context/BlockContext'

export default function Header() {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'
    const location = useLocation()
    const { isAuthenticated, signOut } = useAuth()
    const { blockId, blockName, urlPrefix, isBlockSpecific } = useBlock()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Determine if we're on admin page (considering block-specific paths)
    const isAdmin = location.pathname.includes('/admin')

    return (
        <header className="header">
            <div className="header-content">
                <Link to={urlPrefix} className="logo" aria-label="Internet Sakinah Dashboard">
                    <div className="logo-icon-text">
                        <span className="logo-text-main">
                            INTERNET SAKINAH
                            {isBlockSpecific && (
                                <span className={`header-block-badge badge-${blockId?.toLowerCase() || 'b'}`}>
                                    {blockName}
                                </span>
                            )}
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="nav-desktop">
                    <Link to="/" className="portal-return-btn">
                        ← Kembali ke Portal Griya Sakinah
                    </Link>

                    <Link to={urlPrefix} className={`nav-link ${location.pathname === urlPrefix ? 'active' : ''}`}>
                        <Home size={16} />
                        Dashboard
                    </Link>

                    <Link to={`${urlPrefix}/cek-status`} className={`nav-link ${location.pathname.includes('/cek-status') ? 'active' : ''}`}>
                        Cek Status
                    </Link>

                    {isAuthenticated ? (
                        <>
                            {!isAdmin && (
                                <Link to={`${urlPrefix}/admin`} className="btn btn-primary btn-sm">
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

                {/* Right Action Buttons: Theme Toggle & Hamburger */}
                <div className="header-actions">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="header-action-btn theme-toggle-btn"
                        title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                        aria-label="Mode gelap terang"
                    >
                        {isDark ? <Sun size={19} /> : <Moon size={19} />}
                    </button>

                    {/* Mobile Menu Button (Garis Tiga / Close X) */}
                    <button
                        type="button"
                        className={`header-action-btn mobile-menu-toggle-btn ${mobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        title={mobileMenuOpen ? 'Tutup Menu' : 'Menu Navigasi'}
                        aria-label="Menu navigasi garis tiga"
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <nav className="nav-mobile">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                        ← Portal Griya Sakinah
                    </Link>
                    <Link to={urlPrefix} onClick={() => setMobileMenuOpen(false)} className={location.pathname === urlPrefix ? 'active' : ''}>
                        <Home size={16} /> Dashboard {isBlockSpecific && `(${blockName})`}
                    </Link>
                    <Link to={`${urlPrefix}/cek-status`} onClick={() => setMobileMenuOpen(false)} className={location.pathname.includes('/cek-status') ? 'active' : ''}>
                        <Search size={16} /> Cek Status Pembayaran
                    </Link>
                    {isAuthenticated && !isAdmin && (
                        <Link to={`${urlPrefix}/admin`} onClick={() => setMobileMenuOpen(false)}>
                            <Shield size={16} /> Admin Panel
                        </Link>
                    )}
                </nav>
            )}
        </header>
    )
}
