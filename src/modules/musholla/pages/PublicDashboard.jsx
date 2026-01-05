import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Users,
    Search,
    CheckCircle,
    XCircle,
    Target,
    Clock,
    Award,
    ChevronRight,
    Heart,
    Banknote,
    Eye,
    Sun,
    Moon,
    Home
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge, EmptyState, LoadingSpinner, RankBadge, Modal } from '../components/ui';
import { formatRupiah, formatDate, calculatePercentage } from '../lib/utils';
import { getDashboardStats, getTopDonors, getDonationByReference, getDonations, getConstructionCosts } from '../lib/supabase';

export default function PublicDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalTerkumpul: 0,
        totalTerpakai: 0,
        saldo: 0,
        targetDonasi: 500000000,
        totalDonatur: 0
    });
    const [topDonors, setTopDonors] = useState([]);
    const [recentDonations, setRecentDonations] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Theme
    const [darkMode, setDarkMode] = useState(true);

    // Secret admin access
    const [clickCount, setClickCount] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);

    // Search
    const [searchRef, setSearchRef] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [searching, setSearching] = useState(false);

    // Detail Modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailType, setDetailType] = useState('donations');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [statsData, topDonorsData, donationsData, expensesData] = await Promise.all([
                getDashboardStats(),
                getTopDonors(5),
                getDonations(),
                getConstructionCosts()
            ]);

            setStats(statsData);
            setTopDonors(topDonorsData.data || []);
            setRecentDonations((donationsData.data || []).slice(0, 10));
            setRecentExpenses((expensesData.data || []).slice(0, 10));
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    // Secret admin login - triple click on icon
    function handleIconClick() {
        const now = Date.now();
        if (now - lastClickTime < 500) {
            const newCount = clickCount + 1;
            setClickCount(newCount);
            if (newCount >= 3) {
                navigate('/musholla/login');
                setClickCount(0);
            }
        } else {
            setClickCount(1);
        }
        setLastClickTime(now);
    }

    async function handleSearch(e) {
        e.preventDefault();
        if (!searchRef.trim()) return;

        setSearching(true);
        setSearchError('');
        setSearchResult(null);

        try {
            const { data, error } = await getDonationByReference(searchRef.trim().toUpperCase());
            if (error || !data) {
                setSearchError('Kwitansi tidak ditemukan');
            } else {
                setSearchResult(data);
            }
        } catch (error) {
            setSearchError('Terjadi kesalahan');
        } finally {
            setSearching(false);
        }
    }

    function showDetails(type) {
        setDetailType(type);
        setShowDetailModal(true);
    }

    const kurang = stats.targetDonasi - stats.totalTerkumpul;
    const progressPercent = calculatePercentage(stats.totalTerkumpul, stats.targetDonasi);

    // Theme-aware colors - iOS Premium Dark/Light
    const colors = {
        text: darkMode ? '#f9fafb' : '#1f2937',
        textSecondary: darkMode ? '#e5e7eb' : '#374151',
        textMuted: darkMode ? '#9ca3af' : '#6b7280',
        cardBg: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255,255,255,0.95)',
        cardBorder: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        greenText: darkMode ? '#10b981' : '#059669',
        greenBg: darkMode ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
        roseText: darkMode ? '#FB7185' : '#E11D48',
        roseBg: darkMode ? 'rgba(225, 29, 72, 0.12)' : 'rgba(225, 29, 72, 0.08)',
        blueText: darkMode ? '#60A5FA' : '#2563EB',
        blueBg: darkMode ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)',
        goldText: darkMode ? '#FBBF24' : '#D97706'
    };

    // Premium stat card style - iOS Dark Slate
    const statCardStyle = (variant) => {
        const variants = {
            emerald: { bg: colors.greenBg, border: colors.greenText, text: colors.greenText, iconBg: 'linear-gradient(135deg, #10b981, #34d399)' },
            rose: { bg: colors.roseBg, border: colors.roseText, text: colors.roseText, iconBg: 'linear-gradient(135deg, #E11D48, #FB7185)' },
            blue: { bg: colors.blueBg, border: colors.blueText, text: colors.blueText, iconBg: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }
        };
        const v = variants[variant] || variants.emerald;
        return {
            padding: '24px',
            borderRadius: '20px',
            background: darkMode
                ? `linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(30, 41, 59, 0.6))`
                : '#ffffff',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            iconBg: v.iconBg,
            textColor: v.text
        };
    };

    // Premium card style
    const cardStyle = {
        background: colors.cardBg,
        borderRadius: '20px',
        border: `1px solid ${colors.cardBorder}`,
        padding: '24px',
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(10px)'
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                padding: '24px',
                background: darkMode
                    ? 'linear-gradient(135deg, #0a0f1a 0%, #111827 25%, #1f2937 50%, #111827 75%, #0a0f1a 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)',
                transition: 'background 0.5s ease'
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* Header */}
                <header className="flex justify-between items-center" style={{ marginBottom: '40px' }}>
                    <div className="flex items-center gap-lg">
                        <div
                            onClick={handleIconClick}
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: 20,
                                background: 'linear-gradient(135deg, #10b981, #34d399)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            title="Klik 3x untuk akses admin"
                        >
                            <span style={{ fontSize: '32px' }}>🕌</span>
                        </div>
                        <div>
                            <h1 style={{
                                fontSize: '2.25rem',
                                fontWeight: 900,
                                color: colors.text,
                                textShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
                            }}>
                                Musholla As-Sakinah
                            </h1>
                            <p style={{
                                color: colors.textSecondary,
                                fontSize: '16px',
                                fontWeight: 500
                            }}>
                                Portal Transparansi Donasi Pembangunan
                            </p>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-md">
                        {/* Portal Link */}
                        <Link
                            to="/"
                            className="portal-return-btn"
                            style={{
                                height: 48,
                                padding: '0 20px',
                                borderRadius: 14,
                                background: darkMode
                                    ? 'linear-gradient(135deg, rgba(30, 58, 95, 0.9), rgba(15, 23, 42, 0.95))'
                                    : 'linear-gradient(135deg, rgba(241, 245, 249, 0.95), rgba(226, 232, 240, 0.9))',
                                border: darkMode ? '1px solid rgba(100, 116, 139, 0.3)' : '1px solid rgba(148, 163, 184, 0.4)',
                                color: darkMode ? '#e2e8f0' : '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 0.25s'
                            }}
                        >
                            ← Kembali ke Portal Griya Sakinah
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            style={{
                                width: 48,
                                height: 48,
                                padding: 0,
                                borderRadius: 14,
                                border: 'none',
                                background: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                                color: darkMode ? '#FCD34D' : '#065F46',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s'
                            }}
                            title={darkMode ? 'Mode Siang' : 'Mode Malam'}
                        >
                            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
                        </button>
                    </div>
                </header>

                {/* Stat Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    {/* Total Terkumpul */}
                    <div
                        onClick={() => showDetails('donations')}
                        style={statCardStyle('emerald')}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: statCardStyle('emerald').iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                        }}>
                            <TrendingUp size={24} color="white" />
                        </div>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: colors.textMuted,
                            marginBottom: '8px'
                        }}>Total Terkumpul</p>
                        <p style={{
                            fontSize: '2rem',
                            fontWeight: 900,
                            color: colors.greenText
                        }}>{formatRupiah(stats.totalTerkumpul)}</p>
                        <p style={{
                            fontSize: '13px',
                            color: colors.greenText,
                            opacity: 0.8,
                            marginTop: '8px'
                        }}>⊕ Klik untuk detail →</p>
                    </div>

                    {/* Total Terpakai */}
                    <div
                        onClick={() => showDetails('expenses')}
                        style={statCardStyle('rose')}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: statCardStyle('rose').iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)'
                        }}>
                            <TrendingDown size={24} color="white" />
                        </div>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: colors.textMuted,
                            marginBottom: '8px'
                        }}>Total Terpakai</p>
                        <p style={{
                            fontSize: '2rem',
                            fontWeight: 900,
                            color: colors.roseText
                        }}>{formatRupiah(stats.totalTerpakai)}</p>
                        <p style={{
                            fontSize: '13px',
                            color: colors.roseText,
                            opacity: 0.8,
                            marginTop: '8px'
                        }}>⊕ Klik untuk detail →</p>
                    </div>

                    {/* Saldo */}
                    <div style={statCardStyle('blue')}>
                        <div style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: statCardStyle('blue').iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                        }}>
                            <Wallet size={24} color="white" />
                        </div>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: colors.textMuted,
                            marginBottom: '8px'
                        }}>Saldo Saat Ini</p>
                        <p style={{
                            fontSize: '2rem',
                            fontWeight: 900,
                            color: colors.blueText
                        }}>{formatRupiah(stats.saldo)}</p>
                        <p style={{
                            fontSize: '13px',
                            color: colors.blueText,
                            opacity: 0.8,
                            marginTop: '8px'
                        }}>⊕ Dana Tersedia</p>
                    </div>
                </div>

                {/* Progress Target */}
                <div style={{ ...cardStyle, marginBottom: '32px' }}>
                    <div className="flex items-center gap-sm" style={{ marginBottom: '20px' }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #0891b2, #22d3ee)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(34, 211, 238, 0.3)'
                        }}>
                            <Target size={20} color="white" />
                        </div>
                        <h3 style={{ fontWeight: 700, color: colors.greenText }}>Progress Target Donasi</h3>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '14px', color: colors.textMuted }}>
                            Target: <span style={{ fontWeight: 700, color: colors.text }}>{formatRupiah(stats.targetDonasi)}</span>
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '12px' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textSecondary }}>
                                Pencapaian Target
                            </span>
                            <span style={{
                                fontSize: '24px',
                                fontWeight: 900,
                                color: colors.greenText
                            }}>
                                {progressPercent}%
                            </span>
                        </div>
                        <div style={{
                            height: '20px',
                            background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${progressPercent}%`,
                                background: 'linear-gradient(90deg, #0891b2, #22d3ee, #67e8f9)',
                                borderRadius: '999px',
                                transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                    animation: 'shimmer 2s infinite'
                                }} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center" style={{ marginTop: '20px' }}>
                        <div className="flex items-center gap-sm">
                            <Users size={18} style={{ color: colors.textMuted }} />
                            <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                                <strong style={{ color: colors.text }}>{stats.totalDonatur}</strong> Donatur
                            </span>
                        </div>
                        <div className="flex items-center gap-sm">
                            <Award size={18} style={{ color: colors.goldText }} />
                            <span style={{ fontSize: '14px', color: colors.textSecondary }}>
                                Kurang <strong style={{ color: colors.goldText }}>{formatRupiah(kurang > 0 ? kurang : 0)}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    {/* Top 5 Donatur */}
                    <div style={cardStyle}>
                        <div className="flex items-center gap-sm" style={{ marginBottom: '16px' }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #D97706, #FCD34D)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(217, 119, 6, 0.3)'
                            }}>
                                <Award size={20} color="white" />
                            </div>
                            <h3 style={{ fontWeight: 700, color: colors.goldText }}>Top 5 Donatur</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
                            Jazakumullahu Khairan
                        </p>
                        {topDonors.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px' }}>
                                <Users size={40} style={{ color: colors.textMuted, marginBottom: '12px' }} />
                                <p style={{ color: colors.textMuted, fontWeight: 600 }}>Belum ada donatur</p>
                                <p style={{ color: colors.textMuted, fontSize: '13px' }}>Data akan muncul setelah ada donasi</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {topDonors.map((donor, index) => (
                                    <div
                                        key={donor.id}
                                        className="flex items-center gap-md"
                                        style={{
                                            padding: '16px',
                                            background: index === 0
                                                ? (darkMode ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))' : 'rgba(255, 215, 0, 0.15)')
                                                : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                                            borderRadius: '16px',
                                            border: index === 0 ? '1px solid rgba(255, 215, 0, 0.3)' : `1px solid ${colors.cardBorder}`
                                        }}
                                    >
                                        <RankBadge rank={index + 1} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '15px', color: colors.text }}>
                                                {donor.nama}
                                            </p>
                                            <p style={{ fontSize: '13px', color: colors.textMuted }}>
                                                {donor.blok_rumah || 'Umum'}
                                            </p>
                                        </div>
                                        <p style={{
                                            fontWeight: 800,
                                            fontSize: '15px',
                                            color: colors.greenText
                                        }}>
                                            {formatRupiah(donor.total)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Verifikasi Kwitansi */}
                    <div style={cardStyle}>
                        <div className="flex items-center gap-sm" style={{ marginBottom: '16px' }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #059669, #10B981)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                            }}>
                                <Search size={20} color="white" />
                            </div>
                            <h3 style={{ fontWeight: 700, color: colors.greenText }}>Verifikasi Kwitansi</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
                            Cek status donasi Anda
                        </p>
                        <form onSubmit={handleSearch}>
                            <div className="flex gap-sm">
                                <input
                                    type="text"
                                    placeholder="Masukkan No. Kwitansi (MAS-XXXX-XX-XXXX)"
                                    value={searchRef}
                                    onChange={e => setSearchRef(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '14px 18px',
                                        borderRadius: '12px',
                                        border: `1px solid ${colors.cardBorder}`,
                                        background: darkMode ? 'rgba(255,255,255,0.08)' : 'white',
                                        color: colors.text,
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={searching || !searchRef.trim()}
                                    style={{ paddingLeft: '20px', paddingRight: '20px' }}
                                >
                                    <Search size={18} />
                                </Button>
                            </div>
                        </form>

                        {searching && (
                            <div className="flex justify-center" style={{ marginTop: '24px' }}>
                                <LoadingSpinner size={32} />
                            </div>
                        )}

                        {searchError && (
                            <div
                                className="flex items-center gap-sm"
                                style={{
                                    marginTop: '20px',
                                    padding: '16px',
                                    background: colors.roseBg,
                                    border: `1px solid ${colors.roseText}30`,
                                    borderRadius: '12px'
                                }}
                            >
                                <XCircle size={20} style={{ color: colors.roseText }} />
                                <span style={{ color: colors.roseText }}>{searchError}</span>
                            </div>
                        )}

                        {searchResult && (
                            <div
                                style={{
                                    marginTop: '20px',
                                    padding: '20px',
                                    background: colors.greenBg,
                                    border: `1px solid ${colors.greenText}40`,
                                    borderRadius: '16px'
                                }}
                            >
                                <div className="flex items-center gap-sm mb-md">
                                    <CheckCircle size={24} style={{ color: colors.greenText }} />
                                    <span style={{ fontWeight: 700, color: colors.greenText }}>
                                        Donasi Terverifikasi!
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.textMuted }}>No. Referensi</span>
                                        <span style={{ fontWeight: 700, color: colors.text }}>{searchResult.nomor_referensi}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.textMuted }}>Donatur</span>
                                        <span style={{ fontWeight: 600, color: colors.text }}>{searchResult.mush_donors?.nama}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.textMuted }}>Tanggal</span>
                                        <span style={{ color: colors.text }}>{formatDate(searchResult.tanggal_bayar)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.textMuted }}>Nominal</span>
                                        <span style={{ fontWeight: 800, fontSize: '18px', color: colors.greenText }}>
                                            {formatRupiah(searchResult.nominal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activities Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '24px',
                    marginBottom: '32px'
                }}>
                    {/* Recent Donations */}
                    <div style={cardStyle}>
                        <div className="flex justify-between items-center mb-md">
                            <div className="flex items-center gap-sm">
                                <Heart size={20} style={{ color: colors.greenText }} />
                                <h3 style={{ fontWeight: 700, color: colors.text }}>Donasi Terbaru</h3>
                            </div>
                            <button
                                onClick={() => showDetails('donations')}
                                className="flex items-center gap-sm"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: colors.greenText,
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600
                                }}
                            >
                                Lihat Semua <ChevronRight size={16} />
                            </button>
                        </div>
                        {recentDonations.length === 0 ? (
                            <p style={{ color: colors.textMuted, textAlign: 'center', padding: '20px' }}>Belum ada donasi</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {recentDonations.slice(0, 5).map(d => (
                                    <div
                                        key={d.id}
                                        className="flex justify-between items-center"
                                        style={{
                                            padding: '12px',
                                            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                            borderRadius: '12px',
                                            borderLeft: `3px solid ${colors.greenText}`
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '14px', color: colors.text }}>{d.mush_donors?.nama || 'Anonim'}</p>
                                            <p style={{ fontSize: '12px', color: colors.textMuted }}>{formatDate(d.tanggal_bayar)}</p>
                                        </div>
                                        <p style={{ fontWeight: 700, color: colors.greenText }}>+{formatRupiah(d.nominal)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Expenses */}
                    <div style={cardStyle}>
                        <div className="flex justify-between items-center mb-md">
                            <div className="flex items-center gap-sm">
                                <Banknote size={20} style={{ color: colors.roseText }} />
                                <h3 style={{ fontWeight: 700, color: colors.text }}>Pengeluaran Terbaru</h3>
                            </div>
                            <button
                                onClick={() => showDetails('expenses')}
                                className="flex items-center gap-sm"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: colors.roseText,
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600
                                }}
                            >
                                Lihat Semua <ChevronRight size={16} />
                            </button>
                        </div>
                        {recentExpenses.length === 0 ? (
                            <p style={{ color: colors.textMuted, textAlign: 'center', padding: '20px' }}>Belum ada pengeluaran</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {recentExpenses.slice(0, 5).map(e => (
                                    <div
                                        key={e.id}
                                        className="flex justify-between items-center"
                                        style={{
                                            padding: '12px',
                                            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                            borderRadius: '12px',
                                            borderLeft: `3px solid ${colors.roseText}`
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '14px', color: colors.text }}>{e.keterangan?.substring(0, 30) || 'Pengeluaran'}</p>
                                            <p style={{ fontSize: '12px', color: colors.textMuted }}>{formatDate(e.tanggal)}</p>
                                        </div>
                                        <p style={{ fontWeight: 700, color: colors.roseText }}>-{formatRupiah(e.nominal)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer style={{
                    marginTop: '48px',
                    textAlign: 'center',
                    paddingTop: '24px',
                    borderTop: `1px solid ${colors.cardBorder}`
                }}>
                    <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                        🕌 Musholla As-Sakinah © {new Date().getFullYear()}
                    </p>
                    <p style={{ color: colors.textMuted, fontSize: '13px', marginTop: '4px' }}>
                        Griya Sakinah, Bandung
                    </p>
                </footer>

                {/* Detail Modal */}
                <Modal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    title={detailType === 'donations' ? '💚 Riwayat Donasi' : '📊 Riwayat Pengeluaran'}
                    size="lg"
                >
                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {detailType === 'donations' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentDonations.map(d => (
                                    <div
                                        key={d.id}
                                        className="flex justify-between items-center"
                                        style={{
                                            padding: '16px',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            borderRadius: '12px',
                                            borderLeft: '4px solid #10B981'
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>{d.mush_donors?.nama || 'Anonim'}</p>
                                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                                                {d.mush_donors?.blok_rumah || '-'} • {formatDate(d.tanggal_bayar)}
                                            </p>
                                            <code style={{ fontSize: '11px', color: '#34D399' }}>{d.nomor_referensi}</code>
                                        </div>
                                        <p style={{ fontWeight: 800, fontSize: '16px', color: '#34D399' }}>
                                            +{formatRupiah(d.nominal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentExpenses.map(e => (
                                    <div
                                        key={e.id}
                                        className="flex justify-between items-center"
                                        style={{
                                            padding: '16px',
                                            background: 'rgba(225, 29, 72, 0.1)',
                                            borderRadius: '12px',
                                            borderLeft: '4px solid #E11D48'
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>{e.keterangan}</p>
                                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                                                {e.item_kategori} • {formatDate(e.tanggal)}
                                            </p>
                                        </div>
                                        <p style={{ fontWeight: 800, fontSize: '16px', color: '#FB7185' }}>
                                            -{formatRupiah(e.nominal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal>
            </div>

            {/* Shimmer Animation CSS */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
