// Excel Import Component
import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, Users, CreditCard, Receipt, Check, AlertCircle, Loader2, X, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useAdminOperations } from '../hooks/useSupabase'
import { formatCurrency } from '../utils/helpers'

export default function ImportData({ onSuccess }) {
    const { createResident, createPayment, createExpense, loading } = useAdminOperations()
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [importing, setImporting] = useState(false)
    const [importType, setImportType] = useState('residents') // residents, payments, expenses
    const [results, setResults] = useState(null)
    const [error, setError] = useState(null)

    // Handle file drop/select
    const handleFile = useCallback((e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFile(file)
        setError(null)
        setResults(null)

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

                // Parse based on import type
                const parsed = parseData(jsonData, importType)
                setPreview(parsed)
            } catch (err) {
                setError('Gagal membaca file Excel: ' + err.message)
            }
        }
        reader.readAsArrayBuffer(file)
    }, [importType])

    // Parse Excel data based on type
    const parseData = (rows, type) => {
        if (rows.length < 2) return { headers: [], data: [] }

        const headers = rows[0]
        const data = rows.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''))

        if (type === 'residents') {
            return {
                headers: ['Blok Rumah', 'Nama Warga', 'No WhatsApp'],
                data: data.map(row => ({
                    blok_rumah: String(row[0] || '').trim(),
                    nama_warga: String(row[1] || '').trim(),
                    no_whatsapp: row[2] ? String(row[2]).trim() : null
                })).filter(r => r.blok_rumah && r.nama_warga)
            }
        }

        if (type === 'payments') {
            return {
                headers: ['Blok Rumah', 'Bulan', 'Tahun', 'Nominal', 'Tanggal Bayar'],
                data: data.map(row => ({
                    blok_rumah: String(row[0] || '').trim(),
                    bulan: parseInt(row[1]) || 1,
                    tahun: parseInt(row[2]) || 2025,
                    nominal: parseFloat(String(row[3]).replace(/[^0-9]/g, '')) || 150000,
                    tanggal_bayar: row[4] ? parseExcelDate(row[4]) : new Date().toISOString()
                })).filter(r => r.blok_rumah)
            }
        }

        if (type === 'expenses') {
            return {
                headers: ['Keterangan', 'Nominal', 'Tanggal', 'Kategori'],
                data: data.map(row => ({
                    keterangan: String(row[0] || '').trim(),
                    nominal: parseFloat(String(row[1]).replace(/[^0-9]/g, '')) || 0,
                    tanggal: row[2] ? parseExcelDate(row[2]) : new Date().toISOString().split('T')[0],
                    kategori: mapCategory(String(row[3] || 'Lainnya').trim())
                })).filter(r => r.keterangan && r.nominal > 0)
            }
        }

        return { headers, data }
    }

    // Parse Excel date
    const parseExcelDate = (value) => {
        if (typeof value === 'number') {
            // Excel serial date
            const date = new Date((value - 25569) * 86400 * 1000)
            return date.toISOString().split('T')[0]
        }
        if (typeof value === 'string') {
            // Try to parse string date
            const parts = value.split(/[\/\-]/)
            if (parts.length === 3) {
                const [d, m, y] = parts.map(p => parseInt(p))
                if (y > 2000) {
                    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                }
            }
        }
        return new Date().toISOString().split('T')[0]
    }

    // Map category to valid database values
    const mapCategory = (cat) => {
        const lower = cat.toLowerCase()
        if (lower.includes('starlink') || lower.includes('bandwidth') || lower.includes('isp') || lower.includes('internet')) {
            return 'Bandwidth'
        }
        if (lower.includes('maintenance') || lower.includes('perbaikan') || lower.includes('perawatan')) {
            return 'Maintenance'
        }
        return 'Lainnya'
    }

    // Import data to database
    const handleImport = async () => {
        if (!preview?.data?.length) return

        setImporting(true)
        setError(null)
        const importResults = { success: 0, failed: 0, errors: [] }

        try {
            for (const item of preview.data) {
                try {
                    if (importType === 'residents') {
                        await createResident(item)
                    } else if (importType === 'payments') {
                        await createPayment(item)
                    } else if (importType === 'expenses') {
                        await createExpense(item)
                    }
                    importResults.success++
                } catch (err) {
                    importResults.failed++
                    importResults.errors.push(`${item.blok_rumah || item.keterangan}: ${err.message}`)
                }
            }

            setResults(importResults)
            if (importResults.success > 0 && onSuccess) {
                onSuccess()
            }
        } catch (err) {
            setError('Import gagal: ' + err.message)
        } finally {
            setImporting(false)
        }
    }

    // Download template
    const downloadTemplate = () => {
        let data = []
        let filename = ''

        if (importType === 'residents') {
            data = [
                ['blok_rumah', 'nama_warga', 'no_whatsapp'],
                ['A-1', 'Pak Budi', '08123456789'],
                ['A-2', 'Pak Sani', '08234567890']
            ]
            filename = 'template_warga.xlsx'
        } else if (importType === 'payments') {
            data = [
                ['blok_rumah', 'bulan', 'tahun', 'nominal', 'tanggal_bayar'],
                ['A-1', 1, 2025, 150000, '2025-01-15'],
                ['A-1', 2, 2025, 150000, '2025-02-10']
            ]
            filename = 'template_pembayaran.xlsx'
        } else if (importType === 'expenses') {
            data = [
                ['keterangan', 'nominal', 'tanggal', 'kategori'],
                ['Pembayaran ISP Januari', 750000, '2025-01-05', 'Bandwidth'],
                ['Perbaikan kabel', 150000, '2025-01-10', 'Maintenance']
            ]
            filename = 'template_pengeluaran.xlsx'
        }

        const ws = XLSX.utils.aoa_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Data')
        XLSX.writeFile(wb, filename)
    }

    const resetForm = () => {
        setFile(null)
        setPreview(null)
        setResults(null)
        setError(null)
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <Upload size={20} />
                    Import Data dari Excel
                </h3>
            </div>

            {/* Import Type Selector */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-lg)',
                flexWrap: 'wrap'
            }}>
                {[
                    { value: 'residents', label: 'Data Warga', icon: <Users size={16} /> },
                    { value: 'payments', label: 'Pembayaran', icon: <CreditCard size={16} /> },
                    { value: 'expenses', label: 'Pengeluaran', icon: <Receipt size={16} /> }
                ].map(type => (
                    <button
                        key={type.value}
                        className={`btn ${importType === type.value ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                            setImportType(type.value)
                            resetForm()
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        {type.icon}
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Instructions */}
            <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-lg)',
                fontSize: '0.875rem'
            }}>
                <strong>Format Excel yang dibutuhkan:</strong>
                {importType === 'residents' && (
                    <p className="text-muted" style={{ margin: '8px 0 0' }}>
                        Kolom: <code>blok_rumah</code>, <code>nama_warga</code>, <code>no_whatsapp</code> (opsional)
                    </p>
                )}
                {importType === 'payments' && (
                    <p className="text-muted" style={{ margin: '8px 0 0' }}>
                        Kolom: <code>blok_rumah</code>, <code>bulan</code> (1-12), <code>tahun</code>, <code>nominal</code>, <code>tanggal_bayar</code>
                    </p>
                )}
                {importType === 'expenses' && (
                    <p className="text-muted" style={{ margin: '8px 0 0' }}>
                        Kolom: <code>keterangan</code>, <code>nominal</code>, <code>tanggal</code>, <code>kategori</code> (Bandwidth/Maintenance/Lainnya)
                    </p>
                )}
                <button
                    className="btn btn-sm btn-secondary"
                    onClick={downloadTemplate}
                    style={{ marginTop: 'var(--space-sm)' }}
                >
                    <Download size={14} />
                    Download Template
                </button>
            </div>

            {/* File Upload */}
            {!preview && !results && (
                <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-xl)',
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'var(--bg-tertiary)'
                }}>
                    <FileSpreadsheet size={48} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }} />
                    <span style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {file ? file.name : 'Klik atau drop file Excel di sini'}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                        Format: .xlsx, .xls
                    </span>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFile}
                        style={{ display: 'none' }}
                    />
                </label>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    marginTop: 'var(--space-md)',
                    color: 'var(--color-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)'
                }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Preview */}
            {preview && !results && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-md)'
                    }}>
                        <h4 style={{ margin: 0 }}>
                            Preview: {preview.data.length} data ditemukan
                        </h4>
                        <button className="btn btn-sm btn-secondary" onClick={resetForm}>
                            <X size={14} /> Reset
                        </button>
                    </div>

                    <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-tertiary)', position: 'sticky', top: 0 }}>
                                    {preview.headers.map((h, i) => (
                                        <th key={i} style={{
                                            padding: '10px',
                                            textAlign: 'left',
                                            borderBottom: '1px solid var(--color-border)'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.data.slice(0, 20).map((row, i) => (
                                    <tr key={i}>
                                        {Object.values(row).map((cell, j) => (
                                            <td key={j} style={{
                                                padding: '8px 10px',
                                                borderBottom: '1px solid var(--color-border)'
                                            }}>
                                                {typeof cell === 'number' && cell > 1000
                                                    ? formatCurrency(cell)
                                                    : String(cell || '-')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {preview.data.length > 20 && (
                            <div className="text-center text-muted" style={{ padding: 'var(--space-md)' }}>
                                ... dan {preview.data.length - 20} data lainnya
                            </div>
                        )}
                    </div>

                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleImport}
                        disabled={importing}
                        style={{ width: '100%', marginTop: 'var(--space-lg)' }}
                    >
                        {importing ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Mengimport {preview.data.length} data...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Import {preview.data.length} Data
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Results */}
            {results && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                    <div style={{
                        background: results.failed === 0
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)',
                        border: `1px solid ${results.failed === 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-lg)',
                        textAlign: 'center'
                    }}>
                        <Check size={48} style={{
                            color: results.failed === 0 ? 'var(--color-success)' : 'var(--color-warning)',
                            marginBottom: 'var(--space-md)'
                        }} />
                        <h3 style={{ margin: '0 0 8px' }}>Import Selesai!</h3>
                        <p className="text-muted" style={{ margin: 0 }}>
                            ✅ Berhasil: {results.success} &nbsp;|&nbsp; ❌ Gagal: {results.failed}
                        </p>
                    </div>

                    {results.errors.length > 0 && (
                        <div style={{
                            marginTop: 'var(--space-md)',
                            padding: 'var(--space-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            maxHeight: '150px',
                            overflowY: 'auto'
                        }}>
                            <strong>Error details:</strong>
                            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                                {results.errors.slice(0, 10).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        className="btn btn-secondary"
                        onClick={resetForm}
                        style={{ width: '100%', marginTop: 'var(--space-lg)' }}
                    >
                        Import Data Lain
                    </button>
                </div>
            )}
        </div>
    )
}
