// Kas Utama Card - Premium All-Time Balance Component with animations
import { useState, useMemo, useEffect, useRef } from 'react'
import { Landmark, TrendingUp, TrendingDown, ChevronRight, X, Calendar, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react'
import { formatCurrency, getMonthName } from '../utils/helpers'

// Animated counter component
function AnimatedCounter({ value, duration = 1200, prefix = 'Rp ' }) {
    const [display, setDisplay] = useState(0)
    const rafRef = useRef(null)

    useEffect(() => {
        const start = display
        const diff = value - start
        const startTime = performance.now()

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(start + diff * eased))

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate)
            }
        }

        rafRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(rafRef.current)
    }, [value, duration])

    return (
        <span>
            {prefix}{display.toLocaleString('id-ID')}
        </span>
    )
}

// Mini sparkline chart
function MiniSparkline({ data, color = '#10b981', height = 40, width = 120 }) {
    if (!data || data.length < 2) return null

    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * (height - 4) - 2
        return `${x},${y}`
    }).join(' ')

    const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2

    return (
        <svg width={width} height={height} style={{ display: 'block' }}>
            <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
            />
            {/* Fill area */}
            <polygon
                points={`0,${height} ${points} ${width},${height}`}
                fill="url(#sparkGrad)"
            />
            {/* Dot on last value */}
            <circle cx={width} cy={lastY} r="3" fill={color} stroke="white" strokeWidth="1.5" />
        </svg>
    )
}

export default function KasUtamaCard({
    kasUtama,
    totalPemasukan,
    totalPengeluaran,
    allPayments = [],
    allExpenses = [],
    blockFilter,
    loading,
    onViewDetail
}) {
    const [showDetail, setShowDetail] = useState(false)

    // Filter data by admin block filter
    const filteredPayments = useMemo(() => {
        if (!blockFilter) return allPayments
        return allPayments.filter(p => {
            const block = p.resident?.blok_rumah?.charAt(0)?.toUpperCase()
            return block === blockFilter
        })
    }, [allPayments, blockFilter])

    const filteredExpenses = useMemo(() => {
        if (!blockFilter) return allExpenses
        return allExpenses.filter(e => {
            if (e.block_id) return e.block_id === blockFilter
            return false
        })
    }, [allExpenses, blockFilter])

    const filteredPemasukan = filteredPayments.reduce((sum, p) => sum + Number(p.nominal || 0), 0)
    const filteredPengeluaran = filteredExpenses.reduce((sum, e) => sum + Number(e.nominal || 0), 0)
    const filteredKasUtama = filteredPemasukan - filteredPengeluaran

    // Monthly breakdown for sparkline and detail
    const monthlyData = useMemo(() => {
        const map = {}

        filteredPayments.forEach(p => {
            const key = `${p.tahun}-${String(p.bulan).padStart(2, '0')}`
            if (!map[key]) map[key] = { bulan: p.bulan, tahun: p.tahun, masuk: 0, keluar: 0 }
            map[key].masuk += Number(p.nominal || 0)
        })

        filteredExpenses.forEach(e => {
            const d = new Date(e.tanggal)
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            if (!map[key]) map[key] = { bulan: d.getMonth() + 1, tahun: d.getFullYear(), masuk: 0, keluar: 0 }
            map[key].keluar += Number(e.nominal || 0)
        })

        const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
        let runningBalance = 0
        return sorted.map(([key, data]) => {
            runningBalance += data.masuk - data.keluar
            return { ...data, key, saldo: runningBalance }
        })
    }, [filteredPayments, filteredExpenses])

    const sparklineData = monthlyData.map(m => m.saldo)

    return (
        <>
            {/* Main Card */}
            <div
                className="kas-utama-card"
                onClick={() => setShowDetail(true)}
                style={{ cursor: 'pointer' }}
            >
                {/* Animated background particles */}
                <div className="kas-utama-particles">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`kas-utama-particle p${i}`} />
                    ))}
                </div>

                <div className="kas-utama-glow" />

                <div className="kas-utama-content">
                    <div className="kas-utama-header">
                        <div className="kas-utama-icon-wrap">
                            <Landmark size={28} />
                        </div>
                        <div className="kas-utama-title-area">
                            <span className="kas-utama-label">KAS UTAMA</span>
                            <span className="kas-utama-sublabel">Saldo Akumulasi Sepanjang Masa</span>
                        </div>
                        <div className="kas-utama-sparkline">
                            <MiniSparkline data={sparklineData} color="#34d399" height={36} width={100} />
                        </div>
                    </div>

                    <div className="kas-utama-value-row">
                        <div className="kas-utama-value">
                            <AnimatedCounter value={filteredKasUtama} duration={1500} />
                        </div>
                        <ChevronRight size={24} className="kas-utama-chevron" />
                    </div>

                    <div className="kas-utama-breakdown">
                        <div className="kas-utama-stat masuk">
                            <ArrowUpRight size={14} />
                            <span>Total Masuk</span>
                            <strong>{formatCurrency(filteredPemasukan)}</strong>
                        </div>
                        <div className="kas-utama-divider" />
                        <div className="kas-utama-stat keluar">
                            <ArrowDownRight size={14} />
                            <span>Total Keluar</span>
                            <strong>{formatCurrency(filteredPengeluaran)}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetail && (
                <div className="modal-overlay" onClick={() => setShowDetail(false)}>
                    <div className="modal kas-utama-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #064e3b, #065f46)', color: 'white' }}>
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                                <Landmark size={22} />
                                Detail Kas Utama — Blok {blockFilter}
                            </h3>
                            <button className="modal-close" onClick={() => setShowDetail(false)} style={{ color: 'white' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: 0 }}>
                            {/* Grand Total Summary */}
                            <div style={{
                                padding: '20px 24px',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 78, 59, 0.06))',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Saldo Kas Utama (All-Time)
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                                    {formatCurrency(filteredKasUtama)}
                                </div>
                                <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <TrendingUp size={14} style={{ color: '#22c55e' }} />
                                        <span style={{ color: 'var(--text-muted)' }}>Masuk:</span>
                                        <strong style={{ color: '#22c55e' }}>{formatCurrency(filteredPemasukan)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <TrendingDown size={14} style={{ color: '#ef4444' }} />
                                        <span style={{ color: 'var(--text-muted)' }}>Keluar:</span>
                                        <strong style={{ color: '#ef4444' }}>{formatCurrency(filteredPengeluaran)}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Breakdown Table */}
                            <div style={{ padding: '16px 24px' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={14} />
                                    Rincian Per Bulan
                                </h4>

                                {monthlyData.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                                        Belum ada data transaksi
                                    </p>
                                ) : (
                                    <div style={{ maxHeight: '380px', overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 1 }}>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--color-border)' }}>Periode</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#22c55e', borderBottom: '1px solid var(--color-border)' }}>Masuk</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#ef4444', borderBottom: '1px solid var(--color-border)' }}>Keluar</th>
                                                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)' }}>Saldo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthlyData.map((m, i) => (
                                                    <tr
                                                        key={m.key}
                                                        style={{
                                                            borderBottom: '1px solid var(--color-border)',
                                                            background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                                                            animation: `fadeSlideIn 0.3s ease ${i * 0.03}s both`
                                                        }}
                                                    >
                                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                            {getMonthName(m.bulan)} {m.tahun}
                                                        </td>
                                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#22c55e', fontWeight: 500 }}>
                                                            {m.masuk > 0 ? `+${formatCurrency(m.masuk)}` : '-'}
                                                        </td>
                                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#ef4444', fontWeight: 500 }}>
                                                            {m.keluar > 0 ? `-${formatCurrency(m.keluar)}` : '-'}
                                                        </td>
                                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--color-primary)', fontWeight: 700 }}>
                                                            {formatCurrency(m.saldo)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Footer with Navigate Button */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Data dari {monthlyData.length} periode tercatat
                                </span>
                                {onViewDetail && (
                                    <button
                                        onClick={() => { setShowDetail(false); onViewDetail() }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 16px',
                                            background: 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        Buka Buku Kas Lengkap
                                        <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
