import { jsPDF } from 'jspdf';

export const generateKwitansi = (payment, unit) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Generate receipt number
    const receiptNo = `KW-${new Date().getFullYear()}-${payment.id.substring(0, 6).toUpperCase()}`;
    const date = new Date(payment.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Format currency
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    // Header
    doc.setFillColor(16, 185, 129); // Green color
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('KWITANSI PEMBAYARAN', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('GRIYA SAKINAH', pageWidth / 2, 32, { align: 'center' });

    // Receipt details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    let y = 55;

    // Receipt number and date
    doc.setFont('helvetica', 'bold');
    doc.text('No. Kwitansi', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${receiptNo}`, 70, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Tanggal', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${date}`, 70, y);

    // Separator line
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);

    // Resident info
    y += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Telah diterima dari:', 20, y);

    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Nama', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${unit.residentName}`, 70, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Blok', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${unit.blockNumber}`, 70, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('No. HP', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${unit.phone}`, 70, y);

    // Separator line
    y += 10;
    doc.line(20, y, pageWidth - 20, y);

    // Payment details
    y += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Untuk pembayaran:', 20, y);

    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Kategori', 20, y);
    doc.setFont('helvetica', 'normal');
    const categoryText = payment.category === 'pokok' ? 'Angsuran Pokok' : 'Bangunan Tambahan';
    doc.text(`: ${categoryText}`, 70, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Angsuran ke', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${payment.installmentNo}`, 70, y);

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Nominal', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`: ${formatRupiah(payment.amount)}`, 70, y);

    // Total
    y += 12;
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);

    y += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 20, y);
    doc.setTextColor(16, 185, 129);
    doc.text(`: ${formatRupiah(payment.amount)}`, 70, y);

    // Status badge
    y += 20;
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(pageWidth / 2 - 30, y - 7, 60, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('LUNAS', pageWidth / 2, y, { align: 'center' });

    // Notes
    if (payment.notes) {
        y += 25;
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`Catatan: ${payment.notes}`, 20, y);
    }

    // Footer
    y = 260;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Dokumen ini digenerate secara otomatis oleh sistem Griya Sakinah', pageWidth / 2, y, { align: 'center' });
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, y + 6, { align: 'center' });

    // Save PDF
    doc.save(`Kwitansi_${unit.blockNumber}_${receiptNo}.pdf`);

    return receiptNo;
};

export const generateWhatsAppLink = (phone, message) => {
    // Remove non-numeric characters and ensure starts with country code
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.substring(1);
    }

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

export const getPaymentConfirmationMessage = (unit, payment) => {
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    const date = new Date(payment.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return `Halo Bapak/Ibu ${unit.residentName},

Pembayaran Anda telah kami terima:
📍 Blok: ${unit.blockNumber}
💰 Nominal: ${formatRupiah(payment.amount)}
📅 Tanggal: ${date}
✅ Status: LUNAS

Jazakumullah khairan atas kepercayaan Anda.
- Admin Griya Sakinah`;
};

export const getReminderMessage = (unit, overdueAmount) => {
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    return `Assalamualaikum Bapak/Ibu ${unit.residentName},

Ini adalah pengingat bahwa pembayaran angsuran Anda untuk Blok ${unit.blockNumber} sudah melewati jatuh tempo (tanggal ${unit.dueDay} setiap bulan).

Sisa tunggakan: ${formatRupiah(overdueAmount)}

Mohon segera melakukan pembayaran.

Jazakumullah khairan.
- Admin Griya Sakinah`;
};

export default {
    generateKwitansi,
    generateWhatsAppLink,
    getPaymentConfirmationMessage,
    getReminderMessage
};
