// Supabase Data Hooks
import { useState, useEffect, useCallback } from 'react'
import { supabase, supabaseAdmin } from '../config/supabase'
import { useBlock } from '../context/BlockContext'

// Get current month and year
export function useCurrentPeriod() {
    const now = new Date()
    return {
        bulan: now.getMonth() + 1,
        tahun: now.getFullYear()
    }
}

// Fetch all residents (filtered by block)
export function useResidents() {
    const [residents, setResidents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { blockId, filterByBlock } = useBlock()

    const fetchResidents = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('residents')
                .select('*')
                .order('blok_rumah')

            if (error) throw error

            // Filter by block if in block-specific mode
            const filteredData = filterByBlock(data || [])
            setResidents(filteredData)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching residents:', err)
        } finally {
            setLoading(false)
        }
    }, [blockId, filterByBlock])

    useEffect(() => {
        fetchResidents()
    }, [fetchResidents])

    return { residents, loading, error, refetch: fetchResidents }
}

// Fetch payments with optional filtering (filtered by block via resident)
export function usePayments(bulan = null, tahun = null) {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { blockId } = useBlock()

    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true)
            let query = supabase
                .from('payments')
                .select(`
          *,
          resident:residents(*)
        `)
                .order('tanggal_bayar', { ascending: false })

            if (bulan) query = query.eq('bulan', bulan)
            if (tahun) query = query.eq('tahun', tahun)

            const { data, error } = await query

            if (error) throw error

            // Filter payments by resident's block
            let filteredData = data || []
            if (blockId) {
                filteredData = filteredData.filter(p => {
                    const residentBlock = p.resident?.blok_rumah?.charAt(0)?.toUpperCase()
                    return residentBlock === blockId
                })
            }
            setPayments(filteredData)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching payments:', err)
        } finally {
            setLoading(false)
        }
    }, [bulan, tahun, blockId])

    useEffect(() => {
        fetchPayments()
    }, [fetchPayments])

    return { payments, loading, error, refetch: fetchPayments }
}

// Fetch expenses (filtered by block_id)
export function useExpenses(bulan, tahun) {
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { blockId } = useBlock()

    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true)
            let query = supabase
                .from('expenses')
                .select('*')
                .order('tanggal', { ascending: false })

            // Filter by block_id if in block-specific mode
            if (blockId) {
                query = query.eq('block_id', blockId)
            }

            if (bulan && tahun) {
                const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`
                const endDate = new Date(tahun, bulan, 0).toISOString().split('T')[0]
                query = query.gte('tanggal', startDate).lte('tanggal', endDate)
            }

            const { data, error } = await query

            if (error) throw error
            setExpenses(data || [])
        } catch (err) {
            setError(err.message)
            console.error('Error fetching expenses:', err)
        } finally {
            setLoading(false)
        }
    }, [bulan, tahun, blockId])

    useEffect(() => {
        fetchExpenses()
    }, [fetchExpenses])

    return { expenses, loading, error, refetch: fetchExpenses }
}

// Calculate financial summary
export function useFinancialSummary(bulan, tahun) {
    const { payments } = usePayments(bulan, tahun)
    const { expenses } = useExpenses(bulan, tahun)

    const totalPemasukan = payments.reduce((sum, p) => sum + Number(p.nominal || 0), 0)
    const totalPengeluaran = expenses.reduce((sum, e) => sum + Number(e.nominal || 0), 0)
    const saldo = totalPemasukan - totalPengeluaran

    return {
        totalPemasukan,
        totalPengeluaran,
        saldo,
        payments,
        expenses
    }
}

// Get payment status for current month
export function usePaymentStatus(pBulan, pTahun) {
    const { residents } = useResidents()
    const { bulan: cBulan, tahun: cTahun } = useCurrentPeriod()
    const bulan = pBulan || cBulan
    const tahun = pTahun || cTahun

    const { payments } = usePayments(bulan, tahun)

    const paidResidentIds = new Set(payments.map(p => p.resident_id))

    const statusList = residents.map(resident => ({
        ...resident,
        isPaid: paidResidentIds.has(resident.id),
        payment: payments.find(p => p.resident_id === resident.id) || null
    }))

    const totalPaid = statusList.filter(r => r.isPaid).length
    const totalUnpaid = statusList.filter(r => !r.isPaid).length

    return {
        statusList,
        totalPaid,
        totalUnpaid,
        bulan,
        tahun
    }
}

// Admin CRUD operations
export function useAdminOperations() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Create payment
    const createPayment = async (paymentData) => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabaseAdmin
                .from('payments')
                .insert([paymentData])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Update payment receipt URLs
    const updatePaymentReceipt = async (paymentId, receiptUrls) => {
        const { data, error } = await supabaseAdmin
            .from('payments')
            .update(receiptUrls)
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        return data
    }

    // Create expense
    const createExpense = async (expenseData) => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabaseAdmin
                .from('expenses')
                .insert([expenseData])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Create resident
    const createResident = async (residentData) => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabaseAdmin
                .from('residents')
                .insert([residentData])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Delete payment
    const deletePayment = async (paymentId) => {
        const { error } = await supabaseAdmin
            .from('payments')
            .delete()
            .eq('id', paymentId)

        if (error) throw error
    }

    // Delete expense
    const deleteExpense = async (expenseId) => {
        const { error } = await supabaseAdmin
            .from('expenses')
            .delete()
            .eq('id', expenseId)

        if (error) throw error
    }

    return {
        loading,
        error,
        createPayment,
        updatePaymentReceipt,
        createExpense,
        createResident,
        deletePayment,
        deleteExpense
    }
}

// Upload file to Supabase Storage
export async function uploadToStorage(file, bucket, path) {
    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, file, { upsert: true })

    if (error) throw error

    const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(path)

    return urlData.publicUrl
}
