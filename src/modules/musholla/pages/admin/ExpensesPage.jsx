import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Filter,
    Calendar,
    Banknote,
    Package,
    Hammer,
    MoreHorizontal,
    Check,
    TrendingDown,
    Upload,
    Image as ImageIcon,
    X,
    ExternalLink,
    Eye
} from 'lucide-react';
import { Button, Card, Modal, Badge, LoadingSpinner, EmptyState } from '../../components/ui';
import { formatRupiah, formatDate, getExpenseCategoryLabel, parseCurrency, getMonthName } from '../../lib/utils';
import { getConstructionCosts, createConstructionCost } from '../../lib/supabase';
import { uploadToGoogleDrive, validateFile, formatFileSize, isGDriveConfigured, MUSH_DRIVE_FOLDERS } from '../../lib/googleDrive';

const CATEGORIES = [
    { value: 'material', label: 'Material Bangunan', icon: Package, color: 'var(--blue)' },
    { value: 'tukang', label: 'Upah Tukang', icon: Hammer, color: 'var(--gold)' },
    { value: 'lainnya', label: 'Lain-lain', icon: MoreHorizontal, color: 'var(--purple)' }
];

const MONTHS = [
    { value: 0, label: 'Semua Bulan' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }))
];

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterMonth, setFilterMonth] = useState(0);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    // Preview
    const [previewImage, setPreviewImage] = useState(null);

    // Form
    const [form, setForm] = useState({
        item_kategori: 'material',
        keterangan: '',
        nominal: '',
        tanggal: new Date().toISOString().split('T')[0],
        bukti_url: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        loadExpenses();
    }, []);

    async function loadExpenses() {
        setLoading(true);
        try {
            const { data } = await getConstructionCosts();
            setExpenses(data || []);
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setForm({
            item_kategori: 'material',
            keterangan: '',
            nominal: '',
            tanggal: new Date().toISOString().split('T')[0],
            bukti_url: ''
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        const validation = validateFile(file, {
            maxSize: 10 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
        });

        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        try {
            let buktiUrl = form.bukti_url;

            // Upload photo to Google Drive if selected
            if (selectedFile && isGDriveConfigured()) {
                setUploadProgress('Mengupload foto...');
                const uploadResult = await uploadToGoogleDrive(selectedFile, MUSH_DRIVE_FOLDERS.NOTA_PENGELUARAN);
                buktiUrl = uploadResult.directUrl;
            }

            setUploadProgress('Menyimpan data...');

            const data = {
                ...form,
                nominal: parseCurrency(form.nominal),
                bukti_url: buktiUrl
            };

            const { error } = await createConstructionCost(data);
            if (error) throw error;

            setShowModal(false);
            resetForm();
            loadExpenses();
        } catch (error) {
            console.error('Error creating expense:', error);
            alert('Gagal menyimpan pengeluaran: ' + error.message);
        } finally {
            setSubmitting(false);
            setUploadProgress('');
        }
    }

    // Filter expenses
    const filteredExpenses = expenses.filter(e => {
        if (filterCategory !== 'all' && e.item_kategori !== filterCategory) return false;
        if (filterMonth > 0 || filterYear) {
            const date = new Date(e.tanggal);
            if (filterYear && date.getFullYear() !== filterYear) return false;
            if (filterMonth > 0 && date.getMonth() + 1 !== filterMonth) return false;
        }
        return true;
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.nominal || 0), 0);
    const filteredTotal = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.nominal || 0), 0);
    const categoryTotals = CATEGORIES.reduce((acc, cat) => {
        acc[cat.value] = expenses
            .filter(e => e.item_kategori === cat.value)
            .reduce((sum, e) => sum + parseFloat(e.nominal || 0), 0);
        return acc;
    }, {});

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>
                        Pengeluaran Pembangunan
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Catat pembelian material dan upah tukang
                    </p>
                </div>
                <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    Catat Pengeluaran
                </Button>
            </div>

            {/* Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                {/* Total */}
                <div className="stat-card rose" style={{ padding: '20px' }}>
                    <div className="stat-icon" style={{
                        background: 'linear-gradient(135deg, var(--rose), var(--rose-light))',
                        boxShadow: '0 4px 16px rgba(225, 29, 72, 0.3)'
                    }}>
                        <TrendingDown size={24} color="white" />
                    </div>
                    <p className="stat-label">Total Pengeluaran</p>
                    <p className="stat-value" style={{ fontSize: '1.5rem' }}>{formatRupiah(totalExpenses)}</p>
                </div>

                {/* By Category */}
                {CATEGORIES.map(cat => {
                    const CatIcon = cat.icon;
                    return (
                        <div
                            key={cat.value}
                            className="glass-light"
                            style={{
                                padding: '20px',
                                borderRadius: 'var(--radius-xl)',
                                cursor: 'pointer',
                                border: filterCategory === cat.value ? `2px solid ${cat.color}` : '1px solid var(--glass-border)',
                                transition: 'all 0.3s'
                            }}
                            onClick={() => setFilterCategory(filterCategory === cat.value ? 'all' : cat.value)}
                        >
                            <div className="flex items-center gap-md">
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    background: `linear-gradient(135deg, ${cat.color}, ${cat.color}80)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CatIcon size={22} color="white" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {cat.label}
                                    </p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                        {formatRupiah(categoryTotals[cat.value] || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Premium Month/Year Picker */}
            <Card style={{ marginBottom: '24px' }}>
                <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
                    <div className="flex items-center gap-sm">
                        <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Periode:</span>
                    </div>

                    {/* Month Picker */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {MONTHS.map(m => (
                            <button
                                key={m.value}
                                onClick={() => setFilterMonth(m.value)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    background: filterMonth === m.value
                                        ? 'linear-gradient(135deg, var(--islamic-green), var(--islamic-green-light))'
                                        : 'rgba(255,255,255,0.05)',
                                    color: filterMonth === m.value ? 'white' : 'var(--text-secondary)',
                                    fontWeight: filterMonth === m.value ? 700 : 500,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {m.value === 0 ? 'Semua' : m.label.substring(0, 3)}
                            </button>
                        ))}
                    </div>

                    {/* Year Picker */}
                    <select
                        className="select"
                        value={filterYear}
                        onChange={e => setFilterYear(parseInt(e.target.value))}
                        style={{ width: 'auto', minWidth: '100px' }}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    {(filterCategory !== 'all' || filterMonth > 0) && (
                        <Badge variant="info">
                            Filtered: {formatRupiah(filteredTotal)}
                        </Badge>
                    )}
                </div>
            </Card>

            {/* Expenses List */}
            <Card>
                {loading ? (
                    <div className="flex justify-center" style={{ padding: '48px' }}>
                        <LoadingSpinner size={40} />
                    </div>
                ) : filteredExpenses.length === 0 ? (
                    <EmptyState
                        icon={Banknote}
                        title="Belum ada pengeluaran"
                        description="Catat pengeluaran untuk tracking biaya pembangunan"
                        action={
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                                <Plus size={18} /> Catat Pengeluaran
                            </Button>
                        }
                    />
                ) : (
                    <div className="table-wrapper">
                        <table className="table-glass">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Kategori</th>
                                    <th>Keterangan</th>
                                    <th>Bukti</th>
                                    <th>Nominal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map(expense => {
                                    const category = CATEGORIES.find(c => c.value === expense.item_kategori);
                                    const CatIcon = category?.icon || MoreHorizontal;
                                    return (
                                        <tr key={expense.id}>
                                            <td>{formatDate(expense.tanggal)}</td>
                                            <td>
                                                <div className="flex items-center gap-sm">
                                                    <div style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 8,
                                                        background: `${category?.color || 'var(--text-muted)'}20`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <CatIcon size={16} style={{ color: category?.color }} />
                                                    </div>
                                                    <span>{getExpenseCategoryLabel(expense.item_kategori)}</span>
                                                </div>
                                            </td>
                                            <td>{expense.keterangan}</td>
                                            <td>
                                                {expense.bukti_url ? (
                                                    <button
                                                        onClick={() => setPreviewImage(expense.bukti_url)}
                                                        className="flex items-center gap-sm"
                                                        style={{
                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                            border: '1px solid rgba(59, 130, 246, 0.2)',
                                                            borderRadius: 'var(--radius-sm)',
                                                            padding: '6px 12px',
                                                            cursor: 'pointer',
                                                            color: 'var(--blue-light)',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        <Eye size={14} />
                                                        Lihat
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--rose-light)' }}>
                                                -{formatRupiah(expense.nominal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Add Expense Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                title="📝 Catat Pengeluaran"
            >
                <form onSubmit={handleSubmit}>
                    {/* Category Selection */}
                    <div className="form-group">
                        <label className="form-label">Kategori *</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {CATEGORIES.map(cat => {
                                const CatIcon = cat.icon;
                                const isSelected = form.item_kategori === cat.value;
                                return (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, item_kategori: cat.value })}
                                        className="flex flex-col items-center gap-sm"
                                        style={{
                                            padding: '16px 12px',
                                            borderRadius: 'var(--radius-md)',
                                            background: isSelected ? `${cat.color}20` : 'rgba(255,255,255,0.05)',
                                            border: isSelected ? `2px solid ${cat.color}` : '1px solid rgba(255,255,255,0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            color: isSelected ? cat.color : 'var(--text-secondary)'
                                        }}
                                    >
                                        <CatIcon size={24} />
                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Keterangan *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Contoh: Beli semen 50 sak"
                            value={form.keterangan}
                            onChange={e => setForm({ ...form, keterangan: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label">Nominal *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="500000"
                                value={form.nominal}
                                onChange={e => setForm({ ...form, nominal: e.target.value })}
                                required
                                style={{ fontSize: '18px', fontWeight: 700 }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tanggal *</label>
                            <input
                                type="date"
                                className="input"
                                value={form.tanggal}
                                onChange={e => setForm({ ...form, tanggal: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="form-group">
                        <label className="form-label">Foto Bukti/Nota</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        {previewUrl ? (
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: '150px',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="btn btn-icon"
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        width: '32px',
                                        height: '32px',
                                        background: 'rgba(225, 29, 72, 0.9)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={16} />
                                </button>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                                </p>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center"
                                style={{
                                    padding: '24px',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    border: '2px dashed rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.02)'
                                }}
                            >
                                <Upload size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    Klik untuk upload foto nota
                                </p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                    Foto akan disimpan ke Google Drive
                                </p>
                            </div>
                        )}

                        {!isGDriveConfigured() && (
                            <p className="form-hint" style={{ color: 'var(--gold)' }}>
                                ⚠️ Google Drive belum dikonfigurasi
                            </p>
                        )}
                    </div>

                    {uploadProgress && (
                        <div
                            className="flex items-center gap-sm"
                            style={{
                                padding: '12px',
                                background: 'rgba(5, 150, 105, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '16px'
                            }}
                        >
                            <LoadingSpinner size={16} />
                            <span style={{ fontSize: '14px', color: 'var(--islamic-green-light)' }}>
                                {uploadProgress}
                            </span>
                        </div>
                    )}

                    <div className="flex gap-md justify-end">
                        <Button type="button" variant="glass" onClick={() => { setShowModal(false); resetForm(); }}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" loading={submitting}>
                            <Check size={18} />
                            Simpan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="modal-overlay"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="btn btn-icon btn-glass"
                            style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                zIndex: 10
                            }}
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={previewImage}
                            alt="Bukti"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--glass-shadow-lg)'
                            }}
                        />
                        <div className="flex justify-center" style={{ marginTop: '16px' }}>
                            <a
                                href={previewImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-glass"
                            >
                                <ExternalLink size={16} />
                                Buka di Tab Baru
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
