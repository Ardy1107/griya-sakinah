// Multi-Supabase Client - Query multiple Supabase instances
import { createClient } from '@supabase/supabase-js'

// Create Supabase clients for each module
const createModuleClient = (urlKey, anonKey) => {
    const url = import.meta.env[urlKey]
    const key = import.meta.env[anonKey]

    if (!url || !key) {
        return null
    }

    return createClient(url, key)
}

// Module clients
export const supabaseAngsuran = createModuleClient(
    'VITE_SUPABASE_URL_ANGSURAN',
    'VITE_SUPABASE_ANON_KEY_ANGSURAN'
)

export const supabaseInternet = createModuleClient(
    'VITE_SUPABASE_URL_INTERNET',
    'VITE_SUPABASE_ANON_KEY_INTERNET'
)

export const supabaseMusholla = createModuleClient(
    'VITE_SUPABASE_URL_MUSHOLLA',
    'VITE_SUPABASE_ANON_KEY_MUSHOLLA'
)

// Check which modules are configured
export const moduleStatus = {
    angsuran: !!supabaseAngsuran,
    internet: !!supabaseInternet,
    musholla: !!supabaseMusholla
}

// Fetch resident data by blok from all modules
export async function fetchResidentByBlok(blokRumah) {
    const results = {
        blok: blokRumah.toUpperCase(),
        angsuran: null,
        internet: null,
        musholla: null,
        found: false
    }

    const normalizedBlok = blokRumah.toUpperCase().trim()

    // Query Angsuran
    if (supabaseAngsuran) {
        try {
            const { data } = await supabaseAngsuran
                .from('residents')
                .select('*, payments(*)')
                .ilike('blok_rumah', normalizedBlok)
                .single()
            if (data) {
                results.angsuran = data
                results.found = true
            }
        } catch (e) {
            console.log('Angsuran query error:', e.message)
        }
    }

    // Query Internet
    if (supabaseInternet) {
        try {
            const { data } = await supabaseInternet
                .from('residents')
                .select('*, payments(*)')
                .ilike('blok_rumah', normalizedBlok)
                .single()
            if (data) {
                results.internet = data
                results.found = true
            }
        } catch (e) {
            console.log('Internet query error:', e.message)
        }
    }

    // Query Musholla
    if (supabaseMusholla) {
        try {
            const { data } = await supabaseMusholla
                .from('residents')
                .select('*, payments(*)')
                .ilike('blok_rumah', normalizedBlok)
                .single()
            if (data) {
                results.musholla = data
                results.found = true
            }
        } catch (e) {
            console.log('Musholla query error:', e.message)
        }
    }

    return results
}

// Fetch Top 5 late payers for Internet (Shame Board)
export async function fetchTopLatePayers() {
    if (!supabaseInternet) return []

    try {
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()

        // Get all residents with their payment status
        const { data: residents } = await supabaseInternet
            .from('residents')
            .select('id, nama_warga, blok_rumah')
            .eq('status', 'active')

        if (!residents) return []

        // Check payments for each resident
        const latePayers = []

        for (const resident of residents) {
            const { data: payments } = await supabaseInternet
                .from('payments')
                .select('bulan, tahun')
                .eq('resident_id', resident.id)
                .eq('tahun', currentYear)

            const paidMonths = payments?.map(p => p.bulan) || []
            const unpaidMonths = []

            for (let m = 1; m <= currentMonth; m++) {
                if (!paidMonths.includes(m)) {
                    unpaidMonths.push(m)
                }
            }

            if (unpaidMonths.length > 0) {
                latePayers.push({
                    ...resident,
                    unpaidCount: unpaidMonths.length,
                    unpaidMonths
                })
            }
        }

        // Sort by most unpaid months and take top 5
        return latePayers
            .sort((a, b) => b.unpaidCount - a.unpaidCount)
            .slice(0, 5)

    } catch (e) {
        console.error('Error fetching late payers:', e)
        return []
    }
}

// Fetch Kas Sakinah summary (from Internet module as primary kas)
export async function fetchKasSakinah() {
    if (!supabaseInternet) return null

    try {
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()

        // Get payments (income)
        const { data: payments } = await supabaseInternet
            .from('payments')
            .select('nominal')
            .eq('bulan', currentMonth)
            .eq('tahun', currentYear)

        // Get expenses
        const { data: expenses } = await supabaseInternet
            .from('expenses')
            .select('nominal')
            .gte('tanggal', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)

        const totalPemasukan = payments?.reduce((sum, p) => sum + (p.nominal || 0), 0) || 0
        const totalPengeluaran = expenses?.reduce((sum, e) => sum + (e.nominal || 0), 0) || 0

        return {
            pemasukan: totalPemasukan,
            pengeluaran: totalPengeluaran,
            saldo: totalPemasukan - totalPengeluaran,
            bulan: currentMonth,
            tahun: currentYear
        }

    } catch (e) {
        console.error('Error fetching kas:', e)
        return null
    }
}
