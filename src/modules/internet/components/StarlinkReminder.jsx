// ISP/Bandwidth Payment Reminder Component
import { useState, useEffect } from 'react'
import { Satellite, AlertCircle, Check, X } from 'lucide-react'
import { formatCurrency, getMonthName } from '../utils/helpers'
import { useAdminOperations } from '../hooks/useSupabase'

const ISP_AMOUNT = 750000

export default function StarlinkReminder({ expenses = [], selectedPeriod, onRecordPayment }) {
    const [dismissed, setDismissed] = useState(false)
    const { createExpense, loading } = useAdminOperations()

    // Check if ISP/Bandwidth already paid this month
    // Since expenses prop is filtered by useFinancialSummary(month, year),
    // we can just check if any record with category 'Bandwidth' exists.
    const isISPPaid = expenses.some(exp => exp.kategori === 'Bandwidth')

    // Reset dismissed state when period changes
    useEffect(() => {
        setDismissed(false)
    }, [selectedPeriod.month, selectedPeriod.year])

    const handleQuickPay = async () => {
        try {
            // Important: Use the selected period for the date of the expense 
            // so it correctly matches the current view and disappears.
            const expenseDate = `${selectedPeriod.year}-${String(selectedPeriod.month).padStart(2, '0')}-01`

            await createExpense({
                keterangan: 'Pembayaran ISP Starlink',
                nominal: ISP_AMOUNT,
                kategori: 'Bandwidth',
                tanggal: expenseDate
            })
            if (onRecordPayment) onRecordPayment()
        } catch (err) {
            console.error('Error recording ISP payment:', err)
        }
    }

    // Don't show if paid or dismissed
    if (isISPPaid || dismissed) return null

    return (
        <div className="starlink-reminder">
            <div className="starlink-reminder-icon">
                <Satellite size={24} />
            </div>
            <div className="starlink-reminder-content">
                <div className="starlink-reminder-title">
                    <AlertCircle size={16} />
                    Pembayaran Starlink Bulan Ini
                </div>
                <p className="starlink-reminder-text">
                    Pembayaran Starlink untuk <strong>{getMonthName(selectedPeriod.month)} {selectedPeriod.year}</strong> belum tercatat.
                    <br />
                    <span className="starlink-amount">{formatCurrency(ISP_AMOUNT)}</span>
                </p>
            </div>
            <div className="starlink-reminder-actions">
                <button
                    className="btn btn-primary btn-sm"
                    onClick={handleQuickPay}
                    disabled={loading}
                >
                    <Check size={14} />
                    {loading ? 'Menyimpan...' : 'Catat Bayar'}
                </button>
                <button
                    className="btn btn-icon btn-sm"
                    onClick={() => setDismissed(true)}
                    title="Tutup"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    )
}
