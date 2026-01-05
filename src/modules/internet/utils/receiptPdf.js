// PDF Receipt Generator with Logo - v2.0
import jsPDF from 'jspdf'
import { formatCurrency, getMonthName, generateReceiptNumber } from './helpers'

export function generateReceiptPDF(resident, payment) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 160] // Receipt size
    })

    const receiptNumber = payment.nomor_referensi || generateReceiptNumber(payment.id)
    const period = `${getMonthName(payment.bulan)} ${payment.tahun}`
    const tanggalBayar = new Date(payment.tanggal_bayar).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    const metodeBayar = payment.metode_bayar || 'Cash'

    // Background
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 100, 160, 'F')

    // Header - Green gradient background
    doc.setFillColor(16, 185, 129) // Primary green
    doc.rect(0, 0, 100, 28, 'F')

    // Logo text (since we can't easily embed image in jsPDF without base64)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('GRIYA SAKINAH', 50, 14, { align: 'center' })

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('INTERNET MANAGEMENT SYSTEM', 50, 20, { align: 'center' })

    // Receipt Number Box
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 28, 100, 14, 'F')

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(6)
    doc.text('NOMOR KWITANSI', 50, 34, { align: 'center' })

    doc.setTextColor(30, 41, 59)
    doc.setFontSize(9)
    doc.setFont('courier', 'bold')
    doc.text(receiptNumber, 50, 39, { align: 'center' })

    // Divider
    doc.setDrawColor(226, 232, 240)
    doc.setLineDash([2, 2], 0)
    doc.line(10, 43, 90, 43)

    // Title
    doc.setLineDash([])
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('KWITANSI PEMBAYARAN', 50, 52, { align: 'center' })

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Iuran Internet Sakinah', 50, 57, { align: 'center' })

    // Details
    const detailsStart = 65
    const lineHeight = 7

    const details = [
        ['Blok Rumah', resident.blok_rumah],
        ['Nama Warga', resident.nama_warga.length > 18 ? resident.nama_warga.substring(0, 18) + '...' : resident.nama_warga],
        ['Periode', period],
        ['Tanggal Bayar', tanggalBayar],
        ['Metode', metodeBayar]
    ]

    details.forEach((row, idx) => {
        const y = detailsStart + (idx * lineHeight)

        doc.setTextColor(100, 116, 139)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.text(row[0], 12, y)

        doc.setTextColor(30, 41, 59)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(row[1], 88, y, { align: 'right' })
    })

    // Total Box
    const totalY = detailsStart + (details.length * lineHeight) + 5

    doc.setFillColor(240, 253, 244) // Light green
    doc.setDrawColor(134, 239, 172) // Green border
    doc.roundedRect(12, totalY - 4, 76, 14, 3, 3, 'FD')

    doc.setTextColor(22, 101, 52)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Total Pembayaran', 16, totalY + 2)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrency(payment.nominal), 84, totalY + 3, { align: 'right' })

    // LUNAS Stamp
    const stampY = totalY + 22
    doc.setFillColor(220, 252, 231)
    doc.roundedRect(25, stampY - 4, 50, 14, 3, 3, 'F')

    doc.setDrawColor(34, 197, 94)
    doc.setLineWidth(0.8)
    doc.roundedRect(25, stampY - 4, 50, 14, 3, 3, 'S')

    doc.setTextColor(34, 197, 94)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('LUNAS', 50, stampY + 5, { align: 'center' })

    // Divider
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.setLineDash([2, 2], 0)
    doc.line(10, stampY + 14, 90, stampY + 14)

    // Footer
    doc.setLineDash([])
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Terima kasih atas pembayarannya!', 50, stampY + 20, { align: 'center' })

    doc.setFontSize(5)
    doc.setTextColor(148, 163, 175)
    doc.text('Simpan kwitansi ini sebagai bukti pembayaran sah.', 50, stampY + 24, { align: 'center' })

    doc.setFontSize(5)
    doc.setTextColor(203, 213, 225)
    doc.text(`© ${new Date().getFullYear()} Griya Sakinah Internet Management`, 50, stampY + 32, { align: 'center' })

    return doc
}

export function downloadReceiptPDF(resident, payment) {
    const doc = generateReceiptPDF(resident, payment)
    const fileName = `Kwitansi_${resident.blok_rumah}_${payment.bulan}_${payment.tahun}.pdf`
    doc.save(fileName)
    return fileName
}

export function getReceiptPDFBlob(resident, payment) {
    const doc = generateReceiptPDF(resident, payment)
    return doc.output('blob')
}
