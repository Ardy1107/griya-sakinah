import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Users,
    Plus,
    ArrowRight,
    Heart,
    Banknote
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui';
import { PremiumButton } from '../../components/PremiumComponents';
import { formatRupiah, formatDate } from '../../lib/utils';
import { getDashboardStats, getDonations, getConstructionCosts } from '../../lib/supabase';

export default function AdminDashboard() {
    const context = useOutletContext() || {};
    const darkMode = context.darkMode ?? true;
    const colors = context.colors || {
        text: darkMode ? '#ffffff' : '#1f2937',
        textSecondary: darkMode ? 'rgba(255,255,255,0.8)' : '#374151',
        textMuted: darkMode ? 'rgba(255,255,255,0.5)' : '#6b7280',
        cardBg: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)',
        cardBorder: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        greenText: darkMode ? '#34D399' : '#059669',
        greenBg: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
        roseText: darkMode ? '#FB7185' : '#E11D48',
        roseBg: darkMode ? 'rgba(225, 29, 72, 0.15)' : 'rgba(225, 29, 72, 0.1)',
        blueText: darkMode ? '#60A5FA' : '#2563EB',
        blueBg: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
        goldText: darkMode ? '#FCD34D' : '#D97706',
        goldBg: darkMode ? 'rgba(217, 119, 6, 0.15)' : 'rgba(217, 119, 6, 0.1)'
    };

    const [stats, setStats] = useState({
        totalTerkumpul: 0,
        totalTerpakai: 0,
        saldo: 0,
        totalDonatur: 0
    });
    const [recentDonations, setRecentDonations] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [statsData, donationsData, expensesData] = await Promise.all([
                getDashboardStats(),
                getDonations(),
                getConstructionCosts()
            ]);

            setStats(statsData);
            setRecentDonations((donationsData.data || []).slice(0, 5));
            setRecentExpenses((expensesData.data || []).slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    // Card style helper
    const cardStyle = {
        background: colors.cardBg,
        borderRadius: '20px',
        border: `1px solid ${colors.cardBorder}`,
        padding: '24px',
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(10px)'
    };

    // Stat card config
    const statCards = [
        {
            label: 'Total Terkumpul',
            value: formatRupiah(stats.totalTerkumpul),
            icon: TrendingUp,
            variant: 'green',
            subtitle: 'Donasi Masuk'
        },
        {
            label: 'Total Terpakai',
            value: formatRupiah(stats.totalTerpakai),
            icon: TrendingDown,
            variant: 'rose',
            subtitle: 'Pengeluaran'
        },
        {
            label: 'Saldo Tersedia',
            value: formatRupiah(stats.saldo),
            icon: Wallet,
            variant: 'blue',
            subtitle: 'Dana Ready'
        },
        {
            label: 'Total Donatur',
            value: stats.totalDonatur.toString(),
            icon: Users,
            variant: 'gold',
            subtitle: 'Terdaftar'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '60vh' }}>
                <LoadingSpinner size={48} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 900,
                        color: colors.text,
                        marginBottom: '4px'
                    }}>
                        Dashboard Admin
                    </h1>
                    <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                        Selamat datang di panel administrasi
                    </p>
                </div>
                <Link to="/musholla/admin/donasi">
                    <PremiumButton darkMode={darkMode}>
                        <Plus size={20} />
                        Input Donasi Baru
                    </PremiumButton>
                </Link>
            </div>

            {/* Stat Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    const bgColor = colors[`${stat.variant}Bg`];
                    const textColor = colors[`${stat.variant}Text`];
                    const gradients = {
                        green: 'linear-gradient(135deg, #059669, #10B981)',
                        rose: 'linear-gradient(135deg, #E11D48, #FB7185)',
                        blue: 'linear-gradient(135deg, #2563EB, #60A5FA)',
                        gold: 'linear-gradient(135deg, #D97706, #F59E0B)'
                    };

                    return (
                        <div
                            key={idx}
                            style={{
                                ...cardStyle,
                                background: bgColor,
                                border: `1px solid ${textColor}30`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                background: gradients[stat.variant],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 12px ${textColor}50`
                            }}>
                                <Icon size={24} color="white" />
                            </div>
                            <p style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: colors.textMuted,
                                marginBottom: '8px'
                            }}>
                                {stat.label}
                            </p>
                            <p style={{
                                fontSize: '1.75rem',
                                fontWeight: 900,
                                color: textColor
                            }}>
                                {stat.value}
                            </p>
                            <p style={{
                                fontSize: '13px',
                                color: textColor,
                                opacity: 0.8,
                                marginTop: '8px'
                            }}>
                                ⊕ {stat.subtitle}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <Link to="/musholla/admin/donasi" style={{ textDecoration: 'none' }}>
                    <div
                        className="flex items-center gap-md"
                        style={{
                            ...cardStyle,
                            border: `1px solid ${colors.greenText}30`,
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: 'linear-gradient(135deg, #059669, #10B981)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                        }}>
                            <Heart size={22} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, color: colors.text, fontSize: '15px' }}>Input Donasi</p>
                            <p style={{ fontSize: '13px', color: colors.textMuted }}>Catat donasi baru</p>
                        </div>
                        <ArrowRight size={20} style={{ color: colors.textMuted }} />
                    </div>
                </Link>

                <Link to="/musholla/admin/pengeluaran" style={{ textDecoration: 'none' }}>
                    <div
                        className="flex items-center gap-md"
                        style={{
                            ...cardStyle,
                            border: `1px solid ${colors.roseText}30`,
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: 'linear-gradient(135deg, #E11D48, #FB7185)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(225, 29, 72, 0.3)'
                        }}>
                            <Banknote size={22} color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, color: colors.text, fontSize: '15px' }}>Catat Pengeluaran</p>
                            <p style={{ fontSize: '13px', color: colors.textMuted }}>Material & upah</p>
                        </div>
                        <ArrowRight size={20} style={{ color: colors.textMuted }} />
                    </div>
                </Link>
            </div>

            {/* Recent Activity Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px'
            }}>
                {/* Recent Donations */}
                <div style={cardStyle}>
                    <div className="flex items-center gap-sm" style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.cardBorder}` }}>
                        <Heart size={20} style={{ color: colors.greenText }} />
                        <h3 style={{ fontWeight: 700, color: colors.text }}>Donasi Terbaru</h3>
                    </div>
                    {recentDonations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <Heart size={40} style={{ color: colors.textMuted, marginBottom: '12px' }} />
                            <p style={{ fontWeight: 600, color: colors.text, marginBottom: '4px' }}>Belum ada donasi</p>
                            <p style={{ fontSize: '13px', color: colors.textMuted }}>Input donasi baru untuk memulai</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentDonations.map(donation => (
                                <div
                                    key={donation.id}
                                    className="flex justify-between items-center"
                                    style={{
                                        padding: '14px 16px',
                                        background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                        borderRadius: '12px',
                                        borderLeft: `3px solid ${colors.greenText}`
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '14px', color: colors.text }}>
                                            {donation.mush_donors?.nama || 'Anonim'}
                                        </p>
                                        <p style={{ fontSize: '12px', color: colors.textMuted }}>
                                            {formatDate(donation.tanggal_bayar)}
                                        </p>
                                    </div>
                                    <p style={{
                                        fontWeight: 800,
                                        fontSize: '15px',
                                        color: colors.greenText
                                    }}>
                                        +{formatRupiah(donation.nominal)}
                                    </p>
                                </div>
                            ))}
                            <Link to="/musholla/admin/donasi" className="flex items-center justify-center gap-sm" style={{
                                marginTop: '8px',
                                padding: '12px',
                                color: colors.greenText,
                                fontSize: '14px',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}>
                                Lihat Semua <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Expenses */}
                <div style={cardStyle}>
                    <div className="flex items-center gap-sm" style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.cardBorder}` }}>
                        <Banknote size={20} style={{ color: colors.roseText }} />
                        <h3 style={{ fontWeight: 700, color: colors.text }}>Pengeluaran Terbaru</h3>
                    </div>
                    {recentExpenses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <Banknote size={40} style={{ color: colors.textMuted, marginBottom: '12px' }} />
                            <p style={{ fontWeight: 600, color: colors.text, marginBottom: '4px' }}>Belum ada pengeluaran</p>
                            <p style={{ fontSize: '13px', color: colors.textMuted }}>Catat pengeluaran untuk tracking</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentExpenses.map(expense => (
                                <div
                                    key={expense.id}
                                    className="flex justify-between items-center"
                                    style={{
                                        padding: '14px 16px',
                                        background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                        borderRadius: '12px',
                                        borderLeft: `3px solid ${colors.roseText}`
                                    }}
                                >
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '14px', color: colors.text }}>
                                            {expense.keterangan?.substring(0, 30) || 'Pengeluaran'}
                                        </p>
                                        <p style={{ fontSize: '12px', color: colors.textMuted }}>
                                            {formatDate(expense.tanggal)}
                                        </p>
                                    </div>
                                    <p style={{
                                        fontWeight: 800,
                                        fontSize: '15px',
                                        color: colors.roseText
                                    }}>
                                        -{formatRupiah(expense.nominal)}
                                    </p>
                                </div>
                            ))}
                            <Link to="/musholla/admin/pengeluaran" className="flex items-center justify-center gap-sm" style={{
                                marginTop: '8px',
                                padding: '12px',
                                color: colors.roseText,
                                fontSize: '14px',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}>
                                Lihat Semua <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
