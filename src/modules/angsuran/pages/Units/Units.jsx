import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getUnitsSync as getUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    createAuditLog
} from '../../utils/database';
import { useAuth } from '../../contexts/AuthContext';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Building2,
    Phone,
    Calendar,
    DollarSign,
    Eye
} from 'lucide-react';
import './Units.css';

const Units = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [units, setUnits] = useState([]);
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [formData, setFormData] = useState({
        blockNumber: '',
        residentName: '',
        phone: '',
        dueDay: 10,
        hasAddon: false,
        totalAddonCost: 0
    });

    const loadUnits = () => {
        const data = getUnits();
        setUnits(data);
        setFilteredUnits(data);
    };

    useEffect(() => {
        loadUnits();
    }, []);

    useEffect(() => {
        const filtered = units.filter(unit =>
            unit.blockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.residentName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUnits(filtered);
    }, [searchTerm, units]);

    const handleOpenModal = (unit = null) => {
        if (unit) {
            setEditingUnit(unit);
            setFormData({
                blockNumber: unit.blockNumber,
                residentName: unit.residentName,
                phone: unit.phone,
                dueDay: unit.dueDay,
                hasAddon: unit.hasAddon,
                totalAddonCost: unit.totalAddonCost
            });
        } else {
            setEditingUnit(null);
            setFormData({
                blockNumber: '',
                residentName: '',
                phone: '',
                dueDay: 10,
                hasAddon: false,
                totalAddonCost: 0
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUnit(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingUnit) {
            updateUnit(editingUnit.id, formData);
            createAuditLog(user.id, 'UPDATE_UNIT', `Updated unit ${formData.blockNumber}`);
        } else {
            createUnit(formData);
            createAuditLog(user.id, 'CREATE_UNIT', `Created unit ${formData.blockNumber}`);
        }

        loadUnits();
        handleCloseModal();
    };

    const handleDelete = (unit) => {
        if (window.confirm(`Hapus unit ${unit.blockNumber}?`)) {
            deleteUnit(unit.id);
            createAuditLog(user.id, 'DELETE_UNIT', `Deleted unit ${unit.blockNumber}`);
            loadUnits();
        }
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    return (
        <div className="units-page">
            <div className="page-header">
                <div>
                    <h1>{isAdmin() ? 'Data Unit' : 'Daftar Unit'}</h1>
                    <p>{isAdmin() ? 'Kelola data penghuni dan unit rumah' : 'Lihat data penghuni dan riwayat pembayaran'}</p>
                </div>
                {isAdmin() && (
                    <button className="primary-button" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        <span>Tambah Unit</span>
                    </button>
                )}
            </div>

            {/* Search and Filter */}
            <div className="filter-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Cari blok atau nama penghuni..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-info">
                    Menampilkan {filteredUnits.length} dari {units.length} unit
                </div>
            </div>

            {/* Units Grid */}
            {filteredUnits.length === 0 ? (
                <div className="empty-state">
                    <Building2 size={64} />
                    <h3>Belum ada data unit</h3>
                    <p>Klik tombol "Tambah Unit" untuk mendaftarkan penghuni baru</p>
                </div>
            ) : (
                <div className="units-grid">
                    {filteredUnits.map(unit => (
                        <div key={unit.id} className="unit-card">
                            <div className="unit-header">
                                <span className="block-number">{unit.blockNumber}</span>
                                {isAdmin() && (
                                    <div className="unit-actions">
                                        <button
                                            className="icon-button edit"
                                            onClick={() => handleOpenModal(unit)}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="icon-button delete"
                                            onClick={() => handleDelete(unit)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="unit-body">
                                <h3 className="resident-name">{unit.residentName}</h3>

                                <div className="unit-info">
                                    <div className="info-item">
                                        <Phone size={14} />
                                        <span>{unit.phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <Calendar size={14} />
                                        <span>Jatuh tempo: Tanggal {unit.dueDay}</span>
                                    </div>
                                </div>

                                {unit.hasAddon && (
                                    <div className="addon-badge">
                                        <DollarSign size={14} />
                                        <span>Addon: {formatRupiah(unit.totalAddonCost)}</span>
                                    </div>
                                )}

                                <button
                                    className="view-detail-button"
                                    onClick={() => navigate(`/units/${unit.id}`)}
                                >
                                    <Eye size={16} />
                                    <span>Lihat Detail</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingUnit ? 'Edit Unit' : 'Tambah Unit Baru'}</h2>
                            <button className="close-button" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nomor Blok</label>
                                    <input
                                        type="text"
                                        value={formData.blockNumber}
                                        onChange={(e) => setFormData({ ...formData, blockNumber: e.target.value })}
                                        placeholder="Contoh: A-01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tanggal Jatuh Tempo</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={formData.dueDay}
                                        onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Nama Penghuni</label>
                                <input
                                    type="text"
                                    value={formData.residentName}
                                    onChange={(e) => setFormData({ ...formData, residentName: e.target.value })}
                                    placeholder="Nama lengkap penghuni"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Nomor HP</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="08xxxxxxxxxx"
                                    required
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.hasAddon}
                                        onChange={(e) => setFormData({ ...formData, hasAddon: e.target.checked })}
                                    />
                                    <span>Ada Bangunan Tambahan</span>
                                </label>
                            </div>

                            {formData.hasAddon && (
                                <div className="form-group">
                                    <label>Total Biaya Bangunan Tambahan</label>
                                    <input
                                        type="number"
                                        value={formData.totalAddonCost}
                                        onChange={(e) => setFormData({ ...formData, totalAddonCost: parseInt(e.target.value) || 0 })}
                                        placeholder="Masukkan nominal"
                                    />
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="secondary-button" onClick={handleCloseModal}>
                                    Batal
                                </button>
                                <button type="submit" className="primary-button">
                                    {editingUnit ? 'Simpan Perubahan' : 'Tambah Unit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Units;
