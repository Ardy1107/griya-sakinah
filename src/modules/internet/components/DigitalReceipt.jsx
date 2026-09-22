// Digital Receipt Component - Premium mobile-first receipt with LUNAS watermark
import { useState } from 'react'
import { X, Download, Share2, CheckCircle, Copy, Check } from 'lucide-react'
import { formatCurrency, getMonthName, generateReceiptNumber, formatDate } from '../utils/helpers'
import { getBlockConfig } from '../config/blockConfig'
import { downloadReceiptImage } from '../utils/receiptImage'

export default function DigitalReceipt({ resident, payment, onClose }) {
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!resident || !payment) return null

  const blockId = resident.blok_rumah?.charAt(0)?.toUpperCase()
  const blockConfig = getBlockConfig(blockId)
  const receiptNumber = payment.nomor_referensi || generateReceiptNumber(payment.id)
  const period = `${getMonthName(payment.bulan)} ${payment.tahun}`
  const tanggalBayar = payment.tanggal_bayar
    ? new Date(payment.tanggal_bayar).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '-'

  const handleDownload = async () => {
    try {
      setDownloading(true)
      await downloadReceiptImage(resident, payment)
    } catch (err) {
      console.error('Error downloading receipt:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    const text = `✅ BUKTI PEMBAYARAN INTERNET SAKINAH\n\n🏠 ${resident.nama_warga} (${resident.blok_rumah})\n📅 Periode: ${period}\n💰 Nominal: ${formatCurrency(payment.nominal)}\n📋 No. Kwitansi: ${receiptNumber}\n\n✅ STATUS: LUNAS\n\n— Internet Sakinah ${blockConfig?.name || ''}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Bukti Pembayaran Internet', text })
      } catch (e) {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (e) {
        // fallback
      }
    }
  }

  const accentColor = blockConfig?.color || '#10b981'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className="receipt-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Receipt Card */}
        <div className="receipt-card">
          {/* Header */}
          <div className="receipt-header" style={{ background: blockConfig?.gradient || 'linear-gradient(135deg, #10b981, #059669)' }}>
            <div className="receipt-header-pattern" />
            <div className="receipt-header-content">
              <div className="receipt-logo">
                <span className="receipt-logo-icon">📶</span>
                <div>
                  <div className="receipt-brand">INTERNET SAKINAH</div>
                  <div className="receipt-sub-brand">{blockConfig?.name || 'Griya Sakinah'}</div>
                </div>
              </div>
              <div className="receipt-header-badge">KWITANSI</div>
            </div>
          </div>

          {/* Receipt Number */}
          <div className="receipt-ref">
            <span className="receipt-ref-label">No. Kwitansi</span>
            <span className="receipt-ref-value">{receiptNumber}</span>
          </div>

          {/* Body with details */}
          <div className="receipt-body">
            <div className="receipt-row">
              <span className="receipt-label">Nama Warga</span>
              <span className="receipt-value">{resident.nama_warga}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Blok Rumah</span>
              <span className="receipt-value receipt-value-highlight">{resident.blok_rumah}</span>
            </div>
            <div className="receipt-divider" />
            <div className="receipt-row">
              <span className="receipt-label">Periode</span>
              <span className="receipt-value">{period}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Tanggal Bayar</span>
              <span className="receipt-value">{tanggalBayar}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Metode</span>
              <span className="receipt-value">{payment.metode_bayar || 'Transfer'}</span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="receipt-total">
            <span className="receipt-total-label">Total Pembayaran</span>
            <span className="receipt-total-value" style={{ color: accentColor }}>
              {formatCurrency(payment.nominal)}
            </span>
          </div>

          {/* LUNAS Watermark Stamp */}
          <div className="receipt-stamp-container">
            <div className="receipt-stamp" style={{ borderColor: '#22c55e', color: '#22c55e' }}>
              <CheckCircle size={20} />
              <span>LUNAS</span>
            </div>
          </div>

          {/* Bank Info */}
          {blockConfig?.bank && (
            <div className="receipt-bank-info">
              <span className="receipt-bank-label">Dibayar ke</span>
              <span className="receipt-bank-detail">
                {blockConfig.bank.logo} {blockConfig.bank.name} • {blockConfig.bank.accountNumber}
              </span>
              <span className="receipt-bank-holder">a.n. {blockConfig.bank.accountHolder}</span>
            </div>
          )}

          {/* Footer */}
          <div className="receipt-footer">
            <p>Terima kasih atas pembayarannya!</p>
            <p className="receipt-footer-sub">Simpan kwitansi ini sebagai bukti pembayaran sah.</p>
            <p className="receipt-footer-copy">© {new Date().getFullYear()} Internet Sakinah — Griya Sakinah</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="receipt-actions">
          <button
            className="receipt-action-btn receipt-download-btn"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download size={18} />
            {downloading ? 'Menyimpan...' : 'Simpan Gambar'}
          </button>
          <button className="receipt-action-btn receipt-share-btn" onClick={handleShare}>
            {copied ? <Check size={18} /> : <Share2 size={18} />}
            {copied ? 'Tersalin!' : 'Bagikan'}
          </button>
        </div>
      </div>
    </div>
  )
}
