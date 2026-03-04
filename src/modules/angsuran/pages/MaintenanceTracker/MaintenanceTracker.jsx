import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    getMaintenanceLogs,
    createMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog,
    getUnitsSync as getUnits,
    createAuditLog
} from '../../utils/database';
import { formatDate } from '../../utils/format';
import {
    Plus, Search, X, Wrench, CheckCircle, Clock, AlertTriangle,
    Filter, Trash2, Edit2
} from 'lucide-react';
import './MaintenanceTracker.css';

const CATEGORIES = [
    { value: 'atap', label: '🏠 Atap', color: '#ef4444' },
    { value: 'pipa', label: '🔧 Pipa', color: '#3b82f6' },
    { value: 'listrik', label: '⚡ Listrik', color: '#f59e0b' },
    { value: 'cat', label: '🎨 Cat', color: '#8b5cf6' },
    { value: 'taman', label: '🌿 Taman', color: '#10b981' },
    { value: 'jalan', label: '🛣️ Jalan', color: '#6b7280' },
    { value: 'lainnya', label: '📦 Lainnya', color: '#64748b' }
];

const STATUS_MAP = {
    dilaporkan: { label: 'Dilaporkan', icon: AlertTriangle, color: '#ef4444' },
    diproses: { label: 'Diproses', icon: Clock, color: '#f59e0b' },
    selesai: { label: 'Selesai', icon: CheckCircle, color: '#10b981' }
};

const MaintenanceTracker = () => {
    const { user, isAdmin } = useAuth();
    const [logs, setLogs] = useState([]);
    const [units, setUnits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [formData, setFormData] = useState({
        unitId: '', category: 'lainnya', title: '', description: '', reportedBy: ''
    });

    const loadData = async () => {
        try {
            const [logsData, unitsData] = await Promise.all([getMaintenanceLogs(), getUnits()]);
            setLogs(logsData || []);
            setUnits(unitsData || []);
        } catch (err) {
            if (import.meta.env.DEV) console.error('Error loading maintenance:', err);
            setLogs([]);
            setUnits([]);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filtered = logs.filter(log => {
        const matchSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.blockNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || log.status === filterStatus;
        const matchCategory = filterCategory === 'all' || log.category === filterCategory;
        return matchSearch && matchStatus && matchCategory;
    });

    const stats = {
        total: logs.length,
        dilaporkan: logs.filter(l => l.status === 'dilaporkan').length,
        diproses: logs.filter(l => l.status === 'diproses').length,
        selesai: logs.filter(l => l.status === 'selesai').length
    };

    const handleOpenModal = (log = null) => {
        if (log) {
            setEditingLog(log);
            setFormData({
                unitId: log.unitId, category: log.category, title: log.title,
                description: log.description || '', reportedBy: log.reportedBy || ''
            });
        } else {
            setEditingLog(null);
            setFormData({ unitId: '', category: 'lainnya', title: '', description: '', reportedBy: user?.name || '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingLog) {
            await updateMaintenanceLog(editingLog.id, formData);
            await createAuditLog({ userId: user.id, action: 'UPDATE_MAINTENANCE', details: `Updated: ${formData.title}` });
        } else {
            await createMaintenanceLog(formData);
            await createAuditLog({ userId: user.id, action: 'CREATE_MAINTENANCE', details: `New: ${formData.title}` });
        }
        setShowModal(false);
        loadData();
    };

    const handleStatusChange = async (log, newStatus) => {
        await updateMaintenanceLog(log.id, { ...log, status: newStatus });
        await createAuditLog({ userId: user.id, action: 'UPDATE_MAINTENANCE_STATUS', details: `${log.title}: ${newStatus}` });
        loadData();
    };

    const handleDelete = async (log) => {
        if (window.confirm(`Hapus laporan "${log.title}"?`)) {
            await deleteMaintenanceLog(log.id);
            await createAuditLog({ userId: user.id, action: 'DELETE_MAINTENANCE', details: `Deleted: ${log.title}` });
            loadData();
        }
    };

    const getCategoryInfo = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[6];

    return (
        <div className="maintenance-page">
            <div className="page-header">
                <div>
                    <h1>🔧 Perawatan & Perbaikan</h1>
                    <p>Kelola perawatan dan perbaikan unit perumahan</p>
                </div>
                {isAdmin() && (
                    <button className="primary-button" onClick={() => handleOpenModal()}>
                        <Plus size={20} /> <span>Lapor Kerusakan</span>
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="maintenance-stats">
                <div className="mstat-card total"><Wrench size={20} /><div><span className="mstat-value">{stats.total}</span><span className="mstat-label">Total</span></div></div>
                <div className="mstat-card danger"><AlertTriangle size={20} /><div><span className="mstat-value">{stats.dilaporkan}</span><span className="mstat-label">Dilaporkan</span></div></div>
                <div className="mstat-card warning"><Clock size={20} /><div><span className="mstat-value">{stats.diproses}</span><span className="mstat-label">Diproses</span></div></div>
                <div className="mstat-card success"><CheckCircle size={20} /><div><span className="mstat-value">{stats.selesai}</span><span className="mstat-label">Selesai</span></div></div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="search-box"><Search size={20} />
                    <input type="text" placeholder="Cari judul atau blok..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="filter-controls">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Semua Status</option>
                        <option value="dilaporkan">Dilaporkan</option>
                        <option value="diproses">Diproses</option>
                        <option value="selesai">Selesai</option>
                    </select>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="all">Semua Kategori</option>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Logs List */}
            <div className="maintenance-list">
                {filtered.length === 0 ? (
                    <div className="empty-state"><Wrench size={64} /><h3>Belum ada laporan perawatan</h3><p>Klik "Lapor Kerusakan" untuk membuat laporan baru</p></div>
                ) : (
                    filtered.map(log => {
                        const catInfo = getCategoryInfo(log.category);
                        const statusInfo = STATUS_MAP[log.status];
                        return (
                            <div key={log.id} className={`maintenance-item status-${log.status}`}>
                                <div className="mi-category" style={{ background: catInfo.color }}>{catInfo.label.split(' ')[0]}</div>
                                <div className="mi-content">
                                    <div className="mi-header">
                                        <h4>{log.title}</h4>
                                        <span className={`status-pill ${log.status}`}>
                                            <statusInfo.icon size={14} /> {statusInfo.label}
                                        </span>
                                    </div>
                                    <div className="mi-meta">
                                        <span className="block-badge">{log.blockNumber}</span>
                                        <span>{log.residentName}</span>
                                        <span>{formatDate(log.createdAt)}</span>
                                        {log.reportedBy && <span>Oleh: {log.reportedBy}</span>}
                                    </div>
                                    {log.description && <p className="mi-desc">{log.description}</p>}
                                </div>
                                {isAdmin() && (
                                    <div className="mi-actions">
                                        {log.status === 'dilaporkan' && (
                                            <button className="action-btn process" onClick={() => handleStatusChange(log, 'diproses')} title="Proses">
                                                <Clock size={16} />
                                            </button>
                                        )}
                                        {log.status === 'diproses' && (
                                            <button className="action-btn complete" onClick={() => handleStatusChange(log, 'selesai')} title="Selesai">
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                        <button className="action-btn edit" onClick={() => handleOpenModal(log)} title="Edit"><Edit2 size={16} /></button>
                                        <button className="action-btn delete" onClick={() => handleDelete(log)} title="Hapus"><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingLog ? 'Edit Laporan' : 'Lapor Kerusakan Baru'}</h2>
                            <button className="close-button" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Pilih Unit</label>
                                    <select value={formData.unitId} onChange={(e) => setFormData({ ...formData, unitId: e.target.value })} required>
                                        <option value="">-- Pilih Unit --</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.blockNumber} - {u.residentName}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Kategori</label>
                                    <div className="category-chips">
                                        {CATEGORIES.map(c => (
                                            <button key={c.value} type="button"
                                                className={`category-chip ${formData.category === c.value ? 'active' : ''}`}
                                                style={{ '--chip-color': c.color }}
                                                onClick={() => setFormData({ ...formData, category: c.value })}>
                                                {c.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Judul Kerusakan</label>
                                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Contoh: Atap bocor di kamar belakang" required />
                                </div>
                                <div className="form-group">
                                    <label>Deskripsi (Opsional)</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detail kerusakan..." rows="3" />
                                </div>
                                <div className="form-group">
                                    <label>Dilaporkan Oleh</label>
                                    <input type="text" value={formData.reportedBy} onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })} placeholder="Nama pelapor" />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="primary-button"><Wrench size={18} /> {editingLog ? 'Simpan' : 'Buat Laporan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceTracker;
