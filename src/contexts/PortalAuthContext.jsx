/**
 * Portal Auth Context - Unified Authentication for All Modules
 * Uses Supabase for centralized user management
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PortalAuthContext = createContext(null);

export function PortalAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session in sessionStorage
        const storedUser = sessionStorage.getItem('portal_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                sessionStorage.removeItem('portal_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database not configured' };
        }

        try {
            // Query portal_users table
            const { data, error } = await supabase
                .from('portal_users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                return { success: false, error: 'Username atau password salah' };
            }

            // Update last_login
            await supabase
                .from('portal_users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.id);

            // Create user session
            const userData = {
                id: data.id,
                username: data.username,
                name: data.full_name,
                role: data.role,
                blok: data.blok,
                nomor: data.nomor,
                moduleAccess: data.module_access || []
            };

            // Store in sessionStorage (cleared on browser close)
            sessionStorage.setItem('portal_user', JSON.stringify(userData));
            setUser(userData);

            return { success: true, user: userData };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: 'Terjadi kesalahan. Coba lagi.' };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('portal_user');
        // Also clear any legacy localStorage items
        localStorage.removeItem('superadmin_session');
        localStorage.removeItem('angsuran_session');
        localStorage.removeItem('user_session');
        setUser(null);
    };

    const hasModuleAccess = (moduleName) => {
        if (!user) return false;
        if (user.role === 'superadmin') return true;
        return user.moduleAccess?.includes(moduleName);
    };

    const isAuthenticated = !!user;
    const isSuperadmin = user?.role === 'superadmin';
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isWarga = user?.role === 'warga';

    return (
        <PortalAuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            isSuperadmin,
            isAdmin,
            isWarga,
            login,
            logout,
            hasModuleAccess
        }}>
            {children}
        </PortalAuthContext.Provider>
    );
}

export function usePortalAuth() {
    const context = useContext(PortalAuthContext);
    if (!context) {
        throw new Error('usePortalAuth must be used within PortalAuthProvider');
    }
    return context;
}

export default PortalAuthContext;
