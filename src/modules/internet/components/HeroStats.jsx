// Hero Stats Component - Interactive with Click Details
import { useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, Users, CheckCircle, XCircle, X, Download } from 'lucide-react'
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
    paymentList = []
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
                {/* Left Panel - Main Saldo */}
                <div
                    className="hero-main-panel clickable"
                    onClick={() => handleStatClick('saldo')}
                    title="Klik untuk detail saldo"
                >
                    <div className="hero-main-glow" />
                    <div className="hero-main-icon">
                        <Wallet size={40} />
                    </div>
                    <div className="hero-main-content">
                        <span className="hero-main-label">TOTAL SALDO</span>
                        <AnimatedNumber value={saldo} className="hero-main-value" />
                    </div>
                    <div className="hero-main-footer">
                        <span className="hero-main-badge">Periode Berjalan</span>
                    </div>
                </div>

                {/* Right Panel - Stats Grid */}
                <div className="hero-stats-grid">
                    {/* Financial Row */}
                    <div className="hero-stats-row">
                        <div
                            className="hero-stat-card success clickable"
                            onClick={() => handleStatClick('pemasukan')}
                            title="Klik untuk detail pemasukan"
                        >
                            <div className="hero-stat-icon">
                                <TrendingUp size={20} />
                            </div>
                            <div className="hero-stat-info">
                                <span className="hero-stat-label">Pemasukan</span>
                                <AnimatedNumber value={pemasukan} className="hero-stat-value" />
                            </div>
                        </div>
                        <div
                            className="hero-stat-card danger clickable"
                            onClick={() => handleStatClick('pengeluaran')}
                            title="Klik untuk detail pengeluaran"
                        >
                            <div className="hero-stat-icon">
                                <TrendingDown size={20} />
                            </div>
                            <div className="hero-stat-info">
                                <span className="hero-stat-label">Pengeluaran</span>
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
                        paidList, unpaidList, expenseList, paymentList
                    }}
                />
            )}
        </>
    )
}

// Stat Detail Modal
function StatDetailModal({ type, onClose, data }) {
    const getContent = () => {
        switch (type) {
            case 'saldo':
                return {
                    title: 'Detail Saldo',
                    icon: <Wallet size={24} />,
                    content: (
                        <div className="stat-detail-content">
                            <div className="stat-detail-row">
                                <span>Total Pemasukan</span>
                                <span className="text-success">{formatCurrency(data.pemasukan)}</span>
                            </div>
                            <div className="stat-detail-row">
                                <span>Total Pengeluaran</span>
                                <span className="text-danger">- {formatCurrency(data.pengeluaran)}</span>
                            </div>
                            <div className="stat-detail-divider" />
                            <div className="stat-detail-row total">
                                <span>Saldo Akhir</span>
                                <span className="text-primary">{formatCurrency(data.saldo)}</span>
                            </div>
                            <p className="stat-detail-note">
                                Saldo ini adalah selisih antara total pemasukan dari iuran internet
                                dengan total pengeluaran operasional.
                            </p>
                        </div>
                    )
                }

            case 'pemasukan':
                return {
                    title: 'Detail Pemasukan',
                    icon: <TrendingUp size={24} />,
                    content: (
                        <div className="stat-detail-content">
                            <div className="stat-detail-row total">
                                <span>Total Pemasukan</span>
                                <span className="text-success">{formatCurrency(data.pemasukan)}</span>
                            </div>

                            {data.paymentList && data.paymentList.length > 0 ? (
                                <div className="stat-detail-list mt-3">
                                    <p className="stat-detail-note mb-2">Daftar transaksi masuk:</p>
                                    {data.paymentList.map((pay, i) => (
                                        <div key={i} className="stat-detail-list-item paid">
                                            <div className="stat-detail-list-info">
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                    <span className="nama">
                                                        {pay.resident?.nama_warga || pay.residents?.nama_warga || 'Warga'}
                                                    </span>
                                                    <span className="text-success" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                                        + {formatCurrency(pay.nominal)}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                        {pay.resident?.blok_rumah || pay.residents?.blok_rumah || '-'} • {pay.tanggal_bayar ? new Date(pay.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
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
                            ) : (
                                <p className="stat-detail-note">
                                    Total pemasukan berasal dari iuran internet bulanan warga.
                                    Tarif: Rp 150.000/bulan per rumah.
                                </p>
                            )}
                        </div>
                    )
                }

            case 'pengeluaran':
                return {
                    title: 'Detail Pengeluaran',
                    icon: <TrendingDown size={24} />,
                    content: (
                        <div className="stat-detail-content">
                            <div className="stat-detail-row total">
                                <span>Total Pengeluaran</span>
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
                                <p className="stat-detail-note">
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
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h3 className="modal-title flex items-center gap-2">
                        {icon}
                        {title}
                    </h3>
                    <button className="modal-close" onClick={onClose}>
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
