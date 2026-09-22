// Dashboard Blok B - Dedicated page for Blok B Internet payments
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import StatusGrid from '../components/StatusGrid'
import HeroStats from '../components/HeroStats'
import TrendChart from '../components/TrendChart'
import ProgressBar from '../components/ProgressBar'
import PeriodPicker from '../components/PeriodPicker'
import PaymentInfoCard from '../components/PaymentInfoCard'
import { useFinancialSummary, usePaymentStatus, useResidents } from '../hooks/useSupabase'
import { getMonthName } from '../utils/helpers'
import { useBlock } from '../context/BlockContext'

const DEFAULT_PERIOD = (() => {
  const now = new Date()
  return { bulan: now.getMonth() + 1, tahun: now.getFullYear() }
})()

export default function DashboardBlokB() {
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD)
  const { blockName, urlPrefix } = useBlock()

  const { totalPemasukan, totalPengeluaran, saldo, payments, expenses } = useFinancialSummary(selectedPeriod.bulan, selectedPeriod.tahun)
  const { statusList, totalPaid, totalUnpaid } = usePaymentStatus(selectedPeriod.bulan, selectedPeriod.tahun)
  const { residents } = useResidents()

  const totalWarga = residents.length
  const paidList = statusList.filter(r => r.isPaid)
  const unpaidList = statusList.filter(r => !r.isPaid)

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Welcome Banner with Blok B identity */}
        <div className="dashboard-welcome">
          <div className="dashboard-welcome-inner">
            <div className="dashboard-welcome-text">
              <div className="dashboard-welcome-badge blok-b-badge">
                <span className="dashboard-welcome-badge-dot" />
                Blok B
              </div>
              <h1 className="dashboard-title">
                Dashboard Transparansi
              </h1>
              <p className="dashboard-subtitle">
                Pantau status pembayaran iuran internet Blok B secara transparan & real-time
              </p>
            </div>
            <PeriodPicker value={selectedPeriod} onChange={setSelectedPeriod} />
          </div>
        </div>

        {/* Payment Info Card - Blok B specific */}
        <PaymentInfoCard blockId="B" />

        {/* Hero Stats */}
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

        {/* Progress & Trend */}
        <div className="dashboard-grid-2">
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
              {totalPaid} dari {totalWarga} warga Blok B sudah membayar iuran bulan ini
            </p>
          </div>
          <TrendChart payments={payments} />
        </div>

        {/* Status Grid */}
        <StatusGrid selectedPeriod={selectedPeriod} />

        {/* Transparansi Info */}
        <div className="card mt-4 transparansi-card">
          <h3 className="card-title mb-2" style={{ justifyContent: 'center' }}>
            📊 Informasi Transparansi
          </h3>
          <p className="text-muted transparansi-text">
            Semua data keuangan Blok B ditampilkan secara transparan.
            Klik pada setiap kartu statistik untuk melihat detail.
            Iuran internet Blok B: <strong style={{ color: '#3b82f6' }}>Rp 150.000/bulan</strong> per rumah.
          </p>
          <p className="text-muted transparansi-text" style={{ marginTop: '0.5rem' }}>
            💳 Transfer ke <strong>Bank Mandiri 1480023234738</strong> (a.n. Ardyanto Pri Utomo)
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          © {new Date().getFullYear()} Internet Sakinah • Blok B
        </p>
        <p style={{ marginTop: 'var(--space-sm)' }}>
          <Link to={`${urlPrefix}/peraturan`} className="footer-link" style={{ marginRight: 'var(--space-md)' }}>
            📋 Peraturan
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
