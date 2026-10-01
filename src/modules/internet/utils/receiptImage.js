// Image Receipt Generator with Logo - v2.0
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { formatCurrency, getMonthName, generateReceiptNumber } from './helpers'

// Create receipt HTML element for capture
export function createReceiptElement(resident, payment) {
  const receiptNumber = payment.nomor_referensi || generateReceiptNumber(payment.id)
  const period = `${getMonthName(payment.bulan)} ${payment.tahun}`
  const tanggalBayar = new Date(payment.tanggal_bayar).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const metodeBayar = payment.metode_bayar || 'Cash'

  const container = document.createElement('div')
  container.id = 'receipt-capture'
  container.innerHTML = `
    <div style="
      width: 480px;
      background: #ffffff;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      position: relative;
    ">
      <!-- Background Watermark Pattern -->
      <div style="
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: radial-gradient(#10b981 1px, transparent 1px);
        background-size: 20px 20px;
        opacity: 0.03;
        pointer-events: none;
      "></div>

      <!-- Header with Logo and Gradient -->
      <div style="
        background: linear-gradient(135deg, #0f172a, #1e293b);
        padding: 32px 24px;
        text-align: center;
        position: relative;
        overflow: hidden;
      ">
        <div style="
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 50%);
        "></div>
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        ">
          <div style="
            width: 40px; height: 40px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            color: white; font-weight: bold; font-size: 20px;
            box-shadow: 0 4px 12px rgba(16,185,129,0.3);
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">INTERNET SAKINAH</div>
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Kwitansi Resmi</div>
          </div>
        </div>
      </div>

      <!-- Receipt Number Ribbon -->
      <div style="
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">No. Referensi</span>
        <span style="font-size: 14px; color: #0f172a; font-weight: 700; font-family: 'JetBrains Mono', monospace; background: #e2e8f0; padding: 4px 10px; border-radius: 6px;">${receiptNumber}</span>
      </div>

      <!-- Details Section -->
      <div style="padding: 28px 24px; position: relative;">
        <!-- Large Background LUNAS Watermark -->
        <div style="
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-15deg);
          font-size: 80px;
          font-weight: 900;
          color: rgba(34, 197, 94, 0.05);
          pointer-events: none;
          white-space: nowrap;
          letter-spacing: 10px;
          z-index: 0;
        ">LUNAS</div>
        
        <div style="position: relative; z-index: 1;">
          <div style="
            display: flex; flex-direction: column; gap: 16px;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-size: 14px;">Nama Warga</span>
              <span style="color: #0f172a; font-weight: 600; font-size: 15px;">${resident.nama_warga}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-size: 14px;">Blok Rumah</span>
              <span style="color: #0f172a; font-weight: 700; font-size: 15px; background: #f1f5f9; padding: 4px 12px; border-radius: 20px;">${resident.blok_rumah}</span>
            </div>
            <div style="height: 1px; background: #e2e8f0; margin: 4px 0;"></div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-size: 14px;">Periode Iuran</span>
              <span style="color: #0f172a; font-weight: 600; font-size: 15px;">${period}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-size: 14px;">Tanggal Bayar</span>
              <span style="color: #0f172a; font-weight: 500; font-size: 15px;">${tanggalBayar}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #64748b; font-size: 14px;">Metode Pembayaran</span>
              <span style="color: #0f172a; font-weight: 500; font-size: 15px; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
                ${metodeBayar}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Total & LUNAS Stamp -->
      <div style="padding: 0 24px 28px;">
        <div style="
          background: linear-gradient(to right, #ecfdf5, #dcfce7);
          border: 1px solid #a7f3d0;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
        ">
          <div>
            <div style="color: #047857; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Total Dibayarkan</div>
            <div style="color: #065f46; font-size: 24px; font-weight: 800;">${formatCurrency(payment.nominal)}</div>
          </div>
          
          <!-- Stamp Graphic -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px 16px;
            border: 2px solid #059669;
            border-radius: 8px;
            color: #059669;
            font-weight: 800;
            font-size: 16px;
            letter-spacing: 2px;
            transform: rotate(-3deg);
            background: rgba(16, 185, 129, 0.1);
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            LUNAS
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        padding: 20px 24px;
        text-align: center;
      ">
        <div style="font-size: 13px; color: #475569; font-weight: 500;">Terima kasih atas pembayaran Anda!</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Dokumen ini adalah bukti pembayaran yang sah.</div>
        <div style="font-size: 10px; color: #cbd5e1; margin-top: 16px; text-transform: uppercase; letter-spacing: 1px;">© ${new Date().getFullYear()} Griya Sakinah Management</div>
      </div>
    </div>
  `

  return container
}

// Generate receipt as image
export async function generateReceiptImage(resident, payment) {
  const receiptElement = createReceiptElement(resident, payment)

  receiptElement.style.position = 'absolute'
  receiptElement.style.left = '-9999px'
  receiptElement.style.top = '0'
  document.body.appendChild(receiptElement)

  try {
    const canvas = await html2canvas(receiptElement.firstChild, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    })

    document.body.removeChild(receiptElement)
    return canvas
  } catch (error) {
    document.body.removeChild(receiptElement)
    throw error
  }
}

// Download receipt as PDF
export async function downloadReceiptPdf(resident, payment) {
  const canvas = await generateReceiptImage(resident, payment)
  
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  })
  
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(`Kwitansi_${resident.blok_rumah}_${payment.bulan}_${payment.tahun}.pdf`)
  
  return `Kwitansi_${resident.blok_rumah}_${payment.bulan}_${payment.tahun}.pdf`
}

// Download receipt as PNG
export async function downloadReceiptPng(resident, payment) {
  const canvas = await generateReceiptImage(resident, payment)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Kwitansi_${resident.blok_rumah}_${payment.bulan}_${payment.tahun}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      resolve(link.download)
    }, 'image/png')
  })
}

// Get receipt as blob
export async function getReceiptImageBlob(resident, payment) {
  const canvas = await generateReceiptImage(resident, payment)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png')
  })
}
