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

// Hook for fetching other incomes (Pemasukan Lain: Kas Sebelumnya, Donasi, etc.)
export function useOtherIncomes(bulan, tahun) {
    const [otherIncomes, setOtherIncomes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { blockId } = useBlock()

    const fetchOtherIncomes = useCallback(async () => {
        try {
            setLoading(true)
            let query = supabase
                .from('internet_other_incomes')
                .select('*')
                .order('tanggal', { ascending: false })

            if (blockId) {
                query = query.or(`block_id.eq.${blockId},block_id.is.null`)
            }

            if (bulan && tahun) {
                const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`
                const endDate = new Date(tahun, bulan, 0).toISOString().split('T')[0]
                query = query.gte('tanggal', startDate).lte('tanggal', endDate)
            }

            const { data, error } = await query

            if (error) throw error
            setOtherIncomes(data || [])
        } catch (err) {
            setError(err.message)
            console.error('Error fetching other incomes:', err)
        } finally {
            setLoading(false)
        }
    }, [bulan, tahun, blockId])

    useEffect(() => {
        fetchOtherIncomes()
    }, [fetchOtherIncomes])

    return { otherIncomes, loading, error, refetch: fetchOtherIncomes }
}

// Calculate financial summary
export function useFinancialSummary(bulan, tahun) {
    const { payments } = usePayments(bulan, tahun)
    const { expenses } = useExpenses(bulan, tahun)
    const { otherIncomes, refetch: refetchOtherIncomes } = useOtherIncomes(bulan, tahun)

    const totalIuran = payments.reduce((sum, p) => sum + Number(p.nominal || 0), 0)
    const totalPemasukanLain = otherIncomes.reduce((sum, o) => sum + Number(o.nominal || 0), 0)
    const totalPemasukan = totalIuran + totalPemasukanLain
    const totalPengeluaran = expenses.reduce((sum, e) => sum + Number(e.nominal || 0), 0)
    const saldo = totalPemasukan - totalPengeluaran

    return {
        totalPemasukan,
        totalIuran,
        totalPemasukanLain,
        totalPengeluaran,
        saldo,
        payments,
        expenses,
        otherIncomes,
        refetchOtherIncomes
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

// Default initial cash balances (defaults to 0, no injected 5jt)
export const DEFAULT_SALDO_AWAL = { A: 0, B: 0 }

// All-time financial summary (for Kas Utama / General Ledger)
export function useAllTimeFinancials() {
    const [allPayments, setAllPayments] = useState([])
    const [allExpenses, setAllExpenses] = useState([])
    const [allOtherIncomes, setAllOtherIncomes] = useState([])
    const [saldoAwalMap, setSaldoAwalMap] = useState(DEFAULT_SALDO_AWAL)
    const [loading, setLoading] = useState(true)
    const { blockId } = useBlock()

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true)
            const [paymentsRes, expensesRes, settingsRes, otherIncomesRes] = await Promise.all([
                supabase
                    .from('payments')
                    .select('*, resident:residents(*)')
                    .order('tanggal_bayar', { ascending: true }),
                supabase
                    .from('expenses')
                    .select('*')
                    .order('tanggal', { ascending: true }),
                supabase
                    .from('internet_settings')
                    .select('*'),
                supabase
                    .from('internet_other_incomes')
                    .select('*')
                    .order('tanggal', { ascending: true })
            ])

            let payments = paymentsRes.data || []
            let expenses = expensesRes.data || []
            let otherIncomes = otherIncomesRes.data || []

            // Extract saldo awal settings (defaults to 0)
            let sAwalA = DEFAULT_SALDO_AWAL.A
            let sAwalB = DEFAULT_SALDO_AWAL.B
            if (settingsRes?.data) {
                const settingA = settingsRes.data.find(s => s.key === 'saldo_awal_blok_a')
                const settingB = settingsRes.data.find(s => s.key === 'saldo_awal_blok_b')
                if (settingA && !isNaN(Number(settingA.value))) sAwalA = Number(settingA.value)
                if (settingB && !isNaN(Number(settingB.value))) sAwalB = Number(settingB.value)
            }
            setSaldoAwalMap({ A: sAwalA, B: sAwalB })

            // Filter by block if blockId active
            if (blockId) {
                payments = payments.filter(p => {
                    const residentBlock = p.resident?.blok_rumah?.charAt(0)?.toUpperCase()
                    return residentBlock === blockId
                })
                expenses = expenses.filter(e => {
                    if (e.block_id) return e.block_id === blockId
                    return false
                })
                otherIncomes = otherIncomes.filter(o => {
                    if (!o.block_id) return true
                    return o.block_id === blockId
                })
            }

            setAllPayments(payments)
            setAllExpenses(expenses)
            setAllOtherIncomes(otherIncomes)
        } catch (err) {
            console.error('Error fetching all-time financials:', err)
        } finally {
            setLoading(false)
        }
    }, [blockId])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    const saldoAwal = blockId === 'A'
        ? saldoAwalMap.A
        : blockId === 'B'
            ? saldoAwalMap.B
            : (saldoAwalMap.A + saldoAwalMap.B)

    const totalIuran = allPayments.reduce((sum, p) => sum + Number(p.nominal || 0), 0)
    const totalPemasukanLain = allOtherIncomes.reduce((sum, o) => sum + Number(o.nominal || 0), 0)
    const totalPemasukan = totalIuran + totalPemasukanLain
    const totalPengeluaran = allExpenses.reduce((sum, e) => sum + Number(e.nominal || 0), 0)
    const kasUtama = saldoAwal + totalPemasukan - totalPengeluaran

    return {
        allPayments,
        allExpenses,
        allOtherIncomes,
        totalPemasukan,
        totalIuran,
        totalPemasukanLain,
        totalPengeluaran,
        saldoAwal,
        saldoAwalMap,
        kasUtama,
        loading,
        refetch: fetchAll
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

    // Update resident
    const updateResident = async (residentId, updates) => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabaseAdmin
                .from('residents')
                .update(updates)
                .eq('id', residentId)
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

    // Delete resident
    const deleteResident = async (residentId) => {
        setLoading(true)
        setError(null)
        try {
            const { error } = await supabaseAdmin
                .from('residents')
                .delete()
                .eq('id', residentId)

            if (error) throw error
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Create other income (Pemasukan Lain)
    const createOtherIncome = async (incomeData) => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabaseAdmin
                .from('internet_other_incomes')
                .insert([incomeData])
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

    // Delete other income
    const deleteOtherIncome = async (id) => {
        const { error } = await supabaseAdmin
            .from('internet_other_incomes')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // Update other income
    const updateOtherIncome = async (id, incomeData) => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabaseAdmin
                .from('internet_other_incomes')
                .update(incomeData)
                .eq('id', id)
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

    return {
        loading,
        error,
        createPayment,
        updatePaymentReceipt,
        createExpense,
        createResident,
        updateResident,
        deleteResident,
        deletePayment,
        deleteExpense,
        createOtherIncome,
        updateOtherIncome,
        deleteOtherIncome
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
