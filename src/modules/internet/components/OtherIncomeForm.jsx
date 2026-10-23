// Other Income Form Component - Full Width, Ultra Premium UI/UX matching sibling components
import { useState, useMemo } from 'react'
import { PlusCircle, Calendar, DollarSign, Tag, FileText, Check, Loader2, Trash2, Layers, BookOpen, Search, ArrowUpRight } from 'lucide-react'
import { useAdminOperations } from '../hooks/useSupabase'
import { formatCurrency, formatDate } from '../utils/helpers'
import { useToast } from './Toast'
import ConfirmModal from './ConfirmModal'

const PRESET_CATEGORIES = [
    { value: 'Kas Sebelumnya', label: '🏛️ Kas Sebelumnya / Sisa Saldo Periode Lalu' },
    { value: 'Donasi / Hibah', label: '🎁 Donasi / Hibah Warga' },
    { value: 'Pendapatan Bunga', label: '🏦 Pendapatan Bunga Bank' },
    { value: 'Sponsorship', label: '🤝 Sponsorship / Kerjasama' },
    { value: 'Lain-lain', label: '💡 Pemasukan Lainnya' }
]

const QUICK_AMOUNTS = [
    { label: '+1 Juta', value: 1000000 },
    { label: '+2.5 Juta', value: 2500000 },
    { label: '+5 Juta', value: 5000000 },
    { label: '+10 Juta', value: 10000000 }
]

export default function OtherIncomeForm({
    onSuccess,
    blockFilter,
    otherIncomes = [],
    onDeleteIncome
}) {
    const { createOtherIncome, loading } = useAdminOperations()
    const toast = useToast()

    const [formData, setFormData] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        block_id: blockFilter || 'A',
        kategori: 'Kas Sebelumnya',
        keterangan: '',
        nominal: 5000000
    })

    const [searchTerm, setSearchTerm] = useState('')
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    // Filter incomes by block
    const filteredIncomes = useMemo(() => {
        if (!blockFilter) return otherIncomes
        return otherIncomes.filter(o => !o.block_id || o.block_id === blockFilter)
    }, [otherIncomes, blockFilter])

    // Summary calculations
    const totalIncomes = useMemo(() => {
        return filteredIncomes.reduce((sum, o) => sum + Number(o.nominal || 0), 0)
    }, [filteredIncomes])

    const totalBlokA = useMemo(() => {
        return otherIncomes
            .filter(o => o.block_id === 'A')
            .reduce((sum, o) => sum + Number(o.nominal || 0), 0)
    }, [otherIncomes])

    const totalBlokB = useMemo(() => {
        return otherIncomes
            .filter(o => o.block_id === 'B')
            .reduce((sum, o) => sum + Number(o.nominal || 0), 0)
    }, [otherIncomes])

    const totalUmum = useMemo(() => {
        return otherIncomes
            .filter(o => !o.block_id)
            .reduce((sum, o) => sum + Number(o.nominal || 0), 0)
    }, [otherIncomes])

    // Search filter
    const searchedIncomes = useMemo(() => {
        if (!searchTerm.trim()) return filteredIncomes
        const term = searchTerm.toLowerCase()
        return filteredIncomes.filter(o =>
            (o.keterangan && o.keterangan.toLowerCase().includes(term)) ||
            (o.kategori && o.kategori.toLowerCase().includes(term)) ||
            (o.block_id && `blok ${o.block_id}`.toLowerCase().includes(term))
        )
    }, [filteredIncomes, searchTerm])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'nominal' ? (value === '' ? '' : Number(value)) : value
        }))
    }

    const handleQuickAmount = (val) => {
        setFormData(prev => ({
            ...prev,
            nominal: Number(prev.nominal || 0) + val
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.nominal || Number(formData.nominal) <= 0) {
            toast.error('Nominal pemasukan harus lebih dari 0')
            return
        }

        if (!formData.keterangan.trim()) {
            toast.error('Keterangan transaksi wajib diisi')
            return
        }

        setSubmitting(true)
        try {
            await createOtherIncome({
                tanggal: formData.tanggal,
                block_id: formData.block_id || null,
                kategori: formData.kategori,
                keterangan: formData.keterangan.trim(),
                nominal: Number(formData.nominal)
            })

            toast.success('Pemasukan kas lain berhasil disimpan!')
            setFormData(prev => ({
                ...prev,
                keterangan: '',
                nominal: ''
            }))

            if (onSuccess) onSuccess()
        } catch (err) {
            toast.error('Gagal mencatat: ' + err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', width: '100%' }}>
            {/* 1. Quick Summary Cards (Matching Buku Kas) */}
            <div className="bukukas-summary">
                <div className="bukukas-summary-card masuk">
                    <ArrowUpRight size={22} />
                    <div>
                        <span className="bukukas-summary-label">Total Pemasukan Non-Iuran</span>
                        <span className="bukukas-summary-value">{formatCurrency(totalIncomes)}</span>
                    </div>
                </div>

                <div className="bukukas-summary-card masuk" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                    <Layers size={22} style={{ color: '#10b981' }} />
                    <div>
                        <span className="bukukas-summary-label">Total Kas Masuk Blok A</span>
                        <span className="bukukas-summary-value" style={{ color: '#10b981' }}>{formatCurrency(totalBlokA)}</span>
                    </div>
                </div>

                <div className="bukukas-summary-card masuk" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    <Layers size={22} style={{ color: '#3b82f6' }} />
                    <div>
                        <span className="bukukas-summary-label">Total Kas Masuk Blok B</span>
                        <span className="bukukas-summary-value" style={{ color: '#3b82f6' }}>{formatCurrency(totalBlokB)}</span>
                    </div>
                </div>
            </div>

            {/* 2. Full Width Input Form Card */}
            <div className="card" style={{ width: '100%' }}>
                <div className="card-header">
                    <h3 className="card-title">
                        <PlusCircle size={20} />
                        Formulir Pemasukan Kas Lain
                    </h3>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {blockFilter ? `Penyaringan Aktif: Blok ${blockFilter}` : 'Semua Blok'}
                    </span>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Row 1: Tanggal & Alokasi Blok */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'var(--space-lg)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        {/* Tanggal */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">
                                <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                Tanggal Transaksi
                            </label>
                            <input
                                type="date"
                                name="tanggal"
                                className="form-input"
                                value={formData.tanggal}
                                onChange={handleChange}
                                style={{ colorScheme: 'dark' }}
                                required
                            />
                        </div>

                        {/* Alokasi Blok Kas */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">
                                <Layers size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                Alokasi Blok Kas
                            </label>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                {[
                                    { id: 'A', label: 'Blok A', color: '#10b981' },
                                    { id: 'B', label: 'Blok B', color: '#3b82f6' },
                                    { id: '', label: 'Semua Blok', color: '#8b5cf6' }
                                ].map(blk => {
                                    const isSelected = (formData.block_id || '') === blk.id
                                    return (
                                        <button
                                            key={blk.id}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, block_id: blk.id }))}
                                            style={{
                                                flex: 1,
                                                padding: '10px 14px',
                                                borderRadius: 'var(--radius-md)',
                                                border: isSelected
                                                    ? `2px solid ${blk.color}`
                                                    : '1px solid var(--border-color)',
                                                background: isSelected
                                                    ? `${blk.color}20`
                                                    : 'var(--bg-tertiary)',
                                                color: isSelected
                                                    ? blk.color
                                                    : 'var(--text-secondary)',
                                                fontWeight: isSelected ? 700 : 500,
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                transition: 'all var(--transition-fast)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <span style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: blk.color
                                            }} />
                                            {blk.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Kategori & Nominal */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'var(--space-lg)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        {/* Kategori */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">
                                <Tag size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                Kategori Pemasukan
                            </label>
                            <select
                                name="kategori"
                                className="form-select"
                                value={formData.kategori}
                                onChange={handleChange}
                            >
                                {PRESET_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Nominal */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">
                                <DollarSign size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                Nominal (Rp)
                            </label>
                            <input
                                type="number"
                                name="nominal"
                                className="form-input"
                                placeholder="Contoh: 5000000"
                                value={formData.nominal}
                                onChange={handleChange}
                                min="1000"
                                step="1000"
                                required
                                style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: 'var(--color-primary)'
                                }}
                            />
                            {formData.nominal > 0 && (
                                <div style={{
                                    marginTop: '6px',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color: 'var(--color-success)'
                                }}>
                                    Terbilang: {formatCurrency(Number(formData.nominal))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Amount Chips */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginBottom: 'var(--space-lg)',
                        padding: '10px 14px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Pilihan Cepat:
                        </span>
                        {QUICK_AMOUNTS.map(chip => (
                            <button
                                key={chip.value}
                                type="button"
                                onClick={() => handleQuickAmount(chip.value)}
                                className="btn btn-sm btn-secondary"
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                {chip.label}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, nominal: 5000000 }))}
                            className="btn btn-sm"
                            style={{
                                fontSize: '0.8rem',
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                fontWeight: 600
                            }}
                        >
                            Set Rp 5.000.000
                        </button>
                        {formData.nominal > 0 && (
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, nominal: '' }))}
                                className="btn btn-sm"
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    marginLeft: 'auto'
                                }}
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Keterangan */}
                    <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
                        <label className="form-label">
                            <FileText size={14} style={{ display: 'inline', marginRight: '6px' }} />
                            Keterangan / Catatan Transaksi <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>
                        <textarea
                            name="keterangan"
                            className="form-textarea"
                            rows={3}
                            placeholder="Tuliskan keterangan detail transaksi di sini (misal: 'Pembagian sisa dana kas periode sebelumnya untuk Blok A Rp 5.000.000')..."
                            value={formData.keterangan}
                            onChange={handleChange}
                            required
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px', display: 'block' }}>
                            Keterangan ini akan langsung tampil di Buku Kas, Kas Utama, dan laporan transparansi warga.
                        </small>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={submitting || loading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: 600
                        }}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Menyimpan Transaksi...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Simpan Pemasukan Kas
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* 3. Full Width Riwayat Card (Matching Buku Kas Table) */}
            <div className="card" style={{ width: '100%' }}>
                <div className="card-header">
                    <h3 className="card-title">
                        <BookOpen size={20} />
                        Riwayat Pemasukan Kas Lain Tercatat
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            {filteredIncomes.length} transaksi tercatat
                        </span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bukukas-search" style={{ marginBottom: 'var(--space-md)' }}>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Cari transaksi berdasarkan keterangan atau kategori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {searchedIncomes.length === 0 ? (
                    <div className="bukukas-empty">
                        <BookOpen size={40} />
                        <p>{searchTerm ? 'Tidak ada transaksi yang sesuai dengan pencarian' : 'Belum ada data pemasukan kas lain yang dicatat'}</p>
                    </div>
                ) : (
                    <div className="bukukas-table-wrapper">
                        <table className="bukukas-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>No</th>
                                    <th>Tanggal</th>
                                    <th>Alokasi Blok</th>
                                    <th>Kategori</th>
                                    <th>Keterangan</th>
                                    <th className="text-right">Nominal Masuk</th>
                                    <th style={{ textAlign: 'center', width: '80px' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchedIncomes.map((item, idx) => (
                                    <tr key={item.id} className="row-masuk">
                                        <td className="text-muted">{idx + 1}</td>
                                        <td className="bukukas-date">{formatDate(item.tanggal)}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '3px 10px',
                                                borderRadius: '12px',
                                                background: item.block_id === 'B' ? 'rgba(59, 130, 246, 0.15)' : (item.block_id === 'A' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)'),
                                                color: item.block_id === 'B' ? '#60a5fa' : (item.block_id === 'A' ? '#34d399' : '#a78bfa'),
                                                fontWeight: 700,
                                                border: item.block_id === 'B' ? '1px solid rgba(59, 130, 246, 0.3)' : (item.block_id === 'A' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)')
                                            }}>
                                                {item.block_id ? `Blok ${item.block_id}` : 'Semua Blok'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{item.kategori}</td>
                                        <td>
                                            <div className="bukukas-ket">
                                                <span className="bukukas-badge masuk">↑</span>
                                                <span>{item.keterangan}</span>
                                            </div>
                                        </td>
                                        <td className="text-right text-success" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                            + {formatCurrency(item.nominal)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                type="button"
                                                className="bukukas-delete-btn"
                                                onClick={() => setConfirmDeleteId(item.id)}
                                                title="Hapus transaksi ini"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Confirm Delete Modal */}
            {confirmDeleteId && (
                <ConfirmModal
                    isOpen={!!confirmDeleteId}
                    title="Hapus Pemasukan Kas Lain"
                    message="Apakah Anda yakin ingin menghapus data pemasukan ini? Saldo Kas Utama dan Buku Kas akan disesuaikan otomatis."
                    confirmText="Hapus"
                    cancelText="Batal"
                    variant="danger"
                    onConfirm={async () => {
                        if (onDeleteIncome) {
                            await onDeleteIncome(confirmDeleteId)
                        }
                        setConfirmDeleteId(null)
                    }}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            )}
        </div>
    )
}
