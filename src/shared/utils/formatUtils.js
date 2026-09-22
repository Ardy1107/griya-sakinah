/**
 * Shared Formatting Utilities — Griya Sakinah
 * Currency, phone, and WhatsApp formatting used across all modules
 */

export const formatRupiah = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

export const formatPhone = (phone) => {
    if (!phone) return '-';
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
        clean = '62' + clean.substring(1);
    }
    return clean;
};

export const formatWhatsAppUrl = (phone, message = '') => {
    const clean = formatPhone(phone);
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${clean}${message ? `?text=${encoded}` : ''}`;
};

export const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
};
