// Expense Form Component with Multi-Item Support & Block-Aware Pricing
import { useState, useMemo } from 'react'
import { Receipt, FileText, DollarSign, Tag, Calendar, Loader2, Check, Plus, Trash2, List, ChevronRight, Filter } from 'lucide-react'
import { useAdminOperations } from '../hooks/useSupabase'
import { formatCurrency, getMonthName } from '../utils/helpers'
import { useBlock } from '../context/BlockContext'
import { getBlockConfig, BLOCK_CONFIG } from '../config/blockConfig'

// Build expense categories dynamically based on block
function getExpenseCategories(blockId) {
    const config = getBlockConfig(blockId)
    const categories = []

    if (config?.expenses) {
        Object.entries(config.expenses).forEach(([value, data]) => {
            categories.push({ value, label: data.label, fixed: data.nominal })
        })
    } else {
        // Fallback when no block is selected — show all unique categories
        const seen = new Set()
        Object.values(BLOCK_CONFIG).forEach(block => {
            if (block.expenses) {
                Object.entries(block.expenses).forEach(([value, data]) => {
                    if (!seen.has(value)) {
                        seen.add(value)
                        categories.push({ value, label: data.label })
                    }
                })
            }
        })
    }

    // Always add generic categories
    categories.push({ value: 'Maintenance', label: '🔧 Maintenance / Perawatan' })
    categories.push({ value: 'Lainnya', label: '💡 Lainnya' })

    return categories
}

const EMPTY_ITEM = { nama: '', qty: 1, harga: 0 }

export default function ExpenseForm({ onSuccess, expenses = [], blockFilter }) {
    const { createExpense, loading } = useAdminOperations()
    const { blockId, blockName, isBlockSpecific } = useBlock()
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Use blockFilter from parent (AdminPanel) if available, otherwise fall back to BlockContext
    const effectiveBlockId = blockFilter || blockId || 'A'

    // Dynamic categories based on effective block
    const EXPENSE_CATEGORIES = useMemo(() => {
        return getExpenseCategories(effectiveBlockId)
    }, [effectiveBlockId])

    // Get list of months already paid for Bandwidth/ISP
    const paidStarlinkMonths = useMemo(() => {
        return expenses
            .filter(exp => exp.kategori === 'Bandwidth')
            .map(exp => {
                const date = new Date(exp.tanggal)
                // Extract month from keterangan if available, otherwise use tanggal
                const match = exp.keterangan?.match(/(\w+)\s+(\d{4})/)
                if (match) {
                    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
                    const monthIndex = monthNames.indexOf(match[1])
                    if (monthIndex !== -1) {
                        return `${monthIndex + 1}-${match[2]}`
                    }
                }
                return `${date.getMonth() + 1}-${date.getFullYear()}`
            })
    }, [expenses])

    // Get default fixed amount for the initial category
    const getFixedAmount = (category, blk) => {
        const config = getBlockConfig(blk)
        return config?.expenses?.[category]?.nominal || 0
    }

    // Check if CURRENT month Starlink is already paid (to lock category)
    const isCurrentMonthStarlinkPaid = useMemo(() => {
        return paidStarlinkMonths.includes(`${currentMonth}-${currentYear}`)
    }, [paidStarlinkMonths, currentMonth, currentYear])

    // Find the next unpaid month starting from current
    const getNextUnpaidMonth = () => {
        let month = currentMonth
        let year = currentYear

        // Check up to 24 months ahead
        for (let i = 0; i < 24; i++) {
            if (!paidStarlinkMonths.includes(`${month}-${year}`)) {
                return { month, year }
            }
            month++
            if (month > 12) {
                month = 1
                year++
            }
        }
        return { month: currentMonth, year: currentYear }
    }

    // Starlink month picker state - start from next unpaid month
    const [starlinkPeriod, setStarlinkPeriod] = useState(() => getNextUnpaidMonth())

    // Determine initial category and amount
    const getInitialCategory = () => {
        if (isCurrentMonthStarlinkPaid) return 'Maintenance'
        return 'Bandwidth'
    }

    const getInitialAmount = () => {
        if (isCurrentMonthStarlinkPaid) return 0
        return getFixedAmount('Bandwidth', effectiveBlockId)
    }

    const [formData, setFormData] = useState({
        keterangan: isCurrentMonthStarlinkPaid ? '' : 'Pembayaran ISP Starlink',
        nominal: getInitialAmount(),
        kategori: getInitialCategory(),
        tanggal: now.toISOString().split('T')[0]
    })

    const [useDetailItems, setUseDetailItems] = useState(false)
    const [items, setItems] = useState([{ ...EMPTY_ITEM }])
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    // Check if selected Starlink period is already paid
    const isStarlinkPeriodPaid = useMemo(() => {
        return paidStarlinkMonths.includes(`${starlinkPeriod.month}-${starlinkPeriod.year}`)
    }, [paidStarlinkMonths, starlinkPeriod])

    // Check if selected category has a fixed price
    const currentCategoryFixed = useMemo(() => {
        return EXPENSE_CATEGORIES.find(c => c.value === formData.kategori)?.fixed
    }, [formData.kategori, EXPENSE_CATEGORIES])

    // Calculate total from items
    const calculateItemsTotal = () => {
        return items.reduce((sum, item) => sum + (item.qty * item.harga), 0)
    }

    // Handle Starlink month navigation
    const handleStarlinkMonthChange = (direction) => {
        setStarlinkPeriod(prev => {
            const newMonth = prev.month + direction > 12 ? 1 : (prev.month + direction < 1 ? 12 : prev.month + direction)
            const newYear = prev.month + direction > 12 ? prev.year + 1 : (prev.month + direction < 1 ? prev.year - 1 : prev.year)

            const newPeriod = { month: newMonth, year: newYear }

            // Sync keterangan immediately if category is Bandwidth
            if (formData.kategori === 'Bandwidth') {
                setFormData(current => ({
                    ...current,
                    keterangan: 'Pembayaran ISP Starlink'
                }))
            }

            return newPeriod
        })
    }

    // Handle block change (when not in block-specific mode)
    const handleBlockChange = (newBlock) => {
        setSelectedBlock(newBlock)
        // Re-calculate amount if current category has a fixed price in the new block
        const config = getBlockConfig(newBlock)
        const fixedAmount = config?.expenses?.[formData.kategori]?.nominal
        if (fixedAmount) {
            setFormData(prev => ({ ...prev, nominal: fixedAmount }))
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        // Auto-fill for fixed-price categories
        if (name === 'kategori') {
            const category = EXPENSE_CATEGORIES.find(c => c.value === value)
            if (category?.fixed) {
                const autoKeterangan = value === 'Bandwidth' ? 'Pembayaran ISP Starlink'
                    : value === 'Support' ? 'Biaya Support & Maintenance'
                    : value === 'Listrik' ? 'Biaya Listrik Starlink & Perangkat Jaringan'
                    : ''
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    nominal: category.fixed,
                    keterangan: autoKeterangan
                }))
                return
            } else {
                // Reset fields when switching to a non-fixed category
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    nominal: 0,
                    keterangan: ''
                }))
                return
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: name === 'nominal' ? Number(value) : value
        }))
        setError(null)
        setSuccess(false)
    }

    const handleItemChange = (index, field, value) => {
        setItems(prev => {
            const updated = [...prev]
            updated[index] = {
                ...updated[index],
                [field]: field === 'nama' ? value : Number(value)
            }
            return updated
        })
    }

    const addItem = () => {
        setItems(prev => [...prev, { ...EMPTY_ITEM }])
    }

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(prev => prev.filter((_, i) => i !== index))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        // For Starlink, check if already paid
        if (formData.kategori === 'Bandwidth' && isStarlinkPeriodPaid) {
            setError(`Pembayaran Bandwidth untuk ${getMonthName(starlinkPeriod.month)} ${starlinkPeriod.year} sudah dicatat. Pilih bulan lain.`)
            return
        }

        // For non-fixed categories, require keterangan
        if (!currentCategoryFixed && !formData.keterangan.trim()) {
            setError('Keterangan wajib diisi')
            return
        }

        const finalNominal = useDetailItems ? calculateItemsTotal() : formData.nominal

        if (finalNominal <= 0) {
            setError('Nominal harus lebih dari 0')
            return
        }

        // Validate items if using detail
        if (useDetailItems) {
            const validItems = items.filter(item => item.nama.trim() && item.qty > 0 && item.harga > 0)
            if (validItems.length === 0) {
                setError('Minimal 1 item harus diisi lengkap')
                return
            }
        }

        try {
            // For fixed categories, auto-generate keterangan
            let finalKeterangan = formData.keterangan
            if (formData.kategori === 'Bandwidth') {
                finalKeterangan = 'Pembayaran ISP Starlink'
            } else if (formData.kategori === 'Support' && !formData.keterangan.trim()) {
                finalKeterangan = 'Biaya Support & Maintenance'
            } else if (formData.kategori === 'Listrik' && !formData.keterangan.trim()) {
                finalKeterangan = 'Biaya Listrik Starlink & Perangkat Jaringan'
            }

            const expenseData = {
                ...formData,
                keterangan: finalKeterangan,
                nominal: finalNominal,
                // Auto-assign block_id
                block_id: effectiveBlockId || null
            }

            await createExpense(expenseData)
            setSuccess(true)

            // Reset form - move to next unpaid month for Starlink
            if (formData.kategori === 'Bandwidth') {
                handleStarlinkMonthChange(1) // Move to next month
            }

            setFormData({
                keterangan: formData.kategori === 'Bandwidth' ? 'Pembayaran ISP Starlink' : '',
                nominal: currentCategoryFixed || 0,
                kategori: formData.kategori,
                tanggal: new Date().toISOString().split('T')[0]
            })
            setItems([{ ...EMPTY_ITEM }])
            setUseDetailItems(false)

            if (onSuccess) onSuccess()

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.message)
        }
    }

    // Get effective block name for display
    const effectiveBlockName = getBlockConfig(effectiveBlockId)?.name || 'Semua Blok'

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <Receipt size={20} />
                    Input Pengeluaran
                </h3>
            </div>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-md)',
                        marginBottom: 'var(--space-lg)',
                        color: 'var(--color-danger)',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-md)',
                        marginBottom: 'var(--space-lg)',
                        color: 'var(--color-success)',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)'
                    }}>
                        <Check size={18} />
                        Pengeluaran berhasil disimpan!
                    </div>
                )}

                {/* Block Selector (only when not controlled by parent and not in block-specific mode) */}
                {!blockFilter && !isBlockSpecific && (
                    <div className="form-group">
                        <label className="form-label">
                            <Filter size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Blok Pengeluaran
                        </label>
                        <div style={{
                            display: 'flex',
                            gap: 'var(--space-sm)'
                        }}>
                            {Object.values(BLOCK_CONFIG).map(block => (
                                <button
                                    key={block.id}
                                    type="button"
                                    onClick={() => handleBlockChange(block.id)}
                                    style={{
                                        flex: 1,
                                        padding: 'var(--space-sm) var(--space-md)',
                                        borderRadius: 'var(--radius-md)',
                                        border: effectiveBlockId === block.id
                                            ? `2px solid ${block.color}`
                                            : '2px solid var(--color-border)',
                                        background: effectiveBlockId === block.id
                                            ? `${block.color}15`
                                            : 'transparent',
                                        color: effectiveBlockId === block.id
                                            ? block.color
                                            : 'var(--text-secondary)',
                                        fontWeight: effectiveBlockId === block.id ? 700 : 500,
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        fontFamily: 'var(--font-sans)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {block.name}
                                </button>
                            ))}
                        </div>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                            Harga Starlink {effectiveBlockName}: {formatCurrency(getFixedAmount('Bandwidth', effectiveBlockId))} /bln
                        </small>
                    </div>
                )}

                {/* Category */}
                <div className="form-group">
                    <label className="form-label">
                        <Tag size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Kategori
                    </label>
                    <select
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleChange}
                        className="form-select"
                    >
                        {EXPENSE_CATEGORIES.map(cat => (
                            <option
                                key={cat.value}
                                value={cat.value}
                            >
                                {cat.label}{cat.fixed ? ` — ${formatCurrency(cat.fixed)}` : ''}
                            </option>
                        ))}
                    </select>
                    {isCurrentMonthStarlinkPaid && (
                        <small style={{
                            color: 'var(--color-success)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px'
                        }}>
                            <Check size={12} />
                            Starlink {getMonthName(currentMonth)} {currentYear} sudah lunas
                        </small>
                    )}
                </div>

                {/* Starlink Month Picker - only for Bandwidth category */}
                {formData.kategori === 'Bandwidth' && (
                    <div className="form-group">
                        <label className="form-label">
                            <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Periode Pembayaran
                        </label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-lg)',
                            background: isStarlinkPeriodPaid
                                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04))'
                                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.04))',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-lg)',
                            border: isStarlinkPeriodPaid
                                ? '1px solid rgba(34, 197, 94, 0.25)'
                                : '1px solid rgba(16, 185, 129, 0.15)'
                        }}>
                            <div style={{
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-md)'
                            }}>
                                <span style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: isStarlinkPeriodPaid ? 'var(--color-success)' : 'var(--text-primary)',
                                    letterSpacing: '-0.5px'
                                }}>
                                    {getMonthName(starlinkPeriod.month)} {starlinkPeriod.year}
                                </span>

                                {isStarlinkPeriodPaid && (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.75rem',
                                        color: 'var(--color-success)',
                                        background: 'rgba(34, 197, 94, 0.15)',
                                        padding: '4px 10px',
                                        borderRadius: 'var(--radius-full)',
                                        fontWeight: 600
                                    }}>
                                        <Check size={12} />
                                        Lunas
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                className="btn btn-sm"
                                onClick={() => handleStarlinkMonthChange(1)}
                                style={{
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                Bulan Berikutnya
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Description - only for non-fixed categories */}
                {!currentCategoryFixed && (
                    <div className="form-group">
                        <label className="form-label">
                            <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Keterangan
                        </label>
                        <input
                            type="text"
                            name="keterangan"
                            value={formData.keterangan}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Contoh: Snack rapat RT bulan Desember"
                            required
                        />
                    </div>
                )}

                {/* Toggle Detail Items - only for non-fixed categories */}
                {!currentCategoryFixed && (
                    <div className="form-group">
                        <label className="form-checkbox-label" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            cursor: 'pointer',
                            padding: 'var(--space-sm)',
                            background: useDetailItems ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            borderRadius: 'var(--radius-md)',
                            border: useDetailItems ? '1px solid var(--color-primary)' : '1px solid var(--color-border)'
                        }}>
                            <input
                                type="checkbox"
                                checked={useDetailItems}
                                onChange={(e) => setUseDetailItems(e.target.checked)}
                                style={{ width: 18, height: 18 }}
                            />
                            <List size={16} />
                            <span>Detail Item (opsional)</span>
                        </label>
                    </div>
                )}

                {/* Multi-Item Table */}
                {useDetailItems && (
                    <div className="form-group">
                        <div style={{
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <th style={{ textAlign: 'left', padding: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Nama Item</th>
                                        <th style={{ textAlign: 'center', padding: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)', width: '60px' }}>Qty</th>
                                        <th style={{ textAlign: 'right', padding: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)', width: '100px' }}>Harga</th>
                                        <th style={{ textAlign: 'right', padding: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)', width: '100px' }}>Subtotal</th>
                                        <th style={{ width: '40px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '4px' }}>
                                                <input
                                                    type="text"
                                                    value={item.nama}
                                                    onChange={(e) => handleItemChange(index, 'nama', e.target.value)}
                                                    className="form-input"
                                                    placeholder="Nama item..."
                                                    style={{ fontSize: '0.875rem' }}
                                                />
                                            </td>
                                            <td style={{ padding: '4px' }}>
                                                <input
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                                    className="form-input"
                                                    min="1"
                                                    style={{ textAlign: 'center', fontSize: '0.875rem' }}
                                                />
                                            </td>
                                            <td style={{ padding: '4px' }}>
                                                <input
                                                    type="number"
                                                    value={item.harga}
                                                    onChange={(e) => handleItemChange(index, 'harga', e.target.value)}
                                                    className="form-input"
                                                    min="0"
                                                    step="1000"
                                                    style={{ textAlign: 'right', fontSize: '0.875rem' }}
                                                />
                                            </td>
                                            <td style={{ padding: '4px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600 }}>
                                                {formatCurrency(item.qty * item.harga)}
                                            </td>
                                            <td style={{ padding: '4px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="btn btn-icon btn-sm"
                                                    style={{
                                                        opacity: items.length === 1 ? 0.3 : 1,
                                                        color: 'var(--color-danger)'
                                                    }}
                                                    disabled={items.length === 1}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                                        <td colSpan={3} style={{ padding: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={addItem}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                <Plus size={14} />
                                                Tambah Item
                                            </button>
                                        </td>
                                        <td style={{
                                            padding: '8px',
                                            textAlign: 'right',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            color: 'var(--color-primary)'
                                        }}>
                                            {formatCurrency(calculateItemsTotal())}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* Amount - hide for fixed categories and when using detail items */}
                {!useDetailItems && !currentCategoryFixed && (
                    <div className="form-group">
                        <label className="form-label">
                            <DollarSign size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Nominal (Rp)
                        </label>
                        <input
                            type="number"
                            name="nominal"
                            value={formData.nominal}
                            onChange={handleChange}
                            className="form-input"
                            min="0"
                            step="1000"
                            placeholder="0"
                            required={!useDetailItems && !currentCategoryFixed}
                        />
                        {formData.nominal > 0 && (
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Nominal: {formatCurrency(formData.nominal)}
                            </small>
                        )}
                    </div>
                )}

                {/* Fixed amount display */}
                {currentCategoryFixed && (
                    <div className="form-group">
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.04))',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)',
                            border: '1px solid rgba(16, 185, 129, 0.15)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Nominal ({effectiveBlockName})
                            </span>
                            <span style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: 'var(--color-primary)'
                            }}>
                                {formatCurrency(formData.nominal)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Date */}
                <div className="form-group">
                    <label className="form-label">
                        <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Tanggal
                    </label>
                    <input
                        type="date"
                        name="tanggal"
                        value={formData.tanggal}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn btn-danger btn-lg"
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Check size={18} />
                            Simpan Pengeluaran
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
