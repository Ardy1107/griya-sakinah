import { uploadFile, isGoogleDriveConfigured, isAuthenticated, authenticate } from '../lib/googleDrive';
import { getUnitsSync, getPaymentsSync } from './database';

const BACKUP_INFO_KEY = 'gs_last_backup_info';
const AUTO_BACKUP_ENABLED_KEY = 'gs_auto_backup_enabled';
const BACKUP_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Get last backup info
export const getBackupInfo = () => {
    try {
        const info = localStorage.getItem(BACKUP_INFO_KEY);
        return info ? JSON.parse(info) : null;
    } catch {
        return null;
    }
};

// Save backup info
export const saveBackupInfo = (method = 'manual', fileId = null) => {
    const info = {
        lastBackupTime: new Date().toISOString(),
        method, // 'manual' or 'auto'
        fileId,
        success: true
    };
    localStorage.setItem(BACKUP_INFO_KEY, JSON.stringify(info));
    return info;
};

// Get auto-backup status
export const isAutoBackupEnabled = () => {
    return localStorage.getItem(AUTO_BACKUP_ENABLED_KEY) === 'true';
};

// Toggle auto-backup
export const setAutoBackupEnabled = (enabled) => {
    localStorage.setItem(AUTO_BACKUP_ENABLED_KEY, enabled ? 'true' : 'false');
};

// Calculate next backup time
export const getNextBackupTime = () => {
    const lastBackup = getBackupInfo();
    if (!lastBackup) {
        return new Date(); // Overdue - should backup now
    }
    const lastTime = new Date(lastBackup.lastBackupTime);
    return new Date(lastTime.getTime() + BACKUP_INTERVAL_MS);
};

// Check if backup is overdue
export const isBackupOverdue = () => {
    const nextBackup = getNextBackupTime();
    return new Date() >= nextBackup;
};

export const backupDatabaseToDrive = async (method = 'manual') => {
    try {
        if (!isGoogleDriveConfigured()) {
            throw new Error("Google Drive belum dikonfigurasi");
        }

        if (!isAuthenticated()) {
            await authenticate();
        }

        const data = {
            timestamp: new Date().toISOString(),
            units: getUnitsSync(),
            payments: getPaymentsSync()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const file = new File([blob], `backup_sakinah_${new Date().toISOString().split('T')[0]}.json`, { type: 'application/json' });

        const result = await uploadFile(file);

        // Save backup info
        saveBackupInfo(method, result.id);

        return result;
    } catch (error) {
        console.error("Backup failed:", error);
        throw error;
    }
};

// Auto-backup check (call on app load)
export const checkAndRunAutoBackup = async () => {
    if (!isAutoBackupEnabled()) return null;

    if (isBackupOverdue()) {
        try {
            console.log('[AutoBackup] Running scheduled backup...');
            const result = await backupDatabaseToDrive('auto');
            console.log('[AutoBackup] Complete:', result.id);
            return result;
        } catch (error) {
            console.error('[AutoBackup] Failed:', error);
            return null;
        }
    }
    return null;
};
