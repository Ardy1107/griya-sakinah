/**
 * Angsuran Auth Context - Uses Supabase users table
 * Supports: PIN-based login for both admin & developer
 * 
 * users table columns: id, username, name, role, password_hash, pin_hash, created_at, updated_at
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { hashPassword, getVerifiedSSOSession } from '../../../shared/utils/hashUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // SSO: First check for signed superadmin session
            try {
                const ssoUser = await getVerifiedSSOSession();
                if (ssoUser) {
                    setUser({
                        id: ssoUser.id,
                        username: 'superadmin',
                        name: ssoUser.name,
                        role: 'superadmin',
                        moduleAccess: ['angsuran', 'internet', 'musholla', 'komunitas'],
                        isSuperadminSSO: true
                    });
                    setLoading(false);
                    return;
                }
            } catch (e) {
                // Invalid SSO session, continue to normal auth check
            }

            // Unified session: portal_user only
            const storedUser = sessionStorage.getItem('portal_user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed.role === 'superadmin' ||
                        parsed.role === 'admin' ||
                        parsed.role === 'developer' ||
                        parsed.moduleAccess?.includes('angsuran')) {
                        setUser(parsed);
                    }
                } catch (e) {
                    sessionStorage.removeItem('portal_user');
                }
            }
            sessionStorage.removeItem('angsuran_user');
            localStorage.removeItem('angsuran_user');
            setLoading(false);
        };
        initAuth();
    }, []);

    // Helper: map DB row to user object (matches actual DB column names)
    const mapDbUser = (data) => ({
        id: data.id,
        username: data.username || data.name,
        name: data.name,
        role: data.role,
        moduleAccess: ['angsuran']
    });

    // Legacy username+password login (kept for backward compatibility)
    const login = async (username, password) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            const hashedPassword = await hashPassword(password);

            // Try matching username or name
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .or(`username.eq.${username.toLowerCase()},name.ilike.${username}`)
                .eq('password_hash', hashedPassword)
                .single();

            if (error || !data) {
                return { success: false, error: 'Username atau password salah' };
            }

            const userData = mapDbUser(data);
            sessionStorage.setItem('portal_user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (err) {
            if (import.meta.env.DEV) console.error('Login error:', err);
            return { success: false, error: 'Koneksi bermasalah' };
        }
    };

    // Unified PIN-based login for both admin & developer
    const loginWithPin = async (pin, role = null) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            const hashedPin = await hashPassword(pin);

            // Build query: fetch users with matching role (or all if no role specified)
            let query = supabase
                .from('users')
                .select('*');

            if (role) {
                query = query.eq('role', role);
            }

            const { data: users, error: fetchErr } = await query;

            if (fetchErr || !users || users.length === 0) {
                return { success: false, error: 'Akun tidak ditemukan' };
            }

            // Compare PIN hash securely in JavaScript (not exposed in query)
            const matchedUser = users.find(u => u.pin_hash === hashedPin);

            if (!matchedUser) {
                return { success: false, error: 'PIN salah' };
            }

            const userData = mapDbUser(matchedUser);
            sessionStorage.setItem('portal_user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (err) {
            if (import.meta.env.DEV) console.error('PIN login error:', err);
            return { success: false, error: 'Koneksi bermasalah' };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('portal_user');
        setUser(null);
    };

    const isAuthenticated = !!user;
    const isAdmin = () => user?.role === 'admin' || user?.role === 'superadmin';
    const isDeveloper = () => user?.role === 'developer' || user?.role === 'superadmin';
    const isSuperadmin = () => user?.role === 'superadmin';

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            isAdmin,
            isDeveloper,
            isSuperadmin,
            login,
            loginWithPin,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
