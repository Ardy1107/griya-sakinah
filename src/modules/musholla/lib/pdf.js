import jsPDF from 'jspdf';
import { formatRupiah, terbilangRupiah, formatDate } from './utils';

/**
 * Generate PDF receipt for donation
 * @param {Object} donation - Donation data
 * @param {Object} donor - Donor data
 * @returns {jsPDF} PDF document
 */
export function generateReceiptPDF(donation, donor) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5' // Smaller format for receipt
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    // Helper function to center text
    const centerText = (text, yPos) => {
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, yPos);
    };

    // Header Background
    doc.setFillColor(5, 150, 105); // Islamic Green
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    centerText('🕌', y + 5);

    y += 15;
    doc.setFontSize(16);
    centerText('MUSHOLLA AS-SAKINAH', y);

    y += 7;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    centerText('KWITANSI DONASI', y);

    y += 7;
    doc.setFontSize(9);
    centerText('Griya Sakinah, Bandung', y);

    // Reset text color
    doc.setTextColor(31, 41, 55);
    y = 55;

    // Reference Number Box
    doc.setFillColor(240, 253, 244); // Light green
    doc.setDrawColor(5, 150, 105);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 3, 3, 'FD');

    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    centerText('No. Referensi', y);

    y += 7;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    centerText(donation.nomor_referensi || '-', y);

    y += 15;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal: ${formatDate(donation.tanggal_bayar)}`, margin, y);

    y += 12;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Donor Info Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Telah terima dari:', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    const leftCol = margin;
    const rightCol = margin + 30;

    doc.text('Nama', leftCol, y);
    doc.text(`: ${donor.nama || '-'}`, rightCol, y);
    y += 6;

    doc.text('Alamat', leftCol, y);
    doc.text(`: ${donor.blok_rumah || 'Umum'}`, rightCol, y);
    y += 6;

    if (donor.no_telp) {
        doc.text('No. Telp', leftCol, y);
        doc.text(`: ${donor.no_telp}`, rightCol, y);
        y += 6;
    }

    y += 8;

    // Donation Info Section
    doc.setFont('helvetica', 'bold');
    doc.text('Berupa sumbangan:', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');

    const kategoriLabel = {
        'tunai': 'Uang Tunai',
        'material': 'Material Bangunan',
        'wakaf': 'Wakaf Khusus'
    }[donation.kategori_pembayaran] || donation.kategori_pembayaran;

    doc.text('Kategori', leftCol, y);
    doc.text(`: ${kategoriLabel}`, rightCol, y);
    y += 6;

    doc.text('Nominal', leftCol, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`: ${formatRupiah(donation.nominal)}`, rightCol, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Terbilang', leftCol, y);

    // Word wrap for terbilang
    const terbilang = terbilangRupiah(donation.nominal);
    const splitTerbilang = doc.splitTextToSize(`: ${terbilang}`, pageWidth - rightCol - margin);
    doc.text(splitTerbilang, rightCol, y);
    y += splitTerbilang.length * 5 + 3;

    if (donation.keterangan) {
        doc.setFontSize(10);
        doc.text('Keterangan', leftCol, y);
        const splitKet = doc.splitTextToSize(`: ${donation.keterangan}`, pageWidth - rightCol - margin);
        doc.text(splitKet, rightCol, y);
        y += splitKet.length * 5 + 3;
    }

    y += 8;

    // Purpose
    doc.setFillColor(254, 243, 199); // Gold/yellow background
    doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 2, 2, 'F');
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14); // Dark gold text
    centerText('Untuk: Pembangunan Musholla As-Sakinah', y);

    doc.setTextColor(31, 41, 55);
    y += 18;

    // Signature Section
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const signatureX = pageWidth - margin - 50;
    doc.text(`Bandung, ${formatDate(donation.tanggal_bayar)}`, signatureX, y);
    y += 25;
    doc.line(signatureX, y, signatureX + 50, y);
    y += 5;
    doc.text('Bendahara', signatureX + 15, y);

    // Footer
    y = pageHeight - 20;
    doc.setFillColor(5, 150, 105);
    doc.rect(0, y - 5, pageWidth, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    centerText('🙏 Jazakumullahu Khairan Katsira 🙏', y + 3);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    centerText('Semoga menjadi amal jariyah yang diterima Allah SWT', y + 10);

    return doc;
}

/**
 * Download receipt as PDF
 * @param {Object} donation - Donation data
 * @param {Object} donor - Donor data
 */
export function downloadReceiptPDF(donation, donor) {
    const doc = generateReceiptPDF(donation, donor);
    const filename = `Kwitansi_${donation.nomor_referensi}.pdf`;
    doc.save(filename);
    return filename;
}

/**
 * Get receipt as blob URL for preview or WhatsApp
 * @param {Object} donation - Donation data
 * @param {Object} donor - Donor data
 * @returns {string} Blob URL
 */
export function getReceiptBlobUrl(donation, donor) {
    const doc = generateReceiptPDF(donation, donor);
    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
}
