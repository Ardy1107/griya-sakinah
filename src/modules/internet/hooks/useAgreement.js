// Hook to check if user has signed the internet agreement
import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export function useAgreementCheck(blokRumah) {
    const [hasSigned, setHasSigned] = useState(null) // null = loading, true/false = result
    const [agreement, setAgreement] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkAgreement() {
            if (!blokRumah) {
                setHasSigned(null)
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('internet_agreements')
                    .select('*')
                    .eq('blok_rumah', blokRumah)
                    .order('agreed_at', { ascending: false })
                    .limit(1)

                if (data && data.length > 0 && !error) {
                    setHasSigned(true)
                    setAgreement(data[0])
                } else {
                    setHasSigned(false)
                    setAgreement(null)
                }
            } catch (err) {
                console.error('Agreement check error:', err)
                setHasSigned(false)
            } finally {
                setLoading(false)
            }
        }

        checkAgreement()
    }, [blokRumah])

    return { hasSigned, agreement, loading }
}

// Check if monthly reminder should be shown
export function useMonthlyReminder() {
    const [showReminder, setShowReminder] = useState(false)

    useEffect(() => {
        const now = new Date()
        const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`
        const lastReminderMonth = localStorage.getItem('internet_reminder_month')

        // Show reminder if it's a new month
        if (lastReminderMonth !== currentMonth) {
            setShowReminder(true)
        }
    }, [])

    const dismissReminder = () => {
        const now = new Date()
        const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`
        localStorage.setItem('internet_reminder_month', currentMonth)
        setShowReminder(false)
    }

    return { showReminder, dismissReminder }
}
