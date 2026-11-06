// Status Grid Component - Interactive & Mobile-Friendly Payment Status
import { useState, useMemo } from 'react'
import { Search, Check, X, Filter, Sparkles, CheckCircle2, Clock, Zap } from 'lucide-react'
import { usePaymentStatus } from '../hooks/useSupabase'
import { getMonthName } from '../utils/helpers'
import ResidentModal from './ResidentModal'

// Host units for Starlink equipment
const STARLINK_HOST_UNITS = ['B2', 'A18']

export default function StatusGrid({ selectedPeriod, blockFilter }) {
    const { statusList, totalPaid, totalUnpaid, bulan, tahun } = usePaymentStatus(
        selectedPeriod?.bulan, selectedPeriod?.tahun
    )
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all') // 'all' | 'paid' | 'unpaid'
    const [selectedResident, setSelectedResident] = useState(null)

    // Apply block filter if provided
    const blockFilteredList = useMemo(() => {
        return blockFilter
            ? statusList.filter(r => r.blok_rumah?.charAt(0)?.toUpperCase() === blockFilter)
            : statusList
    }, [statusList, blockFilter])

    const blockPaid = useMemo(() => blockFilteredList.filter(r => r.isPaid).length, [blockFilteredList])
    const blockUnpaid = useMemo(() => blockFilteredList.filter(r => !r.isPaid).length, [blockFilteredList])

    // Filter residents based on search & filter type
    const filteredList = useMemo(() => {
        return blockFilteredList.filter(resident => {
            // Status filter
            if (filterType === 'paid' && !resident.isPaid) return false
            if (filterType === 'unpaid' && resident.isPaid) return false

            // Search filter
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase().trim()
                const matchBlok = resident.blok_rumah?.toLowerCase().includes(term)
                const matchName = resident.nama_warga?.toLowerCase().includes(term)
                return matchBlok || matchName
            }
            return true
        })
    }, [blockFilteredList, filterType, searchTerm])

    const isBlockB = blockFilter === 'B'

    return (
        <div className={`card status-grid-container ${isBlockB ? 'theme-blok-b' : 'theme-blok-a'}`}>
            <div className="status-grid-header">
                <div>
                    <h2 className="card-title status-grid-title">
                        <span>Status Pembayaran Warga</span>
                    </h2>
                    <p className="status-grid-subtitle">
                        Periode: <strong>{getMonthName(bulan)} {tahun}</strong> • Sentuh kartu untuk nota & detail
                    </p>
                </div>

                {/* Filter Chips - Mobile-First */}
                <div className="status-filter-chips">
                    <button
                        type="button"
                        className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterType('all')}
                    >
                        <span>Semua</span>
                        <span className="chip-count">{blockFilteredList.length}</span>
                    </button>
                    <button
                        type="button"
                        className={`filter-chip chip-lunas ${filterType === 'paid' ? 'active' : ''}`}
                        onClick={() => setFilterType('paid')}
                    >
                        <Check size={13} />
                        <span>Lunas</span>
                        <span className="chip-count lunas">{blockPaid}</span>
                    </button>
                    <button
                        type="button"
                        className={`filter-chip chip-belum ${filterType === 'unpaid' ? 'active' : ''}`}
                        onClick={() => setFilterType('unpaid')}
                    >
                        <Clock size={13} />
                        <span>Belum</span>
                        <span className="chip-count belum">{blockUnpaid}</span>
                    </button>
                </div>
            </div>

            {/* Responsive Search Bar */}
            <div className="status-search-wrap">
                <Search className="status-search-icon" size={17} />
                <input
                    type="text"
                    className="status-search-input"
                    placeholder="Cari blok (A1, B2) atau nama warga..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        type="button"
                        className="status-search-clear"
                        onClick={() => setSearchTerm('')}
                        aria-label="Hapus pencarian"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>

            {/* Status Grid Cards */}
            {filteredList.length === 0 ? (
                <div className="status-empty-state">
                    <div className="status-empty-icon">🔍</div>
                    <p className="status-empty-title">
                        {searchTerm ? 'Tidak ada warga yang cocok dengan pencarian' : 'Tidak ada data pada filter ini'}
                    </p>
                    <p className="status-empty-desc">
                        Coba ubah kata kunci atau ganti filter status di atas.
                    </p>
                    {(searchTerm || filterType !== 'all') && (
                        <button
                            type="button"
                            className="status-reset-btn"
                            onClick={() => { setSearchTerm(''); setFilterType('all') }}
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            ) : (
                <div className="status-cards-grid">
                    {filteredList.map((resident) => {
                        const isHost = STARLINK_HOST_UNITS.includes(resident.blok_rumah?.toUpperCase()?.trim())

                        return (
                            <div
                                key={resident.id}
                                className={`warga-status-card ${resident.isPaid ? 'paid' : 'unpaid'} ${isHost ? 'is-host' : ''}`}
                                onClick={() => setSelectedResident(resident)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedResident(resident) }}
                            >
                                {/* Glow element (Element only, no text blur) */}
                                <div className="card-ambient-glow" />

                                <div className="card-top-row">
                                    <div className="card-blok-badge">
                                        {resident.blok_rumah}
                                    </div>
                                    {isHost && (
                                        <span className="card-host-chip" title="Unit Host Perangkat Starlink">
                                            <Zap size={11} />
                                            <span>Host</span>
                                        </span>
                                    )}
                                </div>

                                <div className="card-resident-name" title={resident.nama_warga}>
                                    {resident.nama_warga}
                                </div>

                                <div className="card-footer-row">
                                    <span className={`status-pill ${resident.isPaid ? 'pill-lunas' : 'pill-belum'}`}>
                                        <span className="pill-dot" />
                                        {resident.isPaid ? 'Lunas' : 'Belum Bayar'}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Resident Detail Modal */}
            {selectedResident && (
                <ResidentModal
                    resident={selectedResident}
                    onClose={() => setSelectedResident(null)}
                />
            )}
        </div>
    )
}
