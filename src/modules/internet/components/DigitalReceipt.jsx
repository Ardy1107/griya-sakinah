// Digital Receipt Component - Premium mobile-first receipt with LUNAS watermark
import { useState } from 'react'
import { X, Download, Share2, CheckCircle, Copy, Check } from 'lucide-react'
import { formatCurrency, getMonthName, generateReceiptNumber, formatDate } from '../utils/helpers'
import { getBlockConfig } from '../config/blockConfig'
import bannerInternet from '../../../assets/banner-internet.webp'

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

        {/* Premium Receipt Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
          {/* Background Watermark Pattern */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.03, pointerEvents: 'none' }}></div>

          {/* Header Banner */}
          <img src={bannerInternet} style={{ width: '100%', display: 'block' }} alt="Banner Internet Sakinah" />

          {/* Receipt Number */}
          <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>No. Referensi</span>
            <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 700, fontFamily: 'monospace', background: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>{receiptNumber}</div>
          </div>

          {/* Body with details */}
          <div style={{ padding: '28px 24px', position: 'relative' }}>
            {/* LUNAS Background Watermark */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)', fontSize: '60px', fontWeight: 900, color: 'rgba(34, 197, 94, 0.05)', pointerEvents: 'none', whiteSpace: 'nowrap', letterSpacing: '10px', zIndex: 0 }}>LUNAS</div>
            
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Nama Warga</span>
                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '15px' }}>{resident.nama_warga}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Blok Rumah</span>
                <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', display: 'inline-block' }}>{resident.blok_rumah}</div>
              </div>
              <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Periode Iuran</span>
                <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '15px' }}>{period}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Tanggal Bayar</span>
                <span style={{ color: '#0f172a', fontWeight: 500, fontSize: '15px' }}>{tanggalBayar}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Metode</span>
                <div style={{ color: '#0f172a', fontWeight: 500, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  {payment.metode_bayar || 'Transfer'}
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount & Stamp */}
          <div style={{ padding: '0 24px 28px' }}>
            <div style={{ background: 'linear-gradient(to right, #ecfdf5, #dcfce7)', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#047857', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Total Dibayarkan</div>
                <div style={{ color: '#065f46', fontSize: '24px', fontWeight: 800 }}>{formatCurrency(payment.nominal)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 16px', border: '2px solid #059669', borderRadius: '8px', color: '#059669', fontWeight: 800, fontSize: '16px', letterSpacing: '2px', transform: 'rotate(-3deg)', background: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle size={20} />
                LUNAS
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Terima kasih atas pembayaran Anda!</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Dokumen ini adalah bukti pembayaran yang sah.</div>
            <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>© {new Date().getFullYear()} Griya Sakinah Management</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="receipt-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <button
            className="receipt-action-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
            onClick={async () => {
              try {
                setDownloading(true)
                const { downloadReceiptPdf } = await import('../utils/receiptImage')
                await downloadReceiptPdf(resident, payment)
              } catch (err) {
                console.error(err)
                alert('Gagal mendownload PDF: ' + (err.message || err))
              } finally { setDownloading(false) }
            }}
            disabled={downloading}
          >
            <Download size={18} />
            PDF
          </button>
          
          <button
            className="receipt-action-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
            onClick={async () => {
              try {
                setDownloading(true)
                const { downloadReceiptPng } = await import('../utils/receiptImage')
                await downloadReceiptPng(resident, payment)
              } catch (err) {
                console.error(err)
                alert('Gagal mendownload PNG: ' + (err.message || err))
              } finally { setDownloading(false) }
            }}
            disabled={downloading}
          >
            <Download size={18} />
            PNG
          </button>
          
          <button 
            className="receipt-action-btn receipt-share-btn" 
            style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: 'white', color: '#1e293b', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer' }}
            onClick={handleShare}
          >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
            {copied ? 'Tersalin!' : 'Bagikan WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}
