// Warga Auth Context - Authentication for residents
import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseInternet as supabase } from '../lib/multiSupabase'

const WargaAuthContext = createContext(null)

export function useWargaAuth() {
    const context = useContext(WargaAuthContext)
    if (!context) {
        throw new Error('useWargaAuth must be used within WargaAuthProvider')
    }
    return context
}

export function WargaAuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!supabase) {
            setLoading(false)
            return
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }
            }
        )

        return () => subscription?.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    const signIn = async (email, password) => {
        if (!supabase) return { error: { message: 'Supabase not configured' } }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        return { data, error }
    }

    const signOut = async () => {
        if (!supabase) return
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    const value = {
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        // Check module access
        hasInternet: profile?.has_internet ?? false,
        hasAngsuran: profile?.has_angsuran ?? false,
        hasMusholla: profile?.has_musholla ?? false,
        blokRumah: profile?.blok_rumah ?? null
    }

    return (
        <WargaAuthContext.Provider value={value}>
            {children}
        </WargaAuthContext.Provider>
    )
}

export default WargaAuthContext
