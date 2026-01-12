/**
 * OTA Update Modal Component
 * Shows update progress and status
 */

import { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { initOTA, checkForOTAUpdate, downloadAndApplyUpdate } from '../services/otaService';
import { Capacitor } from '@capacitor/core';

export default function OTAUpdater() {
    const [updateInfo, setUpdateInfo] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, checking, downloading, applying, done, error
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Initialize OTA and check for updates on mount
        const init = async () => {
            if (!Capacitor.isNativePlatform()) return;

            try {
                await initOTA();
                setStatus('checking');

                const result = await checkForOTAUpdate();
                if (result.hasUpdate) {
                    setUpdateInfo(result);

                    // Auto-download if mandatory
                    if (result.isMandatory) {
                        handleUpdate(result);
                    }
                }
                setStatus('idle');
            } catch (error) {
                console.error('[OTA] Init error:', error);
                setStatus('idle');
            }
        };

        init();
    }, []);

    const handleUpdate = async (info = updateInfo) => {
        if (!info?.bundleUrl) {
            setStatus('error');
            return;
        }

        try {
            setStatus('downloading');
            setProgress(0);

            // Simulate progress (actual progress not available from plugin)
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            const success = await downloadAndApplyUpdate(
                info.bundleUrl,
                info.version
            );

            clearInterval(progressInterval);

            if (success) {
                setProgress(100);
                setStatus('done');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('[OTA] Update error:', error);
            setStatus('error');
        }
    };

    const handleDismiss = () => {
        setUpdateInfo(null);
        setStatus('idle');
    };

    // Don't render on web
    if (!Capacitor.isNativePlatform()) return null;

    // Don't render if no update available
    if (!updateInfo && status !== 'downloading' && status !== 'applying') return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    {status === 'downloading' || status === 'applying' ? (
                        <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite' }} color="#6366f1" />
                    ) : status === 'done' ? (
                        <CheckCircle size={48} color="#22c55e" />
                    ) : status === 'error' ? (
                        <AlertCircle size={48} color="#ef4444" />
                    ) : (
                        <Download size={48} color="#6366f1" />
                    )}
                </div>

                {/* Content */}
                <h2 style={styles.title}>
                    {status === 'downloading' ? 'Mengunduh Update...' :
                        status === 'applying' ? 'Menerapkan Update...' :
                            status === 'done' ? 'Update Berhasil!' :
                                status === 'error' ? 'Update Gagal' :
                                    'Update Tersedia'}
                </h2>

                {updateInfo && status === 'idle' && (
                    <>
                        <p style={styles.version}>Versi {updateInfo.version}</p>
                        {updateInfo.releaseNotes && (
                            <p style={styles.notes}>{updateInfo.releaseNotes}</p>
                        )}
                    </>
                )}

                {/* Progress Bar */}
                {(status === 'downloading' || status === 'applying') && (
                    <div style={styles.progressContainer}>
                        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
                    </div>
                )}

                {/* Buttons */}
                <div style={styles.buttons}>
                    {status === 'idle' && updateInfo && (
                        <>
                            <button style={styles.btnPrimary} onClick={() => handleUpdate()}>
                                <Download size={16} />
                                Update Sekarang
                            </button>
                            {!updateInfo.isMandatory && (
                                <button style={styles.btnSecondary} onClick={handleDismiss}>
                                    Nanti Saja
                                </button>
                            )}
                        </>
                    )}
                    {status === 'error' && (
                        <button style={styles.btnSecondary} onClick={handleDismiss}>
                            Tutup
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
    },
    modal: {
        background: '#1e293b',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '350px',
        width: '100%',
        textAlign: 'center',
        border: '1px solid #334155'
    },
    header: {
        marginBottom: '20px'
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#f8fafc',
        margin: '0 0 8px 0'
    },
    version: {
        fontSize: '0.875rem',
        color: '#6366f1',
        fontWeight: 600,
        margin: '0 0 12px 0'
    },
    notes: {
        fontSize: '0.875rem',
        color: '#94a3b8',
        margin: '0 0 20px 0',
        lineHeight: 1.5
    },
    progressContainer: {
        height: '8px',
        background: '#334155',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '20px'
    },
    progressBar: {
        height: '100%',
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
        borderRadius: '4px',
        transition: 'width 0.3s ease'
    },
    buttons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    btnPrimary: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 24px',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer'
    },
    btnSecondary: {
        padding: '12px 24px',
        background: 'transparent',
        color: '#94a3b8',
        border: '1px solid #334155',
        borderRadius: '12px',
        fontSize: '0.875rem',
        cursor: 'pointer'
    }
};
