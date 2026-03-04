/**
 * Shared formatting utilities for Angsuran module
 * Extracted from 9+ duplicate definitions across the codebase
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

export const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export const formatDateLong = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
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

/**
 * SHA-256 hash for password security
 */
export const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
