// Admin Panel Page - Ultra Premium with Block Filter & Complete Bookkeeping
import { useState, useMemo, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from '../config/supabase'
import {
    Home, CreditCard, Receipt, Users, BarChart3,
    LogOut, Menu, X, Eye, Download, FileText, BookOpen,
    Filter, ChevronDown, Shield, Settings, Moon, Sun,
    TrendingUp, TrendingDown, Wallet, Search, Trash2, Edit3,
    CheckCircle, XCircle, AlertTriangle, RefreshCw, Key, EyeOff
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { usePaymentStatus, useFinancialSummary, useResidents, usePayments, useExpenses, useAdminOperations } from '../hooks/useSupabase'
import { useBlock } from '../context/BlockContext'
import { useTheme } from '../context/ThemeContext'
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
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'
import { getMonthName, formatCurrency, formatDate } from '../utils/helpers'
import { exportToExcel, exportBackup } from '../utils/export'
import { getBlockConfig } from '../config/blockConfig'

const TABS = [
    { id: 'transparansi', label: 'Transparansi', icon: Eye, group: 'main' },
    { id: 'bukukas', label: 'Buku Kas', icon: BookOpen, group: 'main' },
    { id: 'payment', label: 'Input Bayar', icon: CreditCard, group: 'kelola' },
    { id: 'expense', label: 'Pengeluaran', icon: Receipt, group: 'kelola' },
    { id: 'residents', label: 'Data Warga', icon: Users, group: 'kelola' },
    { id: 'import', label: 'Import Data', icon: FileText, group: 'tools' },
    { id: 'reports', label: 'Laporan', icon: BarChart3, group: 'tools' },
    { id: 'export', label: 'Export Data', icon: Download, group: 'tools' },
    { id: 'settings', label: 'Pengaturan PIN', icon: Key, group: 'tools' }
]

const TAB_GROUPS = [
    { id: 'main', label: 'DASHBOARD' },
    { id: 'kelola', label: 'KELOLA DATA' },
    { id: 'tools', label: 'TOOLS' }
]

export default function AdminPanel() {
    const { user, loading, signOut, isAuthenticated, isSuperadmin } = useAuth()
    const { blockId, blockName, urlPrefix, isBlockSpecific } = useBlock()
    const { theme, toggleTheme } = useTheme()
    const [activeTab, setActiveTab] = useState('transparansi')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [adminBlockFilter, setAdminBlockFilter] = useState('all') // 'all', 'A', 'B'
    const [showBlockDropdown, setShowBlockDropdown] = useState(false)
    const [selectedPeriod, setSelectedPeriod] = useState(() => {
        const now = new Date()
        return { bulan: now.getMonth() + 1, tahun: now.getFullYear() }
    })

    const { totalPaid, totalUnpaid, statusList } = usePaymentStatus(selectedPeriod.bulan, selectedPeriod.tahun)
    const { totalPemasukan, totalPengeluaran, saldo, payments, expenses } = useFinancialSummary(selectedPeriod.bulan, selectedPeriod.tahun)
    const { residents, refetch: refetchResidents } = useResidents()
    const { expenses: allExpenses } = useExpenses()
    const { deletePayment, deleteExpense } = useAdminOperations()
    const toast = useToast()

    // Filter data by admin block filter (for admin view only — beyond BlockContext)
    const filteredResidents = useMemo(() => {
        if (adminBlockFilter === 'all') return residents
        return residents.filter(r => r.blok_rumah?.charAt(0)?.toUpperCase() === adminBlockFilter)
    }, [residents, adminBlockFilter])

    const filteredPayments = useMemo(() => {
        if (adminBlockFilter === 'all') return payments
        return payments.filter(p => {
            const block = p.resident?.blok_rumah?.charAt(0)?.toUpperCase()
            return block === adminBlockFilter
        })
    }, [payments, adminBlockFilter])

    const filteredExpenses = useMemo(() => {
        if (adminBlockFilter === 'all') return expenses
        return expenses.filter(e => {
            if (e.block_id) return e.block_id === adminBlockFilter
            return true
        })
    }, [expenses, adminBlockFilter])

    const filteredStatusList = useMemo(() => {
        if (adminBlockFilter === 'all') return statusList
        return statusList.filter(r => r.blok_rumah?.charAt(0)?.toUpperCase() === adminBlockFilter)
    }, [statusList, adminBlockFilter])

    const filteredTotalPaid = filteredStatusList.filter(r => r.isPaid).length
    const filteredTotalUnpaid = filteredStatusList.filter(r => !r.isPaid).length
    const filteredPemasukan = filteredPayments.reduce((sum, p) => sum + Number(p.nominal || 0), 0)
    const filteredPengeluaran = filteredExpenses.reduce((sum, e) => sum + Number(e.nominal || 0), 0)
    const filteredSaldo = filteredPemasukan - filteredPengeluaran

    const totalWarga = filteredResidents.length
    const paidList = filteredStatusList.filter(r => r.isPaid)
    const unpaidList = filteredStatusList.filter(r => !r.isPaid)

    // Auth guard
    if (!loading && !isAuthenticated) {
        return <Navigate to={`${urlPrefix}/admin/login`} replace />
    }

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-spinner" />
                <p>Memuat panel admin...</p>
            </div>
        )
    }

    const handleRefresh = () => window.location.reload()

    const handleExportPayments = () => {
        const data = filteredPayments.map(p => ({
            ...p,
            resident: residents.find(r => r.id === p.resident_id)
        }))
        exportToExcel(data, `pembayaran${adminBlockFilter !== 'all' ? `-blok-${adminBlockFilter}` : ''}`, 'payments')
        toast.success('Data pembayaran berhasil di-export!')
    }

    const handleExportExpenses = () => {
        exportToExcel(filteredExpenses, `pengeluaran${adminBlockFilter !== 'all' ? `-blok-${adminBlockFilter}` : ''}`, 'expenses')
        toast.success('Data pengeluaran berhasil di-export!')
    }

    const handleExportResidents = () => {
        exportToExcel(filteredResidents, `data-warga${adminBlockFilter !== 'all' ? `-blok-${adminBlockFilter}` : ''}`, 'residents')
        toast.success('Data warga berhasil di-export!')
    }

    const handleBackup = () => {
        exportBackup(residents, payments, expenses)
        toast.success('Backup lengkap berhasil di-download!')
    }

    // Block filter label
    const getBlockFilterLabel = () => {
        if (adminBlockFilter === 'all') return 'Semua Blok'
        return `Blok ${adminBlockFilter}`
    }

    const getBlockFilterColor = () => {
        if (adminBlockFilter === 'A') return '#10b981'
        if (adminBlockFilter === 'B') return '#3b82f6'
        return 'var(--text-secondary)'
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'transparansi':
                return (
                    <div>
                        <div className="admin-section-header">
                            <div>
                                <h2 className="admin-section-title">Dashboard Transparansi</h2>
                                <p className="admin-section-subtitle">
                                    Pantau status pembayaran dan keuangan real-time — {getBlockFilterLabel()}
                                </p>
                            </div>
                            <PeriodPicker value={selectedPeriod} onChange={setSelectedPeriod} />
                        </div>

                        <HeroStats
                            saldo={filteredSaldo}
                            pemasukan={filteredPemasukan}
                            pengeluaran={filteredPengeluaran}
                            totalWarga={totalWarga}
                            sudahBayar={filteredTotalPaid}
                            belumBayar={filteredTotalUnpaid}
                            expenseList={filteredExpenses}
                            paymentList={filteredPayments}
                            paidList={paidList}
                            unpaidList={unpaidList}
                        />

                        <div className="dashboard-grid-2">
                            <div className="card">
                                <h3 className="card-title mb-3">
                                    Pembayaran {getMonthName(selectedPeriod.bulan)} {selectedPeriod.tahun}
                                </h3>
                                <ProgressBar
                                    value={filteredTotalPaid}
                                    max={totalWarga || 1}
                                    label="Progress Pembayaran"
                                    variant="auto"
                                />
                                <p className="text-muted mt-2" style={{ fontSize: '0.875rem' }}>
                                    {filteredTotalPaid} dari {totalWarga} warga sudah membayar
                                </p>
                            </div>
                            <TrendChart payments={filteredPayments} />
                        </div>

                        <StatusGrid selectedPeriod={selectedPeriod} />
                    </div>
                )

            case 'bukukas':
                return <BukuKasTab
                    payments={filteredPayments}
                    expenses={filteredExpenses}
                    residents={residents}
                    selectedPeriod={selectedPeriod}
                    onPeriodChange={setSelectedPeriod}
                    blockFilter={adminBlockFilter}
                    onDeletePayment={async (id) => {
                        try {
                            await deletePayment(id)
                            toast.success('Pembayaran berhasil dihapus')
                            handleRefresh()
                        } catch (e) {
                            toast.error('Gagal menghapus: ' + e.message)
                        }
                    }}
                    onDeleteExpense={async (id) => {
                        try {
                            await deleteExpense(id)
                            toast.success('Pengeluaran berhasil dihapus')
                            handleRefresh()
                        } catch (e) {
                            toast.error('Gagal menghapus: ' + e.message)
                        }
                    }}
                />

            case 'payment':
                return (
                    <div>
                        <div className="admin-section-header">
                            <div>
                                <h2 className="admin-section-title">Input Pembayaran</h2>
                                <p className="admin-section-subtitle">Catat pembayaran iuran internet warga</p>
                            </div>
                        </div>
                        <PaymentForm onSuccess={handleRefresh} />
                    </div>
                )

            case 'expense':
                return (
                    <div>
                        <div className="admin-section-header">
                            <div>
                                <h2 className="admin-section-title">Input Pengeluaran</h2>
                                <p className="admin-section-subtitle">Catat pengeluaran operasional internet</p>
                            </div>
                        </div>
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
                        <div className="admin-section-header">
                            <div>
                                <h2 className="admin-section-title">Kelola Data Warga</h2>
                                <p className="admin-section-subtitle">
                                    {totalWarga} warga terdaftar — {getBlockFilterLabel()}
                                </p>
                            </div>
                        </div>
                        <ResidentForm onSuccess={handleRefresh} />
                        <ResidentListAdmin residents={filteredResidents} />
                    </div>
                )

            case 'import':
                return (
                    <div>
                        <div className="admin-section-header">
                            <div>
                                <h2 className="admin-section-title">Import Data dari Excel</h2>
                                <p className="admin-section-subtitle">Upload file Excel untuk import data warga atau pembayaran</p>
                            </div>
                        </div>
                        <ImportData onSuccess={handleRefresh} />
                    </div>
                )

            case 'reports':
                return (
                    <div>
                        <div className="admin-section-header">
                            <div>
                                <h2 className="admin-section-title">Laporan Keuangan</h2>
                                <p className="admin-section-subtitle">Rekap dan analisa keuangan internet — {getBlockFilterLabel()}</p>
                            </div>
                        </div>
                        <FinancialReport />
                    </div>
                )

            case 'export':
                return (
                    <div>
                        <div className="admin-section-header">
                            <div>
                                <h2 className="admin-section-title">Export & Backup Data</h2>
                                <p className="admin-section-subtitle">Download data dalam format Excel atau JSON</p>
                            </div>
                        </div>
                        <div className="admin-export-grid">
                            <ExportCard
                                icon={<CreditCard size={22} />}
                                title="Data Pembayaran"
                                desc={`${filteredPayments.length} transaksi`}
                                onClick={handleExportPayments}
                                color="#10b981"
                            />
                            <ExportCard
                                icon={<Receipt size={22} />}
                                title="Data Pengeluaran"
                                desc={`${filteredExpenses.length} transaksi`}
                                onClick={handleExportExpenses}
                                color="#f59e0b"
                            />
                            <ExportCard
                                icon={<Users size={22} />}
                                title="Data Warga"
                                desc={`${filteredResidents.length} warga`}
                                onClick={handleExportResidents}
                                color="#3b82f6"
                            />
                            <ExportCard
                                icon={<FileText size={22} />}
                                title="Backup Lengkap"
                                desc="Semua data (JSON)"
                                onClick={handleBackup}
                                color="#8b5cf6"
                                highlight
                            />
                        </div>
                    </div>
                )

            case 'settings':
                return <PinSettings />

            default:
                return null
        }
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                {/* Sidebar Header */}
                <div className="admin-sidebar-header">
                    <Link to={urlPrefix} className="admin-sidebar-brand">
                        <div className="admin-sidebar-logo-icon">
                            <Shield size={20} />
                        </div>
                        <div>
                            <span className="admin-sidebar-brand-name">Admin Panel</span>
                            <span className="admin-sidebar-brand-sub">Internet Sakinah</span>
                        </div>
                    </Link>
                    <button
                        className="admin-sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Block Filter */}
                <div className="admin-block-filter">
                    <div
                        className="admin-block-filter-btn"
                        onClick={() => setShowBlockDropdown(!showBlockDropdown)}
                    >
                        <Filter size={14} />
                        <span style={{ color: getBlockFilterColor(), fontWeight: 700 }}>
                            {getBlockFilterLabel()}
                        </span>
                        <ChevronDown size={14} className={`admin-block-chevron ${showBlockDropdown ? 'open' : ''}`} />
                    </div>

                    {showBlockDropdown && (
                        <div className="admin-block-dropdown">
                            {[
                                { value: 'all', label: 'Semua Blok', color: 'var(--text-secondary)' },
                                { value: 'A', label: 'Blok A', color: '#10b981' },
                                { value: 'B', label: 'Blok B', color: '#3b82f6' }
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    className={`admin-block-option ${adminBlockFilter === opt.value ? 'active' : ''}`}
                                    onClick={() => {
                                        setAdminBlockFilter(opt.value)
                                        setShowBlockDropdown(false)
                                    }}
                                >
                                    <span className="admin-block-option-dot" style={{ background: opt.color }} />
                                    {opt.label}
                                    {adminBlockFilter === opt.value && <CheckCircle size={14} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="admin-sidebar-nav">
                    {TAB_GROUPS.map(group => (
                        <div key={group.id} className="admin-nav-group">
                            <span className="admin-nav-group-label">{group.label}</span>
                            {TABS.filter(t => t.group === group.id).map(tab => (
                                <a
                                    key={tab.id}
                                    href="#"
                                    className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setActiveTab(tab.id)
                                        setSidebarOpen(false)
                                    }}
                                >
                                    <tab.icon size={18} />
                                    <span>{tab.label}</span>
                                </a>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="admin-sidebar-footer">
                    <div className="admin-sidebar-user">
                        <div className="admin-sidebar-user-avatar">
                            <Shield size={16} />
                        </div>
                        <div className="admin-sidebar-user-info">
                            <span className="admin-sidebar-user-name">Admin</span>
                            <span className="admin-sidebar-user-email">{user?.email || 'superadmin'}</span>
                        </div>
                    </div>

                    <div className="admin-sidebar-actions">
                        <button className="admin-sidebar-action-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}>
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        {isSuperadmin && (
                            <Link to="/admin/dashboard" className="admin-sidebar-action-btn" title="Portal Superadmin">
                                <Settings size={16} />
                            </Link>
                        )}

                        <button className="admin-sidebar-action-btn logout" onClick={signOut} title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Mobile Top Bar */}
                <div className="admin-topbar">
                    <button className="admin-topbar-menu" onClick={() => setSidebarOpen(true)}>
                        <Menu size={22} />
                    </button>
                    <div className="admin-topbar-title">
                        <Shield size={18} />
                        <span>Admin Panel</span>
                    </div>
                    <button className="admin-topbar-theme" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>

                {/* Content */}
                <div className="admin-content">
                    {renderContent()}
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="admin-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}

// ─── Buku Kas Tab ────────────────────────────────────
function BukuKasTab({ payments, expenses, residents, selectedPeriod, onPeriodChange, blockFilter, onDeletePayment, onDeleteExpense }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [confirmDelete, setConfirmDelete] = useState(null)

    // Combine payments and expenses into one ledger
    const ledgerEntries = useMemo(() => {
        const entries = []

        payments.forEach(p => {
            const resident = p.resident || residents.find(r => r.id === p.resident_id)
            entries.push({
                id: p.id,
                type: 'masuk',
                tanggal: p.tanggal_bayar,
                keterangan: `Iuran Internet — ${resident?.nama_warga || 'Warga'} (${resident?.blok_rumah || '-'})`,
                debit: Number(p.nominal || 0),
                kredit: 0,
                kategori: 'Iuran',
                source: 'payment'
            })
        })

        expenses.forEach(e => {
            entries.push({
                id: e.id,
                type: 'keluar',
                tanggal: e.tanggal,
                keterangan: e.keterangan || e.kategori || 'Pengeluaran',
                debit: 0,
                kredit: Number(e.nominal || 0),
                kategori: e.kategori,
                source: 'expense'
            })
        })

        // Sort by date
        entries.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))

        // Calculate running balance
        let balance = 0
        entries.forEach(entry => {
            balance += entry.debit - entry.kredit
            entry.saldo = balance
        })

        return entries
    }, [payments, expenses, residents])

    // Filter
    const filteredEntries = useMemo(() => {
        if (!searchTerm) return ledgerEntries
        const term = searchTerm.toLowerCase()
        return ledgerEntries.filter(e =>
            e.keterangan.toLowerCase().includes(term) ||
            e.kategori?.toLowerCase().includes(term)
        )
    }, [ledgerEntries, searchTerm])

    const totalDebit = filteredEntries.reduce((s, e) => s + e.debit, 0)
    const totalKredit = filteredEntries.reduce((s, e) => s + e.kredit, 0)
    const finalSaldo = totalDebit - totalKredit

    const handleDeleteConfirm = async () => {
        if (!confirmDelete) return
        if (confirmDelete.source === 'payment') {
            await onDeletePayment(confirmDelete.id)
        } else {
            await onDeleteExpense(confirmDelete.id)
        }
        setConfirmDelete(null)
    }

    return (
        <div>
            <div className="admin-section-header">
                <div>
                    <h2 className="admin-section-title">📒 Buku Kas</h2>
                    <p className="admin-section-subtitle">
                        Catatan lengkap uang masuk & keluar — {getMonthName(selectedPeriod.bulan)} {selectedPeriod.tahun}
                    </p>
                </div>
                <PeriodPicker value={selectedPeriod} onChange={onPeriodChange} />
            </div>

            {/* Summary Cards */}
            <div className="bukukas-summary">
                <div className="bukukas-summary-card masuk">
                    <TrendingUp size={20} />
                    <div>
                        <span className="bukukas-summary-label">Total Masuk</span>
                        <span className="bukukas-summary-value">{formatCurrency(totalDebit)}</span>
                    </div>
                </div>
                <div className="bukukas-summary-card keluar">
                    <TrendingDown size={20} />
                    <div>
                        <span className="bukukas-summary-label">Total Keluar</span>
                        <span className="bukukas-summary-value">{formatCurrency(totalKredit)}</span>
                    </div>
                </div>
                <div className="bukukas-summary-card saldo">
                    <Wallet size={20} />
                    <div>
                        <span className="bukukas-summary-label">Saldo</span>
                        <span className="bukukas-summary-value">{formatCurrency(finalSaldo)}</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bukukas-search">
                <Search size={16} />
                <input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Ledger Table */}
            {filteredEntries.length === 0 ? (
                <div className="bukukas-empty">
                    <BookOpen size={40} />
                    <p>Belum ada transaksi di periode ini</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="bukukas-table-wrapper">
                        <table className="bukukas-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Tanggal</th>
                                    <th>Keterangan</th>
                                    <th className="text-right">Debit (Masuk)</th>
                                    <th className="text-right">Kredit (Keluar)</th>
                                    <th className="text-right">Saldo</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry, idx) => (
                                    <tr key={`${entry.source}-${entry.id}`} className={entry.type === 'masuk' ? 'row-masuk' : 'row-keluar'}>
                                        <td className="text-muted">{idx + 1}</td>
                                        <td className="bukukas-date">{formatDate(entry.tanggal)}</td>
                                        <td>
                                            <div className="bukukas-ket">
                                                <span className={`bukukas-badge ${entry.type}`}>
                                                    {entry.type === 'masuk' ? '↑' : '↓'}
                                                </span>
                                                <span>{entry.keterangan}</span>
                                            </div>
                                        </td>
                                        <td className="text-right text-success" style={{ fontWeight: entry.debit ? 700 : 400 }}>
                                            {entry.debit ? formatCurrency(entry.debit) : '-'}
                                        </td>
                                        <td className="text-right text-danger" style={{ fontWeight: entry.kredit ? 700 : 400 }}>
                                            {entry.kredit ? formatCurrency(entry.kredit) : '-'}
                                        </td>
                                        <td className="text-right" style={{ fontWeight: 700, color: entry.saldo >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                            {formatCurrency(entry.saldo)}
                                        </td>
                                        <td>
                                            <button
                                                className="bukukas-delete-btn"
                                                onClick={() => setConfirmDelete(entry)}
                                                title="Hapus"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} style={{ fontWeight: 700 }}>TOTAL</td>
                                    <td className="text-right text-success" style={{ fontWeight: 800 }}>{formatCurrency(totalDebit)}</td>
                                    <td className="text-right text-danger" style={{ fontWeight: 800 }}>{formatCurrency(totalKredit)}</td>
                                    <td className="text-right" style={{ fontWeight: 800, color: finalSaldo >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {formatCurrency(finalSaldo)}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="bukukas-mobile-list">
                        {filteredEntries.map((entry, idx) => (
                            <div key={`${entry.source}-${entry.id}-m`} className={`bukukas-mobile-item ${entry.type}`}>
                                <div className="bukukas-mobile-top">
                                    <span className={`bukukas-badge ${entry.type}`}>
                                        {entry.type === 'masuk' ? '↑ Masuk' : '↓ Keluar'}
                                    </span>
                                    <span className="bukukas-mobile-date">{formatDate(entry.tanggal)}</span>
                                </div>
                                <p className="bukukas-mobile-ket">{entry.keterangan}</p>
                                <div className="bukukas-mobile-bottom">
                                    <span className={`bukukas-mobile-amount ${entry.type}`}>
                                        {entry.type === 'masuk' ? '+' : '-'}{formatCurrency(entry.type === 'masuk' ? entry.debit : entry.kredit)}
                                    </span>
                                    <button
                                        className="bukukas-delete-btn"
                                        onClick={() => setConfirmDelete(entry)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Delete Confirmation */}
            {confirmDelete && (
                <ConfirmModal
                    title="Hapus Transaksi?"
                    message={`Yakin ingin menghapus "${confirmDelete.keterangan}"? Aksi ini tidak bisa dibatalkan.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}
        </div>
    )
}

// ─── Resident List for Admin ────────────────────────
function ResidentListAdmin({ residents }) {
    const [searchTerm, setSearchTerm] = useState('')

    const filtered = useMemo(() => {
        if (!searchTerm) return residents
        const term = searchTerm.toLowerCase()
        return residents.filter(r =>
            r.blok_rumah?.toLowerCase().includes(term) ||
            r.nama_warga?.toLowerCase().includes(term) ||
            r.no_whatsapp?.includes(term)
        )
    }, [residents, searchTerm])

    return (
        <div className="card mt-3">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <h3 className="card-title">
                    <Users size={18} />
                    Daftar Warga ({filtered.length})
                </h3>
                <div className="bukukas-search" style={{ margin: 0, maxWidth: '240px' }}>
                    <Search size={14} />
                    <input
                        type="text"
                        placeholder="Cari warga..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                    />
                </div>
            </div>

            <div className="admin-resident-list">
                {filtered.map(r => {
                    const blockChar = r.blok_rumah?.charAt(0)?.toUpperCase()
                    const blockColor = blockChar === 'A' ? '#10b981' : blockChar === 'B' ? '#3b82f6' : 'var(--text-muted)'

                    return (
                        <div key={r.id} className="admin-resident-item">
                            <div className="admin-resident-avatar" style={{ background: `${blockColor}20`, color: blockColor }}>
                                {blockChar || '?'}
                            </div>
                            <div className="admin-resident-info">
                                <span className="admin-resident-blok" style={{ color: blockColor }}>{r.blok_rumah}</span>
                                <span className="admin-resident-name">{r.nama_warga}</span>
                            </div>
                            <span className="admin-resident-phone">{r.no_whatsapp || '-'}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── PIN Settings Component ──────────────────────
function PinSettings() {
    const [pinA, setPinA] = useState('')
    const [pinB, setPinB] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPinA, setShowPinA] = useState(false)
    const [showPinB, setShowPinB] = useState(false)
    const [message, setMessage] = useState(null)

    useEffect(() => {
        loadPins()
    }, [])

    async function loadPins() {
        if (!supabase) return
        setLoading(true)
        try {
            const { data: dataA } = await supabase
                .from('internet_settings')
                .select('value')
                .eq('key', 'pin_blok_a')
                .single()
            const { data: dataB } = await supabase
                .from('internet_settings')
                .select('value')
                .eq('key', 'pin_blok_b')
                .single()
            if (dataA) setPinA(dataA.value)
            if (dataB) setPinB(dataB.value)
        } catch (err) {
            console.error('Error loading PINs:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        if (!supabase) return
        if (pinA.length < 4 || pinB.length < 4) {
            setMessage({ type: 'error', text: 'PIN harus minimal 4 digit' })
            return
        }
        setSaving(true)
        setMessage(null)
        try {
            await supabase
                .from('internet_settings')
                .upsert({ key: 'pin_blok_a', value: pinA, updated_at: new Date().toISOString() })
            await supabase
                .from('internet_settings')
                .upsert({ key: 'pin_blok_b', value: pinB, updated_at: new Date().toISOString() })
            setMessage({ type: 'success', text: '✅ PIN berhasil disimpan!' })
        } catch (err) {
            setMessage({ type: 'error', text: '❌ Gagal menyimpan: ' + err.message })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <div className="admin-section-header">
                <div>
                    <h2 className="admin-section-title">Pengaturan Kode Akses</h2>
                    <p className="admin-section-subtitle">
                        Atur kode PIN yang digunakan warga untuk mengakses dashboard blok masing-masing
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="admin-loading">
                    <div className="admin-loading-spinner" />
                    <p>Memuat pengaturan...</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    <div style={{ display: 'grid', gap: '24px', maxWidth: '400px' }}>
                        {/* PIN Blok A */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: 'var(--text-secondary)',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                🔵 Kode Akses Blok A
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPinA ? 'text' : 'password'}
                                    value={pinA}
                                    onChange={e => setPinA(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Masukkan PIN (4-6 digit)"
                                    style={{
                                        width: '100%',
                                        padding: '14px 48px 14px 16px',
                                        borderRadius: '12px',
                                        border: '2px solid var(--border-color)',
                                        background: 'var(--bg-tertiary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1.1rem',
                                        fontFamily: 'var(--font-mono)',
                                        letterSpacing: '4px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPinA(!showPinA)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    {showPinA ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* PIN Blok B */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: 'var(--text-secondary)',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                🟢 Kode Akses Blok B
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPinB ? 'text' : 'password'}
                                    value={pinB}
                                    onChange={e => setPinB(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Masukkan PIN (4-6 digit)"
                                    style={{
                                        width: '100%',
                                        padding: '14px 48px 14px 16px',
                                        borderRadius: '12px',
                                        border: '2px solid var(--border-color)',
                                        background: 'var(--bg-tertiary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '1.1rem',
                                        fontFamily: 'var(--font-mono)',
                                        letterSpacing: '4px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPinB(!showPinB)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '4px'
                                    }}
                                >
                                    {showPinB ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Message */}
                        {message && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                background: message.type === 'success'
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'rgba(239, 68, 68, 0.1)',
                                color: message.type === 'success' ? '#10b981' : '#ef4444'
                            }}>
                                {message.text}
                            </div>
                        )}

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                padding: '14px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: 'white',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontFamily: 'var(--font-sans)',
                                opacity: saving ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Key size={16} />
                            {saving ? 'Menyimpan...' : 'Simpan Kode Akses'}
                        </button>

                        {/* Info */}
                        <div style={{
                            padding: '14px 16px',
                            borderRadius: '10px',
                            background: 'var(--bg-tertiary)',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.6
                        }}>
                            <strong>ℹ️ Informasi:</strong><br />
                            • Kode akses digunakan warga untuk masuk ke dashboard blok mereka<br />
                            • Bagikan kode hanya ke warga blok terkait melalui grup WhatsApp<br />
                            • Setelah warga memasukkan kode 1 kali, kode akan tersimpan di HP mereka<br />
                            • Jika Anda mengubah kode, warga harus memasukkan kode baru saat berikutnya
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


// ─── Export Card ──────────────────────────────────
function ExportCard({ icon, title, desc, onClick, color, highlight }) {
    return (
        <div
            className={`admin-export-card ${highlight ? 'highlight' : ''}`}
            style={{ '--export-color': color }}
        >
            <div className="admin-export-card-icon" style={{ background: `${color}15`, color }}>
                {icon}
            </div>
            <div className="admin-export-card-info">
                <span className="admin-export-card-title">{title}</span>
                <span className="admin-export-card-desc">{desc}</span>
            </div>
            <button className="admin-export-card-btn" onClick={onClick}>
                <Download size={16} />
                Export
            </button>
        </div>
    )
}
