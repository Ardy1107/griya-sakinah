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

            // Unified session: griya_admin_session (Unified Admin Portal)
            const storedAdmin = sessionStorage.getItem('griya_admin_session');
            if (storedAdmin) {
                try {
                    const parsed = JSON.parse(storedAdmin);
                    if (parsed.role === 'super_admin' ||
                        parsed.role === 'superadmin' ||
                        parsed.role === 'admin_angsuran' ||
                        parsed.role === 'developer' ||
                        parsed.role === 'admin') {
                        setUser({
                            id: parsed.id || 'admin',
                            username: parsed.username || parsed.name || 'admin',
                            name: parsed.name,
                            role: parsed.role === 'super_admin' ? 'superadmin' : (parsed.role === 'admin_angsuran' ? 'admin' : parsed.role),
                            moduleAccess: ['angsuran'],
                            isSuperadminSSO: parsed.role === 'super_admin' || parsed.role === 'superadmin'
                        });
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    // Invalid session
                }
            }
            sessionStorage.removeItem('portal_user');
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

    // Secure PIN-based login via server-side RPC (no hash exposure)
    const loginWithPin = async (pin, role = null) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            const params = { input_pin: pin };
            if (role) params.input_role = role;

            const { data, error: rpcError } = await supabase.rpc('verify_pin', params);

            if (rpcError) {
                if (import.meta.env.DEV) console.error('RPC error:', rpcError);
                return { success: false, error: 'Koneksi bermasalah' };
            }

            if (!data?.success) {
                return { success: false, error: data?.error || 'PIN salah' };
            }

            const userData = {
                id: data.user.id,
                username: data.user.username || data.user.name,
                name: data.user.name,
                role: data.user.role,
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

    const logout = () => {
        sessionStorage.removeItem('griya_admin_session');
        sessionStorage.removeItem('portal_user');
        setUser(null);
        window.location.href = '/admin';
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
