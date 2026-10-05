// Image & PDF Invoice Generator - v1.0
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { formatCurrency, getMonthName } from './helpers'
import { getBlockConfig } from '../config/blockConfig'
import bannerInternet from '../../../assets/banner-internet.webp'

// Create invoice HTML element for offscreen capture
export function createInvoiceElement(resident, period, unpaidMonths = [], blockId) {
  const blockConfig = getBlockConfig(blockId || resident.blok_rumah?.charAt(0)?.toUpperCase())
  const bank = blockConfig?.bank || { name: 'Bank Transfer', accountNumber: '-', accountHolder: '-' }
  const iuranPerBulan = blockConfig?.iuran || 150000

  // Calculate items
  const items = unpaidMonths.length > 0 
    ? unpaidMonths 
    : [{ bulan: period.bulan, tahun: period.tahun, nominal: iuranPerBulan }]
  
  const totalTagihan = items.reduce((sum, item) => sum + (item.nominal || iuranPerBulan), 0)
  const invoiceNumber = `INV/${period.tahun}/${String(period.bulan).padStart(2, '0')}/${resident.blok_rumah || 'GS'}`
  
  // Due date & Overdue check (Tanggal 5)
  const now = new Date()
  const dueDate = new Date(period.tahun, period.bulan - 1, 5, 23, 59, 59)
  const isOverdue = now > dueDate

  const dueDateFormatted = `5 ${getMonthName(period.bulan)} ${period.tahun}`
  const invoiceDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const container = document.createElement('div')
  container.id = 'invoice-capture'
  container.innerHTML = `
    <div style="
      width: 520px;
      background: #ffffff;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      position: relative;
      color: #0f172a;
      line-height: 1.5;
    ">
      <!-- Watermark Background -->
      <div style="
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: radial-gradient(#d97706 1px, transparent 1px);
        background-size: 24px 24px;
        opacity: 0.03;
        pointer-events: none;
      "></div>

      <!-- Header Banner -->
      <img src="${bannerInternet}" style="width: 100%; display: block; border-top-left-radius: 16px; border-top-right-radius: 16px;" alt="Banner Internet Griya Sakinah" />

      <!-- Invoice Ribbon -->
      <div style="
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        padding: 14px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Surat Tagihan / Invoice</div>
          <div style="font-size: 14px; color: #0f172a; font-weight: 800; font-family: monospace;">${invoiceNumber}</div>
        </div>
        <div>
          ${isOverdue 
            ? `<div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #fef2f2; border: 1.5px solid #ef4444; color: #dc2626; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                ⚠️ JATUH TEMPO TERLEWAT
              </div>`
            : `<div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: #fffbeb; border: 1.5px solid #f59e0b; color: #b45309; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                ⏳ MENUNGGU PEMBAYARAN
              </div>`
          }
        </div>
      </div>

      <!-- Resident Info Section -->
      <div style="padding: 20px 24px; background: #ffffff; position: relative;">
        <!-- Large Background Watermark -->
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-15deg);
          font-size: 64px;
          font-weight: 900;
          color: ${isOverdue ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)'};
          pointer-events: none;
          white-space: nowrap;
          letter-spacing: 8px;
          z-index: 0;
        ">
          ${isOverdue ? 'OVERDUE' : 'TAGIHAN'}
        </div>

        <div style="position: relative; z-index: 1;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <div style="font-size: 12px; color: #64748b; font-weight: 500; margin-bottom: 2px;">Tagihan Kepada:</div>
              <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${resident.nama_warga}</div>
              <div style="display: inline-block; margin-top: 4px; font-size: 12px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 6px;">Blok ${resident.blok_rumah}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #64748b; font-weight: 500; margin-bottom: 2px;">Batas Jatuh Tempo:</div>
              <div style="font-size: 15px; font-weight: 800; color: ${isOverdue ? '#dc2626' : '#d97706'};">${dueDateFormatted}</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Diterbitkan: ${invoiceDateFormatted}</div>
            </div>
          </div>

          <!-- Items Table -->
          <div style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-top: 14px;">
            <div style="background: #f1f5f9; padding: 10px 14px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">
              <span>Rincian Tagihan Iuran</span>
              <span>Jumlah</span>
            </div>
            ${items.map((item, idx) => `
              <div style="padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; border-top: ${idx > 0 ? '1px solid #f1f5f9' : 'none'}; background: ${idx % 2 === 0 ? '#ffffff' : '#fafafa'}; font-size: 13px;">
                <div>
                  <span style="font-weight: 600; color: #1e293b;">Iuran Internet ${getMonthName(item.bulan)} ${item.tahun}</span>
                  ${item.bulan === period.bulan && item.tahun === period.tahun ? '<span style="margin-left: 6px; font-size: 10px; background: #e2e8f0; color: #475569; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Periode Aktif</span>' : '<span style="margin-left: 6px; font-size: 10px; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Tunggakan</span>'}
                </div>
                <span style="font-weight: 700; color: #0f172a; font-family: monospace;">${formatCurrency(item.nominal || iuranPerBulan)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Total Amount Card -->
      <div style="padding: 0 24px 20px;">
        <div style="
          background: ${isOverdue ? 'linear-gradient(to right, #fef2f2, #fff1f2)' : 'linear-gradient(to right, #fffbeb, #fef3c7)'};
          border: 1.5px solid ${isOverdue ? '#fca5a5' : '#fcd34d'};
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div>
            <div style="color: ${isOverdue ? '#991b1b' : '#92400e'}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Total Yang Harus Dibayar</div>
            <div style="color: ${isOverdue ? '#b91c1c' : '#b45309'}; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">${formatCurrency(totalTagihan)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: ${isOverdue ? '#991b1b' : '#92400e'}; font-weight: 600;">${items.length} Bulan Iuran</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">@ ${formatCurrency(iuranPerBulan)}/bln</div>
          </div>
        </div>
      </div>

      <!-- Bank Transfer Instructions -->
      <div style="padding: 0 24px 24px;">
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span>💳</span> CARA PEMBAYARAN TRANSFER BANK:
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 12px; color: #64748b; font-weight: 600;">Bank Tujuan:</span>
              <span style="font-size: 14px; font-weight: 800; color: #0284c7;">${bank.name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 12px; color: #64748b; font-weight: 600;">Nomor Rekening:</span>
              <span style="font-size: 16px; font-weight: 900; color: #0f172a; font-family: monospace; letter-spacing: 1px;">${bank.accountNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; color: #64748b; font-weight: 600;">Atas Nama:</span>
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">${bank.accountHolder}</span>
            </div>
          </div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
            ℹ️ <em>Sertakan keterangan nama warga / blok rumah pada berita transfer, lalu kirimkan bukti transfer ke WhatsApp pengurus untuk pencatatan lunas.</em>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="
        background: #f1f5f9;
        border-top: 1px solid #e2e8f0;
        padding: 16px 24px;
        text-align: center;
      ">
        <div style="font-size: 12px; color: #475569; font-weight: 600;">Pengurus Internet Griya Sakinah ${blockConfig?.name || ''}</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Tagihan ini otomatis dianggap lunas dan tidak berlaku setelah pembayaran diverifikasi oleh admin.</div>
      </div>
    </div>
  `

  return container
}

// Generate invoice as canvas
export async function generateInvoiceImage(resident, period, unpaidMonths, blockId) {
  const invoiceElement = createInvoiceElement(resident, period, unpaidMonths, blockId)

  invoiceElement.style.position = 'absolute'
  invoiceElement.style.left = '-9999px'
  invoiceElement.style.top = '0'
  document.body.appendChild(invoiceElement)

  // Wait for images to load
  const images = invoiceElement.querySelectorAll('img')
  await Promise.all(Array.from(images).map(img => {
    if (img.complete) return Promise.resolve()
    return new Promise(resolve => {
      img.onload = resolve
      img.onerror = resolve
    })
  }))

  try {
    const canvas = await html2canvas(invoiceElement.firstElementChild, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    })

    document.body.removeChild(invoiceElement)
    return canvas
  } catch (error) {
    if (invoiceElement.parentNode) {
      document.body.removeChild(invoiceElement)
    }
    throw error
  }
}

// Download invoice as PDF
export async function downloadInvoicePdf(resident, period, unpaidMonths, blockId) {
  const canvas = await generateInvoiceImage(resident, period, unpaidMonths, blockId)
  
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  })
  
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
  const filename = `Invoice_${resident.blok_rumah}_${period.bulan}_${period.tahun}.pdf`
  pdf.save(filename)
  
  return filename
}

// Download invoice as PNG
export async function downloadInvoicePng(resident, period, unpaidMonths, blockId) {
  const canvas = await generateInvoiceImage(resident, period, unpaidMonths, blockId)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice_${resident.blok_rumah}_${period.bulan}_${period.tahun}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      resolve(link.download)
    }, 'image/png')
  })
}
