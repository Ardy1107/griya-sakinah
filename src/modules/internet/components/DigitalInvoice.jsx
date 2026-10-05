// Digital Invoice Component - Ultra Premium Billing Modal with Live Overdue Detection & PDF/PNG Download
import { useState } from 'react'
import { X, Download, Share2, Copy, Check, AlertTriangle, Clock, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react'
import { formatCurrency, getMonthName, generateWhatsAppUrl } from '../utils/helpers'
import { getBlockConfig } from '../config/blockConfig'
import bannerInternet from '../../../assets/banner-internet.webp'

export default function DigitalInvoice({ resident, period, unpaidMonths = [], onClose, onPayNow }) {
  const [downloading, setDownloading] = useState(false)
  const [copiedBank, setCopiedBank] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)

  if (!resident || !period) return null

  const blockId = resident.blok_rumah?.charAt(0)?.toUpperCase()
  const blockConfig = getBlockConfig(blockId)
  const bank = blockConfig?.bank || { name: 'Bank Transfer', accountNumber: '-', accountHolder: '-' }
  const iuranPerBulan = blockConfig?.iuran || 150000

  // Calculate items
  const items = unpaidMonths.length > 0 
    ? unpaidMonths 
    : [{ bulan: period.bulan, tahun: period.tahun, nominal: iuranPerBulan }]
  
  const totalTagihan = items.reduce((sum, item) => sum + (item.nominal || iuranPerBulan), 0)
  const invoiceNumber = `INV/${period.tahun}/${String(period.bulan).padStart(2, '0')}/${resident.blok_rumah || 'GS'}`

  // Check Overdue (Batas tgl 5)
  const now = new Date()
  const dueDate = new Date(period.tahun, period.bulan - 1, 5, 23, 59, 59)
  const isOverdue = now > dueDate

  const dueDateFormatted = `5 ${getMonthName(period.bulan)} ${period.tahun}`

  // Copy bank account number
  const handleCopyBank = async () => {
    try {
      await navigator.clipboard.writeText(bank.accountNumber)
      setCopiedBank(true)
      setTimeout(() => setCopiedBank(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Share WhatsApp
  const handleShare = async () => {
    const detailBulan = items.map(it => `- Iuran ${getMonthName(it.bulan)} ${it.tahun}: ${formatCurrency(it.nominal || iuranPerBulan)}`).join('\n')
    const message = `📋 *SURAT TAGIHAN INTERNET GRIYA SAKINAH*

Kepada Yth. Bapak/Ibu:
*${resident.nama_warga} (Blok ${resident.blok_rumah})*

No. Tagihan: \`${invoiceNumber}\`
Status: *${isOverdue ? '⚠️ TERLEWAT JATUH TEMPO' : '⏳ MENUNGGU PEMBAYARAN'}*
Batas Jatuh Tempo: *${dueDateFormatted}*

*Rincian Tagihan:*
${detailBulan}

*Total Pembayaran: ${formatCurrency(totalTagihan)}*

-----------------------------
*Rekening Pembayaran:*
Bank: *${bank.name}*
No. Rekening: *${bank.accountNumber}*
Atas Nama: *${bank.accountHolder}*

_Mohon konfirmasikan bukti transfer jika sudah melakukan pembayaran. Terima kasih atas kerjasamanya!_

— Pengurus Internet Griya Sakinah ${blockConfig?.name || ''}`

    if (resident.no_whatsapp) {
      window.open(generateWhatsAppUrl(resident.no_whatsapp, message), '_blank')
    } else if (navigator.share) {
      try {
        await navigator.share({ title: 'Tagihan Internet Griya Sakinah', text: message })
      } catch (err) {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(message)
        setCopiedShare(true)
        setTimeout(() => setCopiedShare(false), 2000)
      } catch (err) {
        // fallback
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="receipt-modal" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '540px', width: '100%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Close button */}
        <button className="receipt-close-btn" onClick={onClose} aria-label="Tutup Modal">
          <X size={20} />
        </button>

        {/* Invoice Card Container */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
          position: 'relative',
          color: '#0f172a'
        }}>
          {/* Header Banner */}
          <img src={bannerInternet} style={{ width: '100%', display: 'block' }} alt="Banner Internet Griya Sakinah" />

          {/* Ribbon Header */}
          <div style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Surat Tagihan / Invoice
              </div>
              <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800, fontFamily: 'monospace' }}>
                {invoiceNumber}
              </div>
            </div>

            {isOverdue ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                background: '#fef2f2',
                border: '1.5px solid #ef4444',
                color: '#dc2626',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                <AlertTriangle size={14} />
                Jatuh Tempo Terlewat
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                background: '#fffbeb',
                border: '1.5px solid #f59e0b',
                color: '#b45309',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                <Clock size={14} />
                Menunggu Pembayaran
              </div>
            )}
          </div>

          {/* Card Body */}
          <div style={{ padding: '20px 22px' }}>
            {/* Resident & Due Date Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              paddingBottom: '16px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '2px' }}>
                  Ditujukan Kepada
                </span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  {resident.nama_warga}
                </span>
                <div style={{ display: 'inline-block', marginTop: '4px', fontSize: '12px', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 10px', borderRadius: '6px' }}>
                  Blok {resident.blok_rumah}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, display: 'block', marginBottom: '2px' }}>
                  Batas Waktu Pembayaran
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: isOverdue ? '#dc2626' : '#d97706', display: 'block' }}>
                  {dueDateFormatted}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                  Tgl 5 Setiap Bulan
                </span>
              </div>
            </div>

            {/* Itemized Breakdown Table */}
            <div style={{ marginTop: '16px' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '9px 14px',
                  background: '#f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <span>Rincian Tagihan</span>
                  <span>Nominal</span>
                </div>
                {items.map((item, idx) => {
                  const isCurrent = item.bulan === period.bulan && item.tahun === period.tahun
                  return (
                    <div 
                      key={`${item.tahun}-${item.bulan}`}
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                        fontSize: '13px'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          Iuran {getMonthName(item.bulan)} {item.tahun}
                        </span>
                        {isCurrent ? (
                          <span style={{ marginLeft: '6px', fontSize: '10px', background: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            Bulan Ini
                          </span>
                        ) : (
                          <span style={{ marginLeft: '6px', fontSize: '10px', background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            Tunggakan
                          </span>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        {formatCurrency(item.nominal || iuranPerBulan)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Total Amount Box */}
            <div style={{ marginTop: '16px' }}>
              <div style={{
                background: isOverdue ? 'linear-gradient(to right, #fef2f2, #fff1f2)' : 'linear-gradient(to right, #fffbeb, #fef3c7)',
                border: `1.5px solid ${isOverdue ? '#fca5a5' : '#fcd34d'}`,
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: isOverdue ? '#991b1b' : '#92400e', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Tagihan Wajib Dibayar
                  </div>
                  <div style={{ color: isOverdue ? '#b91c1c' : '#b45309', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
                    {formatCurrency(totalTagihan)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: isOverdue ? '#991b1b' : '#92400e', fontWeight: 700 }}>
                    {items.length} Bulan
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    @{formatCurrency(iuranPerBulan)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Transfer Instructions with Copy button */}
            <div style={{ marginTop: '16px' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} className="text-primary" />
                  REKENING TUJUAN TRANSFER
                </div>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{bank.name}</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {bank.accountNumber}
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}>a.n. {bank.accountHolder}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyBank}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '8px 12px',
                      background: copiedBank ? '#ecfdf5' : '#f1f5f9',
                      color: copiedBank ? '#059669' : '#334155',
                      border: `1px solid ${copiedBank ? '#a7f3d0' : '#cbd5e1'}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                    title="Salin Nomor Rekening"
                  >
                    {copiedBank ? <Check size={14} /> : <Copy size={14} />}
                    {copiedBank ? 'Disalin' : 'Salin Rek'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: onPayNow ? '1fr 1fr' : '1fr 1fr',
            gap: '8px',
            padding: '16px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9'
          }}>
            {/* Download PDF */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px',
                background: '#dc2626',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onClick={async () => {
                try {
                  setDownloading(true)
                  const { downloadInvoicePdf } = await import('../utils/invoiceImage')
                  await downloadInvoicePdf(resident, period, items, blockId)
                } catch (err) {
                  console.error(err)
                  alert('Gagal mendownload PDF: ' + (err.message || err))
                } finally {
                  setDownloading(false)
                }
              }}
              disabled={downloading}
            >
              <Download size={16} />
              {downloading ? 'Memproses...' : 'Download PDF'}
            </button>

            {/* Download PNG */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px',
                background: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onClick={async () => {
                try {
                  setDownloading(true)
                  const { downloadInvoicePng } = await import('../utils/invoiceImage')
                  await downloadInvoicePng(resident, period, items, blockId)
                } catch (err) {
                  console.error(err)
                  alert('Gagal mendownload PNG: ' + (err.message || err))
                } finally {
                  setDownloading(false)
                }
              }}
              disabled={downloading}
            >
              <Download size={16} />
              {downloading ? 'Memproses...' : 'Download PNG'}
            </button>

            {/* WhatsApp Share Button */}
            <button
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '11px',
                background: '#16a34a',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onClick={handleShare}
            >
              {copiedShare ? <Check size={16} /> : <Share2 size={16} />}
              {copiedShare ? 'Teks Tagihan Disalin!' : resident.no_whatsapp ? 'Kirim Tagihan ke WhatsApp' : 'Salin Format Pesan Tagihan'}
            </button>

            {/* Shortcut Bayar Sekarang */}
            {onPayNow && (
              <button
                style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '11px',
                  background: '#ffffff',
                  color: '#059669',
                  border: '1.5px solid #10b981',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  onClose()
                  onPayNow(resident, items, totalTagihan)
                }}
              >
                <CheckCircle2 size={16} />
                Input Pembayaran (Pelunasan) Warga Ini
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
