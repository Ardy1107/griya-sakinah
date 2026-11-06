// Dashboard Blok A - Dedicated page for Blok A Internet payments
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import StatusGrid from '../components/StatusGrid'
import HeroStats from '../components/HeroStats'
import TrendChart from '../components/TrendChart'
import ProgressBar from '../components/ProgressBar'
import PeriodPicker from '../components/PeriodPicker'
import PaymentInfoCard from '../components/PaymentInfoCard'
import WargaKasUtamaCard from '../components/WargaKasUtamaCard'
import { useFinancialSummary, usePaymentStatus, useResidents, useAllTimeFinancials } from '../hooks/useSupabase'
import { getMonthName } from '../utils/helpers'
import { useBlock } from '../context/BlockContext'

const DEFAULT_PERIOD = (() => {
  const now = new Date()
  return { bulan: now.getMonth() + 1, tahun: now.getFullYear() }
})()

export default function DashboardBlokA() {
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD)
  const { blockName, urlPrefix } = useBlock()

  const { totalPemasukan, totalPengeluaran, saldo, payments, expenses } = useFinancialSummary(selectedPeriod.bulan, selectedPeriod.tahun)
  const { statusList, totalPaid, totalUnpaid } = usePaymentStatus(selectedPeriod.bulan, selectedPeriod.tahun)
  const { residents } = useResidents()

  // All-time financials for running cash balance
  const {
    allPayments: allTimePaymentsData,
    allExpenses: allTimeExpensesData,
    allOtherIncomes: allTimeOtherIncomesData,
    saldoAwal,
    loading: kasLoading
  } = useAllTimeFinancials()

  const totalWarga = residents.length
  const paidList = statusList.filter(r => r.isPaid)
  const unpaidList = statusList.filter(r => !r.isPaid)

  return (
    <div className="app-container warga-portal-theme theme-blok-a">
      <Header />

      <main className="main-content">
        {/* Welcome Banner with Blok A identity */}
        <div className="dashboard-welcome theme-blok-a">
          <div className="dashboard-welcome-inner">
            <div className="dashboard-welcome-text">
              <div className="dashboard-welcome-badge blok-a-badge">
                <span className="dashboard-welcome-badge-dot" />
                Blok A
              </div>
              <h1 className="dashboard-title">
                Dashboard Transparansi
              </h1>
              <p className="dashboard-subtitle">
                Pantau status pembayaran iuran internet Blok A secara transparan & real-time
              </p>
            </div>
            <PeriodPicker value={selectedPeriod} onChange={setSelectedPeriod} />
          </div>
        </div>

        {/* 1. UANG KAS UTAMA POSISI PALING ATAS (Per-Bulan Transparansi) */}
        <WargaKasUtamaCard
          selectedPeriod={selectedPeriod}
          blockId="A"
          allPayments={allTimePaymentsData}
          allExpenses={allTimeExpensesData}
          allOtherIncomes={allTimeOtherIncomesData}
          saldoAwal={saldoAwal}
          loading={kasLoading}
        />

        {/* 2. Hero Stats - Ringkasan Warga & Operasional */}
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

        {/* 3. Progress & Trend */}
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
              {totalPaid} dari {totalWarga} warga Blok A sudah membayar iuran bulan ini
            </p>
          </div>
          <TrendChart payments={payments} color="#10b981" gradientId="trendBlokA" />
        </div>

        {/* 4. Status Grid - Interaktif & Mobile-Friendly */}
        <StatusGrid selectedPeriod={selectedPeriod} blockFilter="A" />

        {/* 5. Payment Info Card - Blok A specific (rekening BSI) */}
        <PaymentInfoCard blockId="A" />
      </main>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          © {new Date().getFullYear()} Internet Sakinah • Blok A
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
