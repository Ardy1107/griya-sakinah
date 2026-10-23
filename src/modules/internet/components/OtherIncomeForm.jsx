// Other Income Form Component - Input Pemasukan Kas Lain / Non-Iuran
import { useState, useMemo } from 'react'
import { PlusCircle, Calendar, DollarSign, Tag, FileText, Check, Loader2, Trash2, Layers, AlertCircle, ArrowUpRight } from 'lucide-react'
import { useAdminOperations } from '../hooks/useSupabase'
import { formatCurrency, formatDate } from '../utils/helpers'
import { useToast } from './Toast'
import ConfirmModal from './ConfirmModal'

const PRESET_CATEGORIES = [
    { value: 'Kas Sebelumnya', label: '🏛️ Kas Sebelumnya / Saldo Periode Lalu' },
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

    const [confirmDeleteId, setConfirmDeleteId] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    // Filter incomes by block
    const filteredIncomes = useMemo(() => {
        if (!blockFilter) return otherIncomes
        return otherIncomes.filter(o => !o.block_id || o.block_id === blockFilter)
    }, [otherIncomes, blockFilter])

    const totalIncomes = useMemo(() => {
        return filteredIncomes.reduce((sum, o) => sum + Number(o.nominal || 0), 0)
    }, [filteredIncomes])

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
            toast.error('Keterangan wajib diisi')
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

            toast.success('Pemasukan lain berhasil dicatat!')
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            {/* Header info */}
            <div className="admin-section-header">
                <div>
                    <h2 className="admin-section-title">📥 Input Pemasukan Kas Lain</h2>
                    <p className="admin-section-subtitle">
                        Catat dana kas periode sebelumnya, donasi, atau pendapatan non-iuran lainnya — {blockFilter ? `Blok ${blockFilter}` : 'Semua Blok'}
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                        {/* Tanggal */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={15} />
                                Tanggal Transaksi
                            </label>
                            <input
                                type="date"
                                name="tanggal"
                                className="form-control"
                                value={formData.tanggal}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Alokasi Blok */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Layers size={15} />
                                Alokasi Blok Kas
                            </label>
                            <select
                                name="block_id"
                                className="form-select"
                                value={formData.block_id || ''}
                                onChange={handleChange}
                            >
                                <option value="A">Blok A</option>
                                <option value="B">Blok B</option>
                                <option value="">Semua Blok (Umum / Bersama)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                        {/* Kategori */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Tag size={15} />
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
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <DollarSign size={15} />
                                Nominal (Rp)
                            </label>
                            <input
                                type="number"
                                name="nominal"
                                className="form-control"
                                placeholder="Contoh: 5000000"
                                value={formData.nominal}
                                onChange={handleChange}
                                min="1000"
                                step="1000"
                                required
                                style={{ fontSize: '1.1rem', fontWeight: 700 }}
                            />
                            {formData.nominal > 0 && (
                                <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, margin: '4px 0 0' }}>
                                    {formatCurrency(Number(formData.nominal))}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Quick Amount Chips */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tambah Cepat:</span>
                        {QUICK_AMOUNTS.map(chip => (
                            <button
                                key={chip.value}
                                type="button"
                                onClick={() => handleQuickAmount(chip.value)}
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '3px 10px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {chip.label}
                            </button>
                        ))}
                        {formData.nominal > 0 && (
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, nominal: 0 }))}
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '3px 10px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    color: '#ef4444',
                                    cursor: 'pointer'
                                }}
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Keterangan */}
                    <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={15} />
                            Keterangan / Catatan Transaksi <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            name="keterangan"
                            className="form-control"
                            rows={3}
                            placeholder="Tulis keterangan transaksi di sini, misalnya: 'Pembagian dana kas periode sebelumnya untuk Blok A' atau 'Donasi warga untuk penambahan access point'..."
                            value={formData.keterangan}
                            onChange={handleChange}
                            required
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                            Keterangan ini akan langsung tampil di Buku Kas dan laporan keuangan warga.
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting || loading}
                        style={{ width: '100%', padding: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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

            {/* Riwayat Pemasukan Lain */}
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ArrowUpRight size={18} style={{ color: '#10b981' }} />
                            Riwayat Pemasukan Lain Tercatat
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                            Total: <strong style={{ color: '#10b981' }}>{formatCurrency(totalIncomes)}</strong> ({filteredIncomes.length} transaksi)
                        </p>
                    </div>
                </div>

                {filteredIncomes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Belum ada data pemasukan kas lain yang dicatat.</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem' }}>Gunakan formulir di atas untuk mencatat saldo kas sebelumnya atau dana lainnya.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Tanggal</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Blok</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Kategori</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Keterangan</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Nominal</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIncomes.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{formatDate(item.tanggal)}</td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                background: item.block_id === 'B' ? 'rgba(59, 130, 246, 0.15)' : (item.block_id === 'A' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)'),
                                                color: item.block_id === 'B' ? '#3b82f6' : (item.block_id === 'A' ? '#10b981' : 'var(--text-muted)'),
                                                fontWeight: 700
                                            }}>
                                                {item.block_id ? `Blok ${item.block_id}` : 'Semua'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', whiteSpace: 'nowrap', fontWeight: 600 }}>{item.kategori}</td>
                                        <td style={{ padding: '10px' }}>{item.keterangan}</td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap' }}>
                                            + {formatCurrency(item.nominal)}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDeleteId(item.id)}
                                                title="Hapus pemasukan ini"
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <Trash2 size={16} />
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
