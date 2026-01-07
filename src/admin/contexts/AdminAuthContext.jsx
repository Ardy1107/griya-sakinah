import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const AdminAuthContext = createContext(null);

// Role hierarchy and permissions
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN_ANGSURAN: 'admin_angsuran',
    ADMIN_INTERNET: 'admin_internet',
    ADMIN_MUSHOLLA: 'admin_musholla',
    ADMIN_ARISAN: 'admin_arisan',
    ADMIN_TAKJIL: 'admin_takjil',
    ADMIN_PEDULI: 'admin_peduli',
    USER: 'user'
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: {
        label: 'Super Admin',
        modules: ['angsuran', 'internet', 'musholla', 'komunitas', 'arisan', 'takjil', 'peduli', 'direktori', 'settings', 'users'],
        canCreateUsers: true,
        canCreateAdmins: true
    },
    [ROLES.ADMIN_ANGSURAN]: {
        label: 'Admin Angsuran',
        modules: ['angsuran'],
        canCreateUsers: false,
        canCreateAdmins: false
    },
    [ROLES.ADMIN_INTERNET]: {
        label: 'Admin Internet',
        modules: ['internet'],
        canCreateUsers: false,
        canCreateAdmins: false
    },
    [ROLES.ADMIN_MUSHOLLA]: {
        label: 'Admin Musholla',
        modules: ['musholla'],
        canCreateUsers: false,
        canCreateAdmins: false
    },
    [ROLES.ADMIN_ARISAN]: {
        label: 'Admin Arisan',
        modules: ['arisan', 'komunitas'],
        canCreateUsers: false,
        canCreateAdmins: false
    },
    [ROLES.ADMIN_TAKJIL]: {
        label: 'Admin Takjil',
        modules: ['takjil', 'komunitas'],
        canCreateUsers: false,
        canCreateAdmins: false
    },
    [ROLES.ADMIN_PEDULI]: {
        label: 'Admin Peduli',
        modules: ['peduli', 'komunitas'],
        canCreateUsers: false,
        canCreateAdmins: false
    }
};

// Session storage key
const SESSION_KEY = 'griya_admin_session';

// Get session from sessionStorage
const getSession = () => {
    const session = sessionStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
};

// Set session to sessionStorage
const setSession = (user) => {
    const sessionData = {
        ...user,
        password: undefined // Don't store password in session
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

    // SSO: If SuperAdmin, also set superadmin_session for other modules
    if (user.role === ROLES.SUPER_ADMIN) {
        const ssoSession = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: 'superadmin'
            },
            expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('superadmin_session', JSON.stringify(ssoSession));
    }
};

// Clear session
const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('superadmin_session'); // Also clear SSO session
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Check for existing session
        const session = getSession();
        if (session) {
            setAdmin(session);
        }
        setLoading(false);
    }, []);

    // Login - Now uses Supabase
    const login = async (username, password) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia. Hubungi administrator.' };
        }

        try {
            // Query from Supabase portal_users table
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

            const userData = {
                id: data.id,
                username: data.username,
                name: data.full_name || data.username,
                email: data.email,
                role: data.role,
                moduleAccess: data.module_access || []
            };

            setSession(userData);
            setAdmin(userData);

            return { success: true, admin: userData };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: 'Koneksi bermasalah. Coba lagi.' };
        }
    };

    const logout = () => {
        clearSession();
        setAdmin(null);
    };

    // Check if admin has access to a module
    const hasModuleAccess = (module) => {
        if (!admin) return false;
        const permissions = ROLE_PERMISSIONS[admin.role];
        return permissions?.modules.includes(module) || false;
    };

    // Check if admin can create users
    const canCreateUsers = () => {
        if (!admin) return false;
        return ROLE_PERMISSIONS[admin.role]?.canCreateUsers || false;
    };

    // Check if admin can create other admins
    const canCreateAdmins = () => {
        if (!admin) return false;
        return ROLE_PERMISSIONS[admin.role]?.canCreateAdmins || false;
    };

    // CRUD operations for users - Now uses Supabase
    const createUser = async (userData) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            const { data, error } = await supabase
                .from('portal_users')
                .insert([{
                    username: userData.username,
                    password: userData.password,
                    full_name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    is_active: true,
                    module_access: userData.moduleAccess || [],
                    created_by: admin?.id
                }])
                .select()
                .single();

            if (error) {
                console.error('Create user error:', error);
                return { success: false, error: 'Gagal membuat user: ' + error.message };
            }

            // Refresh users list
            await fetchUsers();

            return { success: true, user: data };
        } catch (err) {
            console.error('Create user error:', err);
            return { success: false, error: 'Koneksi bermasalah' };
        }
    };

    const updateUser = async (userId, updates) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            const updateData = {};
            if (updates.username) updateData.username = updates.username;
            if (updates.password) updateData.password = updates.password;
            if (updates.name) updateData.full_name = updates.name;
            if (updates.email) updateData.email = updates.email;
            if (updates.role) updateData.role = updates.role;
            if (updates.moduleAccess) updateData.module_access = updates.moduleAccess;
            if (typeof updates.is_active !== 'undefined') updateData.is_active = updates.is_active;

            const { data, error } = await supabase
                .from('portal_users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                console.error('Update user error:', error);
                return { success: false, error: 'Gagal update user: ' + error.message };
            }

            // Refresh users list
            await fetchUsers();

            return { success: true, user: data };
        } catch (err) {
            console.error('Update user error:', err);
            return { success: false, error: 'Koneksi bermasalah' };
        }
    };

    const deleteUser = async (userId) => {
        if (!isSupabaseConfigured()) {
            return { success: false, error: 'Database tidak tersedia' };
        }

        try {
            const { error } = await supabase
                .from('portal_users')
                .delete()
                .eq('id', userId);

            if (error) {
                console.error('Delete user error:', error);
                return { success: false, error: 'Gagal hapus user: ' + error.message };
            }

            // Refresh users list
            await fetchUsers();

            return { success: true };
        } catch (err) {
            console.error('Delete user error:', err);
            return { success: false, error: 'Koneksi bermasalah' };
        }
    };

    const fetchUsers = async () => {
        if (!isSupabaseConfigured()) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('portal_users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Fetch users error:', error);
                return [];
            }

            // Map to legacy format
            const mappedUsers = data.map(u => ({
                id: u.id,
                username: u.username,
                name: u.full_name || u.username,
                email: u.email,
                role: u.role,
                moduleAccess: u.module_access || [],
                isActive: u.is_active,
                createdAt: u.created_at,
                lastLogin: u.last_login
            }));

            setUsers(mappedUsers);
            return mappedUsers;
        } catch (err) {
            console.error('Fetch users error:', err);
            return [];
        }
    };

    const getUsers = () => {
        // Trigger async fetch
        fetchUsers();
        return users;
    };

    const value = {
        admin,
        users,
        loading,
        login,
        logout,
        hasModuleAccess,
        canCreateUsers,
        canCreateAdmins,
        createUser,
        updateUser,
        deleteUser,
        getUsers,
        fetchUsers,
        isAuthenticated: !!admin,
        isSuperAdmin: admin?.role === ROLES.SUPER_ADMIN,
        ROLES,
        ROLE_PERMISSIONS
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export default AdminAuthContext;
