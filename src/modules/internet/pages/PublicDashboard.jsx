// Public Dashboard Page - Enhanced v2.0 with January 2026 default
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import StatusGrid from '../components/StatusGrid'
import HeroStats from '../components/HeroStats'
import TrendChart from '../components/TrendChart'
import ProgressBar from '../components/ProgressBar'
import PeriodPicker from '../components/PeriodPicker'
import { useFinancialSummary, usePaymentStatus, useResidents, usePayments } from '../hooks/useSupabase'
import { getMonthName } from '../utils/helpers'
import { useBlock } from '../context/BlockContext'

// Default to current month/year
const DEFAULT_PERIOD = (() => {
    const now = new Date()
    return { bulan: now.getMonth() + 1, tahun: now.getFullYear() }
})()

export default function PublicDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD)
    const { blockId, blockName, urlPrefix, isBlockSpecific } = useBlock()

    const { totalPemasukan, totalPengeluaran, saldo, payments, expenses } = useFinancialSummary(selectedPeriod.bulan, selectedPeriod.tahun)
    const { statusList, totalPaid, totalUnpaid } = usePaymentStatus(selectedPeriod.bulan, selectedPeriod.tahun)
    const { residents } = useResidents()

    const totalWarga = residents.length

    // Separate paid and unpaid lists for detail modal
    const paidList = statusList.filter(r => r.isPaid)
    const unpaidList = statusList.filter(r => !r.isPaid)

    return (
        <div className="app-container">
            <Header />

            <main className="main-content">
                {/* Welcome Banner */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-xs)' }}>
                                Dashboard Transparansi {isBlockSpecific && <span style={{ color: 'var(--color-primary)' }}>• {blockName}</span>}
                            </h1>
                            <p className="text-muted">
                                Pantau status pembayaran iuran internet {isBlockSpecific ? blockName : 'Griya Sakinah'} secara transparan
                            </p>
                        </div>

                        {/* Period Picker */}
                        <PeriodPicker
                            value={selectedPeriod}
                            onChange={setSelectedPeriod}
                        />
                    </div>
                </div>

                {/* Hero Stats - Clickable */}
                <HeroStats
                    saldo={saldo}
                    pemasukan={totalPemasukan}
                    pengeluaran={totalPengeluaran}
                    totalWarga={totalWarga}
                    sudahBayar={totalPaid}
                    belumBayar={totalUnpaid}
                    paidList={paidList}
                    unpaidList={unpaidList}
                    expenseList={expenses}
                    paymentList={payments}
                />

                {/* Progress & Trend Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 'var(--space-lg)',
                    marginBottom: 'var(--space-xl)'
                }}>
                    {/* Payment Progress */}
                    <div className="card">
                        <h3 className="card-title mb-3">
                            Pembayaran {getMonthName(selectedPeriod.bulan)} {selectedPeriod.tahun}
                        </h3>
                        <ProgressBar
                            value={totalPaid}
                            max={totalWarga || 1}
                            label="Progress Pembayaran"
                            variant="auto"
                        />
                        <p className="text-muted mt-2" style={{ fontSize: '0.875rem' }}>
                            {totalPaid} dari {totalWarga} warga sudah membayar iuran bulan ini
                        </p>
                    </div>

                    {/* Trend Chart */}
                    <TrendChart payments={payments} />
                </div>

                {/* Status Grid */}
                <StatusGrid selectedPeriod={selectedPeriod} />

                {/* Info Transparansi */}
                <div className="card mt-4" style={{ textAlign: 'center' }}>
                    <h3 className="card-title mb-2" style={{ justifyContent: 'center' }}>
                        📊 Informasi Transparansi
                    </h3>
                    <p className="text-muted" style={{ fontSize: '0.875rem', maxWidth: '600px', margin: '0 auto' }}>
                        Semua data keuangan ditampilkan secara transparan untuk warga Griya Sakinah.
                        Klik pada setiap kartu statistik untuk melihat detail informasi.
                        Iuran internet: <strong style={{ color: 'var(--color-primary)' }}>Rp 150.000/bulan</strong> per rumah.
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p className="footer-text">
                    © {new Date().getFullYear()} Griya Sakinah Internet Management {isBlockSpecific && `• ${blockName}`}
                </p>
                <p style={{ marginTop: 'var(--space-sm)' }}>
                    <Link to={`${urlPrefix}/peraturan`} className="footer-link" style={{ marginRight: 'var(--space-md)' }}>
                        📋 Peraturan & Persetujuan
                    </Link>
                    <Link to={`${urlPrefix}/cek-status`} className="footer-link" style={{ marginRight: 'var(--space-md)' }}>
                        🔍 Cek Status
                    </Link>
                    <Link to={`${urlPrefix}/admin/login`} className="footer-link">
                        🔐 Admin
                    </Link>
                </p>
            </footer>
        </div>
    )
}
