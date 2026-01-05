/**
 * Community Admin Panel
 * Unified management panel for all community features
 * Used within Superadmin dashboard
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Users, Trophy, Gift, Calendar, Heart, Home,
    Plus, Edit2, Trash2, Check, X,
    RefreshCw, DollarSign, Phone, Search, Filter,
    ChevronLeft, ChevronRight, Save, MapPin
} from 'lucide-react';
import './CommunityAdmin.css';

// Get community data from localStorage
const STORAGE_KEYS = {
    ARISAN: 'griya_arisan',
    TAKJIL: 'griya_takjil_schedule',
    PEDULI: 'griya_peduli',
    DIREKTORI: 'griya_direktori_warga'
};

const getData = (key, defaultValue = {}) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
};

const setData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const formatRupiah = (num) => `Rp${new Intl.NumberFormat('id-ID').format(num)}`;

const CommunityAdmin = () => {
    const [activePanel, setActivePanel] = useState('arisan');

    const panels = [
        { id: 'arisan', label: 'Arisan', icon: Gift, color: '#10B981' },
        { id: 'takjil', label: 'Takjil', icon: Calendar, color: '#F59E0B' },
        { id: 'peduli', label: 'Peduli', icon: Heart, color: '#EC4899' },
        { id: 'direktori', label: 'Direktori', icon: Home, color: '#3B82F6' }
    ];

    return (
        <div className="community-admin">
            {/* Panel Tabs */}
            <div className="panel-tabs">
                {panels.map(panel => (
                    <button
                        key={panel.id}
                        className={`panel-tab ${activePanel === panel.id ? 'active' : ''}`}
                        onClick={() => setActivePanel(panel.id)}
                        style={{ '--tab-color': panel.color }}
                    >
                        <panel.icon size={18} />
                        <span>{panel.label}</span>
                    </button>
                ))}
            </div>

            {/* Panel Content */}
            <div className="panel-content">
                {activePanel === 'arisan' && <ArisanPanel />}
                {activePanel === 'takjil' && <TakjilPanel />}
                {activePanel === 'peduli' && <PeduliPanel />}
                {activePanel === 'direktori' && <DirektoriPanel />}
            </div>
        </div>
    );
};

// ========== ARISAN PANEL ==========
const ArisanPanel = () => {
    const [arisan, setArisan] = useState({ members: [], history: [], amount: 100000 });
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState({ name: '', blok: '', phone: '' });
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const wheelRef = useRef(null);

    useEffect(() => {
        setArisan(getData(STORAGE_KEYS.ARISAN, { members: [], history: [], amount: 100000 }));
    }, []);

    const saveArisan = (data) => {
        setArisan(data);
        setData(STORAGE_KEYS.ARISAN, data);
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        const newMember = {
            id: `m${Date.now()}`,
            ...formData,
            status: 'active',
            hasWon: false,
            payments: []
        };
        saveArisan({ ...arisan, members: [...arisan.members, newMember] });
        setFormData({ name: '', blok: '', phone: '' });
        setShowModal(false);
    };

    const handleEditMember = (e) => {
        e.preventDefault();
        const updatedMembers = arisan.members.map(m =>
            m.id === editingMember.id ? { ...m, ...formData } : m
        );
        saveArisan({ ...arisan, members: updatedMembers });
        setShowModal(false);
        setEditingMember(null);
    };

    const handleRemoveMember = (id) => {
        if (window.confirm('Hapus anggota ini?')) {
            saveArisan({ ...arisan, members: arisan.members.filter(m => m.id !== id) });
        }
    };

    const handleSpin = () => {
        const eligible = arisan.members.filter(m => !m.hasWon);
        if (isSpinning || eligible.length < 2) return;

        setIsSpinning(true);
        setWinner(null);

        if (wheelRef.current) {
            const rotation = 360 * 10 + Math.random() * 360;
            wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
            wheelRef.current.style.transform = `rotate(${rotation}deg)`;
        }

        setTimeout(() => {
            const selected = eligible[Math.floor(Math.random() * eligible.length)];
            setWinner(selected);
            setIsSpinning(false);

            // Save winner
            const updatedMembers = arisan.members.map(m =>
                m.id === selected.id ? { ...m, hasWon: true, wonDate: new Date().toISOString() } : m
            );
            const newHistory = [
                { date: new Date().toISOString(), winner: selected.name, blok: selected.blok, amount: arisan.amount * arisan.members.length },
                ...arisan.history
            ];
            saveArisan({ ...arisan, members: updatedMembers, history: newHistory });
        }, 5000);
    };

    const handleReset = () => {
        if (window.confirm('Reset semua status pemenang?')) {
            const resetMembers = arisan.members.map(m => ({ ...m, hasWon: false, wonDate: null }));
            saveArisan({ ...arisan, members: resetMembers, history: [] });
            setWinner(null);
        }
    };

    const openEditModal = (member) => {
        setEditingMember(member);
        setFormData({ name: member.name, blok: member.blok, phone: member.phone || '' });
        setShowModal(true);
    };

    const eligible = arisan.members.filter(m => !m.hasWon);
    const totalPot = arisan.amount * arisan.members.length;

    return (
        <div className="arisan-panel">
            {/* Stats */}
            <div className="panel-stats">
                <div className="stat emerald">
                    <Users size={20} />
                    <div>
                        <span className="value">{arisan.members.length}</span>
                        <span className="label">Anggota</span>
                    </div>
                </div>
                <div className="stat blue">
                    <Gift size={20} />
                    <div>
                        <span className="value">{formatRupiah(totalPot)}</span>
                        <span className="label">Total Pot</span>
                    </div>
                </div>
                <div className="stat gold">
                    <Trophy size={20} />
                    <div>
                        <span className="value">{eligible.length}</span>
                        <span className="label">Belum Menang</span>
                    </div>
                </div>
            </div>

            <div className="arisan-content">
                {/* Members List */}
                <div className="members-section">
                    <div className="section-header">
                        <h3>Daftar Anggota</h3>
                        <button className="btn-add" onClick={() => { setEditingMember(null); setFormData({ name: '', blok: '', phone: '' }); setShowModal(true); }}>
                            <Plus size={16} /> Tambah
                        </button>
                    </div>
                    <div className="members-list">
                        {arisan.members.map(member => (
                            <div key={member.id} className={`member-item ${member.hasWon ? 'won' : ''}`}>
                                <div className="member-info">
                                    <span className="name">{member.name}</span>
                                    <span className="blok">{member.blok}</span>
                                </div>
                                {member.hasWon && <span className="won-badge"><Trophy size={12} /> Menang</span>}
                                <div className="member-actions">
                                    <button onClick={() => openEditModal(member)}><Edit2 size={14} /></button>
                                    <button onClick={() => handleRemoveMember(member.id)}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Spin Section */}
                <div className="spin-section">
                    <h3>Spin Wheel</h3>
                    <div className="mini-wheel" ref={wheelRef}>
                        {eligible.map((m, i) => (
                            <div key={m.id} className="wheel-name" style={{ transform: `rotate(${(360 / eligible.length) * i}deg)` }}>
                                {m.name}
                            </div>
                        ))}
                    </div>
                    <div className="spin-buttons">
                        <button className="btn-spin" onClick={handleSpin} disabled={isSpinning || eligible.length < 2}>
                            <RefreshCw size={18} className={isSpinning ? 'spinning' : ''} />
                            {isSpinning ? 'Memutar...' : 'PUTAR'}
                        </button>
                        <button className="btn-reset" onClick={handleReset}>Reset</button>
                    </div>
                    {winner && (
                        <div className="winner-box">
                            <Trophy size={24} />
                            <span>Pemenang: <strong>{winner.name}</strong> ({winner.blok})</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="panel-modal">
                    <div className="modal-box">
                        <h4>{editingMember ? 'Edit Anggota' : 'Tambah Anggota'}</h4>
                        <form onSubmit={editingMember ? handleEditMember : handleAddMember}>
                            <input type="text" placeholder="Nama" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <input type="text" placeholder="Blok (A-01)" value={formData.blok} onChange={e => setFormData({ ...formData, blok: e.target.value })} required />
                            <input type="text" placeholder="No. HP" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            <div className="modal-buttons">
                                <button type="button" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit"><Check size={16} /> Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ========== TAKJIL PANEL ==========
const TakjilPanel = () => {
    const [schedule, setSchedule] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({ donatur: '', menu: '' });

    useEffect(() => {
        const data = getData(STORAGE_KEYS.TAKJIL, { schedule: [] });
        setSchedule(data.schedule || []);
    }, []);

    const saveSchedule = (newSchedule) => {
        setSchedule(newSchedule);
        setData(STORAGE_KEYS.TAKJIL, { schedule: newSchedule });
    };

    const handleSave = (e) => {
        e.preventDefault();
        const updated = schedule.filter(s => s.date !== selectedDate);
        if (formData.donatur) {
            updated.push({ date: selectedDate, donatur: formData.donatur, menu: formData.menu, status: 'confirmed' });
        }
        saveSchedule(updated);
        setShowModal(false);
    };

    const getDaysInMonth = () => {
        const days = [];
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
        }
        return days;
    };

    const getScheduleFor = (date) => schedule.find(s => s.date === date.toISOString().split('T')[0]);

    const openModal = (date) => {
        setSelectedDate(date.toISOString().split('T')[0]);
        const existing = getScheduleFor(date);
        setFormData({ donatur: existing?.donatur || '', menu: existing?.menu || '' });
        setShowModal(true);
    };

    return (
        <div className="takjil-panel">
            <div className="calendar-nav">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}><ChevronLeft size={20} /></button>
                <h3>{currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}><ChevronRight size={20} /></button>
            </div>
            <div className="calendar-grid">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => <div key={d} className="day-header">{d}</div>)}
                {getDaysInMonth().map((date, i) => {
                    if (!date) return <div key={i} className="day-cell empty" />;
                    const sch = getScheduleFor(date);
                    return (
                        <div key={i} className={`day-cell ${sch ? 'filled' : ''}`} onClick={() => openModal(date)}>
                            <span className="date-num">{date.getDate()}</span>
                            {sch && <span className="donatur-name">{sch.donatur}</span>}
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className="panel-modal">
                    <div className="modal-box">
                        <h4>Edit Donatur - {selectedDate}</h4>
                        <form onSubmit={handleSave}>
                            <input type="text" placeholder="Nama Donatur" value={formData.donatur} onChange={e => setFormData({ ...formData, donatur: e.target.value })} />
                            <input type="text" placeholder="Menu Takjil" value={formData.menu} onChange={e => setFormData({ ...formData, menu: e.target.value })} />
                            <div className="modal-buttons">
                                <button type="button" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit"><Check size={16} /> Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ========== PEDULI PANEL ==========
const PeduliPanel = () => {
    const [peduli, setPeduli] = useState({ cases: [], totalDonations: 0 });
    const [showModal, setShowModal] = useState(false);
    const [showDonateModal, setShowDonateModal] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [formData, setFormData] = useState({ title: '', beneficiary: '', targetAmount: '', description: '' });
    const [donation, setDonation] = useState({ donor: '', amount: '', anonymous: false });

    useEffect(() => {
        setPeduli(getData(STORAGE_KEYS.PEDULI, { cases: [], totalDonations: 0 }));
    }, []);

    const savePeduli = (data) => {
        setPeduli(data);
        setData(STORAGE_KEYS.PEDULI, data);
    };

    const handleAddCase = (e) => {
        e.preventDefault();
        const newCase = {
            id: `case-${Date.now()}`,
            ...formData,
            targetAmount: parseInt(formData.targetAmount),
            collectedAmount: 0,
            status: 'active',
            donations: [],
            createdAt: new Date().toISOString()
        };
        savePeduli({ ...peduli, cases: [newCase, ...peduli.cases], totalCases: (peduli.totalCases || 0) + 1 });
        setFormData({ title: '', beneficiary: '', targetAmount: '', description: '' });
        setShowModal(false);
    };

    const handleDonate = (e) => {
        e.preventDefault();
        const newDonation = {
            id: `d${Date.now()}`,
            donor: donation.anonymous ? 'Hamba Allah' : donation.donor,
            amount: parseInt(donation.amount),
            date: new Date().toISOString()
        };
        const updatedCases = peduli.cases.map(c => {
            if (c.id === selectedCase.id) {
                const newCollected = c.collectedAmount + newDonation.amount;
                return {
                    ...c,
                    collectedAmount: newCollected,
                    donations: [...c.donations, newDonation],
                    status: newCollected >= c.targetAmount ? 'completed' : 'active'
                };
            }
            return c;
        });
        savePeduli({ ...peduli, cases: updatedCases, totalDonations: peduli.totalDonations + newDonation.amount });
        setDonation({ donor: '', amount: '', anonymous: false });
        setShowDonateModal(false);
    };

    const handleClose = (caseId) => {
        if (window.confirm('Tutup kasus ini?')) {
            const updated = peduli.cases.map(c => c.id === caseId ? { ...c, status: 'closed' } : c);
            savePeduli({ ...peduli, cases: updated });
        }
    };

    const activeCases = peduli.cases?.filter(c => c.status === 'active') || [];

    return (
        <div className="peduli-panel">
            <div className="panel-header">
                <h3>Kasus Bantuan ({activeCases.length} aktif)</h3>
                <button className="btn-add" onClick={() => setShowModal(true)}><Plus size={16} /> Buat Kasus</button>
            </div>
            <div className="cases-list">
                {activeCases.map(c => (
                    <div key={c.id} className="case-card">
                        <div className="case-info">
                            <h4>{c.title}</h4>
                            <span>{c.beneficiary}</span>
                        </div>
                        <div className="case-progress">
                            <div className="progress-bar">
                                <div className="fill" style={{ width: `${Math.min((c.collectedAmount / c.targetAmount) * 100, 100)}%` }} />
                            </div>
                            <span>{formatRupiah(c.collectedAmount)} / {formatRupiah(c.targetAmount)}</span>
                        </div>
                        <div className="case-actions">
                            <button onClick={() => { setSelectedCase(c); setShowDonateModal(true); }}><DollarSign size={14} /> Donasi</button>
                            <button onClick={() => handleClose(c.id)}><Check size={14} /> Tutup</button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="panel-modal">
                    <div className="modal-box">
                        <h4>Buat Kasus Baru</h4>
                        <form onSubmit={handleAddCase}>
                            <input type="text" placeholder="Judul Kasus" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            <input type="text" placeholder="Penerima" value={formData.beneficiary} onChange={e => setFormData({ ...formData, beneficiary: e.target.value })} required />
                            <input type="number" placeholder="Target Dana" value={formData.targetAmount} onChange={e => setFormData({ ...formData, targetAmount: e.target.value })} required />
                            <textarea placeholder="Deskripsi" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <div className="modal-buttons">
                                <button type="button" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit"><Plus size={16} /> Buat</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDonateModal && (
                <div className="panel-modal">
                    <div className="modal-box">
                        <h4>Input Donasi - {selectedCase?.title}</h4>
                        <form onSubmit={handleDonate}>
                            <input type="text" placeholder="Nama Donatur" value={donation.donor} onChange={e => setDonation({ ...donation, donor: e.target.value })} disabled={donation.anonymous} />
                            <label className="checkbox-label">
                                <input type="checkbox" checked={donation.anonymous} onChange={e => setDonation({ ...donation, anonymous: e.target.checked })} />
                                Donasi Anonim
                            </label>
                            <input type="number" placeholder="Jumlah Donasi" value={donation.amount} onChange={e => setDonation({ ...donation, amount: e.target.value })} required />
                            <div className="modal-buttons">
                                <button type="button" onClick={() => setShowDonateModal(false)}>Batal</button>
                                <button type="submit"><Heart size={16} /> Catat</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ========== DIREKTORI PANEL ==========
const DirektoriPanel = () => {
    const [residents, setResidents] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingResident, setEditingResident] = useState(null);
    const [formData, setFormData] = useState({ name: '', blok: '', phone: '', role: 'Warga' });

    useEffect(() => {
        setResidents(getData(STORAGE_KEYS.DIREKTORI, []));
    }, []);

    const saveResidents = (data) => {
        setResidents(data);
        setData(STORAGE_KEYS.DIREKTORI, data);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingResident) {
            saveResidents(residents.map(r => r.id === editingResident.id ? { ...r, ...formData } : r));
        } else {
            saveResidents([...residents, { id: Date.now().toString(), ...formData }]);
        }
        setFormData({ name: '', blok: '', phone: '', role: 'Warga' });
        setShowModal(false);
        setEditingResident(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Hapus warga ini?')) {
            saveResidents(residents.filter(r => r.id !== id));
        }
    };

    const openEdit = (resident) => {
        setEditingResident(resident);
        setFormData({ ...resident });
        setShowModal(true);
    };

    const filtered = residents.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.blok.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="direktori-panel">
            <div className="panel-header">
                <div className="search-box">
                    <Search size={16} />
                    <input type="text" placeholder="Cari nama/blok..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="btn-add" onClick={() => { setEditingResident(null); setFormData({ name: '', blok: '', phone: '', role: 'Warga' }); setShowModal(true); }}>
                    <Plus size={16} /> Tambah
                </button>
            </div>
            <div className="residents-list">
                {filtered.map(r => (
                    <div key={r.id} className="resident-item">
                        <div className="resident-avatar">{r.name.charAt(0)}</div>
                        <div className="resident-info">
                            <span className="name">{r.name} {r.role !== 'Warga' && <span className="role">{r.role}</span>}</span>
                            <span className="details"><MapPin size={12} /> {r.blok} {r.phone && <> | <Phone size={12} /> {r.phone}</>}</span>
                        </div>
                        <div className="resident-actions">
                            <button onClick={() => openEdit(r)}><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(r.id)}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="panel-modal">
                    <div className="modal-box">
                        <h4>{editingResident ? 'Edit Warga' : 'Tambah Warga'}</h4>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Nama" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <input type="text" placeholder="Blok" value={formData.blok} onChange={e => setFormData({ ...formData, blok: e.target.value })} required />
                            <input type="text" placeholder="No. HP" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                <option value="Warga">Warga</option>
                                <option value="Ketua RT">Ketua RT</option>
                                <option value="Ketua RW">Ketua RW</option>
                                <option value="Sekretaris">Sekretaris</option>
                                <option value="Bendahara">Bendahara</option>
                            </select>
                            <div className="modal-buttons">
                                <button type="button" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit"><Save size={16} /> Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityAdmin;
