// Auth Hook - Manages authentication state
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext(null)

// Check if superadmin is logged in (SSO)
const checkSuperadminSession = () => {
    try {
        const session = localStorage.getItem('superadmin_session')
        if (session) {
            const parsed = JSON.parse(session)
            if (parsed.expiry > Date.now()) {
                return parsed.user
            }
        }
    } catch (e) {
        // Invalid session
    }
    return null
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isSuperadmin, setIsSuperadmin] = useState(false)

    useEffect(() => {
        // First check for superadmin SSO
        const superadminUser = checkSuperadminSession()
        if (superadminUser) {
            // Auto-login as superadmin
            setUser({
                id: 'superadmin',
                email: 'superadmin@griyasakinah.local',
                role: 'superadmin'
            })
            setIsSuperadmin(true)
            setLoading(false)
            return
        }

        // If supabase is not configured, just set loading to false
        if (!supabase) {
            setLoading(false)
            return
        }

        // Check active sessions
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email, password) => {
        if (!supabase) {
            throw new Error('Supabase not configured')
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
        return data
    }

    const signOut = async () => {
        if (supabase) {
            await supabase.auth.signOut()
        }
        setUser(null)
    }

    const value = {
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

