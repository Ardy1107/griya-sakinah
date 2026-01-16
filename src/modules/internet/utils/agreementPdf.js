// Agreement PDF Generator - Download signed agreement as PDF
import jsPDF from 'jspdf'

const AGREEMENT_RULES = [
    'Pembayaran internet wajib dilakukan antara tanggal 1 sampai tanggal 10 di setiap bulannya.',
    'Pembayaran bulanan harus dipatuhi sesuai dengan jadwal yang telah ditetapkan oleh pengelola.',
    'Keterlambatan pembayaran yang melewati tanggal 10 akan diberikan peringatan terlebih dahulu.',
    'Apabila tunggakan mencapai 3 bulan, sambungan internet akan diputus sementara secara otomatis.',
    'Layanan internet hanya akan diaktifkan kembali setelah seluruh total tunggakan dilunasi sepenuhnya.',
    'Gangguan teknis atau kerusakan perangkat harus segera dilaporkan kepada admin/pengelola untuk penanganan lebih lanjut.',
    'Dengan menandatangani dokumen ini, warga dianggap setuju dan tunduk pada seluruh peraturan yang berlaku.'
]

export async function downloadAgreementPDF(resident, agreement, blockName = '') {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPos = 25

    // Header
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('PERATURAN PEMBAYARAN INTERNET', pageWidth / 2, yPos, { align: 'center' })
    yPos += 8

    doc.setFontSize(14)
    doc.text('PERUMAHAN GRIYA SAKINAH', pageWidth / 2, yPos, { align: 'center' })
    yPos += 6

    if (blockName) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(blockName, pageWidth / 2, yPos, { align: 'center' })
        yPos += 6
    }

    // Divider line
    yPos += 5
    doc.setLineWidth(0.5)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 15

    // Resident Info
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Data Warga:', margin, yPos)
    yPos += 7

    doc.setFont('helvetica', 'normal')
    doc.text(`Nama: ${resident.nama_warga}`, margin + 5, yPos)
    yPos += 6
    doc.text(`Blok Rumah: ${resident.blok_rumah}`, margin + 5, yPos)
    yPos += 15

    // Ketentuan & Peraturan
    doc.setFont('helvetica', 'bold')
    doc.text('Ketentuan & Peraturan:', margin, yPos)
    yPos += 10

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    AGREEMENT_RULES.forEach((rule, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${rule}`, contentWidth - 10)

        // Check if we need a new page
        if (yPos + (lines.length * 5) > 250) {
            doc.addPage()
            yPos = 25
        }

        lines.forEach(line => {
            doc.text(line, margin + 5, yPos)
            yPos += 5
        })
        yPos += 3
    })

    yPos += 10

    // Agreement Statement
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Pernyataan Persetujuan:', margin, yPos)
    yPos += 7

    doc.setFont('helvetica', 'normal')
    const agreementText = `Dengan ini saya, ${resident.nama_warga} (Blok ${resident.blok_rumah}), menyatakan telah membaca, memahami, dan menyetujui seluruh peraturan pembayaran internet yang berlaku di Perumahan Griya Sakinah.`
    const agreementLines = doc.splitTextToSize(agreementText, contentWidth - 10)
    agreementLines.forEach(line => {
        doc.text(line, margin + 5, yPos)
        yPos += 5
    })

    yPos += 15

    // Signature Section
    doc.setFont('helvetica', 'bold')
    doc.text('Tanda Tangan Digital:', margin, yPos)
    yPos += 5

    // Add signature image if exists
    if (agreement.signature_data) {
        try {
            doc.addImage(agreement.signature_data, 'PNG', margin, yPos, 60, 30)
            yPos += 35
        } catch (e) {
            console.error('Error adding signature:', e)
            yPos += 10
        }
    }

    // Agreement timestamp
    const agreedDate = new Date(agreement.agreed_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Ditandatangani secara digital pada: ${agreedDate}`, margin, yPos)
    yPos += 15

    // Footer
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 5

    doc.setFontSize(8)
    doc.setTextColor(100)
    doc.text('Dokumen ini adalah bukti persetujuan digital yang sah.', pageWidth / 2, yPos, { align: 'center' })
    yPos += 4
    doc.text('Griya Sakinah Internet Management', pageWidth / 2, yPos, { align: 'center' })

    // Download
    const fileName = `Persetujuan_Internet_${resident.blok_rumah}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
}
