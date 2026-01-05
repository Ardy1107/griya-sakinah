import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
    getPaymentsSync as getPayments,
    getUnitsSync as getUnits,
    getPaymentStatsSync as getPaymentStats
} from '../../utils/database';
import MonthPicker, { formatMonthYear, getMonthYearKey } from '../../components/MonthPicker/MonthPicker';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    Users,
    CreditCard,
    FileSpreadsheet
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
    const [selectedMonth, setSelectedMonth] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    });
    const [reportData, setReportData] = useState({
        payments: [],
        totalIncome: 0,
        totalPokok: 0,
        totalTambahan: 0,
        unitCount: 0,
        paidUnits: []
    });

    useEffect(() => {
        generateReport();
    }, [selectedMonth]);

    const generateReport = () => {
        const allPayments = getPayments();
        const allUnits = getUnits();
        const monthKey = getMonthYearKey(selectedMonth);

        // Filter payments for selected month
        const monthPayments = allPayments.filter(p => {
            if (p.paymentMonthKey) {
                return p.paymentMonthKey === monthKey;
            }
            // Fallback to createdAt for old data
            const payDate = new Date(p.createdAt);
            return payDate.getMonth() === selectedMonth.month &&
                payDate.getFullYear() === selectedMonth.year;
        });

        const totalIncome = monthPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalPokok = monthPayments
            .filter(p => p.category === 'pokok')
            .reduce((sum, p) => sum + p.amount, 0);
        const totalTambahan = monthPayments
            .filter(p => p.category === 'tambahan')
            .reduce((sum, p) => sum + p.amount, 0);

        // Get unique units that paid
        const paidUnitIds = [...new Set(monthPayments.map(p => p.unitId))];
        const paidUnits = paidUnitIds.map(id => allUnits.find(u => u.id === id)).filter(Boolean);

        setReportData({
            payments: monthPayments,
            totalIncome,
            totalPokok,
            totalTambahan,
            unitCount: allUnits.length,
            paidUnits
        });
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const monthStr = formatMonthYear(selectedMonth);

        // Header
        doc.setFillColor(16, 185, 129);
        doc.rect(0, 0, pageWidth, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('LAPORAN BULANAN', pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`GRIYA SAKINAH - ${monthStr}`, pageWidth / 2, 28, { align: 'center' });

        // Summary
        doc.setTextColor(0, 0, 0);
        let y = 50;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Ringkasan', 20, y);

        y += 12;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Pemasukan: ${formatRupiah(reportData.totalIncome)}`, 20, y);
        y += 8;
        doc.text(`Angsuran Pokok: ${formatRupiah(reportData.totalPokok)}`, 20, y);
        y += 8;
        doc.text(`Bangunan Tambahan: ${formatRupiah(reportData.totalTambahan)}`, 20, y);
        y += 8;
        doc.text(`Jumlah Transaksi: ${reportData.payments.length}`, 20, y);
        y += 8;
        doc.text(`Unit Membayar: ${reportData.paidUnits.length} dari ${reportData.unitCount}`, 20, y);

        // Payment list
        y += 20;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Daftar Pembayaran', 20, y);

        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('No', 20, y);
        doc.text('Blok', 35, y);
        doc.text('Kategori', 60, y);
        doc.text('Angsuran', 100, y);
        doc.text('Nominal', 140, y);

        doc.setFont('helvetica', 'normal');
        const units = getUnits();

        reportData.payments.forEach((payment, index) => {
            y += 7;
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            const unit = units.find(u => u.id === payment.unitId);
            doc.text(`${index + 1}`, 20, y);
            doc.text(unit?.blockNumber || '-', 35, y);
            doc.text(payment.category === 'pokok' ? 'Pokok' : 'Tambahan', 60, y);
            doc.text(`#${payment.installmentNo}`, 100, y);
            doc.text(formatRupiah(payment.amount), 140, y);
        });

        // Footer
        y = 280;
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, y, { align: 'center' });

        doc.save(`Laporan_${monthStr.replace(' ', '_')}.pdf`);
    };

    const handleExportCSV = () => {
        const units = getUnits();
        const headers = ['No', 'Tanggal', 'Blok', 'Nama', 'Kategori', 'Angsuran', 'Nominal', 'Status'];

        const rows = reportData.payments.map((payment, index) => {
            const unit = units.find(u => u.id === payment.unitId);
            return [
                index + 1,
                new Date(payment.createdAt).toLocaleDateString('id-ID'),
                unit?.blockNumber || '-',
                unit?.residentName || '-',
                payment.category === 'pokok' ? 'Angsuran Pokok' : 'Bangunan Tambahan',
                payment.installmentNo,
                payment.amount,
                payment.status
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Pembayaran_${formatMonthYear(selectedMonth).replace(' ', '_')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h1>Laporan</h1>
                    <p>Generate dan export laporan bulanan</p>
                </div>
            </div>

            {/* Month Selector */}
            <div className="report-controls">
                <div className="month-selector">
                    <label>Pilih Periode:</label>
                    <MonthPicker
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        minYear={2025}
                    />
                </div>

                <div className="export-buttons">
                    <button className="export-button pdf" onClick={handleExportPDF}>
                        <FileText size={18} />
                        <span>Export PDF</span>
                    </button>
                    <button className="export-button csv" onClick={handleExportCSV}>
                        <FileSpreadsheet size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card green">
                    <TrendingUp size={24} />
                    <div>
                        <span className="summary-value">{formatRupiah(reportData.totalIncome)}</span>
                        <span className="summary-label">Total Pemasukan</span>
                    </div>
                </div>
                <div className="summary-card blue">
                    <CreditCard size={24} />
                    <div>
                        <span className="summary-value">{reportData.payments.length}</span>
                        <span className="summary-label">Transaksi</span>
                    </div>
                </div>
                <div className="summary-card purple">
                    <Users size={24} />
                    <div>
                        <span className="summary-value">{reportData.paidUnits.length}/{reportData.unitCount}</span>
                        <span className="summary-label">Unit Membayar</span>
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="breakdown-section">
                <h3>Breakdown Pembayaran</h3>
                <div className="breakdown-bars">
                    <div className="breakdown-item">
                        <div className="breakdown-header">
                            <span>Angsuran Pokok</span>
                            <span>{formatRupiah(reportData.totalPokok)}</span>
                        </div>
                        <div className="breakdown-bar">
                            <div
                                className="breakdown-fill pokok"
                                style={{
                                    width: reportData.totalIncome > 0
                                        ? `${(reportData.totalPokok / reportData.totalIncome) * 100}%`
                                        : '0%'
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="breakdown-item">
                        <div className="breakdown-header">
                            <span>Bangunan Tambahan</span>
                            <span>{formatRupiah(reportData.totalTambahan)}</span>
                        </div>
                        <div className="breakdown-bar">
                            <div
                                className="breakdown-fill tambahan"
                                style={{
                                    width: reportData.totalIncome > 0
                                        ? `${(reportData.totalTambahan / reportData.totalIncome) * 100}%`
                                        : '0%'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment List */}
            <div className="payments-list">
                <h3>
                    <Calendar size={18} />
                    Daftar Pembayaran - {formatMonthYear(selectedMonth)}
                </h3>

                {reportData.payments.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <p>Tidak ada pembayaran di bulan ini</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Blok</th>
                                    <th>Kategori</th>
                                    <th>Angsuran</th>
                                    <th>Nominal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.payments.map((payment, index) => {
                                    const units = getUnits();
                                    const unit = units.find(u => u.id === payment.unitId);
                                    return (
                                        <tr key={payment.id}>
                                            <td>{index + 1}</td>
                                            <td><span className="block-badge">{unit?.blockNumber || '-'}</span></td>
                                            <td>
                                                <span className={`category-badge ${payment.category}`}>
                                                    {payment.category === 'pokok' ? 'Pokok' : 'Tambahan'}
                                                </span>
                                            </td>
                                            <td>#{payment.installmentNo}</td>
                                            <td className="amount">{formatRupiah(payment.amount)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
