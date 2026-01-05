// ReceiptThumbnail - Display payment receipt with click to zoom
import { useState } from 'react';
import { Image, ExternalLink } from 'lucide-react';
import ImageViewer from '../ImageViewer/ImageViewer';
import '../ImageViewer/ImageViewer.css';

export default function ReceiptThumbnail({
    evidenceUrl,
    evidenceId,
    paymentInfo,
    size = 'medium' // small, medium, large
}) {
    const [showViewer, setShowViewer] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Get thumbnail URL from Google Drive
    const getThumbnailUrl = (url, width = 200) => {
        if (!url) return null;

        // If it's already a thumbnail URL
        if (url.includes('thumbnail')) return url;

        // Extract file ID from Google Drive URL
        let fileId = evidenceId;
        if (!fileId && url) {
            const match = url.match(/\/d\/([^\/]+)|id=([^&]+)/);
            if (match) {
                fileId = match[1] || match[2];
            }
        }

        if (fileId) {
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
        }

        return url;
    };

    const getFullImageUrl = (url) => {
        if (!url) return null;

        let fileId = evidenceId;
        if (!fileId && url) {
            const match = url.match(/\/d\/([^\/]+)|id=([^&]+)/);
            if (match) {
                fileId = match[1] || match[2];
            }
        }

        if (fileId) {
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
        }

        return url;
    };

    const sizeConfig = {
        small: { width: 100, height: 75 },
        medium: { width: 160, height: 120 },
        large: { width: 240, height: 180 }
    };

    const config = sizeConfig[size] || sizeConfig.medium;
    const thumbnailUrl = getThumbnailUrl(evidenceUrl, config.width);
    const fullImageUrl = getFullImageUrl(evidenceUrl);

    if (!evidenceUrl && !evidenceId) {
        return (
            <div className="receipt-thumbnail no-image" style={{ width: config.width, height: config.height }}>
                <Image size={24} />
                <span>Tidak ada bukti</span>
            </div>
        );
    }

    if (imageError) {
        return (
            <div className="receipt-thumbnail error" style={{ width: config.width, height: config.height }}>
                <ExternalLink size={20} />
                <a href={evidenceUrl} target="_blank" rel="noopener noreferrer">
                    Lihat di Drive
                </a>
            </div>
        );
    }

    return (
        <>
            <div
                className="receipt-thumbnail clickable"
                onClick={() => setShowViewer(true)}
                style={{ width: config.width }}
            >
                <img
                    src={thumbnailUrl}
                    alt="Bukti pembayaran"
                    onError={() => setImageError(true)}
                    style={{ width: config.width, height: config.height, objectFit: 'cover' }}
                />
                <span className="receipt-hint">Klik untuk memperbesar</span>
            </div>

            {showViewer && (
                <ImageViewer
                    src={fullImageUrl}
                    alt={paymentInfo || 'Kwitansi Pembayaran'}
                    onClose={() => setShowViewer(false)}
                    downloadUrl={evidenceUrl}
                />
            )}
        </>
    );
}
