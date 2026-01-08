import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createAuditLog } from '../../utils/database';
import {
    backupDatabaseToDrive,
    getBackupInfo,
    isAutoBackupEnabled,
    setAutoBackupEnabled,
    getNextBackupTime,
    saveBackupInfo
} from '../../utils/backupService';
import {
    Download,
    Upload,
    Database,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Shield,
    RefreshCw,
    Cloud,
    Clock,
    Calendar,
    ToggleLeft,
    ToggleRight
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
    const [backupInfo, setBackupInfo] = useState(null);
    const [autoBackup, setAutoBackup] = useState(false);

    useEffect(() => {
        setBackupInfo(getBackupInfo());
        setAutoBackup(isAutoBackupEnabled());
    }, []);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return null;
        const date = new Date(isoString);
        return {
            date: date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const handleToggleAutoBackup = () => {
        const newValue = !autoBackup;
        setAutoBackup(newValue);
        setAutoBackupEnabled(newValue);
        showMessage('success', newValue ? 'Auto-backup mingguan diaktifkan!' : 'Auto-backup dimatikan');
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
            // Refresh backup info display
            setBackupInfo(getBackupInfo());
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

            {/* Backup Status - NEW */}
            <div className="settings-card backup-status">
                <div className="card-header">
                    <Cloud size={20} />
                    <h3>Status Backup</h3>
                </div>

                <div className="backup-info-grid">
                    <div className="backup-info-item">
                        <Clock size={18} />
                        <div>
                            <span className="info-label">Backup Terakhir</span>
                            {backupInfo ? (
                                <span className="info-value">
                                    {formatDateTime(backupInfo.lastBackupTime)?.date} pukul {formatDateTime(backupInfo.lastBackupTime)?.time}
                                </span>
                            ) : (
                                <span className="info-value muted">Belum pernah backup</span>
                            )}
                        </div>
                    </div>

                    {backupInfo && (
                        <div className="backup-info-item">
                            <Database size={18} />
                            <div>
                                <span className="info-label">Metode</span>
                                <span className="info-value">{backupInfo.method === 'auto' ? '🔄 Otomatis' : '👆 Manual'}</span>
                            </div>
                        </div>
                    )}

                    <div className="backup-info-item">
                        <Calendar size={18} />
                        <div>
                            <span className="info-label">Backup Berikutnya</span>
                            <span className="info-value">
                                {autoBackup ? formatDateTime(getNextBackupTime().toISOString())?.date : 'Auto-backup tidak aktif'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="auto-backup-toggle">
                    <div className="toggle-info">
                        <span className="toggle-label">Auto-Backup Mingguan</span>
                        <span className="toggle-desc">Backup otomatis setiap 7 hari ke Google Drive</span>
                    </div>
                    <button
                        className={`toggle-button ${autoBackup ? 'active' : ''}`}
                        onClick={handleToggleAutoBackup}
                    >
                        {autoBackup ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                </div>
            </div>

            {/* Backup & Restore Section */}
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
