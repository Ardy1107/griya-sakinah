// Shared Google Drive Upload Service
// Uses Apps Script webhook (same pattern as musholla module)
// NO Supabase Storage — all files go to Google Drive

const GDRIVE_WEBHOOK_URL = import.meta.env.VITE_GDRIVE_WEBHOOK_URL || '';

/**
 * Convert file to base64
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Create thumbnail from image file
 */
export const createThumbnail = (file, maxWidth = 400, quality = 0.6) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
    });
};

// Folder types for organizing files in Google Drive
export const DRIVE_FOLDERS = {
    CHAT_IMAGES: 'GS_CHAT_IMAGES',
    CHAT_FILES: 'GS_CHAT_FILES',
    KEAMANAN_EVIDENCE: 'GS_KEAMANAN_EVIDENCE',
    EVENT_PHOTOS: 'GS_EVENT_PHOTOS',
    INCIDENT_PHOTOS: 'GS_INCIDENT_PHOTOS',
};

/**
 * Upload file to Google Drive via Apps Script webhook
 */
export async function uploadToGoogleDrive(file, folderType = 'GS_CHAT_IMAGES') {
    if (!GDRIVE_WEBHOOK_URL) {
        throw new Error('Google Drive belum dikonfigurasi. Set VITE_GDRIVE_WEBHOOK_URL di .env');
    }

    const base64 = await fileToBase64(file);

    const response = await fetch(GDRIVE_WEBHOOK_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
            fileName: file.name,
            fileData: base64,
            folderType,
            mimeType: file.type,
        }),
    });

    if (!response.ok) {
        throw new Error(`Upload gagal: HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Upload ke Google Drive gagal');
    }

    return {
        fileId: result.fileId,
        fileUrl: result.viewUrl,
        thumbnailUrl: result.thumbnailUrl || `https://drive.google.com/thumbnail?id=${result.fileId}&sz=w400`,
        directUrl: result.directUrl || `https://drive.google.com/uc?export=view&id=${result.fileId}`,
        fileName: result.fileName || file.name,
        fileType: file.type,
        fileSize: file.size,
    };
}

/**
 * Upload image with auto-compression
 */
export async function uploadImage(file, folderType = 'GS_CHAT_IMAGES', maxSizeMB = 5) {
    // Validate
    if (!file.type.startsWith('image/')) {
        throw new Error('File harus berupa gambar');
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`Ukuran maks ${maxSizeMB}MB`);
    }

    return uploadToGoogleDrive(file, folderType);
}

/**
 * Validate file before upload
 */
export function validateFile(file, options = {}) {
    const {
        maxSize = 10 * 1024 * 1024,
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    } = options;

    if (file.size > maxSize) {
        return { valid: false, error: `Maks ${Math.round(maxSize / 1024 / 1024)}MB` };
    }
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Tipe file tidak didukung' };
    }
    return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get embeddable thumbnail URL from GDrive file ID
 */
export function getGDriveThumbnail(fileId, size = 400) {
    if (!fileId) return null;
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/**
 * Check if Google Drive is configured
 */
export function isGDriveConfigured() {
    return !!GDRIVE_WEBHOOK_URL;
}
