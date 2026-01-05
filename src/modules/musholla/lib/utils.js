/**
 * Utility functions for Musholla As-Sakinah Donation System
 */

/**
 * Format number to Indonesian Rupiah currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatRupiah(amount) {
    if (amount === null || amount === undefined) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format number with thousand separators
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 * @returns {number} Percentage (0-100)
 */
export function calculatePercentage(value, max) {
    if (!max || max === 0) return 0;
    const percentage = (value / max) * 100;
    return Math.min(100, Math.round(percentage));
}

/**
 * Format date to Indonesian locale
 * @param {string|Date} date - The date to format
 * @param {boolean} withTime - Include time in format
 * @returns {string} Formatted date string
 */
export function formatDate(date, withTime = false) {
    if (!date) return '-';
    const d = new Date(date);
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...(withTime && { hour: '2-digit', minute: '2-digit' })
    };
    return d.toLocaleDateString('id-ID', options);
}

/**
 * Format date to short format (DD/MM/YYYY)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDateShort(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Get month name in Indonesian
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export function getMonthName(month) {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1] || '';
}

/**
 * Generate unique reference number for receipts
 * Format: MAS-YYYY-MM-XXXX
 * @param {number} sequence - Sequential number
 * @returns {string} Reference number
 */
export function generateReferenceNumber(sequence = 1) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(sequence).padStart(4, '0');
    return `MAS-${year}-${month}-${seq}`;
}

/**
 * Convert number to Indonesian words (Terbilang)
 * @param {number} num - The number to convert
 * @returns {string} Number in words
 */
export function terbilang(num) {
    const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

    if (num < 12) return satuan[num];
    if (num < 20) return terbilang(num - 10) + ' Belas';
    if (num < 100) return terbilang(Math.floor(num / 10)) + ' Puluh ' + terbilang(num % 10);
    if (num < 200) return 'Seratus ' + terbilang(num - 100);
    if (num < 1000) return terbilang(Math.floor(num / 100)) + ' Ratus ' + terbilang(num % 100);
    if (num < 2000) return 'Seribu ' + terbilang(num - 1000);
    if (num < 1000000) return terbilang(Math.floor(num / 1000)) + ' Ribu ' + terbilang(num % 1000);
    if (num < 1000000000) return terbilang(Math.floor(num / 1000000)) + ' Juta ' + terbilang(num % 1000000);
    if (num < 1000000000000) return terbilang(Math.floor(num / 1000000000)) + ' Milyar ' + terbilang(num % 1000000000);

    return terbilang(Math.floor(num / 1000000000000)) + ' Triliun ' + terbilang(num % 1000000000000);
}

/**
 * Format terbilang with "Rupiah" suffix
 * @param {number} amount - The amount
 * @returns {string} Amount in words with Rupiah
 */
export function terbilangRupiah(amount) {
    if (!amount || amount === 0) return 'Nol Rupiah';
    return terbilang(Math.abs(amount)).trim() + ' Rupiah';
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate random ID
 * @returns {string} Random ID
 */
export function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Parse currency input (remove Rp, dots, etc)
 * @param {string} value - Currency string
 * @returns {number} Parsed number
 */
export function parseCurrency(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
}

/**
 * Validate phone number (Indonesian format)
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid
 */
export function isValidPhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/[^\d]/g, '');
    return cleaned.length >= 10 && cleaned.length <= 14;
}

/**
 * Format phone number for WhatsApp
 * @param {string} phone - Phone number
 * @returns {string} Formatted for WA (62xxx)
 */
export function formatWhatsAppNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }
    return cleaned;
}

/**
 * Generate WhatsApp link
 * @param {string} phone - Phone number
 * @param {string} message - Message to send
 * @returns {string} WhatsApp URL
 */
export function generateWhatsAppLink(phone, message = '') {
    const formattedPhone = formatWhatsAppNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Get donation category label
 * @param {string} category - Category key
 * @returns {string} Category label
 */
export function getDonationCategoryLabel(category) {
    const labels = {
        'tunai': 'Uang Tunai',
        'material': 'Material Bangunan',
        'wakaf': 'Wakaf Khusus'
    };
    return labels[category] || category;
}

/**
 * Get expense category label
 * @param {string} category - Category key
 * @returns {string} Category label
 */
export function getExpenseCategoryLabel(category) {
    const labels = {
        'material': 'Material Bangunan',
        'tukang': 'Upah Tukang',
        'lainnya': 'Lain-lain'
    };
    return labels[category] || category;
}

/**
 * Get donor type label
 * @param {string} type - Type key
 * @returns {string} Type label
 */
export function getDonorTypeLabel(type) {
    const labels = {
        'tetap': 'Donatur Tetap',
        'lepas': 'Donatur Lepas'
    };
    return labels[type] || type;
}
