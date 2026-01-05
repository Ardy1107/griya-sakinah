import { useState, useRef, useEffect } from 'react';
import { Upload, Cloud, Check, X, Loader, Link as LinkIcon, ExternalLink, AlertCircle } from 'lucide-react';
import {
    isGoogleDriveConfigured,
    initGoogleDrive,
    isAuthenticated,
    authenticate,
    uploadFile,
    signOut
} from '../../lib/googleDrive';
import './FileUpload.css';

const FileUpload = ({ onFileUploaded, existingLink = '' }) => {
    const [mode, setMode] = useState('link'); // 'link' or 'upload'
    const [linkValue, setLinkValue] = useState(existingLink);
    const [isGoogleReady, setIsGoogleReady] = useState(false);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            if (isGoogleDriveConfigured()) {
                const success = await initGoogleDrive();
                setIsGoogleReady(success);
                if (success) {
                    setIsSignedIn(isAuthenticated());
                }
            }
        };
        init();
    }, []);

    useEffect(() => {
        setLinkValue(existingLink);
    }, [existingLink]);

    const handleLinkChange = (e) => {
        const value = e.target.value;
        setLinkValue(value);
        onFileUploaded(value);
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            await authenticate();
            setIsSignedIn(true);
        } catch (err) {
            setError('Gagal login Google: ' + err.message);
        }
    };

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Format file tidak didukung. Gunakan JPG, PNG, GIF, WebP, atau PDF.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Ukuran file maksimal 10MB.');
            return;
        }

        setError('');
        setIsUploading(true);
        setUploadProgress(10);

        try {
            // Generate unique filename
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const newFileName = `bukti_pembayaran_${timestamp}.${extension}`;

            setUploadProgress(30);

            const result = await uploadFile(file, newFileName);

            setUploadProgress(100);
            setUploadedFile({
                name: newFileName,
                link: result.driveLink,
            });
            onFileUploaded(result.driveLink);

        } catch (err) {
            console.error('Upload error:', err);
            setError('Gagal upload file: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const clearUpload = () => {
        setUploadedFile(null);
        setUploadProgress(0);
        onFileUploaded('');
    };

    const getDriveFileId = (url) => {
        try {
            const match = url.match(/\/d\/(.+?)\/view/);
            return match ? match[1] : null;
        } catch (e) {
            return null;
        }
    };

    const getThumbnailUrl = (url) => {
        const id = getDriveFileId(url);
        if (id) {
            // Use Google's public thumbnail generation endpoint
            // s400 means size 400px
            return `https://lh3.googleusercontent.com/d/${id}=s400`;
        }
        return null;
    };

    const handleRemoveFile = () => {
        setLinkValue('');
        setUploadedFile(null);
        setUploadProgress(0);
        onFileUploaded('');
    };

    return (
        <div className="file-upload-container">
            {/* Mode Toggle */}
            <div className="upload-mode-toggle">
                <button
                    type="button"
                    className={`mode-btn ${mode === 'link' ? 'active' : ''}`}
                    onClick={() => setMode('link')}
                >
                    <LinkIcon size={14} />
                    <span>Link Manual</span>
                </button>
                {isGoogleReady && (
                    <button
                        type="button"
                        className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
                        onClick={() => setMode('upload')}
                    >
                        <Cloud size={14} />
                        <span>Upload ke Drive</span>
                    </button>
                )}
            </div>

            <div className="upload-content">
                {/* PREVIEW SECTION (If link exists) */}
                {linkValue ? (
                    <div className="file-preview-card">
                        <div className="preview-image-container">
                            {getDriveFileId(linkValue) ? (
                                <img
                                    src={getThumbnailUrl(linkValue)}
                                    alt="Bukti Pembayaran"
                                    className="preview-thumbnail"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/400x300?text=Preview+Tidak+Tersedia';
                                    }}
                                />
                            ) : (
                                <div className="generic-file-preview">
                                    <ExternalLink size={48} />
                                    <span>Link Dokumen</span>
                                </div>
                            )}
                            <div className="preview-overlay">
                                <a
                                    href={linkValue}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-btn"
                                    title="Lihat Ukuran Penuh"
                                >
                                    <ExternalLink size={20} />
                                </a>
                            </div>
                        </div>
                        <div className="preview-actions">
                            <span className="file-status">
                                <Check size={14} /> File Terlampir
                            </span>
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={handleRemoveFile}
                                title="Hapus File"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    // INPUT SECTION
                    <>
                        {mode === 'link' && (
                            <div className="link-input-container">
                                <input
                                    type="url"
                                    value={linkValue}
                                    onChange={handleLinkChange}
                                    placeholder="Tempel link Google Drive atau URL gambar..."
                                    className="link-input"
                                />
                            </div>
                        )}

                        {mode === 'upload' && (
                            <div className="upload-section">
                                {!isSignedIn ? (
                                    <div className="google-signin-prompt">
                                        <Cloud size={24} />
                                        <p>Login dengan Google untuk upload</p>
                                        <button
                                            type="button"
                                            className="google-signin-btn"
                                            onClick={handleGoogleSignIn}
                                        >
                                            Login Google
                                        </button>
                                    </div>
                                ) : isUploading ? (
                                    <div className="upload-progress">
                                        <Loader className="spinner" size={24} />
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <span>Uploading... {uploadProgress}%</span>
                                    </div>
                                ) : (
                                    <div
                                        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload size={24} />
                                        <p>Klik untuk pilih <b>Gambar (JPG/PNG)</b></p>
                                        <span className="file-hint">Maksimal 10MB</span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => handleFileSelect(e.target.files)}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="upload-error">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
