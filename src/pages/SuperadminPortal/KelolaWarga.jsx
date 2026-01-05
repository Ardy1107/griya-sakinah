import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Users,
    Wifi,
    CreditCard,
    Heart,
    Search,
    X,
    Save
} from 'lucide-react';
import { useSuperadmin } from '../../contexts/SuperadminContext';
import { supabase } from '../../modules/angsuran/lib/supabase';
import './SuperadminPortal.css';

export default function KelolaWarga() {
    const { isAuthenticated, loading: authLoading } = useSuperadmin();
    const navigate = useNavigate();

    const [wargaList, setWargaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentWarga, setCurrentWarga] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        blok: '',
        nama: '',
        phone: '',
        can_view_internet: true,
        can_view_angsuran: true,
        can_view_musholla: true
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/superadmin/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWarga();
        }
    }, [isAuthenticated]);

    const fetchWarga = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('warga_users')
            .select('*')
            .order('blok', { ascending: true });

        if (!error) {
            setWargaList(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editMode && currentWarga) {
            // Update
            const { error } = await supabase
                .from('warga_users')
                .update(formData)
                .eq('id', currentWarga.id);

            if (!error) {
                fetchWarga();
                closeModal();
            }
        } else {
            // Insert
            const { error } = await supabase
                .from('warga_users')
                .insert([formData]);

            if (!error) {
                fetchWarga();
                closeModal();
            }
        }
    };

    const handleEdit = (warga) => {
        setCurrentWarga(warga);
        setFormData({
            blok: warga.blok,
            nama: warga.nama,
            phone: warga.phone || '',
            can_view_internet: warga.can_view_internet,
            can_view_angsuran: warga.can_view_angsuran,
            can_view_musholla: warga.can_view_musholla
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Yakin hapus warga ini?')) {
            const { error } = await supabase
                .from('warga_users')
                .delete()
                .eq('id', id);

            if (!error) {
                fetchWarga();
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentWarga(null);
        setFormData({
            blok: '',
            nama: '',
            phone: '',
            can_view_internet: true,
            can_view_angsuran: true,
            can_view_musholla: true
        });
    };

    const openAddModal = () => {
        closeModal();
        setShowModal(true);
    };

    const filteredWarga = wargaList.filter(w =>
        w.blok.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading || loading) {
        return (
            <div className="loading-screen">
                <div className="spinner-lg" />
                <p>Memuat...</p>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="kelola-warga">
            {/* Header */}
            <header className="kelola-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/superadmin" className="back-btn">
                        <ArrowLeft size={18} />
                        Dashboard
                    </Link>
                    <div className="header-title">
                        <h1>Kelola Warga</h1>
                        <p>Manage akses portal per blok</p>
                    </div>
                </div>
                <button onClick={openAddModal} className="add-btn">
                    <Plus size={18} />
                    Tambah Warga
                </button>
            </header>

            {/* Search */}
            <div style={{ maxWidth: 1000, margin: '0 auto 1.5rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '10px 16px'
                }}>
                    <Search size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari blok atau nama..."
                        style={{
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.9375rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="warga-table-container">
                <table className="warga-table">
                    <thead>
                        <tr>
                            <th>Blok</th>
                            <th>Nama</th>
                            <th>Phone</th>
                            <th>Akses</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWarga.map((warga) => (
                            <tr key={warga.id}>
                                <td className="blok-cell">{warga.blok}</td>
                                <td>{warga.nama}</td>
                                <td>{warga.phone || '-'}</td>
                                <td>
                                    <div className="access-badges">
                                        <span className={`access-badge ${warga.can_view_angsuran ? 'active' : 'inactive'}`}>
                                            Angsuran
                                        </span>
                                        <span className={`access-badge ${warga.can_view_internet ? 'active' : 'inactive'}`}>
                                            Internet
                                        </span>
                                        <span className={`access-badge ${warga.can_view_musholla ? 'active' : 'inactive'}`}>
                                            Musholla
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button onClick={() => handleEdit(warga)} className="action-btn">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(warga.id)} className="action-btn delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredWarga.length === 0 && (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.5)'
                    }}>
                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>Tidak ada data warga</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editMode ? 'Edit Warga' : 'Tambah Warga'}</h2>
                            <button onClick={closeModal} className="close-btn">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Blok</label>
                                <input
                                    type="text"
                                    value={formData.blok}
                                    onChange={(e) => setFormData({ ...formData, blok: e.target.value.toUpperCase() })}
                                    placeholder="Contoh: A1"
                                    required
                                    disabled={editMode}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Nama warga"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>No. Telepon</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>

                            <div className="access-toggles">
                                <label className="toggle-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.can_view_angsuran}
                                        onChange={(e) => setFormData({ ...formData, can_view_angsuran: e.target.checked })}
                                    />
                                    <CreditCard size={16} />
                                    <span>Akses Angsuran</span>
                                </label>
                                <label className="toggle-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.can_view_internet}
                                        onChange={(e) => setFormData({ ...formData, can_view_internet: e.target.checked })}
                                    />
                                    <Wifi size={16} />
                                    <span>Akses Internet</span>
                                </label>
                                <label className="toggle-item">
                                    <input
                                        type="checkbox"
                                        checked={formData.can_view_musholla}
                                        onChange={(e) => setFormData({ ...formData, can_view_musholla: e.target.checked })}
                                    />
                                    <Heart size={16} />
                                    <span>Akses Musholla</span>
                                </label>
                            </div>

                            <button type="submit" className="submit-btn">
                                <Save size={18} />
                                {editMode ? 'Simpan Perubahan' : 'Tambah Warga'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    z-index: 1000;
                }
                .modal-content {
                    width: 100%;
                    max-width: 480px;
                    background: #1e293b;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px;
                    overflow: hidden;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .modal-header h2 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: white;
                    margin: 0;
                }
                .close-btn {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.6);
                    cursor: pointer;
                    padding: 4px;
                }
                .close-btn:hover {
                    color: white;
                }
                .modal-form {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .modal-form .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .modal-form label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.8);
                }
                .modal-form input[type="text"],
                .modal-form input[type="tel"] {
                    padding: 0.875rem 1rem;
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    color: white;
                    font-size: 0.9375rem;
                }
                .modal-form input:focus {
                    outline: none;
                    border-color: #10b981;
                }
                .access-toggles {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                }
                .toggle-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    color: rgba(255,255,255,0.8);
                    font-size: 0.9375rem;
                }
                .toggle-item input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    accent-color: #10b981;
                }
            `}</style>
        </div>
    );
}
