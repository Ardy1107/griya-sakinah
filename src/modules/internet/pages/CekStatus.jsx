// Cek Status Page - Self-service for residents
import { useState } from 'react'
import { Search, CheckCircle, XCircle, Download, Calendar, Receipt, Phone } from 'lucide-react'
import Header from '../components/Header'
import { useResidents, usePayments } from '../hooks/useSupabase'
import { formatCurrency, getMonthName, formatDate } from '../utils/helpers'
import { downloadReceiptPDF } from '../utils/receiptPdf'
import { downloadReceiptImage } from '../utils/receiptImage'

export default function CekStatus() {
    const [searchBlok, setSearchBlok] = useState('')
    const [selectedResident, setSelectedResident] = useState(null)
    const { residents } = useResidents()
    const { payments } = usePayments()

    const handleSearch = (e) => {
        e.preventDefault()
        const found = residents.find(r =>
            r.blok_rumah.toLowerCase() === searchBlok.toLowerCase().trim()
        )
        setSelectedResident(found || 'not_found')
    }

    const residentPayments = selectedResident && selectedResident !== 'not_found'
        ? payments.filter(p => p.resident_id === selectedResident.id)
            .sort((a, b) => {
                if (a.tahun !== b.tahun) return b.tahun - a.tahun
                return b.bulan - a.bulan
            })
        : []

    // Check current month status
    const now = new Date()
    const currentMonthPayment = residentPayments.find(
        p => p.bulan === (now.getMonth() + 1) && p.tahun === now.getFullYear()
    )

    const handleDownloadPDF = async (payment) => {
        try {
            await downloadReceiptPDF(selectedResident, payment)
        } catch (err) {
            console.error('Download error:', err)
        }
    }

    const handleDownloadImage = async (payment) => {
        try {
            await downloadReceiptImage(selectedResident, payment)
        } catch (err) {
            console.error('Download error:', err)
        }
    }

    return (
        <div className="app-container">
            <Header />

            <main className="main-content">
                <div className="cek-status-page">
                    {/* Title */}
                    <div className="text-center mb-4">
                        <h1>Cek Status Pembayaran</h1>
                        <p className="text-muted">
                            Masukkan nomor blok rumah untuk melihat status pembayaran Anda
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="cek-status-search">
                        <form onSubmit={handleSearch} className="search-form">
                            <div className="search-input-wrapper">
                                <Search className="search-icon" size={20} />
                                <input
                                    type="text"
                                    value={searchBlok}
                                    onChange={(e) => setSearchBlok(e.target.value)}
                                    placeholder="Masukkan blok rumah (contoh: A1, B2)"
                                    className="form-input search-input-large"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg">
                                <Search size={18} />
                                Cek Status
                            </button>
                        </form>
                    </div>

                    {/* Results */}
                    {selectedResident === 'not_found' && (
                        <div className="cek-status-result card">
                            <div className="cek-status-not-found">
                                <XCircle size={48} className="text-danger" />
                                <h3>Blok Tidak Ditemukan</h3>
                                <p>Blok rumah "{searchBlok}" tidak terdaftar dalam sistem.</p>
                                <p className="text-muted">Pastikan Anda memasukkan nomor blok yang benar.</p>
                            </div>
                        </div>
                    )}

                    {selectedResident && selectedResident !== 'not_found' && (
                        <div className="cek-status-result">
                            {/* Resident Info Card */}
                            <div className="card cek-status-info">
                                <div className="cek-status-header">
                                    <div className="cek-status-blok">{selectedResident.blok_rumah}</div>
                                    <div className="cek-status-nama">{selectedResident.nama_warga}</div>
                                </div>

                                {/* Current Month Status */}
                                <div className={`cek-status-current ${currentMonthPayment ? 'paid' : 'unpaid'}`}>
                                    {currentMonthPayment ? (
                                        <>
                                            <CheckCircle size={32} />
                                            <div>
                                                <h3>LUNAS</h3>
                                                <p>Pembayaran {getMonthName(now.getMonth() + 1)} {now.getFullYear()}</p>
                                                <span className="cek-status-amount">{formatCurrency(currentMonthPayment.nominal)}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={32} />
                                            <div>
                                                <h3>BELUM BAYAR</h3>
                                                <p>Iuran {getMonthName(now.getMonth() + 1)} {now.getFullYear()}</p>
                                                <span className="cek-status-amount">{formatCurrency(150000)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Download Kwitansi */}
                                {currentMonthPayment && (
                                    <div className="cek-status-download">
                                        <p className="text-muted mb-2">Download Kwitansi:</p>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleDownloadPDF(currentMonthPayment)}
                                            >
                                                <Download size={16} />
                                                PDF
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleDownloadImage(currentMonthPayment)}
                                            >
                                                <Download size={16} />
                                                Gambar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment History */}
                            <div className="card mt-3">
                                <div className="card-header">
                                    <h3 className="card-title">
                                        <Calendar size={18} />
                                        Riwayat Pembayaran
                                    </h3>
                                </div>

                                {residentPayments.length === 0 ? (
                                    <div className="text-center text-muted" style={{ padding: '2rem' }}>
                                        Belum ada riwayat pembayaran
                                    </div>
                                ) : (
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Periode</th>
                                                    <th>Tanggal Bayar</th>
                                                    <th>Nominal</th>
                                                    <th>Kwitansi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {residentPayments.map(payment => (
                                                    <tr key={payment.id}>
                                                        <td>
                                                            <strong>{getMonthName(payment.bulan)} {payment.tahun}</strong>
                                                        </td>
                                                        <td>{formatDate(payment.tanggal_bayar)}</td>
                                                        <td className="text-primary" style={{ fontWeight: 600 }}>
                                                            {formatCurrency(payment.nominal)}
                                                        </td>
                                                        <td>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    className="btn btn-sm btn-secondary"
                                                                    onClick={() => handleDownloadPDF(payment)}
                                                                    title="Download PDF"
                                                                >
                                                                    <Receipt size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p className="footer-text">
                    © {new Date().getFullYear()} Griya Sakinah Internet Management
                </p>
            </footer>
        </div>
    )
}
