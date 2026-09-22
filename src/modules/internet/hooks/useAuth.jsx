// Auth Hook - Manages authentication state
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../config/supabase'
import { getVerifiedSSOSession } from '../../../shared/utils/hashUtils'

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
        const initAuth = async () => {
            // Dev Bypass check
            if (import.meta.env.DEV && localStorage.getItem('dev_bypass') === 'true') {
                setUser({
                    id: 'dev-bypass',
                    email: 'admin@griyasakinah.local',
                    role: 'superadmin'
                });
                setIsSuperadmin(true);
                setLoading(false);
                return;
            }

            // First check for signed superadmin SSO
            const superadminUser = await getVerifiedSSOSession();
            if (superadminUser) {
                setUser({
                    id: 'superadmin',
                    email: 'superadmin@griyasakinah.local',
                    role: 'superadmin'
                });
                setIsSuperadmin(true);
                setLoading(false);
                return;
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

            return () => subscription.unsubscribe();
        };
        initAuth();
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
        // Immediately set user to avoid race condition with React Router navigate
        if (data?.session?.user) {
            setUser(data.session.user)
        }
        return data
    }

    const signOut = async () => {
        localStorage.removeItem('dev_bypass')
        if (supabase) {
            await supabase.auth.signOut()
        }
        setUser(null)
        setIsSuperadmin(false)
    }

    const value = {
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
        isSuperadmin
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

