// Invoice Tab Component - Manage Unpaid Residents, Accumulated Arrears & Invoice Generation
import { useState, useMemo } from 'react'
import { 
  FileText, Download, Share2, Search, AlertTriangle, 
  Clock, CreditCard, CheckCircle2, ChevronRight, User, 
  Phone, Eye, Sparkles, Filter
} from 'lucide-react'
import { formatCurrency, getMonthName, generateWhatsAppUrl } from '../utils/helpers'
import { getBlockConfig } from '../config/blockConfig'

export default function InvoiceTab({
  residents = [],
  statusList = [],
  allPayments = [],
  selectedPeriod,
  adminBlockFilter,
  onOpenPayment,
  onShowInvoice
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  const blockConfig = getBlockConfig(adminBlockFilter)
  const iuranPerBulan = blockConfig?.iuran || 150000

  // Check Overdue Status (Tgl 5)
  const now = new Date()
  const dueDate = new Date(selectedPeriod.tahun, selectedPeriod.bulan - 1, 5, 23, 59, 59)
  const isOverdue = now > dueDate

  // 1. Filter residents who are UNPAID for selectedPeriod
  // When a resident pays, statusList is updated with isPaid = true -> they automatically vanish!
  const unpaidResidentsWithArrears = useMemo(() => {
    // Paid status map for current period
    const paidSet = new Set(
      statusList.filter(s => s.isPaid).map(s => s.id)
    )

    // Only get residents who haven't paid this month
    const unpaid = residents.filter(r => !paidSet.has(r.id))

    // Calculate historical unpaid months (Option 1.B: Entire database history up to selectedPeriod)
    return unpaid.map(resident => {
      // Find start year and month for checking
      let startYear = 2026
      let startMonth = 1

      if (resident.created_at) {
        const createdDate = new Date(resident.created_at)
        if (!isNaN(createdDate.getTime())) {
          startYear = Math.min(startYear, createdDate.getFullYear())
          if (createdDate.getFullYear() === startYear) {
            startMonth = createdDate.getMonth() + 1
          }
        }
      }

      // Check if there are earlier payments recorded for this resident
      const residentPayments = allPayments.filter(p => p.resident_id === resident.id)
      residentPayments.forEach(p => {
        if (p.tahun < startYear) {
          startYear = p.tahun
          startMonth = p.bulan
        } else if (p.tahun === startYear && p.bulan < startMonth) {
          startMonth = p.bulan
        }
      })

      // Generate all months from start to selectedPeriod
      const unpaidMonths = []
      let currY = startYear
      let currM = startMonth

      while (currY < selectedPeriod.tahun || (currY === selectedPeriod.tahun && currM <= selectedPeriod.bulan)) {
        // Check if payment exists for this month
        const hasPaid = residentPayments.some(p => p.bulan === currM && p.tahun === currY)
        if (!hasPaid) {
          unpaidMonths.push({
            bulan: currM,
            tahun: currY,
            nominal: iuranPerBulan
          })
        }

        currM++
        if (currM > 12) {
          currM = 1
          currY++
        }
      }

      // Total arrears
      const totalAmount = unpaidMonths.reduce((sum, m) => sum + (m.nominal || iuranPerBulan), 0)
      const arrearsCount = unpaidMonths.length

      return {
        ...resident,
        unpaidMonths,
        arrearsCount,
        totalAmount
      }
    })
  }, [residents, statusList, allPayments, selectedPeriod, iuranPerBulan])

  // 2. Search filter
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return unpaidResidentsWithArrears
    const term = searchTerm.toLowerCase().trim()
    return unpaidResidentsWithArrears.filter(r => 
      r.nama_warga?.toLowerCase().includes(term) ||
      r.blok_rumah?.toLowerCase().includes(term) ||
      r.no_whatsapp?.includes(term)
    )
  }, [unpaidResidentsWithArrears, searchTerm])

  // Summary Metrics
  const totalUnpaidWarga = unpaidResidentsWithArrears.length
  const totalNominalTagihan = unpaidResidentsWithArrears.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalTunggakanBulan = unpaidResidentsWithArrears.reduce((sum, r) => sum + r.arrearsCount, 0)

  // Direct Quick Download PDF
  const handleQuickDownloadPdf = async (resident) => {
    try {
      setDownloadingId(`pdf-${resident.id}`)
      const { downloadInvoicePdf } = await import('../utils/invoiceImage')
      await downloadInvoicePdf(resident, selectedPeriod, resident.unpaidMonths, adminBlockFilter)
    } catch (err) {
      console.error(err)
      alert('Gagal mendownload PDF: ' + (err.message || err))
    } finally {
      setDownloadingId(null)
    }
  }

  // Direct Quick Download PNG
  const handleQuickDownloadPng = async (resident) => {
    try {
      setDownloadingId(`png-${resident.id}`)
      const { downloadInvoicePng } = await import('../utils/invoiceImage')
      await downloadInvoicePng(resident, selectedPeriod, resident.unpaidMonths, adminBlockFilter)
    } catch (err) {
      console.error(err)
      alert('Gagal mendownload PNG: ' + (err.message || err))
    } finally {
      setDownloadingId(null)
    }
  }

  // Direct Quick WhatsApp Link
  const handleQuickWhatsApp = (resident) => {
    const bank = blockConfig?.bank || { name: 'Bank Transfer', accountNumber: '-', accountHolder: '-' }
    const detailBulan = resident.unpaidMonths.map(it => `- Iuran ${getMonthName(it.bulan)} ${it.tahun}: ${formatCurrency(it.nominal || iuranPerBulan)}`).join('\n')
    const message = `📋 *SURAT TAGIHAN INTERNET GRIYA SAKINAH*

Kepada Yth. Bapak/Ibu:
*${resident.nama_warga} (Blok ${resident.blok_rumah})*

Status: *${isOverdue ? '⚠️ TERLEWAT JATUH TEMPO' : '⏳ MENUNGGU PEMBAYARAN'}*
Batas Jatuh Tempo: *5 ${getMonthName(selectedPeriod.bulan)} ${selectedPeriod.tahun}*

*Rincian Tagihan (${resident.arrearsCount} Bulan):*
${detailBulan}

*Total Pembayaran: ${formatCurrency(resident.totalAmount)}*

-----------------------------
*Rekening Pembayaran:*
Bank: *${bank.name}*
No. Rekening: *${bank.accountNumber}*
Atas Nama: *${bank.accountHolder}*

_Mohon kirimkan bukti transfer jika sudah melakukan pembayaran. Terima kasih atas kerjasamanya!_

— Pengurus Internet Griya Sakinah ${blockConfig?.name || ''}`

    if (resident.no_whatsapp) {
      window.open(generateWhatsAppUrl(resident.no_whatsapp, message), '_blank')
    } else {
      navigator.clipboard.writeText(message)
      alert('Nomor WhatsApp belum terdaftar untuk warga ini. Format pesan tagihan telah disalin ke clipboard!')
    }
  }

  return (
    <div className="invoice-tab-container">
      {/* Top Banner & Stats Overview */}
      <div className="invoice-header-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Card 1: Warga Menunggu Pembayaran */}
        <div className="card" style={{
          padding: '18px 20px',
          borderLeft: '4px solid #f59e0b',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: 600 }}>
              Menunggu Pembayaran
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
              {totalUnpaidWarga} <span style={{ fontSize: '14px', fontWeight: 500 }}>Warga</span>
            </div>
            <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>
              Periode {getMonthName(selectedPeriod.bulan)} {selectedPeriod.tahun}
            </div>
          </div>
        </div>

        {/* Card 2: Total Akumulasi Tagihan */}
        <div className="card" style={{
          padding: '18px 20px',
          borderLeft: `4px solid ${isOverdue ? '#ef4444' : '#0284c7'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: isOverdue ? '#fee2e2' : '#e0f2fe',
            color: isOverdue ? '#dc2626' : '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: 600 }}>
              Total Nominal Tagihan
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: isOverdue ? '#dc2626' : 'var(--text-primary, #0f172a)', marginTop: '2px' }}>
              {formatCurrency(totalNominalTagihan)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', marginTop: '2px' }}>
              Akumulasi dari {totalTunggakanBulan} bulan iuran
            </div>
          </div>
        </div>

        {/* Card 3: Status Jatuh Tempo */}
        <div className="card" style={{
          padding: '18px 20px',
          borderLeft: `4px solid ${isOverdue ? '#dc2626' : '#10b981'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: isOverdue ? '#fef2f2' : '#ecfdf5',
            color: isOverdue ? '#dc2626' : '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {isOverdue ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: 600 }}>
              Batas Jatuh Tempo
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: isOverdue ? '#dc2626' : '#059669', marginTop: '2px' }}>
              {isOverdue ? 'Jatuh Tempo Terlewat' : 'Tepat Waktu'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary, #64748b)', marginTop: '2px' }}>
              Tgl 5 {getMonthName(selectedPeriod.bulan)} {selectedPeriod.tahun}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '20px' }}>
        {/* Header & Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          paddingBottom: '16px'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} className="text-primary" />
              Daftar Tagihan Internet Aktif
              <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                {filteredList.length} Tagihan
              </span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', marginTop: '4px' }}>
              Tagihan otomatis hilang dari daftar ini ketika warga sudah melunasi pembayaran.
            </p>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Cari nama atau blok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Unpaid List or Empty State */}
        {filteredList.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: 'var(--bg-secondary, #f8fafc)',
            borderRadius: '12px',
            border: '1.5px dashed var(--border-color, #cbd5e1)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
              {unpaidResidentsWithArrears.length === 0
                ? 'Semua Warga Sudah Lunas!'
                : 'Tidak ada data warga yang cocok dengan pencarian.'
              }
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', marginTop: '4px', maxWidth: '420px', margin: '6px auto 0' }}>
              {unpaidResidentsWithArrears.length === 0
                ? `Alhamdulillah, tidak ada tagihan internet yang tertunda untuk ${blockConfig?.name || 'Blok'} pada periode ${getMonthName(selectedPeriod.bulan)} ${selectedPeriod.tahun}.`
                : 'Coba ubah kata kunci pencarian nama atau blok warga.'
              }
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary, #f8fafc)' }}>
                  <th style={{ padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Blok / Warga</th>
                  <th style={{ padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Periode Belum Lunas</th>
                  <th style={{ padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Total Tagihan</th>
                  <th style={{ padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>Aksi Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((resident) => {
                  const isCurrentOnly = resident.arrearsCount === 1
                  return (
                    <tr key={resident.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                      {/* Warga Info */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '42px',
                            height: '28px',
                            padding: '0 8px',
                            background: '#e0f2fe',
                            color: '#0284c7',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '12px'
                          }}>
                            {resident.blok_rumah}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>
                              {resident.nama_warga}
                            </div>
                            {resident.no_whatsapp && (
                              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Phone size={10} />
                                {resident.no_whatsapp}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Arrears detail */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                          <span className="badge" style={{
                            background: isCurrentOnly ? '#f1f5f9' : '#fee2e2',
                            color: isCurrentOnly ? '#475569' : '#b91c1c',
                            fontWeight: 700
                          }}>
                            {resident.arrearsCount} Bulan
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>
                            ({resident.unpaidMonths.map(m => getMonthName(m.bulan).substring(0, 3)).join(', ')})
                          </span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: isOverdue ? '#dc2626' : '#d97706', fontFamily: 'monospace' }}>
                          {formatCurrency(resident.totalAmount)}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          @{formatCurrency(iuranPerBulan)}/bln
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        {isOverdue ? (
                          <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '10px' }}>
                            ⚠️ OVERDUE
                          </span>
                        ) : (
                          <span className="badge" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontSize: '10px' }}>
                            ⏳ MENUNGGU
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Preview / Cetak Invoice */}
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              background: '#f1f5f9',
                              color: '#1e293b',
                              border: '1px solid #cbd5e1',
                              padding: '6px 10px',
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => onShowInvoice(resident, resident.unpaidMonths)}
                            title="Pratinjau & Cetak Invoice"
                          >
                            <Eye size={14} />
                            <span>Invoice</span>
                          </button>

                          {/* Quick Download PDF */}
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              padding: '6px 8px',
                              fontSize: '12px'
                            }}
                            onClick={() => handleQuickDownloadPdf(resident)}
                            disabled={downloadingId === `pdf-${resident.id}`}
                            title="Unduh Berkas PDF Tagihan"
                          >
                            <Download size={14} />
                            <span style={{ fontSize: '10px', fontWeight: 700, marginLeft: '2px' }}>PDF</span>
                          </button>

                          {/* Quick Download PNG */}
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              background: '#e0f2fe',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              padding: '6px 8px',
                              fontSize: '12px'
                            }}
                            onClick={() => handleQuickDownloadPng(resident)}
                            disabled={downloadingId === `png-${resident.id}`}
                            title="Unduh Gambar PNG Tagihan"
                          >
                            <Download size={14} />
                            <span style={{ fontSize: '10px', fontWeight: 700, marginLeft: '2px' }}>PNG</span>
                          </button>

                          {/* Quick WhatsApp */}
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #86efac',
                              padding: '6px 8px',
                              fontSize: '12px'
                            }}
                            onClick={() => handleQuickWhatsApp(resident)}
                            title="Kirim Penagihan ke WhatsApp"
                          >
                            <Share2 size={14} />
                          </button>

                          {/* Quick Pay Now */}
                          {onOpenPayment && (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onClick={() => onOpenPayment(resident)}
                              title="Input Pembayaran Warga Ini"
                            >
                              <CheckCircle2 size={14} />
                              <span>Bayar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
