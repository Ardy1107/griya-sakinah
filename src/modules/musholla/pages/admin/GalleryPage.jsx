import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Upload,
    Image as ImageIcon,
    X,
    Calendar,
    Check,
    Maximize,
    ChevronLeft,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { Button, Card, Modal, LoadingSpinner, EmptyState } from '../../components/ui';
import { formatDate, getMonthName } from '../../lib/utils';
import { getProgressGallery, createProgressGallery } from '../../lib/supabase';
import { uploadToGoogleDrive, validateFile, formatFileSize, isGDriveConfigured, MUSH_DRIVE_FOLDERS } from '../../lib/googleDrive';

const MONTHS = [
    { value: 0, label: 'Semua Bulan' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }))
];

export default function GalleryPage() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterMonth, setFilterMonth] = useState(0);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    // Lightbox
    const [lightbox, setLightbox] = useState({ show: false, index: 0 });

    // Form
    const [form, setForm] = useState({
        judul: '',
        deskripsi: '',
        tanggal: new Date().toISOString().split('T')[0]
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef(null);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        loadPhotos();
    }, []);

    async function loadPhotos() {
        setLoading(true);
        try {
            const { data } = await getProgressGallery();
            setPhotos(data || []);
        } catch (error) {
            console.error('Error loading photos:', error);
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setForm({
            judul: '',
            deskripsi: '',
            tanggal: new Date().toISOString().split('T')[0]
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
            maxSize: 15 * 1024 * 1024,
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
        if (!selectedFile) {
            alert('Pilih foto untuk diupload');
            return;
        }

        setUploading(true);

        try {
            // Upload to Google Drive
            setUploadProgress('Mengupload foto ke Google Drive...');
            const uploadResult = await uploadToGoogleDrive(selectedFile, MUSH_DRIVE_FOLDERS.GALERI_PROGRES);

            setUploadProgress('Menyimpan data...');

            // Save to database
            const data = {
                judul: form.judul || `Progres ${formatDate(form.tanggal)}`,
                deskripsi: form.deskripsi,
                tanggal: form.tanggal,
                foto_url: uploadResult.directUrl,
                thumbnail_url: uploadResult.thumbnailUrl || uploadResult.directUrl
            };

            const { error } = await createProgressGallery(data);
            if (error) throw error;

            setShowModal(false);
            resetForm();
            loadPhotos();
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Gagal mengupload foto: ' + error.message);
        } finally {
            setUploading(false);
            setUploadProgress('');
        }
    }

    // Filter photos
    const filteredPhotos = photos.filter(p => {
        if (filterMonth > 0 || filterYear) {
            const date = new Date(p.tanggal);
            if (filterYear && date.getFullYear() !== filterYear) return false;
            if (filterMonth > 0 && date.getMonth() + 1 !== filterMonth) return false;
        }
        return true;
    });

    // Lightbox navigation
    function showNext() {
        setLightbox(prev => ({
            ...prev,
            index: (prev.index + 1) % filteredPhotos.length
        }));
    }

    function showPrev() {
        setLightbox(prev => ({
            ...prev,
            index: (prev.index - 1 + filteredPhotos.length) % filteredPhotos.length
        }));
    }

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-lg" style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>
                        Galeri Progres Pembangunan
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Dokumentasi foto progres pembangunan musholla
                    </p>
                </div>
                <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    Upload Foto
                </Button>
            </div>

            {/* Premium Month/Year Filter */}
            <Card style={{ marginBottom: '24px' }}>
                <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
                    <div className="flex items-center gap-sm">
                        <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Filter:</span>
                    </div>

                    {/* Month Pills */}
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
                                    transition: 'all 0.2s',
                                    boxShadow: filterMonth === m.value ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                                }}
                            >
                                {m.value === 0 ? 'Semua' : m.label.substring(0, 3)}
                            </button>
                        ))}
                    </div>

                    {/* Year Dropdown */}
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

                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {filteredPhotos.length} foto
                    </span>
                </div>
            </Card>

            {/* Photo Grid */}
            {loading ? (
                <div className="flex justify-center" style={{ padding: '80px' }}>
                    <LoadingSpinner size={48} />
                </div>
            ) : filteredPhotos.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={ImageIcon}
                        title="Belum ada foto"
                        description="Upload foto progres pembangunan untuk dokumentasi"
                        action={
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                                <Plus size={18} /> Upload Foto
                            </Button>
                        }
                    />
                </Card>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                }}>
                    {filteredPhotos.map((photo, index) => (
                        <div
                            key={photo.id}
                            className="glass"
                            style={{
                                borderRadius: 'var(--radius-xl)',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onClick={() => setLightbox({ show: true, index })}
                        >
                            {/* Image - Direct Display */}
                            <div style={{
                                position: 'relative',
                                paddingBottom: '75%',
                                background: 'rgba(0,0,0,0.2)'
                            }}>
                                <img
                                    src={photo.foto_url || photo.thumbnail_url}
                                    alt={photo.judul}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                <div
                                    style={{
                                        display: 'none',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <ImageIcon size={48} style={{ color: 'var(--text-muted)' }} />
                                </div>

                                {/* Hover Overlay */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                >
                                    <Maximize size={32} color="white" />
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '16px' }}>
                                <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                                    {photo.judul}
                                </h4>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    📅 {formatDate(photo.tanggal)}
                                </p>
                                {photo.deskripsi && (
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                        {photo.deskripsi}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                title="📸 Upload Foto Progres"
            >
                <form onSubmit={handleSubmit}>
                    {/* File Upload */}
                    <div className="form-group">
                        <label className="form-label">Foto *</label>
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
                                        maxHeight: '200px',
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
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
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
                                    padding: '40px',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    border: '2px dashed rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <Upload size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                                    Klik untuk pilih foto
                                </p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                                    JPG, PNG, WebP (max 15MB)
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Judul</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Contoh: Pengecoran Pondasi"
                            value={form.judul}
                            onChange={e => setForm({ ...form, judul: e.target.value })}
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

                    <div className="form-group">
                        <label className="form-label">Deskripsi</label>
                        <textarea
                            className="textarea"
                            placeholder="Catatan atau deskripsi progres..."
                            value={form.deskripsi}
                            onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                            rows={3}
                        />
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

                    {!isGDriveConfigured() && (
                        <div
                            style={{
                                padding: '12px',
                                background: 'rgba(217, 119, 6, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '16px'
                            }}
                        >
                            <p style={{ fontSize: '13px', color: 'var(--gold)' }}>
                                ⚠️ Google Drive belum dikonfigurasi. Foto tidak dapat diupload.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-md justify-end">
                        <Button type="button" variant="glass" onClick={() => { setShowModal(false); resetForm(); }}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={uploading}
                            disabled={!selectedFile || !isGDriveConfigured()}
                        >
                            <Check size={18} />
                            Upload
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Lightbox */}
            {lightbox.show && filteredPhotos.length > 0 && (
                <div
                    className="modal-overlay"
                    style={{ background: 'rgba(0,0,0,0.95)' }}
                    onClick={() => setLightbox({ show: false, index: 0 })}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setLightbox({ show: false, index: 0 })}
                        className="btn btn-icon btn-glass"
                        style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}
                    >
                        <X size={24} />
                    </button>

                    {/* Navigation */}
                    {filteredPhotos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                                className="btn btn-icon btn-glass"
                                style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); showNext(); }}
                                className="btn btn-icon btn-glass"
                                style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ textAlign: 'center', maxWidth: '90vw' }}
                    >
                        <img
                            src={filteredPhotos[lightbox.index]?.foto_url}
                            alt={filteredPhotos[lightbox.index]?.judul}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '75vh',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                            }}
                        />
                        <div style={{ marginTop: '20px' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>
                                {filteredPhotos[lightbox.index]?.judul}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                📅 {formatDate(filteredPhotos[lightbox.index]?.tanggal)}
                            </p>
                            {filteredPhotos[lightbox.index]?.deskripsi && (
                                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    {filteredPhotos[lightbox.index]?.deskripsi}
                                </p>
                            )}
                            <a
                                href={filteredPhotos[lightbox.index]?.foto_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-glass"
                                style={{ marginTop: '16px', display: 'inline-flex' }}
                            >
                                <ExternalLink size={16} />
                                Buka Full Size
                            </a>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '16px' }}>
                            {lightbox.index + 1} / {filteredPhotos.length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
