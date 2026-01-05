// Resident Modal - Shows resident details and payment history
import { X, Phone, Calendar, Receipt, ExternalLink, Download } from 'lucide-react'
import { formatCurrency, getMonthName, formatDate } from '../utils/helpers'
import { usePayments } from '../hooks/useSupabase'

export default function ResidentModal({ resident, onClose }) {
    // Get all payments for this resident
    const { payments } = usePayments()
    const residentPayments = payments.filter(p => p.resident_id === resident.id)
        .sort((a, b) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun
            return b.bulan - a.bulan
        })
        .slice(0, 12) // Show last 12 payments

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Detail Warga</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Resident Info */}
                    <div className="mb-3">
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-lg)',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: 'var(--color-primary)',
                                marginBottom: 'var(--space-sm)'
                            }}>
                                {resident.blok_rumah}
                            </div>
                            <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                                {resident.nama_warga}
                            </div>
                            {resident.no_whatsapp && (
                                <div className="flex items-center justify-center gap-1 mt-2 text-muted" style={{ justifyContent: 'center' }}>
                                    <Phone size={14} />
                                    <span>{resident.no_whatsapp}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className="mb-3">
                        <div className={`status-badge ${resident.isPaid ? 'lunas' : 'belum'}`} style={{
                            display: 'block',
                            textAlign: 'center',
                            padding: 'var(--space-md)',
                            fontSize: '0.875rem'
                        }}>
                            {resident.isPaid ? '✓ Sudah Bayar Bulan Ini' : '✗ Belum Bayar Bulan Ini'}
                        </div>
                    </div>

                    {/* Payment History */}
                    <div>
                        <h4 className="mb-2" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Riwayat Pembayaran
                        </h4>

                        {residentPayments.length === 0 ? (
                            <div className="text-center text-muted" style={{ padding: 'var(--space-lg)' }}>
                                Belum ada riwayat pembayaran
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Periode</th>
                                            <th>Nominal</th>
                                            <th>No. Kwitansi</th>
                                            <th>File</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {residentPayments.map((payment) => (
                                            <tr key={payment.id}>
                                                <td>
                                                    <div style={{ fontWeight: '500' }}>
                                                        {getMonthName(payment.bulan)} {payment.tahun}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {formatDate(payment.tanggal_bayar)}
                                                    </div>
                                                </td>
                                                <td className="text-primary" style={{ fontWeight: '600' }}>
                                                    {formatCurrency(payment.nominal)}
                                                </td>
                                                <td className="text-muted" style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                                                    {payment.nomor_referensi || '-'}
                                                </td>
                                                <td>
                                                    {payment.receipt_url_pdf ? (
                                                        <a
                                                            href={payment.receipt_url_pdf}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-secondary"
                                                            style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                            title="Unduh PDF"
                                                        >
                                                            <Download size={14} />
                                                            <span style={{ fontSize: '0.75rem' }}>PDF</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
