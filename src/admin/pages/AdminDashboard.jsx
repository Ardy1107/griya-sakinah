import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth, ROLES, ROLE_PERMISSIONS } from '../contexts/AdminAuthContext';
import {
    Home, Wifi, Heart, Users, Settings, LogOut, Shield,
    TrendingUp, ChevronRight, Plus, Edit2, Trash2, X, Check,
    Moon, Sun, UserPlus, LayoutDashboard, Gift, Sparkles
} from 'lucide-react';
import CommunityAdmin from './CommunityAdmin';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const {
        admin, logout, getUsers, createUser, updateUser, deleteUser,
        isSuperAdmin, canCreateUsers, canCreateAdmins, hasModuleAccess
    } = useAdminAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        setUsers(getUsers());
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const moduleCards = [
        {
            id: 'spiritual',
            title: 'Spiritual Abundance',
            description: 'SEFT, Doa, Zikir, Habit & Syukur',
            icon: Sparkles,
            color: 'violet',
            link: '/spiritual',
            stats: { label: 'Fitur Lengkap', value: '8' }
        },
        {
            id: 'angsuran',
            title: 'Angsuran Sakinah',
            description: 'Kelola data cicilan rumah warga',
            icon: Home,
            color: 'emerald',
            link: '/angsuran/dashboard',
            stats: { label: 'Total Unit', value: '150+' }
        },
        {
            id: 'internet',
            title: 'Internet Sakinah',
            description: 'Kelola tagihan internet warga',
            icon: Wifi,
            color: 'blue',
            link: '/internet/admin',
            stats: { label: 'Pelanggan Aktif', value: '120+' }
        },
        {
            id: 'musholla',
            title: 'Musholla Sakinah',
            description: 'Kelola donasi dan laporan',
            icon: Heart,
            color: 'purple',
            link: '/musholla/admin',
            stats: { label: 'Total Donasi', value: 'Rp 15jt+' }
        },
        {
            id: 'komunitas',
            title: 'Fitur Komunitas',
            description: 'Pengumuman, Arisan, Peduli',
            icon: Users,
            color: 'amber',
            link: '/komunitas',
            stats: { label: 'Fitur Aktif', value: '5' }
        }
    ];

    // Spiritual is always visible for all users (personal tool), others are filtered by module access
    const filteredModules = moduleCards.filter(m => m.id === 'spiritual' || hasModuleAccess(m.id));

    const handleDeleteUser = (userId) => {
        if (window.confirm('Yakin ingin menghapus user ini?')) {
            const result = deleteUser(userId);
            if (result.success) {
                setUsers(getUsers());
            }
        }
    };

    const UserModal = () => {
        const [formData, setFormData] = useState({
            username: editingUser?.username || '',
            password: editingUser ? '' : '',
            name: editingUser?.name || '',
            email: editingUser?.email || '',
            role: editingUser?.role || ROLES.ADMIN_ANGSURAN
        });

        const handleSubmit = (e) => {
            e.preventDefault();

            if (editingUser) {
                const updates = { ...formData };
                if (!updates.password) delete updates.password;
                updateUser(editingUser.id, updates);
            } else {
                createUser(formData);
            }

            setUsers(getUsers());
            setShowUserModal(false);
            setEditingUser(null);
        };

        const availableRoles = canCreateAdmins()
            ? Object.keys(ROLES).map(k => ROLES[k])
            : [ROLES.ADMIN_ANGSURAN, ROLES.ADMIN_INTERNET, ROLES.ADMIN_MUSHOLLA].filter(r => {
                // Admin can only create admins for their own module
                const adminModule = admin?.role?.replace('admin_', '');
                return r === `admin_${adminModule}`;
            });

        return (
            <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{editingUser ? 'Edit User' : 'Tambah User Baru'}</h2>
                        <button className="modal-close" onClick={() => setShowUserModal(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                required
                                disabled={!!editingUser}
                            />
                        </div>
                        <div className="form-group">
                            <label>{editingUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required={!editingUser}
                            />
                        </div>
                        <div className="form-group">
                            <label>Nama Lengkap</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                {isSuperAdmin && <option value={ROLES.SUPER_ADMIN}>Super Admin</option>}
                                <option value={ROLES.ADMIN_ANGSURAN}>Admin Angsuran</option>
                                <option value={ROLES.ADMIN_INTERNET}>Admin Internet</option>
                                <option value={ROLES.ADMIN_MUSHOLLA}>Admin Musholla</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowUserModal(false)}>
                                Batal
                            </button>
                            <button type="submit" className="btn-primary">
                                <Check size={18} />
                                {editingUser ? 'Simpan' : 'Tambah User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="admin-brand">
                        <div className="brand-icon">
                            <Shield size={24} />
                        </div>
                        <div>
                            <span className="brand-title">Admin Portal</span>
                            <span className="brand-subtitle">Griya Sakinah</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </button>

                    {canCreateUsers() && (
                        <button
                            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <Users size={20} />
                            <span>Management User</span>
                        </button>
                    )}

                    {hasModuleAccess('komunitas') && (
                        <button
                            className={`nav-item ${activeTab === 'komunitas' ? 'active' : ''}`}
                            onClick={() => setActiveTab('komunitas')}
                        >
                            <Gift size={20} />
                            <span>Komunitas</span>
                        </button>
                    )}

                    {isSuperAdmin && (
                        <button
                            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={20} />
                            <span>Pengaturan</span>
                        </button>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-profile">
                        <div className="profile-avatar">
                            {admin?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="profile-info">
                            <span className="profile-name">{admin?.name}</span>
                            <span className="profile-role">{ROLE_PERMISSIONS[admin?.role]?.label}</span>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>
                            {activeTab === 'overview' && 'Dashboard Overview'}
                            {activeTab === 'users' && 'Management User'}
                            {activeTab === 'komunitas' && 'Kelola Komunitas'}
                            {activeTab === 'settings' && 'Pengaturan'}
                        </h1>
                        <p>Selamat datang kembali, {admin?.name}</p>
                    </div>
                    <div className="header-actions">
                        <button className="theme-toggle" onClick={toggleTheme}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <Link to="/" className="btn-secondary">
                            <Home size={18} />
                            Portal Utama
                        </Link>
                    </div>
                </header>

                <div className="admin-content">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="overview-content">
                            {/* Featured Spiritual Card - Premium Large */}
                            <Link to="/spiritual" className="spiritual-featured-card">
                                <div className="spiritual-featured-icon">
                                    <Sparkles size={48} />
                                </div>
                                <div className="spiritual-featured-content">
                                    <h2>Spiritual Abundance</h2>
                                    <p>SEFT Tracker • Doa Para Nabi • Zikir • Habit Tracker • Muhasabah • Syukur</p>
                                    <div className="spiritual-featured-badges">
                                        <span className="badge">🎯 SEFT Release</span>
                                        <span className="badge">🤲 11 Ring Doa</span>
                                        <span className="badge">💝 Qalbu Meter</span>
                                    </div>
                                </div>
                                <ChevronRight size={28} className="spiritual-featured-arrow" />
                            </Link>

                            <h2 className="section-title" style={{ marginTop: '1.5rem' }}>Modul Administrasi</h2>
                            <div className="module-cards">
                                {filteredModules.filter(m => m.id !== 'spiritual').map(module => (
                                    <Link
                                        key={module.id}
                                        to={module.link}
                                        className={`module-card ${module.color}`}
                                    >
                                        <div className="module-icon">
                                            <module.icon size={28} />
                                        </div>
                                        <div className="module-info">
                                            <h3>{module.title}</h3>
                                            <p>{module.description}</p>
                                        </div>
                                        <div className="module-stats">
                                            <span className="stat-value">{module.stats.value}</span>
                                            <span className="stat-label">{module.stats.label}</span>
                                        </div>
                                        <ChevronRight size={20} className="module-arrow" />
                                    </Link>
                                ))}
                            </div>

                            <h2 className="section-title" style={{ marginTop: '2rem' }}>Statistik Cepat</h2>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <TrendingUp size={24} />
                                    <div>
                                        <span className="stat-value">{users.length}</span>
                                        <span className="stat-label">Total Admin</span>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <Shield size={24} />
                                    <div>
                                        <span className="stat-value">{filteredModules.length}</span>
                                        <span className="stat-label">Modul Aktif</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && canCreateUsers() && (
                        <div className="users-content">
                            <div className="users-header">
                                <h2>Daftar Admin & User</h2>
                                <button
                                    className="btn-primary"
                                    onClick={() => { setEditingUser(null); setShowUserModal(true); }}
                                >
                                    <UserPlus size={18} />
                                    Tambah User
                                </button>
                            </div>

                            <div className="users-table-container">
                                <table className="users-table">
                                    <thead>
                                        <tr>
                                            <th>Nama</th>
                                            <th>Username</th>
                                            <th>Role</th>
                                            <th>Email</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="user-cell">
                                                        <div className="user-avatar">{user.name?.charAt(0)}</div>
                                                        <span>{user.name}</span>
                                                    </div>
                                                </td>
                                                <td><code>{user.username}</code></td>
                                                <td>
                                                    <span className={`role-badge ${user.role}`}>
                                                        {ROLE_PERMISSIONS[user.role]?.label || user.role}
                                                    </span>
                                                </td>
                                                <td>{user.email || '-'}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon edit"
                                                            onClick={() => { setEditingUser(user); setShowUserModal(true); }}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        {user.id !== admin?.id && (
                                                            <button
                                                                className="btn-icon delete"
                                                                onClick={() => handleDeleteUser(user.id)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Komunitas Tab */}
                    {activeTab === 'komunitas' && hasModuleAccess('komunitas') && (
                        <div className="komunitas-content">
                            <CommunityAdmin />
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && isSuperAdmin && (
                        <div className="settings-content">
                            <h2>Pengaturan Sistem</h2>
                            <p className="coming-soon">Fitur pengaturan akan segera hadir...</p>
                        </div>
                    )}
                </div>
            </main>

            {/* User Modal */}
            {showUserModal && <UserModal />}
        </div>
    );
};

export default AdminDashboard;
