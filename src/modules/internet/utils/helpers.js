// Helper utility functions

// Format currency to Indonesian Rupiah
export function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

// Format date to Indonesian locale
export function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

// Format date short
export function formatDateShort(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// Get month name in Indonesian
export function getMonthName(month) {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return months[month - 1] || ''
}

// Generate receipt number
export function generateReceiptNumber(paymentId) {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `GS-${timestamp}-${random}`
}

// Validate phone number (Indonesian format)
export function validatePhoneNumber(phone) {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '')
    // Check if it starts with 08 or +62
    const regex = /^(\+62|62|0)8[1-9][0-9]{7,10}$/
    return regex.test(cleaned)
}

// Format phone number for WhatsApp
export function formatWhatsAppNumber(phone) {
    let cleaned = phone.replace(/[\s-]/g, '')
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1)
    } else if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1)
    }
    return cleaned
}

// Generate WhatsApp message URL
export function generateWhatsAppUrl(phone, message) {
    const formattedPhone = formatWhatsAppNumber(phone)
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}

// Generate receipt message for WhatsApp
export function generateReceiptMessage(resident, payment, receiptUrl) {
    const period = `${getMonthName(payment.bulan)} ${payment.tahun}`

    return `🏠 *KWITANSI PEMBAYARAN IURAN INTERNET*
  
Yth. ${resident.nama_warga}
Blok: ${resident.blok_rumah}

Periode: ${period}
Nominal: ${formatCurrency(payment.nominal)}
Status: ✅ LUNAS

📄 Kwitansi Digital:
${receiptUrl}

Terima kasih atas pembayarannya!

_Griya Sakinah - Internet Management_`
}

// Debounce function for search
export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Get current period string
export function getCurrentPeriodString() {
    const now = new Date()
    return `${getMonthName(now.getMonth() + 1)} ${now.getFullYear()}`
}

// Check if payment is for current month
export function isCurrentMonth(bulan, tahun) {
    const now = new Date()
    return bulan === (now.getMonth() + 1) && tahun === now.getFullYear()
}

// Calculate percentage
export function calculatePercentage(value, total) {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
}

// Group payments by month for chart data
export function groupPaymentsByMonth(payments) {
    const grouped = {}

    payments.forEach(payment => {
        const key = `${payment.tahun}-${String(payment.bulan).padStart(2, '0')}`
        if (!grouped[key]) {
            grouped[key] = {
                month: `${getMonthName(payment.bulan).substring(0, 3)} ${payment.tahun}`,
                total: 0,
                count: 0
            }
        }
        grouped[key].total += Number(payment.nominal)
        grouped[key].count += 1
    })

    return Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6) // Last 6 months
        .map(([, data]) => data)
}

// Group expenses by category
export function groupExpensesByCategory(expenses) {
    const grouped = {}

    expenses.forEach(expense => {
        const kategori = expense.kategori || 'Lainnya'
        if (!grouped[kategori]) {
            grouped[kategori] = 0
        }
        grouped[kategori] += Number(expense.nominal)
    })

    return Object.entries(grouped).map(([name, value]) => ({
        name,
        value
    }))
}
