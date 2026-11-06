// Resident Modal - Premium Mobile-First Bottom Sheet with Receipt & History
import { useState, useMemo } from 'react'
import { X, Phone, Download, FileText, CheckCircle2, Clock, Receipt, MessageCircle, ExternalLink } from 'lucide-react'
import { formatCurrency, getMonthName, formatDate } from '../utils/helpers'
import { usePayments } from '../hooks/useSupabase'
import DigitalReceipt from './DigitalReceipt'

export default function ResidentModal({ resident, onClose }) {
    const [showReceipt, setShowReceipt] = useState(null)

    // Get all payments for this resident
    const { payments } = usePayments()
    const residentPayments = useMemo(() => {
        return payments
            .filter(p => p.resident_id === resident.id)
            .sort((a, b) => {
                if (a.tahun !== b.tahun) return b.tahun - a.tahun
                return b.bulan - a.bulan
            })
            .slice(0, 12)
    }, [payments, resident.id])

    // Find the current payment receipt if available
    const activeReceiptPayment = resident.payment || residentPayments[0] || null

    const isBlockB = resident.blok_rumah?.toUpperCase()?.startsWith('B')

    // WhatsApp clean link
    const waLink = useMemo(() => {
        if (!resident.no_whatsapp) return null
        let clean = resident.no_whatsapp.replace(/\D/g, '')
        if (clean.startsWith('0')) clean = '62' + clean.slice(1)
        if (!clean.startsWith('62')) clean = '62' + clean
        return `https://wa.me/${clean}?text=Halo%20${encodeURIComponent(resident.nama_warga)},%20terima%20kasih%20telah%20mengecek%20status%20Internet%20Sakinah.`
    }, [resident.no_whatsapp, resident.nama_warga])

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div
                    className={`modal resident-modal-premium ${isBlockB ? 'theme-blok-b' : 'theme-blok-a'}`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Mobile Sheet Drag Handle */}
                    <div className="modal-drag-handle" />

                    <div className="modal-header">
                        <div className="resident-modal-header-left">
                            <span className="resident-modal-badge">
                                Blok {resident.blok_rumah}
                            </span>
                            <h3 className="modal-title">Detail Warga</h3>
                        </div>
                        <button className="modal-close" onClick={onClose} aria-label="Tutup">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="modal-body resident-modal-scrollable">
                        {/* Resident Profile Card */}
                        <div className="resident-profile-card">
                            <div className="resident-profile-avatar">
                                {resident.blok_rumah}
                            </div>
                            <div className="resident-profile-info">
                                <div className="resident-profile-name">{resident.nama_warga}</div>
                                <div className="resident-profile-meta">
                                    <span>Rumah Blok {resident.blok_rumah}</span>
                                    {resident.no_whatsapp && (
                                        <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="resident-profile-wa-btn"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MessageCircle size={13} />
                                            <span>WhatsApp</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Current Status Banner with Glowing Neon Border */}
                        <div className={`resident-status-banner ${resident.isPaid ? 'paid' : 'unpaid'}`}>
                            {resident.isPaid ? (
                                <>
                                    <div className="status-banner-icon lunas">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div className="status-banner-text">
                                        <strong className="status-banner-title">Iuran Bulan Ini Lunas</strong>
                                        <span className="status-banner-desc">Terima kasih atas partisipasi tepat waktu Anda</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="status-banner-icon belum">
                                        <Clock size={20} />
                                    </div>
                                    <div className="status-banner-text">
                                        <strong className="status-banner-title">Belum Bayar Bulan Ini</strong>
                                        <span className="status-banner-desc">Silakan transfer ke rekening kas yang tertera di bawah</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Digital Receipt CTA Button if Paid */}
                        {resident.isPaid && activeReceiptPayment && (
                            <button
                                type="button"
                                className="resident-receipt-btn"
                                onClick={() => setShowReceipt(activeReceiptPayment)}
                            >
                                <div className="receipt-btn-icon-wrap">
                                    <Receipt size={18} />
                                </div>
                                <div className="receipt-btn-text">
                                    <strong>Lihat Nota Pembayaran Resmi</strong>
                                    <span>Bukti digital & kuitansi tersimpan</span>
                                </div>
                                <span className="resident-receipt-btn-arrow">→</span>
                            </button>
                        )}

                        {/* Payment History List */}
                        <div className="resident-history">
                            <h4 className="resident-history-title">
                                <FileText size={15} />
                                <span>Riwayat Pembayaran Terakhir</span>
                            </h4>

                            {residentPayments.length === 0 ? (
                                <div className="resident-history-empty">
                                    Belum ada catatan riwayat pembayaran tersimpan.
                                </div>
                            ) : (
                                <div className="resident-history-list">
                                    {residentPayments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="resident-history-item"
                                            onClick={() => setShowReceipt(payment)}
                                            role="button"
                                            tabIndex={0}
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
                                                    <Receipt size={12} />
                                                    <span>Nota</span>
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
