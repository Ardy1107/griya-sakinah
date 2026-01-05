// Google Drive Upload Service for Musholla As-Sakinah
// Upload file ke Google Drive via Apps Script webhook (shared with SEI but separate folder)

const GDRIVE_WEBHOOK_URL = import.meta.env.VITE_GDRIVE_WEBHOOK_URL || '';
const MUSHOLLA_FOLDER_ID = import.meta.env.VITE_MUSHOLLA_FOLDER_ID || '';

// Folder types untuk organisasi file di Google Drive Musholla
export const MUSH_DRIVE_FOLDERS = {
    BUKTI_DONASI: 'MUSH_BUKTI_DONASI',
    NOTA_PENGELUARAN: 'MUSH_NOTA_PENGELUARAN',
    GALERI_PROGRES: 'MUSH_GALERI_PROGRES',
    LAPORAN: 'MUSH_LAPORAN',
};

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
 * @param {File|Blob} file - Image file
 * @param {number} maxWidth - Max width in pixels
 * @param {number} quality - JPEG quality 0-1
 * @returns {Promise<string>} Base64 thumbnail
 */
export const createThumbnail = (file, maxWidth = 800, quality = 0.8) => {
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

                const thumbnail = canvas.toDataURL('image/jpeg', quality);
                resolve(thumbnail);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
    });
};

/**
 * Upload file to Google Drive via Apps Script webhook
 * @param {File} file - File to upload
 * @param {string} folderType - Type of folder (GALERI_PROGRES, BUKTI_DONASI, etc)
 * @returns {Promise<{success: boolean, fileUrl?: string, error?: string}>}
 */
export const uploadToGoogleDrive = async (file, folderType = 'MUSH_GALERI_PROGRES') => {
    const base64 = await fileToBase64(file);

    if (!GDRIVE_WEBHOOK_URL) {
        throw new Error('Google Drive belum dikonfigurasi. Set VITE_GDRIVE_WEBHOOK_URL di .env.local');
    }

    try {
        const response = await fetch(GDRIVE_WEBHOOK_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                fileName: file.name,
                fileData: base64,
                folderType: folderType,
                mimeType: file.type
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                fileId: result.fileId,
                fileUrl: result.viewUrl,
                downloadUrl: result.downloadUrl,
                thumbnailUrl: result.thumbnailUrl || `https://drive.google.com/thumbnail?id=${result.fileId}&sz=w1000`,
                directUrl: result.directUrl || `https://drive.google.com/uc?export=view&id=${result.fileId}`,
                fileName: result.fileName,
                fileType: file.type,
                fileSize: file.size,
                uploadedAt: new Date().toISOString()
            };
        } else {
            throw new Error(result.error || 'Upload ke Google Drive gagal');
        }

    } catch (error) {
        console.error('Google Drive upload error:', error);
        throw new Error(`Gagal upload ke Google Drive: ${error.message}`);
    }
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (files, folderType = 'MUSH_GALERI_PROGRES', onProgress) => {
    const results = [];
    for (let i = 0; i < files.length; i++) {
        const result = await uploadToGoogleDrive(files[i], folderType);
        results.push(result);
        if (onProgress) {
            onProgress(i + 1, files.length);
        }
    }
    return results;
};

/**
 * Validate file before upload
 */
export const validateFile = (file, options = {}) => {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    } = options;

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `Ukuran file terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB`
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Tipe file tidak didukung. Gunakan: ${allowedTypes.join(', ')}`
        };
    }

    return { valid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if Google Drive is configured
 */
export const isGDriveConfigured = () => {
    return !!GDRIVE_WEBHOOK_URL;
};

/**
 * Get embeddable image URL from Google Drive
 */
export const getEmbeddableUrl = (fileId) => {
    if (!fileId) return null;
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
};

export default {
    uploadToGoogleDrive,
    uploadMultipleFiles,
    validateFile,
    formatFileSize,
    fileToBase64,
    createThumbnail,
    isGDriveConfigured,
    getEmbeddableUrl,
    MUSH_DRIVE_FOLDERS
};
