import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../contexts/CommunityContext';
import {
    ArrowLeft, Heart, Plus, X, Check, User, Calendar,
    TrendingUp, Users, Gift, Eye, EyeOff
} from 'lucide-react';
import './PeduliPage.css';

const formatRupiah = (value) => {
    return `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

const PeduliPage = () => {
    const { peduli, addPeduliCase, donateToPeduli, closePeduliCase } = useCommunity();
    const [showDonateModal, setShowDonateModal] = useState(false);
    const [showAddCaseModal, setShowAddCaseModal] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [expandedCase, setExpandedCase] = useState(null);

    // Donation Form State
    const [donorName, setDonorName] = useState('');
    const [donationAmount, setDonationAmount] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);

    // New Case Form State
    const [newCase, setNewCase] = useState({
        title: '',
        description: '',
        beneficiary: '',
        blok: '',
        targetAmount: ''
    });

    const activeCases = peduli.cases.filter(c => c.status === 'active');
    const completedCases = peduli.cases.filter(c => c.status === 'completed' || c.status === 'closed');

    const handleDonate = (e) => {
        e.preventDefault();
        if (!selectedCase || !donationAmount) return;

        donateToPeduli(selectedCase.id, {
            donor: isAnonymous ? 'Hamba Allah' : donorName,
            amount: parseInt(donationAmount),
            anonymous: isAnonymous
        });

        setShowDonateModal(false);
        setDonorName('');
        setDonationAmount('');
        setIsAnonymous(false);
        setSelectedCase(null);
    };

    const handleAddCase = (e) => {
        e.preventDefault();
        addPeduliCase({
            ...newCase,
            targetAmount: parseInt(newCase.targetAmount),
            createdBy: 'Admin'
        });
        setShowAddCaseModal(false);
        setNewCase({ title: '', description: '', beneficiary: '', blok: '', targetAmount: '' });
    };

    const openDonateModal = (caseItem) => {
        setSelectedCase(caseItem);
        setShowDonateModal(true);
    };

    const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

    return (
        <div className="peduli-page">
            {/* Header */}
            <header className="peduli-header">
                <Link to="/komunitas" className="back-button">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1>Griya Sakinah Peduli</h1>
                    <p>Dana kepedulian untuk warga yang membutuhkan</p>
                </div>
            </header>

            {/* Stats */}
            <div className="peduli-stats">
                <div className="stat-card">
                    <Heart size={24} />
                    <div>
                        <span className="value">{formatRupiah(peduli.totalDonations || 0)}</span>
                        <span className="label">Total Terkumpul</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Users size={24} />
                    <div>
                        <span className="value">{activeCases.length}</span>
                        <span className="label">Kasus Aktif</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Gift size={24} />
                    <div>
                        <span className="value">{completedCases.length}</span>
                        <span className="label">Terbantu</span>
                    </div>
                </div>
            </div>

            {/* Add Case Button */}
            <div className="add-case-section">
                <button className="add-case-btn" onClick={() => setShowAddCaseModal(true)}>
                    <Plus size={20} />
                    Ajukan Kasus Baru
                </button>
            </div>

            {/* Active Cases */}
            <section className="cases-section">
                <h2>🆘 Butuh Bantuan</h2>
                {activeCases.length === 0 ? (
                    <p className="no-cases">Tidak ada kasus aktif saat ini.</p>
                ) : (
                    <div className="cases-grid">
                        {activeCases.map(caseItem => {
                            const progress = Math.min((caseItem.collectedAmount / caseItem.targetAmount) * 100, 100);
                            const isExpanded = expandedCase === caseItem.id;

                            return (
                                <div key={caseItem.id} className="case-card">
                                    <div className="case-header">
                                        <h3>{caseItem.title}</h3>
                                        <span className="case-beneficiary">
                                            {caseItem.beneficiary} - Blok {caseItem.blok}
                                        </span>
                                    </div>
                                    <p className="case-description">{caseItem.description}</p>

                                    <div className="progress-section">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="progress-info">
                                            <span className="collected">{formatRupiah(caseItem.collectedAmount)}</span>
                                            <span className="target">/ {formatRupiah(caseItem.targetAmount)}</span>
                                        </div>
                                        <span className="progress-percent">{Math.round(progress)}%</span>
                                    </div>

                                    <div className="case-actions">
                                        <button
                                            className="donate-btn"
                                            onClick={() => openDonateModal(caseItem)}
                                        >
                                            <Heart size={16} />
                                            Donasi Sekarang
                                        </button>
                                        <button
                                            className="transparency-btn"
                                            onClick={() => setExpandedCase(isExpanded ? null : caseItem.id)}
                                        >
                                            {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                                            {isExpanded ? 'Tutup' : 'Lihat Donatur'}
                                        </button>
                                    </div>

                                    {/* Transparency - Donor List */}
                                    {isExpanded && (
                                        <div className="donor-list">
                                            <h4>Daftar Donatur ({caseItem.donations.length})</h4>
                                            {caseItem.donations.length === 0 ? (
                                                <p className="no-donors">Belum ada donatur.</p>
                                            ) : (
                                                <ul>
                                                    {caseItem.donations.map(d => (
                                                        <li key={d.id}>
                                                            <div className="donor-info">
                                                                <User size={14} />
                                                                <span>{d.anonymous ? 'Hamba Allah' : d.donor}</span>
                                                            </div>
                                                            <div className="donor-amount">
                                                                {formatRupiah(d.amount)}
                                                            </div>
                                                            <div className="donor-date">
                                                                {formatDate(d.date)}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Completed Cases */}
            {completedCases.length > 0 && (
                <section className="cases-section completed">
                    <h2>✅ Sudah Terbantu</h2>
                    <div className="cases-grid">
                        {completedCases.map(caseItem => (
                            <div key={caseItem.id} className="case-card completed">
                                <div className="case-header">
                                    <h3>{caseItem.title}</h3>
                                    <span className="completed-badge">Selesai</span>
                                </div>
                                <p className="case-beneficiary">{caseItem.beneficiary}</p>
                                <p className="case-total">
                                    Total: {formatRupiah(caseItem.collectedAmount)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Donate Modal */}
            {showDonateModal && selectedCase && (
                <div className="modal-overlay" onClick={() => setShowDonateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Donasi untuk {selectedCase.beneficiary}</h2>
                            <button className="modal-close" onClick={() => setShowDonateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleDonate} className="donate-form">
                            <div className="form-group">
                                <label>Nama Donatur</label>
                                <input
                                    type="text"
                                    value={donorName}
                                    onChange={e => setDonorName(e.target.value)}
                                    placeholder="Nama Anda"
                                    disabled={isAnonymous}
                                    required={!isAnonymous}
                                />
                                <label className="anonymous-check">
                                    <input
                                        type="checkbox"
                                        checked={isAnonymous}
                                        onChange={e => setIsAnonymous(e.target.checked)}
                                    />
                                    Donasi sebagai Hamba Allah (anonim)
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Jumlah Donasi</label>
                                <div className="quick-amounts">
                                    {quickAmounts.map(amt => (
                                        <button
                                            key={amt}
                                            type="button"
                                            className={donationAmount === String(amt) ? 'active' : ''}
                                            onClick={() => setDonationAmount(String(amt))}
                                        >
                                            {formatRupiah(amt)}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    value={donationAmount}
                                    onChange={e => setDonationAmount(e.target.value)}
                                    placeholder="Atau masukkan nominal lain"
                                    min="1000"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowDonateModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-donate">
                                    <Heart size={18} />
                                    Donasi {donationAmount && formatRupiah(parseInt(donationAmount))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Case Modal */}
            {showAddCaseModal && (
                <div className="modal-overlay" onClick={() => setShowAddCaseModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Ajukan Kasus Baru</h2>
                            <button className="modal-close" onClick={() => setShowAddCaseModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddCase} className="case-form">
                            <div className="form-group">
                                <label>Judul</label>
                                <input
                                    type="text"
                                    value={newCase.title}
                                    onChange={e => setNewCase({ ...newCase, title: e.target.value })}
                                    placeholder="Contoh: Bantuan Biaya Operasi Pak Hasan"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Nama Penerima</label>
                                <input
                                    type="text"
                                    value={newCase.beneficiary}
                                    onChange={e => setNewCase({ ...newCase, beneficiary: e.target.value })}
                                    placeholder="Nama warga yang membutuhkan"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Blok</label>
                                <input
                                    type="text"
                                    value={newCase.blok}
                                    onChange={e => setNewCase({ ...newCase, blok: e.target.value })}
                                    placeholder="Contoh: A1, B2, C3"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    value={newCase.description}
                                    onChange={e => setNewCase({ ...newCase, description: e.target.value })}
                                    placeholder="Jelaskan kondisi dan kebutuhan bantuan"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Target Dana</label>
                                <input
                                    type="number"
                                    value={newCase.targetAmount}
                                    onChange={e => setNewCase({ ...newCase, targetAmount: e.target.value })}
                                    placeholder="Contoh: 5000000"
                                    min="100000"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddCaseModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-submit">
                                    <Check size={18} />
                                    Ajukan Kasus
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeduliPage;
