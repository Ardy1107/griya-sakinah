import { uploadFile, isGoogleDriveConfigured, isAuthenticated, authenticate } from '../lib/googleDrive';
import { getUnitsSync, getPaymentsSync } from './database';

export const backupDatabaseToDrive = async () => {
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
        return result;
    } catch (error) {
        console.error("Backup failed:", error);
        throw error;
    }
};
