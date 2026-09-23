/**
 * Angsuran Auth Context - Uses Supabase users table
 * Supports: PIN-based admin login & one-click developer login
 * 
 * users table columns: id, nama, email, role, created_at, pin_hash
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

    // Helper: map DB row to user object
    const mapDbUser = (data) => ({
        id: data.id,
        username: data.email || data.nama,
        name: data.nama,
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

            // Try matching email or nama
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .or(`email.eq.${username.toLowerCase()},nama.ilike.${username}`)
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

    // PIN-based login for admin
    const loginWithPin = async (pin) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            const hashedPin = await hashPassword(pin);
            console.log('[PIN Login] PIN:', pin, 'Hash:', hashedPin);

            // First, check if any admin users exist at all
            const { data: admins, error: adminErr } = await supabase
                .from('users')
                .select('id, nama, role, pin_hash')
                .eq('role', 'admin');
            
            console.log('[PIN Login] Admin users found:', admins, 'Error:', adminErr);

            if (admins && admins.length > 0) {
                console.log('[PIN Login] DB pin_hash:', admins[0].pin_hash);
                console.log('[PIN Login] Match:', admins[0].pin_hash === hashedPin);
            }

            // Look for admin user with matching PIN hash
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'admin')
                .eq('pin_hash', hashedPin)
                .single();

            console.log('[PIN Login] Final query result:', data, 'Error:', error);

            if (error || !data) {
                return { success: false, error: 'PIN salah' };
            }

            const userData = mapDbUser(data);
            sessionStorage.setItem('portal_user', JSON.stringify(userData));
            setUser(userData);
            return { success: true };
        } catch (err) {
            console.error('PIN login error:', err);
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

            const userData = mapDbUser(data);
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
