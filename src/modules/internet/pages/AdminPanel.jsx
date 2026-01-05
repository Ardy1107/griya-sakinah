// Admin Panel Page - With Full Dashboard Transparansi
import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import {
    Home, CreditCard, Receipt, Users, BarChart3,
    LogOut, Menu, X, Eye, Download, FileText
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePaymentStatus, useFinancialSummary, useResidents, usePayments, useExpenses } from '../hooks/useSupabase'
import PaymentForm from '../components/PaymentForm'
import ExpenseForm from '../components/ExpenseForm'
import ResidentForm from '../components/ResidentForm'
import FinancialReport from '../components/FinancialReport'
import StatusGrid from '../components/StatusGrid'
import HeroStats from '../components/HeroStats'
import ProgressBar from '../components/ProgressBar'
import TrendChart from '../components/TrendChart'
import PeriodPicker from '../components/PeriodPicker'
import StarlinkReminder from '../components/StarlinkReminder'
import ImportData from '../components/ImportData'
import { useToast } from '../components/Toast'
import { getMonthName } from '../utils/helpers'
import { exportToExcel, exportBackup } from '../utils/export'

const TABS = [
    { id: 'transparansi', label: 'Transparansi', icon: Eye },
    { id: 'payment', label: 'Input Bayar', icon: CreditCard },
    { id: 'expense', label: 'Pengeluaran', icon: Receipt },
    { id: 'residents', label: 'Warga', icon: Users },
    { id: 'import', label: 'Import Data', icon: FileText },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'export', label: 'Export Data', icon: Download }
]

export default function AdminPanel() {
    const { user, loading, signOut, isAuthenticated, isSuperadmin } = useAuth()
    const [activeTab, setActiveTab] = useState('transparansi')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedPeriod, setSelectedPeriod] = useState(() => {
        const now = new Date()
        return { bulan: now.getMonth() + 1, tahun: now.getFullYear() }
    })

    const { totalPaid, totalUnpaid, statusList } = usePaymentStatus(selectedPeriod.bulan, selectedPeriod.tahun)
    const { totalPemasukan, totalPengeluaran, saldo, payments, expenses } = useFinancialSummary(selectedPeriod.bulan, selectedPeriod.tahun)
    const { residents } = useResidents()
    const { expenses: allExpenses } = useExpenses()
    const toast = useToast()

    const totalWarga = residents.length
    const paidList = statusList.filter(r => r.isPaid)
    const unpaidList = statusList.filter(r => !r.isPaid)

    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
        return <Navigate to="/internet/admin/login" replace />
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="animate-pulse text-muted">Loading...</div>
            </div>
        )
    }

    const handleRefresh = () => {
        window.location.reload()
    }

    const handleExportPayments = () => {
        const paymentsWithResident = payments.map(p => ({
            ...p,
            resident: residents.find(r => r.id === p.resident_id)
        }))
        exportToExcel(paymentsWithResident, 'pembayaran', 'payments')
        toast.success('Data pembayaran berhasil di-export!')
    }

    const handleExportExpenses = () => {
        exportToExcel(expenses, 'pengeluaran', 'expenses')
        toast.success('Data pengeluaran berhasil di-export!')
    }

    const handleExportResidents = () => {
        exportToExcel(residents, 'data-warga', 'residents')
        toast.success('Data warga berhasil di-export!')
    }

    const handleBackup = () => {
        exportBackup(residents, payments, expenses)
        toast.success('Backup lengkap berhasil di-download!')
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'transparansi':
                return (
                    <div>
                        {/* Header with Period Picker */}
                        <div className="flex items-center justify-between mb-3" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                            <div>
                                <h2 style={{ marginBottom: 'var(--space-xs)' }}>Dashboard Transparansi</h2>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    Pantau status pembayaran dan keuangan real-time
                                </p>
                            </div>
                            <PeriodPicker
                                value={selectedPeriod}
                                onChange={setSelectedPeriod}
                            />
                        </div>

                        {/* Hero Stats */}
                        <HeroStats
                            saldo={saldo}
                            pemasukan={totalPemasukan}
                            pengeluaran={totalPengeluaran}
                            totalWarga={totalWarga}
                            sudahBayar={totalPaid}
                            belumBayar={totalUnpaid}
                            expenseList={expenses}
                            paymentList={payments}
                            paidList={paidList}
                            unpaidList={unpaidList}
                        />

                        {/* Progress & Trend Row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 'var(--space-lg)',
                            marginBottom: 'var(--space-xl)'
                        }}>
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
                                    {totalPaid} dari {totalWarga} warga sudah membayar
                                </p>
                            </div>
                            <TrendChart payments={payments} />
                        </div>

                        {/* Status Grid */}
                        <StatusGrid selectedPeriod={selectedPeriod} />
                    </div>
                )

            case 'payment':
                return (
                    <div>
                        <h2 className="mb-3">Input Pembayaran</h2>
                        <PaymentForm onSuccess={handleRefresh} />
                    </div>
                )

            case 'expense':
                return (
                    <div>
                        <h2 className="mb-3">Input Pengeluaran</h2>
                        <StarlinkReminder
                            expenses={expenses}
                            selectedPeriod={{ month: selectedPeriod.bulan, year: selectedPeriod.tahun }}
                            onRecordPayment={handleRefresh}
                        />
                        <ExpenseForm onSuccess={handleRefresh} expenses={allExpenses} />
                    </div>
                )

            case 'residents':
                return (
                    <div>
                        <h2 className="mb-3">Kelola Warga</h2>
                        <ResidentForm onSuccess={handleRefresh} />

                        {/* Residents List */}
                        <div className="card mt-3">
                            <div className="card-header">
                                <h3 className="card-title">
                                    <Users size={18} />
                                    Daftar Warga ({residents.length})
                                </h3>
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Blok</th>
                                            <th>Nama</th>
                                            <th>WhatsApp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {residents.map(r => (
                                            <tr key={r.id}>
                                                <td><strong>{r.blok_rumah}</strong></td>
                                                <td>{r.nama_warga}</td>
                                                <td className="text-muted">{r.no_whatsapp || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )

            case 'import':
                return (
                    <div>
                        <h2 className="mb-3">Import Data dari Excel</h2>
                        <ImportData onSuccess={handleRefresh} />
                    </div>
                )

            case 'reports':
                return (
                    <div>
                        <h2 className="mb-3">Laporan Keuangan</h2>
                        <FinancialReport />
                    </div>
                )

            case 'export':
                return (
                    <div>
                        <h2 className="mb-3">Export & Backup Data</h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: 'var(--space-lg)'
                        }}>
                            {/* Export Pembayaran */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <CreditCard size={18} />
                                        Data Pembayaran
                                    </h3>
                                </div>
                                <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                                    {payments.length} transaksi pembayaran
                                </p>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={handleExportPayments}
                                >
                                    <Download size={16} />
                                    Export Excel
                                </button>
                            </div>

                            {/* Export Pengeluaran */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <Receipt size={18} />
                                        Data Pengeluaran
                                    </h3>
                                </div>
                                <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                                    {expenses.length} transaksi pengeluaran
                                </p>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={handleExportExpenses}
                                >
                                    <Download size={16} />
                                    Export Excel
                                </button>
                            </div>

                            {/* Export Warga */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <Users size={18} />
                                        Data Warga
                                    </h3>
                                </div>
                                <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                                    {residents.length} warga terdaftar
                                </p>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    onClick={handleExportResidents}
                                >
                                    <Download size={16} />
                                    Export Excel
                                </button>
                            </div>

                            {/* Full Backup */}
                            <div className="card" style={{
                                background: 'linear-gradient(135deg, var(--bg-card), var(--bg-tertiary))',
                                border: '1px solid var(--color-primary)'
                            }}>
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <FileText size={18} />
                                        Backup Lengkap
                                    </h3>
                                </div>
                                <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                                    Semua data dalam format JSON
                                </p>
                                <button
                                    className="btn btn-success"
                                    style={{ width: '100%' }}
                                    onClick={handleBackup}
                                >
                                    <Download size={16} />
                                    Download Backup
                                </button>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="flex items-center justify-between">
                    <Link to="/internet" className="logo">
                        <img
                            src="/logo.png"
                            alt="Griya Sakinah"
                            style={{ height: '36px', width: 'auto' }}
                        />
                        <div>
                            <span className="logo-text" style={{ fontSize: '1rem' }}>Griya Sakinah</span>
                            <span className="logo-subtitle">Admin Panel</span>
                        </div>
                    </Link>

                    <button
                        className="btn btn-icon btn-secondary hidden-desktop"
                        onClick={() => setSidebarOpen(false)}
                        style={{ display: 'none' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {TABS.map(tab => (
                        <li key={tab.id}>
                            <a
                                href="#"
                                className={activeTab === tab.id ? 'active' : ''}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setActiveTab(tab.id)
                                    setSidebarOpen(false)
                                }}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </a>
                        </li>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-xl)' }}>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginBottom: 'var(--space-md)'
                    }}>
                        Logged in as:
                        <br />
                        <span style={{ color: 'var(--text-primary)' }}>{user?.email}</span>
                    </div>

                    {isSuperadmin && (
                        <Link
                            to="/admin/dashboard"
                            className="btn btn-primary"
                            style={{ width: '100%', marginBottom: 'var(--space-sm)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Home size={16} />
                            Admin Portal
                        </Link>
                    )}

                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                        onClick={signOut}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ padding: 'var(--space-lg)', overflowY: 'auto' }}>
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-3 mobile-header">
                    <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="logo">
                        <img
                            src="/logo.png"
                            alt="GS"
                            style={{ height: '32px', width: 'auto' }}
                        />
                        <span className="logo-text" style={{ fontSize: '1rem' }}>Admin</span>
                    </div>

                    <div style={{ width: '40px' }}></div>
                </div>

                {renderContent()}
            </main>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="modal-overlay"
                    style={{ background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <style>{`
                .mobile-header {
                    display: none;
                }
                
                @media (max-width: 768px) {
                    .admin-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .sidebar {
                        position: fixed;
                        left: -100%;
                        top: 0;
                        bottom: 0;
                        width: 280px;
                        z-index: 100;
                        transition: left 0.3s ease;
                    }
                    .sidebar.sidebar-open {
                        left: 0;
                    }
                    .hidden-desktop {
                        display: block !important;
                    }
                    .mobile-header {
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    )
}
