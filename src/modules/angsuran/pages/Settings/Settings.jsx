import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createAuditLog } from '../../utils/database';
import { backupDatabaseToDrive } from '../../utils/backupService';
import {
    Download,
    Upload,
    Database,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Shield,
    RefreshCw,
    Cloud
} from 'lucide-react';
import './Settings.css';

const BACKUP_KEYS = [
    'gs_users',
    'gs_units',
    'gs_payments',
    'gs_audit_logs'
];

const Settings = () => {
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [driveLoading, setDriveLoading] = useState(false);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleBackup = () => {
        try {
            setLoading(true);
            const backupData = {};

            BACKUP_KEYS.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    backupData[key] = JSON.parse(data);
                }
            });

            backupData.backupDate = new Date().toISOString();
            backupData.version = '1.0';

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const dateStr = new Date().toISOString().split('T')[0];
            link.download = `griya-sakinah-backup-${dateStr}.json`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);

            createAuditLog({ userId: user.id, action: 'BACKUP_DATABASE', details: 'Database backup downloaded' });
            showMessage('success', 'Backup berhasil diunduh!');
        } catch (error) {
            showMessage('error', 'Gagal membuat backup: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDriveBackup = async () => {
        try {
            setDriveLoading(true);
            const result = await backupDatabaseToDrive();
            await createAuditLog({ userId: user.id, action: 'BACKUP_DRIVE', details: 'Database backup uploaded to Google Drive' });
            showMessage('success', `Backup berhasil! File ID: ${result.id}`);
        } catch (error) {
            console.error(error);
            showMessage('error', 'Gagal backup ke Google Drive: ' + error.message);
        } finally {
            setDriveLoading(false);
        }
    };

    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                setLoading(true);
                const data = JSON.parse(event.target.result);

                if (!data.version) {
                    throw new Error('File backup tidak valid');
                }

                BACKUP_KEYS.forEach(key => {
                    if (data[key]) {
                        localStorage.setItem(key, JSON.stringify(data[key]));
                    }
                });

                createAuditLog({ userId: user.id, action: 'RESTORE_DATABASE', details: `Database restored from backup dated ${data.backupDate}` });
                showMessage('success', 'Data berhasil direstore! Halaman akan dimuat ulang...');

                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } catch (error) {
                showMessage('error', 'Gagal restore: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleClearAll = () => {
        if (window.confirm('PERINGATAN: Semua data akan dihapus permanen! Apakah Anda yakin?')) {
            if (window.confirm('Ini adalah konfirmasi terakhir. Data tidak dapat dikembalikan. Lanjutkan?')) {
                try {
                    setLoading(true);
                    BACKUP_KEYS.forEach(key => {
                        localStorage.removeItem(key);
                    });
                    localStorage.removeItem('gs_session');

                    showMessage('success', 'Semua data telah dihapus. Halaman akan dimuat ulang...');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } catch (error) {
                    showMessage('error', 'Gagal menghapus data: ' + error.message);
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const getDataStats = () => {
        const stats = {};
        BACKUP_KEYS.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                stats[key] = JSON.parse(data).length;
            } else {
                stats[key] = 0;
            }
        });
        return stats;
    };

    const stats = getDataStats();

    return (
        <div className="settings-page">
            <div className="page-header">
                <div>
                    <h1>Pengaturan</h1>
                    <p>Kelola backup dan konfigurasi sistem</p>
                </div>
            </div>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Data Statistics */}
            <div className="settings-card">
                <div className="card-header">
                    <Database size={20} />
                    <h3>Statistik Database</h3>
                </div>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-number">{stats.gs_users}</span>
                        <span className="stat-label">Users</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{stats.gs_units}</span>
                        <span className="stat-label">Units</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{stats.gs_payments}</span>
                        <span className="stat-label">Payments</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{stats.gs_audit_logs}</span>
                        <span className="stat-label">Audit Logs</span>
                    </div>
                </div>
            </div>

            {/* Backup Section */}
            <div className="settings-card">
                <div className="card-header">
                    <Shield size={20} />
                    <h3>Backup & Restore</h3>
                </div>
                <p className="card-description">
                    Backup data untuk mencegah kehilangan data. File backup dalam format JSON.
                </p>

                <div className="action-buttons">
                    <button
                        className="action-button backup"
                        onClick={handleBackup}
                        disabled={loading || driveLoading}
                    >
                        <Download size={20} />
                        <div>
                            <span className="button-title">Download Backup</span>
                            <span className="button-desc">Unduh semua data sebagai file JSON</span>
                        </div>
                    </button>

                    <button
                        className="action-button google-drive"
                        onClick={handleDriveBackup}
                        disabled={loading || driveLoading}
                    >
                        <Cloud size={20} />
                        <div>
                            <span className="button-title">Backup ke Google Drive</span>
                            <span className="button-desc">
                                {driveLoading ? 'Mengupload...' : 'Simpan backup aman di Cloud'}
                            </span>
                        </div>
                    </button>

                    <button
                        className="action-button restore"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading || driveLoading}
                    >
                        <Upload size={20} />
                        <div>
                            <span className="button-title">Restore dari Backup</span>
                            <span className="button-desc">Pulihkan data dari file backup</span>
                        </div>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleRestore}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            {/* Danger Zone */}
            <div className="settings-card danger">
                <div className="card-header">
                    <AlertTriangle size={20} />
                    <h3>Zona Berbahaya</h3>
                </div>
                <p className="card-description">
                    Tindakan berikut tidak dapat dibatalkan. Harap berhati-hati.
                </p>

                <button
                    className="action-button danger"
                    onClick={handleClearAll}
                    disabled={loading || driveLoading}
                >
                    <Trash2 size={20} />
                    <div>
                        <span className="button-title">Hapus Semua Data</span>
                        <span className="button-desc">Menghapus semua data secara permanen</span>
                    </div>
                </button>
            </div>

            {(loading || driveLoading) && (
                <div className="loading-overlay">
                    <RefreshCw size={32} className="spinning" />
                    <span>Memproses...</span>
                </div>
            )}
        </div>
    );
};

export default Settings;
