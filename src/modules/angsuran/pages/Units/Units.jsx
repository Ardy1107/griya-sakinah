import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
    getUnits,
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
    Eye,
    Download,
    Upload,
    FileSpreadsheet,
    CheckCircle,
    AlertCircle,
    ArrowUpDown,
    Filter,
    SortAsc,
    SortDesc
} from 'lucide-react';
import './Units.css';


const Units = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [units, setUnits] = useState([]);
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('blockNumber');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterAddon, setFilterAddon] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        blockNumber: '',
        residentName: '',
        phone: '',
        dueDay: 10,
        hasAddon: false,
        totalAddonCost: 0,
        monthlyPayment: 0,
        startingInstallment: 0,
        status: 'aktif'
    });

    // Excel Import States
    const [showImportModal, setShowImportModal] = useState(false);
    const [importData, setImportData] = useState([]);
    const [importErrors, setImportErrors] = useState([]);
    const [importSuccess, setImportSuccess] = useState(0);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef(null);

    // Download Excel Template
    const downloadTemplate = () => {
        const templateData = [
            {
                'Nomor Blok': 'A-01',
                'Nama Penghuni': 'Contoh Nama',
                'Nomor HP': '08123456789',
                'Tanggal Jatuh Tempo': 10,
                'Ada Bangunan Tambahan': 'Tidak',
                'Biaya Bangunan Tambahan': 0,
                'Nominal Angsuran': 3000000,
                'Status': 'aktif'
            },
            {
                'Nomor Blok': 'A-02',
                'Nama Penghuni': 'Nama Kedua',
                'Nomor HP': '08987654321',
                'Tanggal Jatuh Tempo': 15,
                'Ada Bangunan Tambahan': 'Ya',
                'Biaya Bangunan Tambahan': 5000000,
                'Nominal Angsuran': 5500000,
                'Status': 'aktif'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');

        // Add column widths
        ws['!cols'] = [
            { wch: 15 }, // Nomor Blok
            { wch: 25 }, // Nama Penghuni
            { wch: 15 }, // Nomor HP
            { wch: 20 }, // Tanggal Jatuh Tempo
            { wch: 22 }, // Ada Bangunan Tambahan
            { wch: 25 }, // Biaya Bangunan Tambahan
            { wch: 18 }, // Nominal Angsuran
            { wch: 15 }  // Status
        ];

        XLSX.writeFile(wb, 'Template_Import_Unit.xlsx');
    };

    // Handle File Upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Validate and transform data
                const processed = [];
                const errors = [];

                jsonData.forEach((row, index) => {
                    const rowNum = index + 2; // Excel row (header is row 1)
                    const blockNumber = row['Nomor Blok']?.toString().trim();
                    const residentName = row['Nama Penghuni']?.toString().trim();
                    const phone = row['Nomor HP']?.toString().trim();
                    const dueDay = parseInt(row['Tanggal Jatuh Tempo']) || 10;
                    const hasAddonText = row['Ada Bangunan Tambahan']?.toString().toLowerCase();
                    const hasAddon = hasAddonText === 'ya' || hasAddonText === 'yes' || hasAddonText === 'true' || hasAddonText === '1';
                    const totalAddonCost = parseInt(row['Biaya Bangunan Tambahan']) || 0;
                    const monthlyPayment = parseInt(row['Nominal Angsuran']) || 0;
                    const status = row['Status']?.toString().toLowerCase() || 'aktif';

                    // Validation
                    if (!blockNumber) {
                        errors.push(`Baris ${rowNum}: Nomor Blok kosong`);
                        return;
                    }
                    if (!residentName) {
                        errors.push(`Baris ${rowNum}: Nama Penghuni kosong`);
                        return;
                    }
                    if (!phone) {
                        errors.push(`Baris ${rowNum}: Nomor HP kosong`);
                        return;
                    }

                    // Valid status values
                    const validStatus = ['aktif', 'pending_lunas', 'lunas'].includes(status) ? status : 'aktif';

                    processed.push({
                        blockNumber,
                        residentName,
                        phone,
                        dueDay: Math.min(31, Math.max(1, dueDay)),
                        hasAddon,
                        totalAddonCost: hasAddon ? totalAddonCost : 0,
                        monthlyPayment,
                        status: validStatus
                    });
                });

                setImportData(processed);
                setImportErrors(errors);
                setShowImportModal(true);
            } catch (err) {
                alert('Error membaca file Excel: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);

        // Reset file input
        e.target.value = '';
    };

    // Process Import
    const processImport = async () => {
        setIsImporting(true);
        let successCount = 0;

        for (const unitData of importData) {
            try {
                await createUnit(unitData);
                await createAuditLog({ userId: user.id, action: 'CREATE_UNIT', details: `Imported unit ${unitData.blockNumber} from Excel` });
                successCount++;
            } catch (err) {
                console.error('Error importing unit:', err);
            }
        }

        setImportSuccess(successCount);
        setIsImporting(false);
        await loadUnits();

        // Show success for 2 seconds then close
        setTimeout(() => {
            setShowImportModal(false);
            setImportData([]);
            setImportErrors([]);
            setImportSuccess(0);
        }, 2000);
    };

    const loadUnits = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUnits();
            setUnits(data || []);
            setFilteredUnits(data || []);
        } catch (err) {
            console.error('Error loading units:', err);
            setError(err.message || 'Gagal memuat data. Pastikan table "units" sudah dibuat di Supabase.');
            setUnits([]);
            setFilteredUnits([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnits();
    }, []);

    useEffect(() => {
        let result = [...units];

        // Search filter
        if (searchTerm) {
            result = result.filter(unit =>
                unit.blockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                unit.residentName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            result = result.filter(unit => unit.status === filterStatus);
        }

        // Addon filter
        if (filterAddon !== 'all') {
            result = result.filter(unit =>
                filterAddon === 'yes' ? unit.hasAddon : !unit.hasAddon
            );
        }

        // Sorting
        result.sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
                case 'blockNumber':
                    aVal = a.blockNumber.toLowerCase();
                    bVal = b.blockNumber.toLowerCase();
                    break;
                case 'residentName':
                    aVal = a.residentName.toLowerCase();
                    bVal = b.residentName.toLowerCase();
                    break;
                case 'status':
                    aVal = a.status || 'aktif';
                    bVal = b.status || 'aktif';
                    break;
                case 'monthlyPayment':
                    aVal = a.monthlyPayment || 0;
                    bVal = b.monthlyPayment || 0;
                    break;
                default:
                    aVal = a.blockNumber.toLowerCase();
                    bVal = b.blockNumber.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });

        setFilteredUnits(result);
    }, [searchTerm, units, sortBy, sortOrder, filterStatus, filterAddon]);

    const handleOpenModal = (unit = null) => {
        if (unit) {
            setEditingUnit(unit);
            setFormData({
                blockNumber: unit.blockNumber,
                residentName: unit.residentName,
                phone: unit.phone,
                dueDay: unit.dueDay,
                hasAddon: unit.hasAddon,
                totalAddonCost: unit.totalAddonCost,
                monthlyPayment: unit.monthlyPayment || 0,
                startingInstallment: unit.startingInstallment || 0,
                status: unit.status || 'aktif'
            });
        } else {
            setEditingUnit(null);
            setFormData({
                blockNumber: '',
                residentName: '',
                phone: '',
                dueDay: 10,
                hasAddon: false,
                totalAddonCost: 0,
                monthlyPayment: 0,
                startingInstallment: 0,
                status: 'aktif'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUnit(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingUnit) {
                await updateUnit(editingUnit.id, formData);
                await createAuditLog({ userId: user.id, action: 'UPDATE_UNIT', details: `Updated unit ${formData.blockNumber}` });
            } else {
                await createUnit(formData);
                await createAuditLog({ userId: user.id, action: 'CREATE_UNIT', details: `Created unit ${formData.blockNumber}` });
            }

            await loadUnits();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving unit:', err);
            alert('Gagal menyimpan: ' + err.message);
        }
    };

    const handleDelete = async (unit) => {
        if (window.confirm(`Hapus unit ${unit.blockNumber}?`)) {
            try {
                await deleteUnit(unit.id);
                await createAuditLog({ userId: user.id, action: 'DELETE_UNIT', details: `Deleted unit ${unit.blockNumber}` });
                await loadUnits();
            } catch (err) {
                console.error('Error deleting unit:', err);
                alert('Gagal menghapus: ' + err.message);
            }
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
            {/* Loading State */}
            {loading && (
                <div className="loading-state" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '60px 20px', textAlign: 'center'
                }}>
                    <div>
                        <div className="spinner" style={{
                            width: '40px', height: '40px', border: '3px solid #e0e0e0',
                            borderTop: '3px solid #10b981', borderRadius: '50%',
                            animation: 'spin 1s linear infinite', margin: '0 auto 16px'
                        }}></div>
                        <p style={{ color: '#666', fontSize: '14px' }}>Memuat data...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="error-state" style={{
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    border: '1px solid #fecaca', borderRadius: '12px',
                    padding: '24px', margin: '20px', textAlign: 'center'
                }}>
                    <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '12px' }} />
                    <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Memuat Data</h3>
                    <p style={{ color: '#991b1b', marginBottom: '16px' }}>{error}</p>
                    <button onClick={loadUnits} className="primary-button" style={{ margin: '0 auto' }}>
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Main Content - only show when not loading */}
            {!loading && (
                <>
                    <div className="page-header">
                        <div>
                            <h1>{isAdmin() ? 'Data Unit' : 'Daftar Unit'}</h1>
                            <p>{isAdmin() ? 'Kelola data penghuni dan unit rumah' : 'Lihat data penghuni dan riwayat pembayaran'}</p>
                        </div>
                        {isAdmin() && (
                            <div className="header-actions">
                                <button className="secondary-button" onClick={downloadTemplate}>
                                    <Download size={18} />
                                    <span>Template Excel</span>
                                </button>
                                <button className="secondary-button" onClick={() => fileInputRef.current?.click()}>
                                    <Upload size={18} />
                                    <span>Import Excel</span>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".xlsx,.xls"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <button className="primary-button" onClick={() => handleOpenModal()}>
                                    <Plus size={20} />
                                    <span>Tambah Unit</span>
                                </button>
                            </div>
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

                        <div className="filter-controls">
                            {/* Sort */}
                            <div className="filter-group">
                                <label><ArrowUpDown size={14} /> Urutkan</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="blockNumber">Nomor Blok</option>
                                    <option value="residentName">Nama Penghuni</option>
                                    <option value="status">Status</option>
                                    <option value="monthlyPayment">Nominal Angsuran</option>
                                </select>
                                <button
                                    className="sort-order-btn"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                                >
                                    {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                                </button>
                            </div>

                            {/* Filter Status */}
                            <div className="filter-group">
                                <label><Filter size={14} /> Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="aktif">🟢 Aktif</option>
                                    <option value="pending_lunas">🔵 Pending Lunas</option>
                                    <option value="lunas">🟡 Lunas</option>
                                </select>
                            </div>

                            {/* Filter Addon */}
                            <div className="filter-group">
                                <label>Bangunan Tambahan</label>
                                <select
                                    value={filterAddon}
                                    onChange={(e) => setFilterAddon(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Semua</option>
                                    <option value="yes">Ada</option>
                                    <option value="no">Tidak Ada</option>
                                </select>
                            </div>
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

                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
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

                                        <div className="form-group">
                                            <label>💰 Nominal Angsuran Bulanan</label>
                                            <input
                                                type="number"
                                                value={formData.monthlyPayment}
                                                onChange={(e) => setFormData({ ...formData, monthlyPayment: parseInt(e.target.value) || 0 })}
                                                placeholder="Contoh: 3000000"
                                            />
                                            <span className="input-hint">Nominal yang harus dibayar setiap bulan</span>
                                        </div>

                                        <div className="form-group">
                                            <label>📊 Sudah Angsur Ke-</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.startingInstallment}
                                                onChange={(e) => setFormData({ ...formData, startingInstallment: parseInt(e.target.value) || 0 })}
                                                placeholder="Contoh: 24"
                                            />
                                            <span className="input-hint">Angsuran terakhir sebelum pakai aplikasi ini (0 jika baru mulai)</span>
                                        </div>

                                        <div className="form-group">
                                            <label>Status Unit</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="form-select"
                                            >
                                                <option value="aktif">🟢 Aktif (Masih Mencicil)</option>
                                                <option value="pending_lunas">🔵 Pending Lunas (Menunggu Dokumen)</option>
                                                <option value="lunas">🟡 Lunas Total</option>
                                            </select>
                                        </div>
                                    </div>

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

                    {/* Import Modal */}
                    {showImportModal && (
                        <div className="modal-overlay" onClick={() => !isImporting && setShowImportModal(false)}>
                            <div className="modal import-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>
                                        <FileSpreadsheet size={24} />
                                        Import Data Unit
                                    </h2>
                                    {!isImporting && !importSuccess && (
                                        <button className="close-button" onClick={() => setShowImportModal(false)}>
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>

                                <div className="import-modal-body">
                                    {importSuccess > 0 ? (
                                        <div className="import-success">
                                            <CheckCircle size={64} />
                                            <h3>Import Berhasil!</h3>
                                            <p>{importSuccess} unit berhasil ditambahkan</p>
                                        </div>
                                    ) : (
                                        <>
                                            {importErrors.length > 0 && (
                                                <div className="import-errors">
                                                    <div className="error-header">
                                                        <AlertCircle size={18} />
                                                        <span>{importErrors.length} baris bermasalah (akan dilewati)</span>
                                                    </div>
                                                    <ul>
                                                        {importErrors.slice(0, 5).map((err, i) => (
                                                            <li key={i}>{err}</li>
                                                        ))}
                                                        {importErrors.length > 5 && (
                                                            <li>...dan {importErrors.length - 5} error lainnya</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="import-preview">
                                                <h4>Preview Data ({importData.length} unit akan diimport)</h4>
                                                <div className="preview-table-wrapper">
                                                    <table className="preview-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Blok</th>
                                                                <th>Nama</th>
                                                                <th>HP</th>
                                                                <th>Jatuh Tempo</th>
                                                                <th>Addon</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {importData.slice(0, 10).map((row, i) => (
                                                                <tr key={i}>
                                                                    <td>{row.blockNumber}</td>
                                                                    <td>{row.residentName}</td>
                                                                    <td>{row.phone}</td>
                                                                    <td>Tgl {row.dueDay}</td>
                                                                    <td>{row.hasAddon ? formatRupiah(row.totalAddonCost) : '-'}</td>
                                                                    <td>
                                                                        <span className={`status-badge ${row.status}`}>
                                                                            {row.status === 'aktif' ? '🟢' : row.status === 'pending_lunas' ? '🔵' : '🟡'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    {importData.length > 10 && (
                                                        <p className="preview-more">...dan {importData.length - 10} data lainnya</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="modal-actions">
                                                <button
                                                    type="button"
                                                    className="secondary-button"
                                                    onClick={() => setShowImportModal(false)}
                                                    disabled={isImporting}
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="button"
                                                    className="primary-button"
                                                    onClick={processImport}
                                                    disabled={isImporting || importData.length === 0}
                                                >
                                                    {isImporting ? 'Mengimport...' : `Import ${importData.length} Unit`}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Units;
