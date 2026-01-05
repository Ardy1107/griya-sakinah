/**
 * Direktori Warga - Resident Directory
 * Contact list per block with search
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Users,
    Phone,
    MapPin,
    Plus,
    Edit2,
    Trash2,
    X,
    Home,
    User,
    Filter,
    Shield,
    Eye,
    EyeOff,
    AlertCircle,
    Save
} from 'lucide-react';
import { createFuzzySearch } from '../../lib/smartSearch';
import './DirektoriWarga.css';

const ADMIN_PASSWORD = 'direktori2026';
const STORAGE_KEY = 'griya_direktori_warga';

// Default residents data
const DEFAULT_RESIDENTS = [
    { id: '1', name: 'Pak Ahmad', blok: 'A-01', phone: '081234567890', role: 'Ketua RT' },
    { id: '2', name: 'Bu Siti', blok: 'A-02', phone: '081234567891', role: 'Warga' },
    { id: '3', name: 'Pak Budi', blok: 'B-01', phone: '081234567892', role: 'Ketua RW' },
    { id: '4', name: 'Bu Ani', blok: 'B-02', phone: '081234567893', role: 'Warga' },
    { id: '5', name: 'Pak Joko', blok: 'C-01', phone: '081234567894', role: 'Warga' },
    { id: '6', name: 'Bu Dewi', blok: 'C-02', phone: '081234567895', role: 'Bendahara' },
    { id: '7', name: 'Pak Eko', blok: 'D-01', phone: '081234567896', role: 'Warga' },
    { id: '8', name: 'Bu Ratna', blok: 'D-02', phone: '081234567897', role: 'Sekretaris' },
];

const DirektoriWarga = () => {
    // Auth
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState('');

    // Data
    const [residents, setResidents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBlok, setFilterBlok] = useState('all');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingResident, setEditingResident] = useState(null);
    const [formData, setFormData] = useState({ name: '', blok: '', phone: '', role: 'Warga' });

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setResidents(JSON.parse(saved));
        } else {
            setResidents(DEFAULT_RESIDENTS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RESIDENTS));
        }

        // Check admin auth
        const auth = sessionStorage.getItem('direktori_admin_auth');
        if (auth === 'true') setIsAdmin(true);
    }, []);

    const saveResidents = (data) => {
        setResidents(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAdmin(true);
            sessionStorage.setItem('direktori_admin_auth', 'true');
            setShowLoginModal(false);
            setPassword('');
            setAuthError('');
        } else {
            setAuthError('Password salah!');
        }
    };

    const handleLogout = () => {
        setIsAdmin(false);
        sessionStorage.removeItem('direktori_admin_auth');
    };

    const handleAdd = () => {
        setEditingResident(null);
        setFormData({ name: '', blok: '', phone: '', role: 'Warga' });
        setShowModal(true);
    };

    const handleEdit = (resident) => {
        setEditingResident(resident);
        setFormData({ ...resident });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Yakin ingin menghapus data warga ini?')) {
            saveResidents(residents.filter(r => r.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.blok) return;

        if (editingResident) {
            // Update
            saveResidents(residents.map(r =>
                r.id === editingResident.id ? { ...r, ...formData } : r
            ));
        } else {
            // Add
            const newResident = {
                id: Date.now().toString(),
                ...formData
            };
            saveResidents([...residents, newResident]);
        }

        setShowModal(false);
        setEditingResident(null);
    };

    const handleCall = (phone) => {
        window.open(`tel:${phone}`, '_self');
    };

    const handleWhatsApp = (phone) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
        window.open(`https://wa.me/${waPhone}`, '_blank');
    };

    // Get unique bloks
    const bloks = [...new Set(residents.map(r => r.blok.split('-')[0]))].sort();

    // Filter residents with fuzzy search
    const fuzzyResults = createFuzzySearch(residents, ['name', 'blok', 'phone'], searchTerm);
    const filteredResidents = fuzzyResults.filter(r => {
        const matchBlok = filterBlok === 'all' || r.blok.startsWith(filterBlok);
        return matchBlok;
    });

    // Group by blok
    const groupedResidents = filteredResidents.reduce((acc, resident) => {
        const blokPrefix = resident.blok.split('-')[0];
        if (!acc[blokPrefix]) acc[blokPrefix] = [];
        acc[blokPrefix].push(resident);
        return acc;
    }, {});

    return (
        <div className="direktori-page">
            {/* Header */}
            <header className="direktori-header">
                <div className="header-left">
                    <Link to="/komunitas" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1>📒 Direktori Warga</h1>
                        <p>Griya Sakinah</p>
                    </div>
                </div>
                <div className="header-actions">
                    {isAdmin ? (
                        <>
                            <button className="add-btn" onClick={handleAdd}>
                                <Plus size={18} />
                                Tambah
                            </button>
                            <button className="logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <button className="admin-btn" onClick={() => setShowLoginModal(true)}>
                            <Shield size={16} />
                            Admin
                        </button>
                    )}
                </div>
            </header>

            {/* Stats */}
            <div className="direktori-stats">
                <div className="stat-card">
                    <Users size={24} />
                    <div>
                        <span className="value">{residents.length}</span>
                        <span className="label">Total Warga</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Home size={24} />
                    <div>
                        <span className="value">{bloks.length}</span>
                        <span className="label">Blok</span>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="search-filter">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Cari nama, blok, atau nomor HP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <Filter size={18} />
                    <select value={filterBlok} onChange={(e) => setFilterBlok(e.target.value)}>
                        <option value="all">Semua Blok</option>
                        {bloks.map(blok => (
                            <option key={blok} value={blok}>Blok {blok}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results */}
            <div className="results-info">
                Menampilkan {filteredResidents.length} dari {residents.length} warga
            </div>

            {/* Residents List */}
            <div className="residents-container">
                {Object.keys(groupedResidents).sort().map(blok => (
                    <div key={blok} className="blok-section">
                        <h3 className="blok-header">
                            <Home size={18} />
                            Blok {blok}
                            <span className="blok-count">{groupedResidents[blok].length}</span>
                        </h3>
                        <div className="residents-list">
                            {groupedResidents[blok].map(resident => (
                                <div key={resident.id} className="resident-card">
                                    <div className="resident-avatar">
                                        {resident.name.charAt(0)}
                                    </div>
                                    <div className="resident-info">
                                        <div className="resident-name">
                                            {resident.name}
                                            {resident.role !== 'Warga' && (
                                                <span className="role-badge">{resident.role}</span>
                                            )}
                                        </div>
                                        <div className="resident-details">
                                            <span><MapPin size={12} /> {resident.blok}</span>
                                            <span><Phone size={12} /> {resident.phone}</span>
                                        </div>
                                    </div>
                                    <div className="resident-actions">
                                        <button
                                            className="action-btn call"
                                            onClick={() => handleCall(resident.phone)}
                                            title="Telepon"
                                        >
                                            <Phone size={16} />
                                        </button>
                                        <button
                                            className="action-btn whatsapp"
                                            onClick={() => handleWhatsApp(resident.phone)}
                                            title="WhatsApp"
                                        >
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </button>
                                        {isAdmin && (
                                            <>
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => handleEdit(resident)}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDelete(resident.id)}
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredResidents.length === 0 && (
                    <div className="empty-state">
                        <Users size={48} />
                        <p>Tidak ada warga ditemukan</p>
                    </div>
                )}
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Login Admin</h2>
                            <button className="close-btn" onClick={() => setShowLoginModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleLogin} className="modal-form">
                            <div className="form-group">
                                <label>Password</label>
                                <div className="password-input">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Masukkan password"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {authError && (
                                <div className="auth-error">
                                    <AlertCircle size={16} />
                                    {authError}
                                </div>
                            )}
                            <button type="submit" className="submit-btn">
                                <Shield size={18} />
                                Masuk
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingResident ? 'Edit Warga' : 'Tambah Warga'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nama warga"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Blok</label>
                                    <input
                                        type="text"
                                        value={formData.blok}
                                        onChange={(e) => setFormData({ ...formData, blok: e.target.value })}
                                        placeholder="A-01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Jabatan</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Warga">Warga</option>
                                        <option value="Ketua RT">Ketua RT</option>
                                        <option value="Ketua RW">Ketua RW</option>
                                        <option value="Sekretaris">Sekretaris</option>
                                        <option value="Bendahara">Bendahara</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>No. HP</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    <Save size={18} />
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DirektoriWarga;
