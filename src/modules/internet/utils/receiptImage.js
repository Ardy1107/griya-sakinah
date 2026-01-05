// Image Receipt Generator with Logo - v2.0
import html2canvas from 'html2canvas'
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
      width: 400px;
      background: white;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    ">
      <!-- Header with Logo -->
      <div style="
        background: linear-gradient(135deg, #10b981, #059669);
        padding: 24px;
        text-align: center;
      ">
        <img 
          src="/logo.png" 
          alt="Griya Sakinah" 
          style="
            height: 60px;
            width: auto;
            margin-bottom: 12px;
            filter: brightness(0) invert(1);
          "
          crossorigin="anonymous"
        />
        <div style="
          font-size: 10px;
          color: rgba(255,255,255,0.8);
          text-transform: uppercase;
          letter-spacing: 2px;
        ">Internet Management System</div>
      </div>

      <!-- Receipt Number -->
      <div style="
        text-align: center;
        padding: 16px;
        background: #f8fafc;
        border-bottom: 1px dashed #e2e8f0;
      ">
        <div style="
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">Nomor Kwitansi</div>
        <div style="
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          margin-top: 4px;
          font-family: monospace;
        ">${receiptNumber}</div>
      </div>

      <!-- Title -->
      <div style="
        text-align: center;
        padding: 20px;
      ">
        <div style="
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        ">KWITANSI PEMBAYARAN</div>
        <div style="
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        ">Iuran Internet Sakinah</div>
      </div>

      <!-- Details -->
      <div style="padding: 0 24px;">
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        ">
          <span style="color: #64748b; font-size: 13px;">Blok Rumah</span>
          <span style="color: #1e293b; font-weight: 600; font-size: 14px;">${resident.blok_rumah}</span>
        </div>
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        ">
          <span style="color: #64748b; font-size: 13px;">Nama Warga</span>
          <span style="color: #1e293b; font-weight: 600; font-size: 14px;">${resident.nama_warga}</span>
        </div>
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        ">
          <span style="color: #64748b; font-size: 13px;">Periode</span>
          <span style="color: #1e293b; font-weight: 600; font-size: 14px;">${period}</span>
        </div>
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        ">
          <span style="color: #64748b; font-size: 13px;">Tanggal Bayar</span>
          <span style="color: #1e293b; font-weight: 600; font-size: 14px;">${tanggalBayar}</span>
        </div>
        <div style="
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        ">
          <span style="color: #64748b; font-size: 13px;">Metode Bayar</span>
          <span style="color: #1e293b; font-weight: 600; font-size: 14px;">${metodeBayar}</span>
        </div>
      </div>

      <!-- Total -->
      <div style="
        margin: 20px 24px;
        padding: 16px;
        background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        border-radius: 12px;
        border: 1px solid #86efac;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <span style="color: #166534; font-size: 13px;">Total Pembayaran</span>
          <span style="
            color: #15803d;
            font-weight: 700;
            font-size: 20px;
          ">${formatCurrency(payment.nominal)}</span>
        </div>
      </div>

      <!-- LUNAS Stamp -->
      <div style="
        text-align: center;
        padding: 24px;
      ">
        <div style="
          display: inline-block;
          padding: 12px 40px;
          background: #dcfce7;
          border: 3px solid #22c55e;
          border-radius: 8px;
          transform: rotate(-2deg);
        ">
          <div style="
            font-size: 28px;
            font-weight: 700;
            color: #22c55e;
            letter-spacing: 4px;
          ">LUNAS</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="
        padding: 20px;
        background: #f8fafc;
        text-align: center;
        border-top: 1px dashed #e2e8f0;
      ">
        <div style="
          font-size: 12px;
          color: #64748b;
        ">Terima kasih atas pembayarannya!</div>
        <div style="
          font-size: 10px;
          color: #94a3b8;
          margin-top: 8px;
        ">Simpan kwitansi ini sebagai bukti pembayaran sah.</div>
        <div style="
          font-size: 10px;
          color: #cbd5e1;
          margin-top: 16px;
        ">© ${new Date().getFullYear()} Griya Sakinah Internet Management</div>
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

// Download receipt as image
export async function downloadReceiptImage(resident, payment) {
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
