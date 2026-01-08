import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getUnits, getPayments } from './database';

const BACKUP_INFO_KEY = 'gs_last_backup_info';
const AUTO_BACKUP_ENABLED_KEY = 'gs_auto_backup_enabled';
const BACKUP_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const BACKUP_BUCKET = 'backups';

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
export const saveBackupInfo = (method = 'manual', filePath = null) => {
    const info = {
        lastBackupTime: new Date().toISOString(),
        method, // 'manual' or 'auto'
        filePath,
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

// Check if backup storage is configured
export const isBackupConfigured = () => {
    return isSupabaseConfigured();
};

// Backup to Supabase Storage (PRIVATE)
export const backupToSupabase = async (method = 'manual') => {
    try {
        if (!isSupabaseConfigured()) {
            throw new Error("Supabase belum dikonfigurasi");
        }

        // Get data from database
        const units = await getUnits();
        const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false });

        const backupData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            method,
            units: units || [],
            payments: payments || [],
            totalUnits: units?.length || 0,
            totalPayments: payments?.length || 0
        };

        // Generate filename with timestamp
        const dateStr = new Date().toISOString().split('T')[0];
        const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        const fileName = `backup_griyasakinah_${dateStr}_${timeStr}.json`;

        // Convert to blob
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });

        // Upload to Supabase Storage (private bucket)
        const { data, error } = await supabase.storage
            .from(BACKUP_BUCKET)
            .upload(fileName, blob, {
                contentType: 'application/json',
                upsert: false
            });

        if (error) {
            // If bucket doesn't exist error, provide helpful message
            if (error.message.includes('not found') || error.message.includes('Bucket')) {
                throw new Error('Bucket "backups" belum ada. Buat dulu di Supabase Dashboard > Storage.');
            }
            throw error;
        }

        // Save backup info
        saveBackupInfo(method, data.path);

        return {
            success: true,
            path: data.path,
            fileName,
            size: blob.size,
            timestamp: backupData.timestamp
        };
    } catch (error) {
        console.error("Backup failed:", error);
        throw error;
    }
};

// List all backups from Supabase Storage
export const listBackups = async () => {
    if (!isSupabaseConfigured()) return [];

    try {
        const { data, error } = await supabase.storage
            .from(BACKUP_BUCKET)
            .list('', {
                limit: 20,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Failed to list backups:", error);
        return [];
    }
};

// Download a backup file
export const downloadBackup = async (fileName) => {
    if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

    const { data, error } = await supabase.storage
        .from(BACKUP_BUCKET)
        .download(fileName);

    if (error) throw error;
    return data;
};

// Delete old backups (keep last N backups)
export const cleanupOldBackups = async (keepCount = 5) => {
    const backups = await listBackups();
    if (backups.length <= keepCount) return;

    const toDelete = backups.slice(keepCount);
    for (const file of toDelete) {
        await supabase.storage.from(BACKUP_BUCKET).remove([file.name]);
    }
};

// Auto-backup check (call on app load)
export const checkAndRunAutoBackup = async () => {
    if (!isAutoBackupEnabled()) return null;

    if (isBackupOverdue()) {
        try {
            console.log('[AutoBackup] Running scheduled backup...');
            const result = await backupToSupabase('auto');
            console.log('[AutoBackup] Complete:', result.path);
            // Cleanup old backups after auto-backup
            await cleanupOldBackups(10);
            return result;
        } catch (error) {
            console.error('[AutoBackup] Failed:', error);
            return null;
        }
    }
    return null;
};

// Legacy export for compatibility
export const backupDatabaseToDrive = backupToSupabase;

