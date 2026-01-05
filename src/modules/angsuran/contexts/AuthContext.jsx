/**
 * Angsuran Auth Context - Uses Supabase users table
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // SSO: First check for superadmin session from Admin Portal
        try {
            const ssoSession = localStorage.getItem('superadmin_session');
            if (ssoSession) {
                const parsed = JSON.parse(ssoSession);
                if (parsed.expiry > Date.now() && parsed.user) {
                    setUser({
                        id: parsed.user.id,
                        username: 'superadmin',
                        name: parsed.user.name,
                        role: 'superadmin',
                        moduleAccess: ['angsuran', 'internet', 'musholla', 'komunitas'],
                        isSuperadminSSO: true
                    });
                    setLoading(false);
                    return;
                }
            }
        } catch (e) {
            // Invalid SSO session, continue to normal auth check
        }

        // Check for existing session (from portal_user or direct angsuran_user)
        const portalUser = sessionStorage.getItem('portal_user');
        const angsuranUser = sessionStorage.getItem('angsuran_user') || localStorage.getItem('angsuran_user');

        const storedUser = portalUser || angsuranUser;
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
                sessionStorage.removeItem('angsuran_user');
                localStorage.removeItem('angsuran_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            // Query from Supabase users table
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username.toLowerCase())
                .eq('password_hash', password)
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
            console.error('Login error:', err);
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
