// Payment Form Component - Enhanced v2.0
import { useState, useEffect } from 'react'
import { CreditCard, User, Calendar, DollarSign, Loader2, Check, Wallet, Hash, FileText, Download } from 'lucide-react'
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

export default function PaymentForm({ onSuccess }) {
    const { residents, loading: residentsLoading } = useResidents()
    const { createPayment, updatePaymentReceipt, loading } = useAdminOperations()
    const { bulan: currentBulan, tahun: currentTahun } = useCurrentPeriod()
    const toast = useToast()

    const [formData, setFormData] = useState({
        resident_id: '',
        bulan: currentBulan,
        tahun: currentTahun,
        nominal: DEFAULT_NOMINAL,
        tanggal_bayar: new Date().toISOString().split('T')[0],
        metode_bayar: 'Cash',
        nomor_referensi: ''
    })

    const [selectedResident, setSelectedResident] = useState(null)
    const [savedPayment, setSavedPayment] = useState(null)
    const [receiptUrls, setReceiptUrls] = useState(null)
    const [generatingReceipt, setGeneratingReceipt] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

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
            [name]: name === 'nominal' || name === 'bulan' || name === 'tahun'
                ? Number(value)
                : value
        }))
        setError(null)
        setSuccess(false)
        setSavedPayment(null)
        setReceiptUrls(null)
    }

    const generateAndUploadReceipts = async (resident, payment) => {
        setGeneratingReceipt(true)
        try {
            // Generate PDF
            const pdfBlob = await getReceiptPDFBlob(resident, payment)
            const pdfPath = `receipts/${resident.blok_rumah}/${payment.tahun}/${payment.bulan}_pdf.pdf`

            // Generate Image
            const imgBlob = await getReceiptImageBlob(resident, payment)
            const imgPath = `receipts/${resident.blok_rumah}/${payment.tahun}/${payment.bulan}_img.png`

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

            if (pdfUrl || imgUrl) {
                await updatePaymentReceipt(payment.id, {
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

        if (!formData.resident_id) {
            setError('Pilih warga terlebih dahulu')
            return
        }

        try {
            const payment = await createPayment({
                ...formData,
                tanggal_bayar: new Date(formData.tanggal_bayar).toISOString(),
                status: 'Lunas'
            })

            setSavedPayment(payment)
            setSuccess(true)
            toast.success('Pembayaran berhasil disimpan!')

            // Generate receipts in background
            generateAndUploadReceipts(selectedResident, payment)

            if (onSuccess) onSuccess()
        } catch (err) {
            setError(err.message)
            toast.error('Gagal menyimpan pembayaran')
        }
    }

    const resetForm = () => {
        const newRefNo = generateReceiptNumber(Date.now().toString())
        setFormData({
            resident_id: '',
            bulan: currentBulan,
            tahun: currentTahun,
            nominal: DEFAULT_NOMINAL,
            tanggal_bayar: new Date().toISOString().split('T')[0],
            metode_bayar: 'Cash',
            nomor_referensi: newRefNo
        })
        setSavedPayment(null)
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

            {success && savedPayment ? (
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
                            {getMonthName(savedPayment.bulan)} {savedPayment.tahun} - {formatCurrency(savedPayment.nominal)}
                            <br />
                            <span style={{ color: 'var(--text-primary)' }}>
                                Ref: {formData.nomor_referensi} | {formData.metode_bayar}
                            </span>
                        </p>

                        {generatingReceipt && (
                            <p className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                                <Loader2 size={14} className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} />
                                Generating receipt...
                            </p>
                        )}
                    </div>

                    {selectedResident && savedPayment && (
                        <>
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                <WhatsAppShare
                                    resident={selectedResident}
                                    payment={savedPayment}
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
                            {residents.map(resident => (
                                <option key={resident.id} value={resident.id}>
                                    {resident.blok_rumah} - {resident.nama_warga}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Period */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                Bulan
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

                    {/* Amount */}
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
                            required
                        />
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Nominal: {formatCurrency(formData.nominal)}
                        </small>
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
                        disabled={loading || residentsLoading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                Simpan Pembayaran
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    )
}
