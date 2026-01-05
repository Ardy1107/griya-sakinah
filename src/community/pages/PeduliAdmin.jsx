/**
 * Peduli Admin Management
 * Manage community solidarity fund cases
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../contexts/CommunityContext';
import {
    ArrowLeft,
    Heart,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Users,
    DollarSign,
    Target,
    Shield,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Clock
} from 'lucide-react';
import './PeduliAdmin.css';

const ADMIN_PASSWORD = 'peduli2026';

const PeduliAdmin = () => {
    const { peduli, addPeduliCase, donateToPeduli, closePeduliCase } = useCommunity();

    // Auth
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState('');

    // UI State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDonateModal, setShowDonateModal] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [newCase, setNewCase] = useState({
        title: '',
        description: '',
        beneficiary: '',
        blok: '',
        targetAmount: ''
    });
    const [donation, setDonation] = useState({
        donor: '',
        amount: '',
        anonymous: false
    });

    useEffect(() => {
        const auth = sessionStorage.getItem('peduli_admin_auth');
        if (auth === 'true') setIsAuthenticated(true);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('peduli_admin_auth', 'true');
            setAuthError('');
        } else {
            setAuthError('Password salah!');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('peduli_admin_auth');
    };

    const handleAddCase = (e) => {
        e.preventDefault();
        if (!newCase.title || !newCase.beneficiary || !newCase.targetAmount) return;

        addPeduliCase({
            ...newCase,
            targetAmount: parseInt(newCase.targetAmount),
            createdBy: 'Admin'
        });

        setNewCase({ title: '', description: '', beneficiary: '', blok: '', targetAmount: '' });
        setShowAddModal(false);
    };

    const handleDonate = (e) => {
        e.preventDefault();
        if (!donation.amount) return;

        donateToPeduli(selectedCase.id, {
            donor: donation.anonymous ? 'Hamba Allah' : donation.donor,
            amount: parseInt(donation.amount),
            anonymous: donation.anonymous
        });

        setDonation({ donor: '', amount: '', anonymous: false });
        setShowDonateModal(false);
        setSelectedCase(null);
    };

    const handleClose = (caseItem) => {
        if (window.confirm(`Yakin ingin menutup kasus "${caseItem.title}"?`)) {
            closePeduliCase(caseItem.id);
        }
    };

    const openDonateModal = (caseItem) => {
        setSelectedCase(caseItem);
        setShowDonateModal(true);
    };

    const formatRupiah = (num) => {
        return `Rp${new Intl.NumberFormat('id-ID').format(num)}`;
    };

    const getProgress = (collected, target) => {
        return Math.min((collected / target) * 100, 100);
    };

    const activeCases = peduli.cases?.filter(c => c.status === 'active') || [];
    const completedCases = peduli.cases?.filter(c => c.status === 'completed' || c.status === 'closed') || [];

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="peduli-login">
                <div className="login-card">
                    <div className="login-icon">
                        <Heart size={48} />
                    </div>
                    <h1>Admin Peduli</h1>
                    <p>Kelola bantuan solidaritas warga</p>

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
                            <Shield size={18} />
                            Masuk
                        </button>
                    </form>

                    <Link to="/komunitas/peduli" className="back-link">
                        <ArrowLeft size={16} />
                        Kembali ke Peduli
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="peduli-admin">
            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <Link to="/komunitas/peduli" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1>💝 Admin Peduli</h1>
                        <p>Griya Sakinah Peduli</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="add-btn" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        Buat Kasus
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="admin-stats">
                <div className="stat-card rose">
                    <Heart size={24} />
                    <div>
                        <span className="value">{peduli.totalCases || 0}</span>
                        <span className="label">Total Kasus</span>
                    </div>
                </div>
                <div className="stat-card emerald">
                    <DollarSign size={24} />
                    <div>
                        <span className="value">{formatRupiah(peduli.totalDonations || 0)}</span>
                        <span className="label">Total Donasi</span>
                    </div>
                </div>
                <div className="stat-card blue">
                    <Clock size={24} />
                    <div>
                        <span className="value">{activeCases.length}</span>
                        <span className="label">Aktif</span>
                    </div>
                </div>
                <div className="stat-card gold">
                    <CheckCircle size={24} />
                    <div>
                        <span className="value">{completedCases.length}</span>
                        <span className="label">Selesai</span>
                    </div>
                </div>
            </div>

            {/* Active Cases */}
            <section className="cases-section">
                <h2>Kasus Aktif ({activeCases.length})</h2>
                {activeCases.length === 0 ? (
                    <div className="empty-state">
                        <Heart size={48} />
                        <p>Tidak ada kasus aktif</p>
                    </div>
                ) : (
                    <div className="cases-grid">
                        {activeCases.map(caseItem => (
                            <div key={caseItem.id} className="case-card">
                                <div className="case-header">
                                    <h3>{caseItem.title}</h3>
                                    <span className="status-badge active">Aktif</span>
                                </div>

                                <p className="case-beneficiary">
                                    <Users size={14} />
                                    {caseItem.beneficiary} {caseItem.blok && `(Blok ${caseItem.blok})`}
                                </p>

                                <p className="case-description">{caseItem.description}</p>

                                <div className="progress-section">
                                    <div className="progress-header">
                                        <span>Terkumpul</span>
                                        <span>{formatRupiah(caseItem.collectedAmount)} / {formatRupiah(caseItem.targetAmount)}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${getProgress(caseItem.collectedAmount, caseItem.targetAmount)}%` }}
                                        />
                                    </div>
                                    <span className="progress-percent">
                                        {Math.round(getProgress(caseItem.collectedAmount, caseItem.targetAmount))}%
                                    </span>
                                </div>

                                <div className="case-donations">
                                    <h4>Donatur ({caseItem.donations?.length || 0})</h4>
                                    <div className="donations-list">
                                        {caseItem.donations?.slice(0, 3).map(d => (
                                            <div key={d.id} className="donation-item">
                                                <span>{d.donor}</span>
                                                <span>{formatRupiah(d.amount)}</span>
                                            </div>
                                        ))}
                                        {(caseItem.donations?.length || 0) > 3 && (
                                            <span className="more-donors">+{caseItem.donations.length - 3} lainnya</span>
                                        )}
                                    </div>
                                </div>

                                <div className="case-actions">
                                    <button className="action-btn donate" onClick={() => openDonateModal(caseItem)}>
                                        <DollarSign size={16} />
                                        Input Donasi
                                    </button>
                                    <button className="action-btn close" onClick={() => handleClose(caseItem)}>
                                        <Check size={16} />
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Completed Cases */}
            {completedCases.length > 0 && (
                <section className="cases-section completed">
                    <h2>Kasus Selesai ({completedCases.length})</h2>
                    <div className="completed-list">
                        {completedCases.map(caseItem => (
                            <div key={caseItem.id} className="completed-item">
                                <div className="completed-info">
                                    <h4>{caseItem.title}</h4>
                                    <span>{caseItem.beneficiary}</span>
                                </div>
                                <div className="completed-amount">
                                    <span>{formatRupiah(caseItem.collectedAmount)}</span>
                                    <span className="status-badge completed">Selesai</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Add Case Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Buat Kasus Baru</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddCase} className="modal-form">
                            <div className="form-group">
                                <label>Judul Kasus</label>
                                <input
                                    type="text"
                                    value={newCase.title}
                                    onChange={e => setNewCase({ ...newCase, title: e.target.value })}
                                    placeholder="Contoh: Bantuan Biaya Pengobatan"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Penerima Manfaat</label>
                                    <input
                                        type="text"
                                        value={newCase.beneficiary}
                                        onChange={e => setNewCase({ ...newCase, beneficiary: e.target.value })}
                                        placeholder="Nama penerima"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Blok</label>
                                    <input
                                        type="text"
                                        value={newCase.blok}
                                        onChange={e => setNewCase({ ...newCase, blok: e.target.value })}
                                        placeholder="A-01"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    value={newCase.description}
                                    onChange={e => setNewCase({ ...newCase, description: e.target.value })}
                                    placeholder="Jelaskan kebutuhan bantuan..."
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Target Dana (Rp)</label>
                                <input
                                    type="number"
                                    value={newCase.targetAmount}
                                    onChange={e => setNewCase({ ...newCase, targetAmount: e.target.value })}
                                    placeholder="5000000"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    <Plus size={18} />
                                    Buat Kasus
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Donate Modal */}
            {showDonateModal && selectedCase && (
                <div className="modal-overlay" onClick={() => setShowDonateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Input Donasi</h2>
                            <button className="close-btn" onClick={() => setShowDonateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="case-info">
                            <p><strong>{selectedCase.title}</strong></p>
                            <p>Untuk: {selectedCase.beneficiary}</p>
                        </div>
                        <form onSubmit={handleDonate} className="modal-form">
                            <div className="form-group">
                                <label>Nama Donatur</label>
                                <input
                                    type="text"
                                    value={donation.donor}
                                    onChange={e => setDonation({ ...donation, donor: e.target.value })}
                                    placeholder="Nama donatur"
                                    disabled={donation.anonymous}
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={donation.anonymous}
                                        onChange={e => setDonation({ ...donation, anonymous: e.target.checked })}
                                    />
                                    <span>Donasi sebagai Hamba Allah (Anonim)</span>
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Jumlah Donasi (Rp)</label>
                                <input
                                    type="number"
                                    value={donation.amount}
                                    onChange={e => setDonation({ ...donation, amount: e.target.value })}
                                    placeholder="500000"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowDonateModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    <Heart size={18} />
                                    Catat Donasi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeduliAdmin;
