// Export utilities - Excel and JSON
import { formatCurrency, getMonthName, formatDateShort } from './helpers'

// Export to Excel (CSV format)
export function exportToExcel(data, filename, type = 'payments') {
    let csvContent = ''

    if (type === 'payments') {
        // Header
        csvContent = 'No,Blok,Nama Warga,Periode,Tanggal Bayar,Nominal,Metode,No Referensi,Status\n'

        // Data
        data.forEach((payment, idx) => {
            const row = [
                idx + 1,
                payment.resident?.blok_rumah || '-',
                payment.resident?.nama_warga || '-',
                `${getMonthName(payment.bulan)} ${payment.tahun}`,
                formatDateShort(payment.tanggal_bayar),
                payment.nominal,
                payment.metode_bayar || 'Cash',
                payment.nomor_referensi || '-',
                payment.status || 'Lunas'
            ].join(',')
            csvContent += row + '\n'
        })
    } else if (type === 'expenses') {
        csvContent = 'No,Tanggal,Kategori,Keterangan,Nominal\n'

        data.forEach((expense, idx) => {
            const row = [
                idx + 1,
                formatDateShort(expense.tanggal),
                expense.kategori || '-',
                `"${expense.keterangan}"`,
                expense.nominal
            ].join(',')
            csvContent += row + '\n'
        })
    } else if (type === 'residents') {
        csvContent = 'No,Blok,Nama Warga,No WhatsApp,Tanggal Daftar\n'

        data.forEach((resident, idx) => {
            const row = [
                idx + 1,
                resident.blok_rumah,
                `"${resident.nama_warga}"`,
                resident.no_whatsapp || '-',
                formatDateShort(resident.created_at)
            ].join(',')
            csvContent += row + '\n'
        })
    }

    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
}

// Export to JSON
export function exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2)
    downloadFile(jsonContent, `${filename}.json`, 'application/json')
}

// Export all data as backup
export function exportBackup(residents, payments, expenses) {
    const backup = {
        exportDate: new Date().toISOString(),
        version: '2.0',
        data: {
            residents,
            payments,
            expenses
        },
        summary: {
            totalResidents: residents.length,
            totalPayments: payments.length,
            totalExpenses: expenses.length,
            totalPemasukan: payments.reduce((sum, p) => sum + Number(p.nominal || 0), 0),
            totalPengeluaran: expenses.reduce((sum, e) => sum + Number(e.nominal || 0), 0)
        }
    }

    const filename = `griya-sakinah-backup-${formatDateShort(new Date()).replace(/\//g, '-')}`
    exportToJSON(backup, filename)
}

// Generate monthly report
export function exportMonthlyReport(payments, expenses, bulan, tahun) {
    const monthPayments = payments.filter(p => p.bulan === bulan && p.tahun === tahun)
    const monthExpenses = expenses.filter(e => {
        const date = new Date(e.tanggal)
        return date.getMonth() + 1 === bulan && date.getFullYear() === tahun
    })

    const report = {
        periode: `${getMonthName(bulan)} ${tahun}`,
        exportDate: new Date().toISOString(),
        pemasukan: {
            total: monthPayments.reduce((sum, p) => sum + Number(p.nominal || 0), 0),
            count: monthPayments.length,
            details: monthPayments.map(p => ({
                blok: p.resident?.blok_rumah,
                nama: p.resident?.nama_warga,
                nominal: p.nominal,
                tanggal: p.tanggal_bayar
            }))
        },
        pengeluaran: {
            total: monthExpenses.reduce((sum, e) => sum + Number(e.nominal || 0), 0),
            count: monthExpenses.length,
            details: monthExpenses.map(e => ({
                keterangan: e.keterangan,
                kategori: e.kategori,
                nominal: e.nominal,
                tanggal: e.tanggal
            }))
        }
    }

    report.saldo = report.pemasukan.total - report.pengeluaran.total

    const filename = `laporan-${getMonthName(bulan).toLowerCase()}-${tahun}`
    exportToJSON(report, filename)

    return report
}

// Helper to trigger file download
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
