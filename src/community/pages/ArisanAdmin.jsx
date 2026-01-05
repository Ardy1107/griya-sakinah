/**
 * Arisan Admin Management System
 * Advanced management with password protection
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../contexts/CommunityContext';
import {
    ArrowLeft,
    Users,
    Trophy,
    Settings,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    Lock,
    RefreshCw,
    Gift,
    Calendar,
    DollarSign,
    History,
    Shield,
    Eye,
    EyeOff,
    Save,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import './ArisanAdmin.css';

// Admin password (in production, this should be in environment variable or database)
const ADMIN_PASSWORD = 'arisan2026';

const ArisanAdmin = () => {
    const {
        arisan,
        spinArisan,
        addArisanMember,
        updateArisanMember,
        removeArisanMember,
        recordArisanPayment,
        updateArisanSettings,
        resetArisan
    } = useCommunity();

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState('');

    // UI State
    const [activeTab, setActiveTab] = useState('members');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [spinDuration, setSpinDuration] = useState(10);
    const wheelRef = useRef(null);

    // Form states
    const [newMember, setNewMember] = useState({ name: '', blok: '', phone: '' });
    const [editMember, setEditMember] = useState({});
    const [paymentForm, setPaymentForm] = useState({ period: '', amount: '' });
    const [settingsForm, setSettingsForm] = useState({
        name: '',
        amount: 100000,
        period: 'monthly'
    });

    // Check auth from session
    useEffect(() => {
        const authStatus = sessionStorage.getItem('arisan_admin_auth');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    // Initialize settings form
    useEffect(() => {
        if (arisan) {
            setSettingsForm({
                name: arisan.name || 'Arisan Warga',
                amount: arisan.amount || 100000,
                period: arisan.period || 'monthly'
            });
        }
    }, [arisan]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('arisan_admin_auth', 'true');
            setAuthError('');
        } else {
            setAuthError('Password salah!');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('arisan_admin_auth');
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!newMember.name || !newMember.blok) return;
        addArisanMember(newMember);
        setNewMember({ name: '', blok: '', phone: '' });
        setShowAddModal(false);
    };

    const handleEditMember = (e) => {
        e.preventDefault();
        if (!editMember.name || !editMember.blok) return;
        updateArisanMember(selectedMember.id, editMember);
        setShowEditModal(false);
        setSelectedMember(null);
    };

    const handleRemoveMember = (member) => {
        if (window.confirm(`Yakin ingin menghapus ${member.name} dari arisan?`)) {
            removeArisanMember(member.id);
        }
    };

    const handlePayment = (e) => {
        e.preventDefault();
        if (!paymentForm.period || !paymentForm.amount) return;
        recordArisanPayment(selectedMember.id, paymentForm.period, parseInt(paymentForm.amount));
        setPaymentForm({ period: '', amount: '' });
        setShowPaymentModal(false);
        setSelectedMember(null);
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        updateArisanSettings(settingsForm);
        setShowSettingsModal(false);
    };

    const handleSpin = () => {
        if (isSpinning || eligibleMembers.length === 0) return;

        setIsSpinning(true);
        setWinner(null);

        const wheel = wheelRef.current;
        if (wheel) {
            const totalRotation = 360 * spinDuration + Math.random() * 720;
            wheel.style.transition = `transform ${spinDuration}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
            wheel.style.transform = `rotate(${totalRotation}deg)`;
        }

        setTimeout(() => {
            const result = spinArisan();
            setWinner(result);
            setShowConfetti(true);
            setIsSpinning(false);
            setTimeout(() => setShowConfetti(false), 5000);
        }, spinDuration * 1000);
    };

    const handleReset = () => {
        if (window.confirm('Yakin ingin reset arisan? Semua riwayat pemenang akan dihapus.')) {
            resetArisan();
            setWinner(null);
            if (wheelRef.current) {
                wheelRef.current.style.transition = 'none';
                wheelRef.current.style.transform = 'rotate(0deg)';
            }
        }
    };

    const openEditModal = (member) => {
        setSelectedMember(member);
        setEditMember({ name: member.name, blok: member.blok, phone: member.phone || '' });
        setShowEditModal(true);
    };

    const openPaymentModal = (member) => {
        setSelectedMember(member);
        setPaymentForm({ period: getCurrentPeriod(), amount: arisan.amount });
        setShowPaymentModal(true);
    };

    const formatRupiah = (num) => {
        return `Rp${new Intl.NumberFormat('id-ID').format(num)}`;
    };

    const getCurrentPeriod = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const eligibleMembers = arisan.members?.filter(m => m.status === 'active' && !m.hasWon) || [];
    const totalMembers = arisan.members?.length || 0;
    const totalPot = (arisan.amount || 0) * totalMembers;
    const wonMembers = arisan.members?.filter(m => m.hasWon) || [];

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="arisan-login">
                <div className="login-card">
                    <div className="login-icon">
                        <Shield size={48} />
                    </div>
                    <h1>Admin Arisan</h1>
                    <p>Masukkan password untuk mengelola arisan</p>

                    <form onSubmit={handleLogin}>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password admin"
                                autoFocus
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {authError && (
                            <div className="auth-error">
                                <AlertCircle size={16} />
                                {authError}
                            </div>
                        )}

                        <button type="submit" className="login-button">
                            <Lock size={18} />
                            Masuk
                        </button>
                    </form>

                    <Link to="/komunitas/arisan" className="back-link">
                        <ArrowLeft size={16} />
                        Kembali ke halaman publik
                    </Link>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="arisan-admin">
            {showConfetti && <div className="confetti-overlay" />}

            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <Link to="/komunitas/arisan" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1>🎰 Admin Arisan</h1>
                        <p>{arisan.name}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="settings-btn" onClick={() => setShowSettingsModal(true)}>
                        <Settings size={20} />
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        <Lock size={16} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="admin-stats">
                <div className="stat-card emerald">
                    <Users size={24} />
                    <div>
                        <span className="value">{totalMembers}</span>
                        <span className="label">Anggota</span>
                    </div>
                </div>
                <div className="stat-card blue">
                    <Gift size={24} />
                    <div>
                        <span className="value">{formatRupiah(totalPot)}</span>
                        <span className="label">Total Pot</span>
                    </div>
                </div>
                <div className="stat-card gold">
                    <Trophy size={24} />
                    <div>
                        <span className="value">{wonMembers.length}</span>
                        <span className="label">Sudah Menang</span>
                    </div>
                </div>
                <div className="stat-card purple">
                    <DollarSign size={24} />
                    <div>
                        <span className="value">{formatRupiah(arisan.amount)}</span>
                        <span className="label">Iuran/Bulan</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    <Users size={18} />
                    Anggota
                </button>
                <button
                    className={`tab ${activeTab === 'spin' ? 'active' : ''}`}
                    onClick={() => setActiveTab('spin')}
                >
                    <Gift size={18} />
                    Spin
                </button>
                <button
                    className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <History size={18} />
                    Riwayat
                </button>
            </div>

            {/* Content */}
            <div className="admin-content">
                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="members-section">
                        <div className="section-header">
                            <h2>Daftar Anggota ({totalMembers})</h2>
                            <button className="add-btn" onClick={() => setShowAddModal(true)}>
                                <Plus size={18} />
                                Tambah
                            </button>
                        </div>

                        <div className="members-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Blok</th>
                                        <th>Status</th>
                                        <th>Pembayaran</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {arisan.members?.map(member => (
                                        <tr key={member.id} className={member.hasWon ? 'won' : ''}>
                                            <td>
                                                <div className="member-name">
                                                    {member.name}
                                                    {member.hasWon && <Trophy size={14} className="trophy-icon" />}
                                                </div>
                                            </td>
                                            <td><span className="blok-badge">{member.blok}</span></td>
                                            <td>
                                                <span className={`status-badge ${member.hasWon ? 'won' : 'active'}`}>
                                                    {member.hasWon ? 'Sudah Menang' : 'Aktif'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="payment-count">
                                                    {member.payments?.length || 0} kali bayar
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-btn payment"
                                                        onClick={() => openPaymentModal(member)}
                                                        title="Catat Pembayaran"
                                                    >
                                                        <DollarSign size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => openEditModal(member)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleRemoveMember(member)}
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Spin Tab */}
                {activeTab === 'spin' && (
                    <div className="spin-section">
                        <div className="spin-info">
                            <h3>Peserta Eligible: {eligibleMembers.length}</h3>
                            <p>{eligibleMembers.map(m => m.name).join(', ') || 'Tidak ada peserta eligible'}</p>
                        </div>

                        {/* Duration selector */}
                        <div className="duration-selector">
                            <label>Durasi Putar:</label>
                            <div className="duration-options">
                                {[5, 10, 15, 20, 30].map(sec => (
                                    <button
                                        key={sec}
                                        className={`duration-btn ${spinDuration === sec ? 'active' : ''}`}
                                        onClick={() => setSpinDuration(sec)}
                                        disabled={isSpinning}
                                    >
                                        {sec}s
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="wheel-container">
                            <div className="wheel-pointer">▼</div>
                            <div className="wheel" ref={wheelRef}>
                                {eligibleMembers.map((member, index) => {
                                    const rotation = (360 / eligibleMembers.length) * index;
                                    const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6'];
                                    return (
                                        <div
                                            key={member.id}
                                            className="wheel-segment"
                                            style={{
                                                transform: `rotate(${rotation}deg)`,
                                                background: colors[index % colors.length]
                                            }}
                                        >
                                            <span>{member.name}</span>
                                        </div>
                                    );
                                })}
                                <div className="wheel-center">
                                    <Gift size={32} />
                                </div>
                            </div>
                        </div>

                        <div className="spin-actions">
                            <button
                                className={`spin-button ${isSpinning ? 'spinning' : ''}`}
                                onClick={handleSpin}
                                disabled={isSpinning || eligibleMembers.length === 0}
                            >
                                <RefreshCw size={24} className={isSpinning ? 'spin-icon' : ''} />
                                {isSpinning ? `Memutar ${spinDuration}s...` : 'PUTAR!'}
                            </button>
                            <button className="reset-btn" onClick={handleReset}>
                                Reset Arisan
                            </button>
                        </div>

                        {winner && (
                            <div className="winner-announcement">
                                <Trophy size={48} />
                                <h2>🎉 Selamat!</h2>
                                <p className="winner-name">{winner.name}</p>
                                <p className="winner-blok">Blok {winner.blok}</p>
                                <p className="winner-amount">Mendapat {formatRupiah(totalPot)}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="history-section">
                        <h2>Riwayat Pemenang</h2>
                        {arisan.history?.length > 0 ? (
                            <div className="history-list">
                                {arisan.history.map((item, idx) => (
                                    <div key={idx} className="history-item">
                                        <div className="history-rank">#{idx + 1}</div>
                                        <div className="history-info">
                                            <span className="history-name">{item.winner}</span>
                                            <span className="history-blok">Blok {item.blok}</span>
                                        </div>
                                        <div className="history-meta">
                                            <span className="history-date">
                                                <Calendar size={14} />
                                                {new Date(item.date).toLocaleDateString('id-ID')}
                                            </span>
                                            <span className="history-amount">
                                                {formatRupiah(item.amount || 0)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <History size={48} />
                                <p>Belum ada riwayat pemenang</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Tambah Anggota</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className="modal-form">
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={newMember.name}
                                    onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                    placeholder="Masukkan nama"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Blok Rumah</label>
                                <input
                                    type="text"
                                    value={newMember.blok}
                                    onChange={e => setNewMember({ ...newMember, blok: e.target.value })}
                                    placeholder="Contoh: A-01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>No. HP (Opsional)</label>
                                <input
                                    type="text"
                                    value={newMember.phone}
                                    onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    <Plus size={18} />
                                    Tambah
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Member Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Anggota</h2>
                            <button className="close-btn" onClick={() => setShowEditModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditMember} className="modal-form">
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={editMember.name}
                                    onChange={e => setEditMember({ ...editMember, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Blok Rumah</label>
                                <input
                                    type="text"
                                    value={editMember.blok}
                                    onChange={e => setEditMember({ ...editMember, blok: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>No. HP</label>
                                <input
                                    type="text"
                                    value={editMember.phone}
                                    onChange={e => setEditMember({ ...editMember, phone: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>
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

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Catat Pembayaran</h2>
                            <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="payment-info">
                            <p>Anggota: <strong>{selectedMember?.name}</strong></p>
                            <p>Blok: <strong>{selectedMember?.blok}</strong></p>
                        </div>
                        <form onSubmit={handlePayment} className="modal-form">
                            <div className="form-group">
                                <label>Periode (YYYY-MM)</label>
                                <input
                                    type="month"
                                    value={paymentForm.period}
                                    onChange={e => setPaymentForm({ ...paymentForm, period: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Jumlah Iuran</label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowPaymentModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    <CheckCircle size={18} />
                                    Catat
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Pengaturan Arisan</h2>
                            <button className="close-btn" onClick={() => setShowSettingsModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSettings} className="modal-form">
                            <div className="form-group">
                                <label>Nama Arisan</label>
                                <input
                                    type="text"
                                    value={settingsForm.name}
                                    onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Iuran per Bulan (Rp)</label>
                                <input
                                    type="number"
                                    value={settingsForm.amount}
                                    onChange={e => setSettingsForm({ ...settingsForm, amount: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Periode</label>
                                <select
                                    value={settingsForm.period}
                                    onChange={e => setSettingsForm({ ...settingsForm, period: e.target.value })}
                                >
                                    <option value="weekly">Mingguan</option>
                                    <option value="monthly">Bulanan</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowSettingsModal(false)}>
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

export default ArisanAdmin;
