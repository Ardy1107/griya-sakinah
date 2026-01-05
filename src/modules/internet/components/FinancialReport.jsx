// Financial Report Component with Clickable Stats
import { useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, X, Calendar, User, Home, ChevronRight, Search, Download, Receipt } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useFinancialSummary } from '../hooks/useSupabase'
import { formatCurrency, groupPaymentsByMonth, groupExpensesByCategory, getMonthName } from '../utils/helpers'

export default function FinancialReport() {
    const { totalPemasukan, totalPengeluaran, saldo, payments, expenses } = useFinancialSummary()
    const [detailModal, setDetailModal] = useState(null) // 'pemasukan' | 'pengeluaran' | null
    const [searchTerm, setSearchTerm] = useState('')

    const paymentChartData = groupPaymentsByMonth(payments)
    const expenseChartData = groupExpensesByCategory(expenses)

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    // Group payments by month for detail view
    const paymentsByMonth = payments.reduce((acc, p) => {
        const key = `${p.bulan}-${p.tahun}`
        if (!acc[key]) acc[key] = { bulan: p.bulan, tahun: p.tahun, items: [], total: 0 }
        acc[key].items.push(p)
        acc[key].total += Number(p.nominal || 0)
        return acc
    }, {})

    // Group expenses by category for detail view
    const expensesByCategory = expenses.reduce((acc, e) => {
        const cat = e.kategori || 'Lainnya'
        if (!acc[cat]) acc[cat] = { kategori: cat, items: [], total: 0 }
        acc[cat].items.push(e)
        acc[cat].total += Number(e.nominal || 0)
        return acc
    }, {})

    // Filter payments by search term (Receipt Code)
    const searchResults = searchTerm.length >= 3
        ? payments.filter(p => p.nomor_referensi?.toLowerCase().includes(searchTerm.toLowerCase()))
        : []

    return (
        <div>
            {/* Search Kwitansi */}
            <div className="card mb-4" style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--color-primary)' }}>
                        <Receipt size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', margin: 0 }}>Cek Kwitansi Pembayaran</h3>
                        <p className="text-muted" style={{ fontSize: '0.8125rem', margin: '2px 0 0' }}>Cari berdasarkan nomor referensi atau kode kwitansi</p>
                    </div>
                </div>

                <div className="search-container mt-3">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Masukkan kode kwitansi (min. 3 karakter)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'var(--bg-secondary)' }}
                    />
                </div>

                {searchTerm.length >= 3 && (
                    <div className="mt-3">
                        {searchResults.length > 0 ? (
                            <div className="stat-detail-list">
                                {searchResults.map(p => (
                                    <div key={p.id} className="stat-detail-list-item paid" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--color-border)' }}>
                                        <div className="stat-detail-list-info">
                                            <span className="nama">{p.resident?.nama_warga || p.residents?.nama_warga || 'Warga'}</span>
                                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                {p.resident?.blok_rumah || p.residents?.blok_rumah || '-'} • {getMonthName(p.bulan)} {p.tahun}
                                            </span>
                                            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '4px', color: 'var(--color-primary)' }}>
                                                {p.nomor_referensi}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                                                {formatCurrency(p.nominal)}
                                            </span>
                                            {p.receipt_url_pdf && (
                                                <a href={p.receipt_url_pdf} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ padding: '2px 8px' }}>
                                                    <Download size={12} /> <span style={{ fontSize: '0.7rem' }}>PDF</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted py-3" style={{ fontSize: '0.875rem' }}>
                                Kwitansi dengan kode "{searchTerm}" tidak ditemukan.
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Stats Cards - Clickable */}
            <div className="stats-grid mb-4">
                <StatCard
                    icon={<Wallet size={24} />}
                    iconClass="primary"
                    label="Total Saldo"
                    value={formatCurrency(saldo)}
                    highlight
                />
                <StatCard
                    icon={<TrendingUp size={24} />}
                    iconClass="success"
                    label="Total Pemasukan"
                    value={formatCurrency(totalPemasukan)}
                    onClick={() => setDetailModal('pemasukan')}
                    clickable
                    count={payments.length}
                />
                <StatCard
                    icon={<TrendingDown size={24} />}
                    iconClass="danger"
                    label="Total Pengeluaran"
                    value={formatCurrency(totalPengeluaran)}
                    onClick={() => setDetailModal('pengeluaran')}
                    clickable
                    count={expenses.length}
                />
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                {/* Income Chart */}
                <div className="card">
                    <h3 className="card-title mb-3">
                        <TrendingUp size={18} />
                        Pemasukan per Bulan
                    </h3>
                    <div className="chart-container">
                        {paymentChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentChartData}>
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                        axisLine={{ stroke: 'var(--border-color)' }}
                                    />
                                    <YAxis
                                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                                        axisLine={{ stroke: 'var(--border-color)' }}
                                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)'
                                        }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                        formatter={(value) => [formatCurrency(value), 'Total']}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-muted" style={{ paddingTop: '100px' }}>
                                Belum ada data pemasukan
                            </div>
                        )}
                    </div>
                </div>

                {/* Expense Chart */}
                <div className="card">
                    <h3 className="card-title mb-3">
                        <PiggyBank size={18} />
                        Pengeluaran per Kategori
                    </h3>
                    <div className="chart-container">
                        {expenseChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={{ stroke: '#64748b' }}
                                    >
                                        {expenseChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)'
                                        }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                        formatter={(value) => [formatCurrency(value), 'Total']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-muted" style={{ paddingTop: '100px' }}>
                                Belum ada data pengeluaran
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal - Pemasukan */}
            {detailModal === 'pemasukan' && (
                <DetailModal
                    title="Detail Pemasukan"
                    subtitle={`${payments.length} transaksi • Total ${formatCurrency(totalPemasukan)}`}
                    onClose={() => setDetailModal(null)}
                    color="success"
                >
                    {Object.values(paymentsByMonth)
                        .sort((a, b) => (b.tahun * 12 + b.bulan) - (a.tahun * 12 + a.bulan))
                        .map(group => (
                            <div key={`${group.bulan}-${group.tahun}`} style={{ marginBottom: 'var(--space-lg)' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-sm) var(--space-md)',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--space-sm)'
                                }}>
                                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} />
                                        {getMonthName(group.bulan)} {group.tahun}
                                    </span>
                                    <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                                        {formatCurrency(group.total)}
                                    </span>
                                </div>
                                <div className="stat-detail-list mt-3">
                                    {group.items.map(p => (
                                        <div key={p.id} className="stat-detail-list-item paid" style={{ background: 'transparent', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--color-border)', borderRadius: 0 }}>
                                            <div className="stat-detail-list-info">
                                                <span className="nama">{p.resident?.nama_warga || p.residents?.nama_warga || 'Warga'}</span>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                    {p.resident?.blok_rumah || p.residents?.blok_rumah || '-'} • {p.tanggal_bayar ? new Date(p.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                                </span>
                                            </div>
                                            <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                                                {formatCurrency(p.nominal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </DetailModal>
            )}

            {/* Detail Modal - Pengeluaran */}
            {detailModal === 'pengeluaran' && (
                <DetailModal
                    title="Detail Pengeluaran"
                    subtitle={`${expenses.length} transaksi • Total ${formatCurrency(totalPengeluaran)}`}
                    onClose={() => setDetailModal(null)}
                    color="danger"
                >
                    {Object.values(expensesByCategory)
                        .sort((a, b) => b.total - a.total)
                        .map(group => (
                            <div key={group.kategori} style={{ marginBottom: 'var(--space-lg)' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-sm) var(--space-md)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--space-sm)'
                                }}>
                                    <span style={{ fontWeight: 600 }}>{group.kategori}</span>
                                    <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
                                        {formatCurrency(group.total)}
                                    </span>
                                </div>
                                <div className="stat-detail-list mt-3">
                                    {group.items.map(e => (
                                        <div key={e.id} className="stat-detail-list-item expense" style={{ background: 'transparent', padding: '8px 0', border: 'none', borderBottom: '1px solid var(--color-border)', borderRadius: 0 }}>
                                            <div className="stat-detail-list-info">
                                                <span className="nama">
                                                    {e.kategori === 'Bandwidth' ? 'Pembayaran ISP Starlink' : (e.keterangan || e.kategori)}
                                                </span>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                    {new Date(e.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
                                                {formatCurrency(e.nominal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </DetailModal>
            )}
        </div>
    )
}

// Stat Card Sub-component
function StatCard({ icon, iconClass, label, value, highlight, onClick, clickable, count }) {
    return (
        <div
            className="stat-card"
            onClick={onClick}
            style={{
                ...(highlight ? {
                    borderColor: 'var(--color-primary)',
                    boxShadow: 'var(--shadow-glow)'
                } : {}),
                ...(clickable ? { cursor: 'pointer', transition: 'transform 0.2s' } : {})
            }}
            onMouseEnter={(e) => clickable && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => clickable && (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <div className={`stat-icon ${iconClass}`}>
                {icon}
            </div>
            <div className="stat-content">
                <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {label}
                    {clickable && <ChevronRight size={12} />}
                </div>
                <div className="stat-value" style={highlight ? { color: 'var(--color-primary)' } : {}}>
                    {value}
                </div>
                {count !== undefined && (
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {count} transaksi
                    </div>
                )}
            </div>
        </div>
    )
}

// Detail Modal Component
function DetailModal({ title, subtitle, children, onClose, color }) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-lg)'
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-xl)',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-lg)',
                    borderBottom: '1px solid var(--color-border)',
                    background: color === 'success'
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent)'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent)'
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h3>
                        <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>{subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-icon"
                        style={{ background: 'transparent' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: 'var(--space-lg)',
                    maxHeight: 'calc(80vh - 100px)',
                    overflowY: 'auto'
                }}>
                    {children}
                </div>
            </div>
        </div>
    )
}
