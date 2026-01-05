import { createContext, useContext, useState, useEffect } from 'react';

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

// Default admin accounts (for development/demo)
const DEFAULT_ADMINS = [
    {
        id: 'sa-001',
        username: 'superadmin',
        password: 'admin123',
        name: 'Super Administrator',
        role: ROLES.SUPER_ADMIN,
        email: 'admin@griyasakinah.com',
        createdAt: new Date().toISOString()
    },
    {
        id: 'aa-001',
        username: 'admin.angsuran',
        password: 'angsuran123',
        name: 'Admin Angsuran',
        role: ROLES.ADMIN_ANGSURAN,
        email: 'angsuran@griyasakinah.com',
        createdAt: new Date().toISOString()
    },
    {
        id: 'ai-001',
        username: 'admin.internet',
        password: 'internet123',
        name: 'Admin Internet',
        role: ROLES.ADMIN_INTERNET,
        email: 'internet@griyasakinah.com',
        createdAt: new Date().toISOString()
    },
    {
        id: 'am-001',
        username: 'admin.musholla',
        password: 'musholla123',
        name: 'Admin Musholla',
        role: ROLES.ADMIN_MUSHOLLA,
        email: 'musholla@griyasakinah.com',
        createdAt: new Date().toISOString()
    }
];

// LocalStorage keys
const STORAGE_KEYS = {
    ADMIN_SESSION: 'griya_admin_session',
    ADMIN_USERS: 'griya_admin_users',
    ALL_USERS: 'griya_all_users'
};

// Initialize admin users in localStorage
const initializeAdminUsers = () => {
    const existing = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    if (!existing) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(DEFAULT_ADMINS));
        return DEFAULT_ADMINS;
    }
    return JSON.parse(existing);
};

// Get all admin users
const getAdminUsers = () => {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    return data ? JSON.parse(data) : initializeAdminUsers();
};

// Save admin users
const saveAdminUsers = (users) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
};

// Get session
const getSession = () => {
    const session = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    return session ? JSON.parse(session) : null;
};

// Set session
const setSession = (user) => {
    const sessionData = {
        ...user,
        password: undefined // Don't store password in session
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(sessionData));
};

// Clear session
const clearSession = () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
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
        // Initialize users
        initializeAdminUsers();
        setUsers(getAdminUsers());

        // Check for existing session
        const session = getSession();
        if (session) {
            setAdmin(session);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const allAdmins = getAdminUsers();
        const foundAdmin = allAdmins.find(a => a.username === username);

        if (!foundAdmin) {
            return { success: false, error: 'Username tidak ditemukan' };
        }

        if (foundAdmin.password !== password) {
            return { success: false, error: 'Password salah' };
        }

        setSession(foundAdmin);
        setAdmin(foundAdmin);

        return { success: true, admin: foundAdmin };
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

    // CRUD operations for users
    const createUser = (userData) => {
        const newUser = {
            id: `user-${Date.now()}`,
            ...userData,
            createdAt: new Date().toISOString(),
            createdBy: admin?.id
        };

        const allAdmins = getAdminUsers();
        allAdmins.push(newUser);
        saveAdminUsers(allAdmins);
        setUsers(allAdmins);

        return { success: true, user: newUser };
    };

    const updateUser = (userId, updates) => {
        const allAdmins = getAdminUsers();
        const index = allAdmins.findIndex(u => u.id === userId);

        if (index === -1) {
            return { success: false, error: 'User tidak ditemukan' };
        }

        allAdmins[index] = { ...allAdmins[index], ...updates };
        saveAdminUsers(allAdmins);
        setUsers(allAdmins);

        return { success: true, user: allAdmins[index] };
    };

    const deleteUser = (userId) => {
        const allAdmins = getAdminUsers();
        const filtered = allAdmins.filter(u => u.id !== userId);

        if (filtered.length === allAdmins.length) {
            return { success: false, error: 'User tidak ditemukan' };
        }

        saveAdminUsers(filtered);
        setUsers(filtered);

        return { success: true };
    };

    const getUsers = () => {
        return getAdminUsers();
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
