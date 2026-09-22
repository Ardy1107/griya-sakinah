// Resident Modal - Shows resident details, payment history & digital receipt
import { useState } from 'react'
import { X, Phone, Download, FileText, CheckCircle, XCircle, Receipt } from 'lucide-react'
import { formatCurrency, getMonthName, formatDate } from '../utils/helpers'
import { usePayments } from '../hooks/useSupabase'
import DigitalReceipt from './DigitalReceipt'

export default function ResidentModal({ resident, onClose }) {
    const [showReceipt, setShowReceipt] = useState(null)

    // Get all payments for this resident
    const { payments } = usePayments()
    const residentPayments = payments.filter(p => p.resident_id === resident.id)
        .sort((a, b) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun
            return b.bulan - a.bulan
        })
        .slice(0, 12)

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal resident-modal-premium" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3 className="modal-title">Detail Warga</h3>
                        <button className="modal-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="modal-body">
                        {/* Resident Info Card */}
                        <div className="resident-profile-card">
                            <div className="resident-profile-avatar">
                                {resident.blok_rumah?.charAt(0)}
                            </div>
                            <div className="resident-profile-info">
                                <div className="resident-profile-blok">{resident.blok_rumah}</div>
                                <div className="resident-profile-name">{resident.nama_warga}</div>
                                {resident.no_whatsapp && (
                                    <div className="resident-profile-phone">
                                        <Phone size={13} />
                                        <span>{resident.no_whatsapp}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Current Status */}
                        <div className={`resident-status-banner ${resident.isPaid ? 'paid' : 'unpaid'}`}>
                            {resident.isPaid ? (
                                <>
                                    <CheckCircle size={18} />
                                    <span>Sudah Bayar Bulan Ini</span>
                                </>
                            ) : (
                                <>
                                    <XCircle size={18} />
                                    <span>Belum Bayar Bulan Ini</span>
                                </>
                            )}
                        </div>

                        {/* If paid, show receipt button */}
                        {resident.isPaid && resident.payment && (
                            <button
                                className="resident-receipt-btn"
                                onClick={() => setShowReceipt(resident.payment)}
                            >
                                <Receipt size={18} />
                                <span>Lihat Nota Digital</span>
                                <span className="resident-receipt-btn-arrow">→</span>
                            </button>
                        )}

                        {/* Payment History */}
                        <div className="resident-history">
                            <h4 className="resident-history-title">
                                <FileText size={16} />
                                Riwayat Pembayaran
                            </h4>

                            {residentPayments.length === 0 ? (
                                <div className="resident-history-empty">
                                    Belum ada riwayat pembayaran
                                </div>
                            ) : (
                                <div className="resident-history-list">
                                    {residentPayments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="resident-history-item"
                                            onClick={() => setShowReceipt(payment)}
                                        >
                                            <div className="resident-history-item-left">
                                                <div className="resident-history-item-period">
                                                    {getMonthName(payment.bulan)} {payment.tahun}
                                                </div>
                                                <div className="resident-history-item-date">
                                                    {formatDate(payment.tanggal_bayar)}
                                                </div>
                                            </div>
                                            <div className="resident-history-item-right">
                                                <div className="resident-history-item-amount">
                                                    {formatCurrency(payment.nominal)}
                                                </div>
                                                <div className="resident-history-item-receipt">
                                                    <Receipt size={14} />
                                                    Nota
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Digital Receipt Modal */}
            {showReceipt && (
                <DigitalReceipt
                    resident={resident}
                    payment={showReceipt}
                    onClose={() => setShowReceipt(null)}
                />
            )}
        </>
    )
}
