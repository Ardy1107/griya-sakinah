import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Download, FileSpreadsheet, TrendingUp, TrendingDown, Wallet, BarChart3, Filter } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui';
import { PremiumMonthPicker, PremiumButton } from '../../components/PremiumComponents';
import { formatRupiah, formatDate } from '../../lib/utils';
import { getDonations, getConstructionCosts } from '../../lib/supabase';

export default function ReportsPage() {
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
        blueBg: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'
    };

    const [donations, setDonations] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [reportType, setReportType] = useState('all'); // all, donations, expenses

    // Export loading
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [donationsRes, expensesRes] = await Promise.all([
                getDonations(),
                getConstructionCosts()
            ]);
            setDonations(donationsRes.data || []);
            setExpenses(expensesRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    // Filter data by month/year
    const filteredDonations = donations.filter(d => {
        if (selectedMonth === -1) {
            return new Date(d.tanggal_bayar).getFullYear() === selectedYear;
        }
        const date = new Date(d.tanggal_bayar);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });

    const filteredExpenses = expenses.filter(e => {
        if (selectedMonth === -1) {
            return new Date(e.tanggal).getFullYear() === selectedYear;
        }
        const date = new Date(e.tanggal);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });

    // Calculate totals
    const totalDonations = filteredDonations.reduce((sum, d) => sum + (d.nominal || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.nominal || 0), 0);
    const balance = totalDonations - totalExpenses;

    async function exportToExcel() {
        setExporting(true);
        try {
            const { utils, writeFile } = await import('xlsx');
            const wb = utils.book_new();

            if (reportType === 'all' || reportType === 'donations') {
                const donationData = filteredDonations.map(d => ({
                    'No. Referensi': d.nomor_referensi,
                    'Tanggal': formatDate(d.tanggal_bayar),
                    'Nama Donatur': d.mush_donors?.nama || 'Anonim',
                    'Blok': d.mush_donors?.blok_rumah || '-',
                    'Metode': d.metode_bayar,
                    'Nominal': d.nominal
                }));
                const ws1 = utils.json_to_sheet(donationData);
                utils.book_append_sheet(wb, ws1, 'Donasi');
            }

            if (reportType === 'all' || reportType === 'expenses') {
                const expenseData = filteredExpenses.map(e => ({
                    'Tanggal': formatDate(e.tanggal),
                    'Kategori': e.item_kategori,
                    'Keterangan': e.keterangan,
                    'Nominal': e.nominal
                }));
                const ws2 = utils.json_to_sheet(expenseData);
                utils.book_append_sheet(wb, ws2, 'Pengeluaran');
            }

            const monthName = selectedMonth === -1 ? 'Semua' : ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][selectedMonth];
            writeFile(wb, `Laporan-Musholla-${monthName}-${selectedYear}.xlsx`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Gagal export ke Excel');
        } finally {
            setExporting(false);
        }
    }

    async function exportToPDF() {
        setExporting(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();

            const monthName = selectedMonth === -1 ? 'Semua Bulan' : ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][selectedMonth];

            // Header
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('LAPORAN KEUANGAN', 105, 20, { align: 'center' });
            doc.setFontSize(14);
            doc.text('Musholla As-Sakinah', 105, 28, { align: 'center' });
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Periode: ${monthName} ${selectedYear}`, 105, 36, { align: 'center' });

            let y = 50;

            // Summary
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('RINGKASAN', 20, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Donasi: ${formatRupiah(totalDonations)}`, 20, y);
            y += 6;
            doc.text(`Total Pengeluaran: ${formatRupiah(totalExpenses)}`, 20, y);
            y += 6;
            doc.text(`Saldo: ${formatRupiah(balance)}`, 20, y);
            y += 15;

            // Donations
            if (reportType === 'all' || reportType === 'donations') {
                doc.setFont('helvetica', 'bold');
                doc.text('DAFTAR DONASI', 20, y);
                y += 8;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);

                filteredDonations.slice(0, 20).forEach(d => {
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(`${formatDate(d.tanggal_bayar)} - ${d.mush_donors?.nama || 'Anonim'} - ${formatRupiah(d.nominal)}`, 20, y);
                    y += 5;
                });
                y += 10;
            }

            // Expenses
            if (reportType === 'all' || reportType === 'expenses') {
                if (y > 240) {
                    doc.addPage();
                    y = 20;
                }
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('DAFTAR PENGELUARAN', 20, y);
                y += 8;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);

                filteredExpenses.slice(0, 20).forEach(e => {
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(`${formatDate(e.tanggal)} - ${e.keterangan?.substring(0, 40) || 'Pengeluaran'} - ${formatRupiah(e.nominal)}`, 20, y);
                    y += 5;
                });
            }

            doc.save(`Laporan-Musholla-${monthName}-${selectedYear}.pdf`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Gagal export ke PDF');
        } finally {
            setExporting(false);
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

    // Stat card helper
    const statCardStyle = (variant) => {
        const configs = {
            green: { bg: colors.greenBg, text: colors.greenText, iconBg: 'linear-gradient(135deg, #059669, #10B981)' },
            rose: { bg: colors.roseBg, text: colors.roseText, iconBg: 'linear-gradient(135deg, #E11D48, #FB7185)' },
            blue: { bg: colors.blueBg, text: colors.blueText, iconBg: 'linear-gradient(135deg, #2563EB, #60A5FA)' }
        };
        return configs[variant];
    };

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
            <div className="flex justify-between items-center" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 900,
                        color: colors.text,
                        marginBottom: '4px'
                    }}>
                        Laporan & Export
                    </h1>
                    <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                        Generate laporan keuangan dan export data
                    </p>
                </div>
                <div className="flex gap-md">
                    <PremiumButton
                        onClick={exportToExcel}
                        variant="primary"
                        loading={exporting}
                        darkMode={darkMode}
                    >
                        <FileSpreadsheet size={18} />
                        Export Excel
                    </PremiumButton>
                    <button
                        onClick={exportToPDF}
                        disabled={exporting}
                        style={{
                            padding: '14px 24px',
                            borderRadius: '14px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #E11D48, #FB7185)',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: exporting ? 'not-allowed' : 'pointer',
                            opacity: exporting ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 16px rgba(225, 29, 72, 0.4)'
                        }}
                    >
                        <FileText size={18} />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Month Picker */}
            <div style={{ marginBottom: '24px' }}>
                <PremiumMonthPicker
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={setSelectedMonth}
                    onYearChange={setSelectedYear}
                    darkMode={darkMode}
                    minYear={2025}
                />
            </div>

            {/* Report Type Filter */}
            <div style={{ ...cardStyle, marginBottom: '24px', padding: '16px' }}>
                <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
                    <div className="flex items-center gap-sm">
                        <Filter size={18} style={{ color: colors.textMuted }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textMuted }}>
                            Jenis Laporan:
                        </span>
                    </div>
                    {[
                        { value: 'all', label: 'Semua Transaksi', icon: BarChart3 },
                        { value: 'donations', label: 'Donasi Saja', icon: TrendingUp },
                        { value: 'expenses', label: 'Pengeluaran Saja', icon: TrendingDown }
                    ].map(type => (
                        <button
                            key={type.value}
                            onClick={() => setReportType(type.value)}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '12px',
                                border: 'none',
                                background: reportType === type.value
                                    ? 'linear-gradient(135deg, #059669, #10B981)'
                                    : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                                color: reportType === type.value ? '#ffffff' : colors.text,
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: reportType === type.value ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                            }}
                        >
                            <type.icon size={16} />
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                {/* Total Donasi */}
                <div style={{
                    ...cardStyle,
                    background: statCardStyle('green').bg,
                    border: `1px solid ${colors.greenText}30`,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: statCardStyle('green').iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                    }}>
                        <TrendingUp size={24} color="white" />
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.textMuted, marginBottom: '8px' }}>
                        Total Donasi
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: colors.greenText }}>
                        {formatRupiah(totalDonations)}
                    </p>
                    <p style={{ fontSize: '13px', color: colors.greenText, opacity: 0.8, marginTop: '8px' }}>
                        ⊕ {filteredDonations.length} transaksi
                    </p>
                </div>

                {/* Total Pengeluaran */}
                <div style={{
                    ...cardStyle,
                    background: statCardStyle('rose').bg,
                    border: `1px solid ${colors.roseText}30`,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
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
                    <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.textMuted, marginBottom: '8px' }}>
                        Total Pengeluaran
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: colors.roseText }}>
                        {formatRupiah(totalExpenses)}
                    </p>
                    <p style={{ fontSize: '13px', color: colors.roseText, opacity: 0.8, marginTop: '8px' }}>
                        ⊕ {filteredExpenses.length} transaksi
                    </p>
                </div>

                {/* Saldo */}
                <div style={{
                    ...cardStyle,
                    background: statCardStyle('blue').bg,
                    border: `1px solid ${colors.blueText}30`,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
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
                    <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.textMuted, marginBottom: '8px' }}>
                        Saldo Periode Ini
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: colors.blueText }}>
                        {formatRupiah(balance)}
                    </p>
                    <p style={{ fontSize: '13px', color: colors.blueText, opacity: 0.8, marginTop: '8px' }}>
                        ⊕ Selisih
                    </p>
                </div>
            </div>

            {/* Data Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Donations Preview */}
                {(reportType === 'all' || reportType === 'donations') && (
                    <div style={cardStyle}>
                        <div className="flex items-center gap-sm" style={{ marginBottom: '20px' }}>
                            <TrendingUp size={20} style={{ color: colors.greenText }} />
                            <h3 style={{ fontWeight: 700, color: colors.text }}>Preview Donasi</h3>
                            <span style={{
                                marginLeft: 'auto',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: colors.greenBg,
                                color: colors.greenText
                            }}>
                                {filteredDonations.length}
                            </span>
                        </div>
                        {filteredDonations.length === 0 ? (
                            <p style={{ color: colors.textMuted, textAlign: 'center', padding: '32px' }}>
                                Tidak ada data donasi
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredDonations.slice(0, 5).map(d => (
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
                                {filteredDonations.length > 5 && (
                                    <p style={{ textAlign: 'center', fontSize: '13px', color: colors.textMuted, padding: '8px' }}>
                                        + {filteredDonations.length - 5} lainnya...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Expenses Preview */}
                {(reportType === 'all' || reportType === 'expenses') && (
                    <div style={cardStyle}>
                        <div className="flex items-center gap-sm" style={{ marginBottom: '20px' }}>
                            <TrendingDown size={20} style={{ color: colors.roseText }} />
                            <h3 style={{ fontWeight: 700, color: colors.text }}>Preview Pengeluaran</h3>
                            <span style={{
                                marginLeft: 'auto',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: colors.roseBg,
                                color: colors.roseText
                            }}>
                                {filteredExpenses.length}
                            </span>
                        </div>
                        {filteredExpenses.length === 0 ? (
                            <p style={{ color: colors.textMuted, textAlign: 'center', padding: '32px' }}>
                                Tidak ada data pengeluaran
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredExpenses.slice(0, 5).map(e => (
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
                                {filteredExpenses.length > 5 && (
                                    <p style={{ textAlign: 'center', fontSize: '13px', color: colors.textMuted, padding: '8px' }}>
                                        + {filteredExpenses.length - 5} lainnya...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
