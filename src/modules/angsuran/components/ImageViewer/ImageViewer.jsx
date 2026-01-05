// ImageViewer Component - Modal untuk zoom gambar kwitansi
import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, ExternalLink } from 'lucide-react';
import './ImageViewer.css';

export default function ImageViewer({ src, alt, onClose, downloadUrl }) {
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Close on ESC key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('image-viewer-overlay')) {
            onClose();
        }
    };

    const handleDownload = () => {
        if (downloadUrl) {
            window.open(downloadUrl, '_blank');
        }
    };

    const handleOpenInDrive = () => {
        if (src) {
            // Extract file ID and open in Google Drive
            const match = src.match(/id=([^&]+)/);
            if (match) {
                window.open(`https://drive.google.com/file/d/${match[1]}/view`, '_blank');
            } else {
                window.open(src, '_blank');
            }
        }
    };

    return (
        <div className="image-viewer-overlay" onClick={handleOverlayClick}>
            <div className="image-viewer-container">
                {/* Header */}
                <div className="image-viewer-header">
                    <span className="image-viewer-title">{alt || 'Kwitansi Pembayaran'}</span>
                    <div className="image-viewer-actions">
                        <button onClick={handleZoomOut} title="Perkecil">
                            <ZoomOut size={20} />
                        </button>
                        <span className="zoom-level">{Math.round(scale * 100)}%</span>
                        <button onClick={handleZoomIn} title="Perbesar">
                            <ZoomIn size={20} />
                        </button>
                        {downloadUrl && (
                            <button onClick={handleDownload} title="Download">
                                <Download size={20} />
                            </button>
                        )}
                        <button onClick={handleOpenInDrive} title="Buka di Google Drive">
                            <ExternalLink size={20} />
                        </button>
                        <button onClick={onClose} className="close-btn" title="Tutup">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Image Container */}
                <div className="image-viewer-content">
                    {loading && !error && (
                        <div className="image-loading">
                            <div className="loading-spinner"></div>
                            <span>Memuat gambar...</span>
                        </div>
                    )}
                    {error && (
                        <div className="image-error">
                            <span>Gagal memuat gambar</span>
                        </div>
                    )}
                    <img
                        src={src}
                        alt={alt}
                        className={`viewer-image ${loading ? 'hidden' : ''}`}
                        style={{ transform: `scale(${scale})` }}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setError(true);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
