/**
 * Superadmin Context - Uses Supabase Authentication
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SuperadminContext = createContext(null);

export function SuperadminProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedUser = sessionStorage.getItem('portal_user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.role === 'super_admin') {
                    setIsAuthenticated(true);
                    setUser(parsed);
                }
            } catch (e) {
                sessionStorage.removeItem('portal_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            // Query from Supabase portal_users table
            const { data, error } = await supabase
                .from('portal_users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .eq('role', 'super_admin')
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

            const userData = {
                id: data.id,
                username: data.username,
                name: data.full_name,
                role: 'super_admin',
                moduleAccess: data.module_access || []
            };

            sessionStorage.setItem('portal_user', JSON.stringify(userData));
            setIsAuthenticated(true);
            setUser(userData);
            return { success: true };
        } catch (err) {
            console.error('Superadmin login error:', err);
            return { success: false, error: 'Koneksi bermasalah' };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('portal_user');
        localStorage.removeItem('superadmin_session');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <SuperadminContext.Provider value={{
            isAuthenticated,
            user,
            loading,
            login,
            logout
        }}>
            {children}
        </SuperadminContext.Provider>
    );
}

export function useSuperadmin() {
    const context = useContext(SuperadminContext);
    if (!context) {
        throw new Error('useSuperadmin must be used within SuperadminProvider');
    }
    return context;
}

export default SuperadminContext;
