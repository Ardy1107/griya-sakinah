// Hero Stats Component - Interactive with Click Details
import { useState, useMemo } from 'react'
import {
    Wallet, TrendingUp, TrendingDown, Users, CheckCircle, XCircle, X, Download,
    Landmark, Calendar, ArrowUpRight, ArrowDownRight, Sparkles, Filter
} from 'lucide-react'
import { formatCurrency, getMonthName } from '../utils/helpers'

export default function HeroStats({
    saldo,
    pemasukan,
    pengeluaran,
    totalWarga,
    sudahBayar,
    belumBayar,
    onStatClick,
    paidList = [],
    unpaidList = [],
    expenseList = [],
    paymentList = [],
    otherIncomes = [],
    allOtherIncomes = [],
    allPayments = [],
    allExpenses = [],
    totalPemasukanAllTime,
    totalPengeluaranAllTime,
    saldoAwal = 0
}) {
    const [showModal, setShowModal] = useState(null)

    const handleStatClick = (type) => {
        if (onStatClick) {
            onStatClick(type)
        } else {
            setShowModal(type)
        }
    }

    return (
        <>
            <div className="hero-stats-premium">
                {/* Left Panel - Saldo Kas Utama (Terus berjalan antar bulan) */}
                <div
                    className="hero-main-panel clickable"
                    onClick={() => handleStatClick('saldo')}
                    title="Sentuh untuk rincian Kas Utama"
                >
                    <div className="hero-main-glow" />
                    <div className="hero-main-icon">
                        <Wallet size={38} />
                    </div>
                    <div className="hero-main-content">
                        <span className="hero-main-label">KAS UTAMA</span>
                        <AnimatedNumber value={saldo} className="hero-main-value" />
                    </div>
                    <div className="hero-main-footer">
                        <span className="hero-main-badge">Kas Utama Paguyuban</span>
                    </div>
                </div>

                {/* Right Panel - Stats Grid */}
                <div className="hero-stats-grid">
                    {/* Financial Row */}
                    <div className="hero-stats-row">
                        <div
                            className="hero-stat-card success clickable"
                            onClick={() => handleStatClick('pemasukan')}
                            title="Klik untuk detail pemasukan bulan ini"
                        >
                            <div className="hero-stat-icon">
                                <TrendingUp size={20} />
                            </div>
                            <div className="hero-stat-info">
                                <span className="hero-stat-label">Masuk Bulan Ini</span>
                                <AnimatedNumber value={pemasukan} className="hero-stat-value" />
                            </div>
                        </div>
                        <div
                            className="hero-stat-card danger clickable"
                            onClick={() => handleStatClick('pengeluaran')}
                            title="Klik untuk detail pengeluaran bulan ini"
                        >
                            <div className="hero-stat-icon">
                                <TrendingDown size={20} />
                            </div>
                            <div className="hero-stat-info">
                                <span className="hero-stat-label">Keluar Bulan Ini</span>
                                <AnimatedNumber value={pengeluaran} className="hero-stat-value" />
                            </div>
                        </div>
                    </div>

                    {/* Status Row */}
                    <div className="hero-stats-row triple">
                        <div
                            className="hero-stat-card info clickable"
                            onClick={() => handleStatClick('warga')}
                            title="Klik untuk daftar warga"
                        >
                            <div className="hero-stat-icon">
                                <Users size={20} />
                            </div>
                            <div className="hero-stat-info">
                                <span className="hero-stat-label">Total Warga</span>
                                <span className="hero-stat-value">{totalWarga}</span>
                            </div>
                        </div>
                        <div
                            className="hero-stat-card success clickable"
                            onClick={() => handleStatClick('sudahBayar')}
                            title="Klik untuk daftar yang sudah bayar"
                        >
                            <div className="hero-stat-icon">
                                <CheckCircle size={20} />
                            </div>
                            <div className="hero-stat-info">
                                <span className="hero-stat-label">Lunas</span>
                                <span className="hero-stat-value">{sudahBayar}</span>
                            </div>
                        </div>
                        <div
                            className="hero-stat-card danger clickable"
                            onClick={() => handleStatClick('belumBayar')}
                            title="Klik untuk daftar yang belum bayar"
                        >
                            <div className="hero-stat-icon">
                                <XCircle size={20} />
                            </div>
                            <div className="hero-stat-info">
                                <span className="hero-stat-label">Pending</span>
                                <span className="hero-stat-value">{belumBayar}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showModal && (
                <StatDetailModal
                    type={showModal}
                    onClose={() => setShowModal(null)}
                    data={{
                        saldo, pemasukan, pengeluaran, totalWarga, sudahBayar, belumBayar,
                        paidList, unpaidList, expenseList, paymentList,
                        otherIncomes, allOtherIncomes, allPayments, allExpenses,
                        totalPemasukanAllTime, totalPengeluaranAllTime, saldoAwal
                    }}
                />
            )}
        </>
    )
}

// Kas Utama Detail Subcomponent (Fully Trackable, Complete Dates & Categories)
function KasUtamaDetail({ data }) {
    const [filter, setFilter] = useState('all') // 'all', 'dana', 'iuran', 'pengeluaran'

    const otherIncomes = data.allOtherIncomes || []
    const payments = data.allPayments || []
    const expenses = data.allExpenses || []

    const totalDanaMasuk = data.totalPemasukanAllTime ?? (
        otherIncomes.reduce((s, o) => s + Number(o.nominal || 0), 0) +
        payments.reduce((s, p) => s + Number(p.nominal || 0), 0)
    )
    const totalPengeluaran = data.totalPengeluaranAllTime ?? expenses.reduce((s, e) => s + Number(e.nominal || 0), 0)

    // Build unified chronological entries
    const entries = useMemo(() => {
        const list = []

        otherIncomes.forEach(item => {
            list.push({
                id: `other-${item.id}`,
                type: 'dana',
                title: item.keterangan || 'Penerimaan Kas Lainnya',
                category: item.kategori || 'Kas Paguyuban',
                date: item.tanggal,
                month: item.tanggal ? new Date(item.tanggal).getMonth() + 1 : null,
                year: item.tanggal ? new Date(item.tanggal).getFullYear() : null,
                amount: Number(item.nominal || 0),
                isIncome: true,
                badge: item.kategori || 'Kas Paguyuban',
                blockScope: !item.block_id ? 'Semua Blok' : `Blok ${item.block_id}`,
                icon: 'landmark'
            })
        })

        payments.forEach(pay => {
            const residentName = pay.resident?.nama_warga || pay.residents?.nama_warga || 'Warga'
            const block = pay.resident?.blok_rumah || pay.residents?.blok_rumah || '-'
            list.push({
                id: `pay-${pay.id}`,
                type: 'iuran',
                title: `${residentName} (${block})`,
                category: 'Iuran Internet',
                date: pay.tanggal_bayar,
                month: pay.bulan,
                year: pay.tahun,
                amount: Number(pay.nominal || 0),
                isIncome: true,
                badge: `Iuran ${getMonthName(pay.bulan)} ${pay.tahun}`,
                blockScope: `Blok ${block}`,
                receiptUrl: pay.receipt_url_pdf,
                icon: 'user'
            })
        })

        expenses.forEach(exp => {
            list.push({
                id: `exp-${exp.id}`,
                type: 'pengeluaran',
                title: exp.keterangan || exp.kategori || 'Pengeluaran Kas',
                category: exp.kategori || 'Operasional',
                date: exp.tanggal,
                month: exp.tanggal ? new Date(exp.tanggal).getMonth() + 1 : null,
                year: exp.tanggal ? new Date(exp.tanggal).getFullYear() : null,
                amount: Number(exp.nominal || 0),
                isIncome: false,
                badge: exp.kategori || 'Operasional',
                blockScope: exp.block_id ? `Blok ${exp.block_id}` : 'Operasional',
                icon: 'expense'
            })
        })

        // Sort descending by date (newest first)
        return list.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0
            const dateB = b.date ? new Date(b.date).getTime() : 0
            return dateB - dateA
        })
    }, [otherIncomes, payments, expenses])

    const filteredEntries = useMemo(() => {
        if (filter === 'all') return entries
        return entries.filter(e => e.type === filter)
    }, [entries, filter])

    return (
        <div className="kas-utama-detail-container">
            {/* Overview Box */}
            <div className="kas-overview-box">
                <span className="kas-overview-label">TOTAL SALDO KAS UTAMA</span>
                <span className="kas-overview-balance">{formatCurrency(data.saldo)}</span>
                <div className="kas-overview-pills">
                    <div className="kas-overview-pill incoming">
                        <ArrowUpRight size={14} />
                        <span>Masuk: <strong>+{formatCurrency(totalDanaMasuk)}</strong></span>
                    </div>
                    <div className="kas-overview-pill outgoing">
                        <ArrowDownRight size={14} />
                        <span>Keluar: <strong>-{formatCurrency(totalPengeluaran)}</strong></span>
                    </div>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="kas-filter-pills">
                <button
                    type="button"
                    className={`kas-filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Semua ({entries.length})
                </button>
                <button
                    type="button"
                    className={`kas-filter-btn ${filter === 'dana' ? 'active' : ''}`}
                    onClick={() => setFilter('dana')}
                >
                    <Landmark size={13} />
                    Dana Kas / Sisa ({otherIncomes.length})
                </button>
                <button
                    type="button"
                    className={`kas-filter-btn ${filter === 'iuran' ? 'active' : ''}`}
                    onClick={() => setFilter('iuran')}
                >
                    <Users size={13} />
                    Iuran Warga ({payments.length})
                </button>
                {expenses.length > 0 && (
                    <button
                        type="button"
                        className={`kas-filter-btn ${filter === 'pengeluaran' ? 'active' : ''}`}
                        onClick={() => setFilter('pengeluaran')}
                    >
                        <TrendingDown size={13} />
                        Pengeluaran ({expenses.length})
                    </button>
                )}
            </div>

            {/* Feed List */}
            <div className="kas-tracker-feed">
                {filteredEntries.length > 0 ? (
                    filteredEntries.map(entry => (
                        <div key={entry.id} className={`kas-tracker-item ${entry.isIncome ? 'income' : 'expense'}`}>
                            <div className="kas-tracker-icon-col">
                                {entry.icon === 'landmark' ? (
                                    <div className="kas-icon-badge landmark">
                                        <Landmark size={18} />
                                    </div>
                                ) : entry.icon === 'user' ? (
                                    <div className="kas-icon-badge user">
                                        <Users size={18} />
                                    </div>
                                ) : (
                                    <div className="kas-icon-badge expense">
                                        <TrendingDown size={18} />
                                    </div>
                                )}
                            </div>

                            <div className="kas-tracker-content">
                                <div className="kas-tracker-row-top">
                                    <div className="kas-tracker-title-wrap">
                                        <h4 className="kas-tracker-title">{entry.title}</h4>
                                        <span className={`kas-badge-tag ${entry.type}`}>{entry.badge}</span>
                                    </div>
                                    <span className={`kas-tracker-nominal ${entry.isIncome ? 'income' : 'expense'}`}>
                                        {entry.isIncome ? '+' : '-'} {formatCurrency(entry.amount)}
                                    </span>
                                </div>

                                <div className="kas-tracker-row-bottom">
                                    <div className="kas-tracker-meta">
                                        <span className="kas-tracker-date">
                                            <Calendar size={13} />
                                            {entry.date ? new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanggal tidak tercatat'}
                                        </span>
                                        {entry.month && entry.year && (
                                            <span className="kas-tracker-period-text">
                                                • Periode {getMonthName(entry.month)} {entry.year}
                                            </span>
                                        )}
                                        {entry.blockScope && (
                                            <span className="kas-tracker-scope">
                                                • {entry.blockScope}
                                            </span>
                                        )}
                                    </div>

                                    {entry.receiptUrl && (
                                        <a
                                            href={entry.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="kas-tracker-pdf-btn"
                                            title="Unduh Kwitansi PDF"
                                        >
                                            <Download size={13} />
                                            Kwitansi
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="kas-tracker-empty">
                        <p>Tidak ada transaksi pada kategori ini.</p>
                    </div>
                )}
            </div>

            <p className="stat-detail-note mt-3">
                🏛️ <strong>Transparansi Kas Utama:</strong> Seluruh dana kas, iuran warga, dan pengeluaran dicatat secara otomatis, transparan, dan dapat ditelusuri riwayatnya secara real-time.
            </p>
        </div>
    )
}

// Stat Detail Modal
function StatDetailModal({ type, onClose, data }) {
    const getContent = () => {
        switch (type) {
            case 'saldo':
                return {
                    title: 'Detail Kas Utama',
                    icon: <Wallet size={24} />,
                    content: <KasUtamaDetail data={data} />
                }

            case 'pemasukan':
                return {
                    title: 'Detail Pemasukan Bulan Ini',
                    icon: <TrendingUp size={24} />,
                    content: (
                        <div className="stat-detail-content">
                            <div className="stat-detail-row total">
                                <span>Total Pemasukan Bulan Ini</span>
                                <span className="text-success">{formatCurrency(data.pemasukan)}</span>
                            </div>

                            {/* Dana Masuk Non-Iuran */}
                            {data.otherIncomes && data.otherIncomes.length > 0 && (
                                <div className="mt-3">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                        <Landmark size={15} />
                                        <span>Dana Masuk Non-Iuran ({data.otherIncomes.length})</span>
                                    </div>
                                    <div className="stat-detail-list">
                                        {data.otherIncomes.map((item, i) => (
                                            <div key={i} className="stat-detail-list-item paid">
                                                <div className="stat-detail-list-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                        <span className="nama">{item.keterangan || item.kategori}</span>
                                                        <span className="text-success" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                                                            + {formatCurrency(item.nominal)}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        <span className="kas-badge-tag dana">{item.kategori || 'Kas'}</span>
                                                        <span>•</span>
                                                        <span>{item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Iuran Internet Warga */}
                            {data.paymentList && data.paymentList.length > 0 ? (
                                <div className="mt-3">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                        <Users size={15} />
                                        <span>Iuran Internet Warga ({data.paymentList.length})</span>
                                    </div>
                                    <div className="stat-detail-list">
                                        {data.paymentList.map((pay, i) => (
                                            <div key={i} className="stat-detail-list-item paid">
                                                <div className="stat-detail-list-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                        <span className="nama">
                                                            {pay.resident?.nama_warga || pay.residents?.nama_warga || 'Warga'} ({pay.resident?.blok_rumah || pay.residents?.blok_rumah || '-'})
                                                        </span>
                                                        <span className="text-success" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                                                            + {formatCurrency(pay.nominal)}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                            {pay.tanggal_bayar ? new Date(pay.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                                        </span>
                                                        {pay.receipt_url_pdf && (
                                                            <a
                                                                href={pay.receipt_url_pdf}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Unduh Kwitansi PDF"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    fontSize: '0.75rem',
                                                                    color: 'var(--color-primary)',
                                                                    textDecoration: 'none',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '4px',
                                                                    background: 'rgba(var(--color-primary-rgb), 0.1)'
                                                                }}
                                                            >
                                                                <Download size={14} />
                                                                PDF
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                (!data.otherIncomes || data.otherIncomes.length === 0) && (
                                    <p className="stat-detail-note mt-3">
                                        Belum ada transaksi pembayaran iuran yang tercatat pada bulan ini.
                                    </p>
                                )
                            )}
                        </div>
                    )
                }

            case 'pengeluaran':
                return {
                    title: 'Detail Pengeluaran Bulan Ini',
                    icon: <TrendingDown size={24} />,
                    content: (
                        <div className="stat-detail-content">
                            <div className="stat-detail-row total">
                                <span>Total Pengeluaran Bulan Ini</span>
                                <span className="text-danger">{formatCurrency(data.pengeluaran)}</span>
                            </div>

                            {data.expenseList && data.expenseList.length > 0 ? (
                                <div className="stat-detail-list mt-3">
                                    <p className="stat-detail-note mb-2">Daftar transaksi pengeluaran:</p>
                                    {data.expenseList.map((exp, i) => (
                                        <div key={i} className="stat-detail-list-item expense">
                                            <div className="stat-detail-list-info">
                                                <span className="nama">
                                                    {exp.kategori === 'Bandwidth' ? 'Pembayaran ISP Starlink' : (exp.keterangan || exp.kategori)}
                                                </span>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                    {new Date(exp.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <span className="text-danger" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                                - {formatCurrency(exp.nominal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="stat-detail-note mt-3">
                                    Pengeluaran meliputi biaya bandwidth internet, maintenance jaringan,
                                    dan biaya operasional lainnya.
                                </p>
                            )}
                        </div>
                    )
                }

            case 'warga':
                return {
                    title: 'Informasi Warga',
                    icon: <Users size={24} />,
                    content: (
                        <div className="stat-detail-content">
                            <div className="stat-detail-row total">
                                <span>Total Warga Terdaftar</span>
                                <span>{data.totalWarga} rumah</span>
                            </div>
                            <div className="stat-detail-row">
                                <span>Sudah Bayar Bulan Ini</span>
                                <span className="text-success">{data.sudahBayar} rumah</span>
                            </div>
                            <div className="stat-detail-row">
                                <span>Belum Bayar Bulan Ini</span>
                                <span className="text-danger">{data.belumBayar} rumah</span>
                            </div>
                        </div>
                    )
                }

            case 'sudahBayar':
                return {
                    title: 'Warga Sudah Bayar',
                    icon: <CheckCircle size={24} className="text-success" />,
                    content: (
                        <div className="stat-detail-content">
                            <div className="stat-detail-row total">
                                <span>Sudah Bayar</span>
                                <span className="text-success">{data.sudahBayar} Warga</span>
                            </div>
                            {data.paidList && data.paidList.length > 0 ? (
                                <div className="stat-detail-list mt-3">
                                    {data.paidList.map((r, i) => (
                                        <div key={i} className="stat-detail-list-item paid">
                                            <div className="stat-detail-list-info">
                                                <span className="nama">{r.nama_warga}</span>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                    Blok {r.blok_rumah} • {r.payment?.tanggal_bayar ? new Date(r.payment.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : 'Tanggal tidak tercatat'}
                                                </span>
                                            </div>
                                            <span className="text-success" style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle size={14} />
                                                LUNAS
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted mt-3">Belum ada data pembayaran</p>
                            )}
                        </div>
                    )
                }

            case 'belumBayar':
                return {
                    title: 'Warga Belum Bayar',
                    icon: <XCircle size={24} className="text-danger" />,
                    content: (
                        <div className="stat-detail-content">
                            <div className="stat-detail-row total">
                                <span>Belum Bayar</span>
                                <span className="text-danger">{data.belumBayar} Warga</span>
                            </div>
                            {data.unpaidList && data.unpaidList.length > 0 ? (
                                <div className="stat-detail-list mt-3">
                                    {data.unpaidList.map((r, i) => (
                                        <div key={i} className="stat-detail-list-item unpaid">
                                            <div className="stat-detail-list-info">
                                                <span className="nama">{r.nama_warga}</span>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                    Blok {r.blok_rumah}
                                                </span>
                                            </div>
                                            <span className="text-danger" style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <XCircle size={14} />
                                                PENDING
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-success mt-3">Semua warga sudah bayar! 🎉</p>
                            )}
                        </div>
                    )
                }

            default:
                return { title: 'Detail', icon: null, content: null }
        }
    }

    const { title, icon, content } = getContent()

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal kas-utama-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title flex items-center gap-2">
                        {icon}
                        {title}
                    </h3>
                    <button className="modal-close" onClick={onClose} aria-label="Tutup">
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {content}
                </div>
            </div>
        </div>
    )
}

// Animated Number Component with count-up effect
function AnimatedNumber({ value, className = '' }) {
    return (
        <span className={className}>
            {formatCurrency(value)}
        </span>
    )
}
