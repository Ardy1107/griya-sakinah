// Header Component - Internet Sakinah
import { Link, useLocation } from 'react-router-dom'
import { Home, Shield, Moon, Sun, Menu } from 'lucide-react'
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
                <Link to={urlPrefix} className="logo">
                    <div className="logo-icon-text">
                        <span className="logo-text-main">
                            INTERNET SAKINAH
                            {isBlockSpecific && (
                                <span style={{
                                    marginLeft: '8px',
                                    padding: '2px 8px',
                                    background: blockId === 'A' ? 'var(--color-primary)' : 'var(--color-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.7em',
                                    fontWeight: 600
                                }}>
                                    {blockName}
                                </span>
                            )}
                        </span>
                    </div>
                </Link>

                <nav className="nav-desktop">
                    <a href="/" className="portal-return-btn">
                        ← Kembali ke Portal Griya Sakinah
                    </a>

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
                    <Link to={urlPrefix} onClick={() => setMobileMenuOpen(false)}>
                        <Home size={16} /> Dashboard {isBlockSpecific && `(${blockName})`}
                    </Link>
                    <Link to={`${urlPrefix}/cek-status`} onClick={() => setMobileMenuOpen(false)}>
                        Cek Status
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
