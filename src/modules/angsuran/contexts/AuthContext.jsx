/**
 * Angsuran Auth Context - Uses Supabase users table
 * Supports: PIN-based admin login & one-click developer login
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { hashPassword } from '../utils/format';
import { getVerifiedSSOSession } from '../../../shared/utils/hashUtils';

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

    // Legacy username+password login (kept for backward compatibility)
    const login = async (username, password) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            const hashedPassword = await hashPassword(password);

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username.toLowerCase())
                .eq('password_hash', hashedPassword)
                .single();

            if (error || !data) {
                return { success: false, error: 'Username atau password salah' };
            }

            const userData = {
                id: data.id,
                username: data.username,
                name: data.name,
                role: data.role,
                moduleAccess: ['angsuran']
            };

            sessionStorage.setItem('portal_user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (err) {
            if (import.meta.env.DEV) console.error('Login error:', err);
            return { success: false, error: 'Koneksi bermasalah' };
        }
    };

    // PIN-based login for admin
    const loginWithPin = async (pin) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            const hashedPin = await hashPassword(pin);

            // Look for admin user with matching PIN hash
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'admin')
                .eq('pin_hash', hashedPin)
                .single();

            if (error || !data) {
                // Fallback: try matching against password_hash for backward compatibility
                const hashedAlt = await hashPassword(pin);
                const { data: altData, error: altError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('role', 'admin')
                    .eq('password_hash', hashedAlt)
                    .single();

                if (altError || !altData) {
                    return { success: false, error: 'PIN salah' };
                }

                const userData = {
                    id: altData.id,
                    username: altData.username,
                    name: altData.name,
                    role: altData.role,
                    moduleAccess: ['angsuran']
                };

                sessionStorage.setItem('portal_user', JSON.stringify(userData));
                setUser(userData);
                return { success: true };
            }

            const userData = {
                id: data.id,
                username: data.username,
                name: data.name,
                role: data.role,
                moduleAccess: ['angsuran']
            };

            sessionStorage.setItem('portal_user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (err) {
            if (import.meta.env.DEV) console.error('PIN login error:', err);
            return { success: false, error: 'Koneksi bermasalah' };
        }
    };

    // One-click developer login
    const loginAsDeveloper = async () => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            // Fetch the developer user directly
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'developer')
                .single();

            if (error || !data) {
                return { success: false, error: 'Akun developer tidak ditemukan' };
            }

            const userData = {
                id: data.id,
                username: data.username,
                name: data.name,
                role: data.role,
                moduleAccess: ['angsuran']
            };

            sessionStorage.setItem('portal_user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (err) {
            if (import.meta.env.DEV) console.error('Developer login error:', err);
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
            loginAsDeveloper,
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
