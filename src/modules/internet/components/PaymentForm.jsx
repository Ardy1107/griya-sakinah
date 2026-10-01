// Payment Form Component - Enhanced v3.0 with Multi-Month Support
import { useState, useEffect, useMemo } from 'react'
import { CreditCard, User, Calendar, DollarSign, Loader2, Check, Wallet, Hash, FileText, Download, Layers } from 'lucide-react'
import { useResidents, useAdminOperations, useCurrentPeriod, uploadToStorage } from '../hooks/useSupabase'
import { getMonthName, formatCurrency, generateReceiptNumber } from '../utils/helpers'
import { getReceiptPDFBlob } from '../utils/receiptPdf'
import { getReceiptImageBlob } from '../utils/receiptImage'
import { useToast } from './Toast'
import WhatsAppShare from './WhatsAppShare'

const PAYMENT_METHODS = [
    { value: 'Cash', label: 'Cash / Tunai' },
    { value: 'Transfer', label: 'Transfer Bank' },
    { value: 'QRIS', label: 'QRIS' }
]

const DEFAULT_NOMINAL = 150000 // Rp 150.000
const SUBSIDIZED_NOMINAL = 75000 // Rp 75.000 for B2 & A18

// Units with Starlink equipment — get 50% subsidy
const SUBSIDIZED_UNITS = ['B2', 'A18']

const MONTH_COUNT_OPTIONS = [
    { value: 1, label: '1 Bulan' },
    { value: 2, label: '2 Bulan' },
    { value: 3, label: '3 Bulan' },
    { value: 6, label: '6 Bulan' },
    { value: 12, label: '12 Bulan' }
]

// Calculate the list of months covered from a start month/year for N months
function getMonthRange(startBulan, startTahun, count) {
    const months = []
    let bulan = startBulan
    let tahun = startTahun
    for (let i = 0; i < count; i++) {
        months.push({ bulan, tahun })
        bulan++
        if (bulan > 12) {
            bulan = 1
            tahun++
        }
    }
    return months
}

function getMonthRangeLabel(startBulan, startTahun, count) {
    if (count === 1) return `${getMonthName(startBulan)} ${startTahun}`
    const months = getMonthRange(startBulan, startTahun, count)
    const first = months[0]
    const last = months[months.length - 1]
    if (first.tahun === last.tahun) {
        return `${getMonthName(first.bulan)} - ${getMonthName(last.bulan)} ${first.tahun}`
    }
    return `${getMonthName(first.bulan)} ${first.tahun} - ${getMonthName(last.bulan)} ${last.tahun}`
}

export default function PaymentForm({ onSuccess, blockFilter }) {
    const { residents, loading: residentsLoading } = useResidents()
    const { createPayment, updatePaymentReceipt, loading } = useAdminOperations()
    const { bulan: currentBulan, tahun: currentTahun } = useCurrentPeriod()
    const toast = useToast()

    // Filter residents by block
    const filteredResidents = blockFilter
        ? residents.filter(r => r.blok_rumah?.charAt(0)?.toUpperCase() === blockFilter)
        : residents

    const [formData, setFormData] = useState({
        resident_id: '',
        bulan: currentBulan,
        tahun: currentTahun,
        tanggal_bayar: new Date().toISOString().split('T')[0],
        metode_bayar: 'Cash',
        nomor_referensi: ''
    })

    const [jumlahBulan, setJumlahBulan] = useState(1)
    const [selectedResident, setSelectedResident] = useState(null)
    const [savedPayments, setSavedPayments] = useState([])
    const [receiptUrls, setReceiptUrls] = useState(null)
    const [generatingReceipt, setGeneratingReceipt] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    // Detect if selected resident is a subsidized unit
    const isSubsidized = useMemo(() => {
        if (!selectedResident) return false
        const blok = selectedResident.blok_rumah?.toUpperCase()?.trim()
        return SUBSIDIZED_UNITS.includes(blok)
    }, [selectedResident])

    // Per-month nominal based on unit
    const perMonthNominal = isSubsidized ? SUBSIDIZED_NOMINAL : DEFAULT_NOMINAL

    // Total nominal
    const totalNominal = perMonthNominal * jumlahBulan

    // Month range for display
    const monthRangeLabel = getMonthRangeLabel(formData.bulan, formData.tahun, jumlahBulan)
    const monthRange = getMonthRange(formData.bulan, formData.tahun, jumlahBulan)

    // Auto-generate reference number
    useEffect(() => {
        const refNo = generateReceiptNumber(Date.now().toString())
        setFormData(prev => ({ ...prev, nomor_referensi: refNo }))
    }, [])

    // Update selected resident when resident_id changes
    useEffect(() => {
        if (formData.resident_id) {
            const resident = residents.find(r => r.id === formData.resident_id)
            setSelectedResident(resident)
        } else {
            setSelectedResident(null)
        }
    }, [formData.resident_id, residents])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'bulan' || name === 'tahun'
                ? Number(value)
                : value
        }))
        setError(null)
        setSuccess(false)
        setSavedPayments([])
        setReceiptUrls(null)
    }

    const generateAndUploadReceipts = async (resident, combinedPayment) => {
        setGeneratingReceipt(true)
        try {
            // Generate PDF
            const pdfBlob = await getReceiptPDFBlob(resident, combinedPayment)
            const pdfPath = `receipts/${resident.blok_rumah}/${combinedPayment.tahun}/${combinedPayment.bulan}_${jumlahBulan}bln_pdf.pdf`

            // Generate Image
            const imgBlob = await getReceiptImageBlob(resident, combinedPayment)
            const imgPath = `receipts/${resident.blok_rumah}/${combinedPayment.tahun}/${combinedPayment.bulan}_${jumlahBulan}bln_img.png`

            let pdfUrl = null
            let imgUrl = null

            try {
                pdfUrl = await uploadToStorage(pdfBlob, 'receipts', pdfPath)
            } catch (uploadErr) {
                console.warn('PDF upload failed:', uploadErr)
            }

            try {
                imgUrl = await uploadToStorage(imgBlob, 'receipts', imgPath)
            } catch (uploadErr) {
                console.warn('Image upload failed:', uploadErr)
            }

            // Update the first payment record with receipt URLs
            if ((pdfUrl || imgUrl) && combinedPayment.id) {
                await updatePaymentReceipt(combinedPayment.id, {
                    receipt_url_pdf: pdfUrl,
                    receipt_url_img: imgUrl
                })
            }

            setReceiptUrls({ pdf: pdfUrl, img: imgUrl })
            return { pdf: pdfUrl, img: imgUrl }
        } catch (err) {
            console.error('Receipt generation error:', err)
            return null
        } finally {
            setGeneratingReceipt(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)
        setSubmitting(true)

        if (!formData.resident_id) {
            setError('Pilih warga terlebih dahulu')
            setSubmitting(false)
            return
        }

        try {
            const createdPayments = []

            // Create individual payment records for each month
            for (const period of monthRange) {
                const payment = await createPayment({
                    resident_id: formData.resident_id,
                    bulan: period.bulan,
                    tahun: period.tahun,
                    nominal: perMonthNominal,
                    tanggal_bayar: new Date(formData.tanggal_bayar).toISOString(),
                    metode_bayar: formData.metode_bayar,
                    nomor_referensi: formData.nomor_referensi,
                    status: 'Lunas'
                })
                createdPayments.push(payment)
            }

            setSavedPayments(createdPayments)
            setSuccess(true)

            const monthLabel = jumlahBulan > 1
                ? `${jumlahBulan} bulan (${monthRangeLabel})`
                : monthRangeLabel
            toast.success(`Pembayaran ${monthLabel} berhasil disimpan!`)

            // Create a combined payment object for the receipt
            const combinedPayment = {
                ...createdPayments[0],
                nominal: totalNominal,
                // Add multi-month metadata for receipt rendering
                _multiMonth: jumlahBulan > 1 ? {
                    count: jumlahBulan,
                    perMonth: perMonthNominal,
                    rangeLabel: monthRangeLabel,
                    months: monthRange
                } : null
            }

            // Generate 1 combined receipt in background
            generateAndUploadReceipts(selectedResident, combinedPayment)

            if (onSuccess) onSuccess()
        } catch (err) {
            setError(err.message)
            toast.error('Gagal menyimpan pembayaran')
        } finally {
            setSubmitting(false)
        }
    }

    const resetForm = () => {
        const newRefNo = generateReceiptNumber(Date.now().toString())
        setFormData({
            resident_id: '',
            bulan: currentBulan,
            tahun: currentTahun,
            tanggal_bayar: new Date().toISOString().split('T')[0],
            metode_bayar: 'Cash',
            nomor_referensi: newRefNo
        })
        setJumlahBulan(1)
        setSavedPayments([])
        setReceiptUrls(null)
        setSuccess(false)
        setError(null)
        setSelectedResident(null)
    }

    // Generate month options
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: getMonthName(i + 1)
    }))

    // Generate year options (2026 onwards)
    const currentYear = new Date().getFullYear()
    const startYear = 2026
    const years = Array.from({ length: Math.max(5, currentYear - startYear + 3) }, (_, i) => startYear + i)

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <CreditCard size={20} />
                    Input Pembayaran
                </h3>
            </div>

            {success && savedPayments.length > 0 ? (
                <div>
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-lg)',
                        marginBottom: 'var(--space-lg)',
                        textAlign: 'center'
                    }}>
                        <Check size={48} color="var(--color-success)" style={{ marginBottom: 'var(--space-md)' }} />
                        <h4 style={{ color: 'var(--color-success)', marginBottom: 'var(--space-sm)' }}>
                            Pembayaran Berhasil Disimpan!
                        </h4>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                            {selectedResident?.nama_warga} - {selectedResident?.blok_rumah}
                            <br />
                            {jumlahBulan > 1 ? (
                                <>
                                    <strong>{jumlahBulan} bulan</strong> ({monthRangeLabel})
                                    <br />
                                    {formatCurrency(perMonthNominal)}/bulan × {jumlahBulan} = <strong>{formatCurrency(totalNominal)}</strong>
                                </>
                            ) : (
                                <>
                                    {monthRangeLabel} - {formatCurrency(totalNominal)}
                                </>
                            )}
                            <br />
                            <span style={{ color: 'var(--text-primary)' }}>
                                Ref: {formData.nomor_referensi} | {formData.metode_bayar}
                            </span>
                        </p>

                        {isSubsidized && (
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#f59e0b',
                                background: 'rgba(245, 158, 11, 0.1)',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                display: 'inline-block',
                                marginTop: 'var(--space-sm)'
                            }}>
                                ⚡ Subsidi perangkat Starlink — Rp 75.000/bulan
                            </p>
                        )}

                        {generatingReceipt && (
                            <p className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                                <Loader2 size={14} className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} />
                                Generating receipt...
                            </p>
                        )}
                    </div>

                    {selectedResident && savedPayments[0] && (
                        <>
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <WhatsAppShare
                                    resident={selectedResident}
                                    payment={{
                                        ...savedPayments[0],
                                        nominal: totalNominal,
                                        _multiMonth: jumlahBulan > 1 ? {
                                            count: jumlahBulan,
                                            perMonth: perMonthNominal,
                                            rangeLabel: monthRangeLabel
                                        } : null
                                    }}
                                    receiptUrl={receiptUrls?.img || receiptUrls?.pdf}
                                />
                            </div>

                            {receiptUrls?.pdf && (
                                <a
                                    href={receiptUrls.pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 'var(--space-sm)',
                                        background: 'var(--color-primary)',
                                        marginBottom: 'var(--space-md)'
                                    }}
                                >
                                    <Download size={18} />
                                    Unduh Kwitansi (PDF)
                                </a>
                            )}
                        </>
                    )}

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={resetForm}
                        style={{ width: '100%', marginTop: 'var(--space-md)' }}
                    >
                        Input Pembayaran Baru
                    </button>
                </div>
            ) : (
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

                    {/* Reference Number */}
                    <div className="form-group">
                        <label className="form-label">
                            <Hash size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Nomor Referensi
                        </label>
                        <input
                            type="text"
                            value={formData.nomor_referensi}
                            className="form-input"
                            disabled
                            style={{ background: 'var(--bg-secondary)', color: 'var(--color-primary)', fontFamily: 'monospace' }}
                        />
                    </div>

                    {/* Resident Selection */}
                    <div className="form-group">
                        <label className="form-label">
                            <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Pilih Warga
                        </label>
                        <select
                            name="resident_id"
                            value={formData.resident_id}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="">-- Pilih Warga --</option>
                            {filteredResidents.map(resident => (
                                <option key={resident.id} value={resident.id}>
                                    {resident.blok_rumah} - {resident.nama_warga}
                                    {SUBSIDIZED_UNITS.includes(resident.blok_rumah?.toUpperCase()?.trim()) ? ' ⚡' : ''}
                                </option>
                            ))}
                        </select>
                        {isSubsidized && (
                            <small style={{
                                color: '#f59e0b',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px'
                            }}>
                                ⚡ Unit Starlink — Iuran Rp 75.000/bulan (subsidi listrik)
                            </small>
                        )}
                    </div>

                    {/* Period - Start Month */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Mulai Bulan
                            </label>
                            <select
                                name="bulan"
                                value={formData.bulan}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>{month.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tahun</label>
                            <select
                                name="tahun"
                                value={formData.tahun}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Month Count Selector */}
                    <div className="form-group">
                        <label className="form-label">
                            <Layers size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Jumlah Bulan
                        </label>
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            flexWrap: 'wrap'
                        }}>
                            {MONTH_COUNT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        setJumlahBulan(opt.value)
                                        setError(null)
                                    }}
                                    style={{
                                        flex: '1 1 auto',
                                        minWidth: '60px',
                                        padding: '8px 12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: jumlahBulan === opt.value
                                            ? '2px solid var(--color-primary)'
                                            : '2px solid var(--color-border)',
                                        background: jumlahBulan === opt.value
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : 'transparent',
                                        color: jumlahBulan === opt.value
                                            ? 'var(--color-primary)'
                                            : 'var(--text-secondary)',
                                        fontWeight: jumlahBulan === opt.value ? 700 : 500,
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontFamily: 'var(--font-sans)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Month range preview */}
                        {jumlahBulan > 1 && (
                            <div style={{
                                marginTop: '8px',
                                padding: '8px 12px',
                                background: 'rgba(16, 185, 129, 0.06)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(16, 185, 129, 0.15)',
                                fontSize: '0.8rem'
                            }}>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                    📅 Periode: <strong style={{ color: 'var(--text-primary)' }}>{monthRangeLabel}</strong>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    {monthRange.map((m, i) => (
                                        <span key={i}>
                                            {getMonthName(m.bulan).substring(0, 3)} {m.tahun}
                                            {i < monthRange.length - 1 ? ' → ' : ''}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="form-group">
                        <label className="form-label">
                            <Wallet size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Metode Pembayaran
                        </label>
                        <select
                            name="metode_bayar"
                            value={formData.metode_bayar}
                            onChange={handleChange}
                            className="form-select"
                        >
                            {PAYMENT_METHODS.map(method => (
                                <option key={method.value} value={method.value}>{method.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Amount Summary */}
                    <div className="form-group">
                        <label className="form-label">
                            <DollarSign size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Total Pembayaran
                        </label>
                        <div style={{
                            padding: '12px 16px',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                color: 'var(--color-primary)',
                                fontFamily: 'var(--font-mono, monospace)'
                            }}>
                                {formatCurrency(totalNominal)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {jumlahBulan > 1 ? (
                                    <>{formatCurrency(perMonthNominal)}/bulan × {jumlahBulan} bulan</>
                                ) : (
                                    <>{formatCurrency(perMonthNominal)}/bulan</>
                                )}
                                {isSubsidized && <span style={{ color: '#f59e0b' }}> (Subsidi Starlink)</span>}
                            </div>
                        </div>
                    </div>

                    {/* Payment Date */}
                    <div className="form-group">
                        <label className="form-label">Tanggal Bayar</label>
                        <input
                            type="date"
                            name="tanggal_bayar"
                            value={formData.tanggal_bayar}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={submitting || loading || residentsLoading}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Menyimpan {jumlahBulan > 1 ? `${jumlahBulan} bulan...` : '...'}
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                {jumlahBulan > 1
                                    ? `Simpan Pembayaran ${jumlahBulan} Bulan (${formatCurrency(totalNominal)})`
                                    : 'Simpan Pembayaran'
                                }
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    )
}
