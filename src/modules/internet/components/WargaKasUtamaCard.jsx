// WargaKasUtamaCard - Period-Aware Running Cash Balance for Residents with Transparency Modal
import { useState, useMemo, useEffect, useRef } from 'react'
import { Landmark, TrendingUp, TrendingDown, ChevronRight, X, Calendar, Receipt, Users, Info, ShieldCheck, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react'
import { formatCurrency, getMonthName, formatDate } from '../utils/helpers'

// Animated Counter for smooth numbers
function AnimatedCounter({ value, duration = 800, prefix = 'Rp ' }) {
    const [display, setDisplay] = useState(value)
    const rafRef = useRef(null)

    useEffect(() => {
        const start = display
        const diff = value - start
        if (diff === 0) return

        const startTime = performance.now()

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(start + diff * eased))

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate)
            }
        }

        rafRef.current = requestAnimationFrame(animate)
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [value, duration])

    return (
        <span>
            {prefix}{display.toLocaleString('id-ID')}
        </span>
    )
}

export default function WargaKasUtamaCard({
    selectedPeriod,
    blockId = 'A',
    allPayments = [],
    allExpenses = [],
    allOtherIncomes = [],
    saldoAwal = 0,
    loading = false
}) {
    const [showModal, setShowModal] = useState(false)
    const [activeTab, setActiveTab] = useState('pengeluaran') // 'pengeluaran' | 'pemasukan' | 'rekap'

    const targetBulan = selectedPeriod?.bulan || (new Date().getMonth() + 1)
    const targetTahun = selectedPeriod?.tahun || new Date().getFullYear()
    const monthLabel = `${getMonthName(targetBulan)} ${targetTahun}`

    // Effective initial balance
    const effectiveSaldoAwal = typeof saldoAwal === 'number' ? saldoAwal : 0

    // Filter data for this block
    const blockPayments = useMemo(() => {
        return allPayments.filter(p => {
            const b = p.resident?.blok_rumah?.charAt(0)?.toUpperCase()
            return !blockId || b === blockId
        })
    }, [allPayments, blockId])

    const blockExpenses = useMemo(() => {
        return allExpenses.filter(e => {
            if (e.block_id) return e.block_id === blockId
            return !blockId
        })
    }, [allExpenses, blockId])

    const blockOtherIncomes = useMemo(() => {
        return allOtherIncomes.filter(o => {
            if (o.block_id) return o.block_id === blockId
            return !blockId
        })
    }, [allOtherIncomes, blockId])

    // 1. Current Month transactions (Bulan yang dipilih)
    const currentMonthPayments = useMemo(() => {
        return blockPayments.filter(p => p.tahun === targetTahun && p.bulan === targetBulan)
    }, [blockPayments, targetTahun, targetBulan])

    const currentMonthExpenses = useMemo(() => {
        return blockExpenses.filter(e => {
            const d = new Date(e.tanggal)
            return d.getFullYear() === targetTahun && (d.getMonth() + 1) === targetBulan
        })
    }, [blockExpenses, targetTahun, targetBulan])

    const currentMonthOtherIncomes = useMemo(() => {
        return blockOtherIncomes.filter(o => {
            const d = new Date(o.tanggal)
            return d.getFullYear() === targetTahun && (d.getMonth() + 1) === targetBulan
        })
    }, [blockOtherIncomes, targetTahun, targetBulan])

    const monthIuran = currentMonthPayments.reduce((sum, p) => sum + Number(p.nominal || 0), 0)
    const monthPemasukanLain = currentMonthOtherIncomes.reduce((sum, o) => sum + Number(o.nominal || 0), 0)
    const monthPemasukan = monthIuran + monthPemasukanLain
    const monthPengeluaran = currentMonthExpenses.reduce((sum, e) => sum + Number(e.nominal || 0), 0)
    const monthSurplus = monthPemasukan - monthPengeluaran

    // 2. Cumulative Running Balance up to end of selected period
    const runningKasUtama = useMemo(() => {
        // Payments up to target month/year
        const cumPayments = blockPayments.filter(p => {
            if (p.tahun < targetTahun) return true
            if (p.tahun === targetTahun && p.bulan <= targetBulan) return true
            return false
        }).reduce((sum, p) => sum + Number(p.nominal || 0), 0)

        // Other Incomes up to target month/year
        const cumOther = blockOtherIncomes.filter(o => {
            const d = new Date(o.tanggal)
            const y = d.getFullYear()
            const m = d.getMonth() + 1
            if (y < targetTahun) return true
            if (y === targetTahun && m <= targetBulan) return true
            return false
        }).reduce((sum, o) => sum + Number(o.nominal || 0), 0)

        // Expenses up to target month/year
        const cumExpenses = blockExpenses.filter(e => {
            const d = new Date(e.tanggal)
            const y = d.getFullYear()
            const m = d.getMonth() + 1
            if (y < targetTahun) return true
            if (y === targetTahun && m <= targetBulan) return true
            return false
        }).reduce((sum, e) => sum + Number(e.nominal || 0), 0)

        return effectiveSaldoAwal + cumPayments + cumOther - cumExpenses
    }, [blockPayments, blockOtherIncomes, blockExpenses, targetTahun, targetBulan, effectiveSaldoAwal])

    // Monthly breakdown history (all-time trajectory)
    const monthlyHistory = useMemo(() => {
        const map = {}

        blockPayments.forEach(p => {
            const key = `${p.tahun}-${String(p.bulan).padStart(2, '0')}`
            if (!map[key]) map[key] = { bulan: p.bulan, tahun: p.tahun, masuk: 0, keluar: 0 }
            map[key].masuk += Number(p.nominal || 0)
        })

        blockOtherIncomes.forEach(o => {
            const d = new Date(o.tanggal)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            if (!map[key]) map[key] = { bulan: d.getMonth() + 1, tahun: d.getFullYear(), masuk: 0, keluar: 0 }
            map[key].masuk += Number(o.nominal || 0)
        })

        blockExpenses.forEach(e => {
            const d = new Date(e.tanggal)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            if (!map[key]) map[key] = { bulan: d.getMonth() + 1, tahun: d.getFullYear(), masuk: 0, keluar: 0 }
            map[key].keluar += Number(e.nominal || 0)
        })

        const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
        let runningBalance = effectiveSaldoAwal
        return sorted.map(([key, data]) => {
            runningBalance += data.masuk - data.keluar
            return { ...data, key, saldo: runningBalance }
        })
    }, [blockPayments, blockOtherIncomes, blockExpenses, effectiveSaldoAwal])

    const isBlockB = blockId === 'B'

    return (
        <>
            {/* Warga Kas Utama Hero Card */}
            <section
                className={`warga-kas-card ${isBlockB ? 'theme-blok-b' : 'theme-blok-a'} clickable`}
                onClick={() => setShowModal(true)}
                role="button"
                tabIndex={0}
                aria-label={`Kas Utama Blok ${blockId} periode ${monthLabel}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowModal(true) }}
            >
                {/* Ambient glow container (Element only, no text blur) */}
                <div className="warga-kas-ambient-glow" />

                {/* Top Badge & Header */}
                <div className="warga-kas-top-bar">
                    <div className="warga-kas-badge">
                        <span className="warga-kas-badge-pulse" />
                        <Landmark size={13} className="warga-kas-badge-icon" />
                        <span className="warga-kas-badge-text">
                            KAS UTAMA • {monthLabel.toUpperCase()}
                        </span>
                    </div>

                    <div className="warga-kas-tap-hint">
                        <span>Transparansi</span>
                        <ChevronRight size={14} className="warga-kas-hint-arrow" />
                    </div>
                </div>

                {/* Main Cash Balance */}
                <div className="warga-kas-balance-wrap">
                    <div className="warga-kas-label">
                        Saldo Kas Berjalan s/d {monthLabel}
                    </div>
                    <div className="warga-kas-amount">
                        {loading ? (
                            <span className="warga-kas-skeleton">Rp --------</span>
                        ) : (
                            <AnimatedCounter value={runningKasUtama} />
                        )}
                    </div>
                    <div className="warga-kas-caption">
                        Akumulasi kas riil paguyuban Blok {blockId}
                    </div>
                </div>

                {/* 3-Pill Flow Breakdown for Current Month */}
                <div className="warga-kas-flow-grid">
                    {/* Inflow */}
                    <div className="warga-kas-flow-pill inflow">
                        <div className="warga-kas-flow-icon">
                            <ArrowDownRight size={15} />
                        </div>
                        <div className="warga-kas-flow-content">
                            <span className="warga-kas-flow-title">Masuk Bulan Ini</span>
                            <span className="warga-kas-flow-val positive">
                                +{formatCurrency(monthPemasukan)}
                            </span>
                            <span className="warga-kas-flow-sub">
                                {currentMonthPayments.length} warga lunas
                            </span>
                        </div>
                    </div>

                    {/* Outflow */}
                    <div className="warga-kas-flow-pill outflow">
                        <div className="warga-kas-flow-icon">
                            <ArrowUpRight size={15} />
                        </div>
                        <div className="warga-kas-flow-content">
                            <span className="warga-kas-flow-title">Keluar Bulan Ini</span>
                            <span className="warga-kas-flow-val negative">
                                -{formatCurrency(monthPengeluaran)}
                            </span>
                            <span className="warga-kas-flow-sub">
                                {currentMonthExpenses.length} pos operasional
                            </span>
                        </div>
                    </div>

                    {/* Net / Sisa */}
                    <div className="warga-kas-flow-pill net">
                        <div className="warga-kas-flow-icon">
                            <Sparkles size={15} />
                        </div>
                        <div className="warga-kas-flow-content">
                            <span className="warga-kas-flow-title">Sisa Bulan Ini</span>
                            <span className={`warga-kas-flow-val ${monthSurplus >= 0 ? 'positive' : 'negative'}`}>
                                {monthSurplus >= 0 ? '+' : ''}{formatCurrency(monthSurplus)}
                            </span>
                            <span className="warga-kas-flow-sub">
                                {monthSurplus >= 0 ? 'Surplus operasional' : 'Defisit ditutup kas'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Mobile Tap Banner */}
                <div className="warga-kas-footer-banner">
                    <ShieldCheck size={14} className="warga-kas-shield-icon" />
                    <span>Transparansi 100% terbuka • Sentuh untuk rincian belanja & bukti kas</span>
                </div>
            </section>

            {/* Transparency Modal / Bottom-Sheet for Mobile */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div
                        className={`modal warga-transparansi-modal ${isBlockB ? 'theme-blok-b' : 'theme-blok-a'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Mobile Drag Indicator */}
                        <div className="modal-drag-handle" />

                        {/* Modal Header */}
                        <div className="modal-header">
                            <div className="warga-modal-title-wrap">
                                <div className="warga-modal-badge">
                                    Blok {blockId}
                                </div>
                                <h3 className="modal-title">
                                    Transparansi Kas — {monthLabel}
                                </h3>
                            </div>
                            <button
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                                aria-label="Tutup"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Summary Hero */}
                        <div className="warga-modal-summary">
                            <div className="warga-modal-summary-item">
                                <span className="label">Saldo Kas Periode Ini</span>
                                <span className="val main">{formatCurrency(runningKasUtama)}</span>
                            </div>
                            <div className="warga-modal-summary-sub">
                                <div className="sub-stat">
                                    <span className="dot in" />
                                    <span>Masuk: <strong>+{formatCurrency(monthPemasukan)}</strong></span>
                                </div>
                                <div className="sub-stat">
                                    <span className="dot out" />
                                    <span>Keluar: <strong>-{formatCurrency(monthPengeluaran)}</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Tabs */}
                        <div className="warga-modal-tabs">
                            <button
                                className={`warga-modal-tab ${activeTab === 'pengeluaran' ? 'active' : ''}`}
                                onClick={() => setActiveTab('pengeluaran')}
                            >
                                <TrendingDown size={14} />
                                <span>Pengeluaran ({currentMonthExpenses.length})</span>
                            </button>
                            <button
                                className={`warga-modal-tab ${activeTab === 'pemasukan' ? 'active' : ''}`}
                                onClick={() => setActiveTab('pemasukan')}
                            >
                                <TrendingUp size={14} />
                                <span>Pemasukan ({currentMonthPayments.length})</span>
                            </button>
                            <button
                                className={`warga-modal-tab ${activeTab === 'rekap' ? 'active' : ''}`}
                                onClick={() => setActiveTab('rekap')}
                            >
                                <Calendar size={14} />
                                <span>Buku Kas Bulanan</span>
                            </button>
                        </div>

                        {/* Modal Body Content */}
                        <div className="modal-body warga-modal-body">
                            {/* TAB 1: PENGELUARAN */}
                            {activeTab === 'pengeluaran' && (
                                <div className="warga-transaksi-list">
                                    <div className="warga-transaksi-intro">
                                        Rincian biaya operasional internet yang dibayar kas pada periode <strong>{monthLabel}</strong>:
                                    </div>

                                    {currentMonthExpenses.length === 0 ? (
                                        <div className="warga-empty-state">
                                            <Info size={32} />
                                            <p>Belum ada catatan pengeluaran kas di bulan {monthLabel}.</p>
                                        </div>
                                    ) : (
                                        currentMonthExpenses.map((expense) => {
                                            const isListrik = expense.kategori === 'Listrik' || expense.keterangan?.toLowerCase().includes('listrik')
                                            const isStarlink = expense.kategori === 'Bandwidth' || expense.keterangan?.toLowerCase().includes('starlink')

                                            return (
                                                <div key={expense.id} className="warga-transaksi-item expense">
                                                    <div className="warga-transaksi-icon expense">
                                                        {isListrik ? '⚡' : isStarlink ? '🌐' : '🔧'}
                                                    </div>
                                                    <div className="warga-transaksi-detail">
                                                        <div className="warga-transaksi-title">
                                                            {expense.keterangan || expense.kategori}
                                                        </div>
                                                        <div className="warga-transaksi-meta">
                                                            <span className="warga-transaksi-tag">
                                                                {expense.kategori || 'Operasional'}
                                                            </span>
                                                            <span className="warga-transaksi-date">
                                                                {formatDate(expense.tanggal)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="warga-transaksi-amount expense">
                                                        -{formatCurrency(expense.nominal)}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}

                            {/* TAB 2: PEMASUKAN */}
                            {activeTab === 'pemasukan' && (
                                <div className="warga-transaksi-list">
                                    <div className="warga-transaksi-intro">
                                        Daftar warga yang telah membayar iuran internet periode <strong>{monthLabel}</strong>:
                                    </div>

                                    {currentMonthPayments.length === 0 ? (
                                        <div className="warga-empty-state">
                                            <Users size={32} />
                                            <p>Belum ada warga yang membayar iuran untuk bulan {monthLabel}.</p>
                                        </div>
                                    ) : (
                                        currentMonthPayments.map((p) => (
                                            <div key={p.id} className="warga-transaksi-item income">
                                                <div className="warga-transaksi-icon income">
                                                    🏠
                                                </div>
                                                <div className="warga-transaksi-detail">
                                                    <div className="warga-transaksi-title">
                                                        {p.resident?.blok_rumah} — {p.resident?.nama_warga}
                                                    </div>
                                                    <div className="warga-transaksi-meta">
                                                        <span className="warga-transaksi-tag lunas">
                                                            Lunas
                                                        </span>
                                                        <span className="warga-transaksi-date">
                                                            {formatDate(p.tanggal_bayar)}
                                                        </span>
                                                        <span className="warga-transaksi-method">
                                                            • {p.metode_bayar || 'Transfer'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="warga-transaksi-amount income">
                                                    +{formatCurrency(p.nominal)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* TAB 3: BUKU KAS REKAPITULASI */}
                            {activeTab === 'rekap' && (
                                <div className="warga-rekap-wrap">
                                    <div className="warga-transaksi-intro">
                                        Pergerakan saldo kas utama akumulatif dari waktu ke waktu:
                                    </div>

                                    <div className="warga-rekap-table-wrap">
                                        <table className="warga-rekap-table">
                                            <thead>
                                                <tr>
                                                    <th>Bulan</th>
                                                    <th className="text-right">Masuk</th>
                                                    <th className="text-right">Keluar</th>
                                                    <th className="text-right">Saldo Kas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {effectiveSaldoAwal > 0 && (
                                                    <tr className="initial-row">
                                                        <td>🏛️ Saldo Awal</td>
                                                        <td className="text-right text-success">+{formatCurrency(effectiveSaldoAwal)}</td>
                                                        <td className="text-right text-muted">-</td>
                                                        <td className="text-right text-bold">{formatCurrency(effectiveSaldoAwal)}</td>
                                                    </tr>
                                                )}
                                                {monthlyHistory.map((m) => {
                                                    const isSelected = m.bulan === targetBulan && m.tahun === targetTahun
                                                    return (
                                                        <tr key={m.key} className={isSelected ? 'selected-row' : ''}>
                                                            <td>
                                                                <span className="table-period">
                                                                    {getMonthName(m.bulan)} {m.tahun}
                                                                </span>
                                                                {isSelected && <span className="table-active-chip">Sedang Dilihat</span>}
                                                            </td>
                                                            <td className="text-right text-success">
                                                                +{formatCurrency(m.masuk)}
                                                            </td>
                                                            <td className="text-right text-danger">
                                                                {m.keluar > 0 ? `-${formatCurrency(m.keluar)}` : '-'}
                                                            </td>
                                                            <td className="text-right text-bold">
                                                                {formatCurrency(m.saldo)}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

