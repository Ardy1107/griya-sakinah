// Status Grid Component - Shows payment status for all homes
import { useState } from 'react'
import { Search, Check, X } from 'lucide-react'
import { usePaymentStatus } from '../hooks/useSupabase'
import { debounce } from '../utils/helpers'
import ResidentModal from './ResidentModal'

export default function StatusGrid() {
    const { statusList, totalPaid, totalUnpaid, bulan, tahun } = usePaymentStatus()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedResident, setSelectedResident] = useState(null)

    // Filter residents based on search
    const filteredList = statusList.filter(resident =>
        resident.blok_rumah.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.nama_warga.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSearch = debounce((value) => {
        setSearchTerm(value)
    }, 300)

    const getMonthName = (month) => {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]
        return months[month - 1]
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">
                    <span>Status Pembayaran</span>
                    <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.875rem' }}>
                        {getMonthName(bulan)} {tahun}
                    </span>
                </h2>

                <div className="flex gap-2">
                    <span className="status-badge lunas" style={{ fontSize: '0.75rem' }}>
                        <Check size={12} /> {totalPaid} Lunas
                    </span>
                    <span className="status-badge belum" style={{ fontSize: '0.75rem' }}>
                        <X size={12} /> {totalUnpaid} Belum
                    </span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-container mb-3">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Cari blok rumah atau nama..."
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Status Grid */}
            {filteredList.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: '3rem' }}>
                    {searchTerm ? 'Tidak ada hasil yang cocok' : 'Belum ada data warga'}
                </div>
            ) : (
                <div className="status-grid">
                    {filteredList.map((resident) => (
                        <div
                            key={resident.id}
                            className={`status-card ${resident.isPaid ? 'paid' : 'unpaid'}`}
                            onClick={() => setSelectedResident(resident)}
                        >
                            <div className="blok">{resident.blok_rumah}</div>
                            <div className="name">{resident.nama_warga}</div>
                            <span className={`status-badge ${resident.isPaid ? 'lunas' : 'belum'}`}>
                                {resident.isPaid ? 'Lunas' : 'Belum'}
                            </span>
                        </div>
                    ))}
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
