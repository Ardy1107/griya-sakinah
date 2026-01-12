/**
 * Update Checker Component
 * Cek update saat app dibuka dan tampilkan dialog jika ada versi baru
 */

import { useState, useEffect } from 'react';
import { Download, X, Sparkles, RefreshCw } from 'lucide-react';
import { checkForUpdate, downloadAndInstallUpdate, APP_VERSION } from '../services/updateService';

export default function UpdateChecker() {
    const [updateInfo, setUpdateInfo] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        // Cek update saat component mount
        const checkUpdate = async () => {
            const result = await checkForUpdate();
            if (result.hasUpdate) {
                setUpdateInfo(result);
                setShowDialog(true);
            }
        };

        // Delay check sedikit agar tidak mengganggu loading awal
        const timer = setTimeout(checkUpdate, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleUpdate = async () => {
        if (!updateInfo?.downloadUrl) return;

        setIsDownloading(true);
        await downloadAndInstallUpdate(updateInfo.downloadUrl);
        setIsDownloading(false);
    };

    const handleDismiss = () => {
        setShowDialog(false);
    };

    if (!showDialog || !updateInfo) return null;

    return (
        <div className="update-overlay">
            <div className="update-dialog">
                <button className="update-close" onClick={handleDismiss}>
                    <X size={20} />
                </button>

                <div className="update-icon">
                    <Sparkles size={40} />
                </div>

                <h2 className="update-title">Update Tersedia! 🎉</h2>

                <p className="update-version">
                    Versi baru <strong>{updateInfo.latestVersion}</strong> sudah tersedia
                    <br />
                    <span className="update-current">Versi Anda: {APP_VERSION}</span>
                </p>

                <div className="update-notes">
                    <h4>Yang Baru:</h4>
                    <p>{updateInfo.releaseNotes}</p>
                </div>

                <div className="update-actions">
                    <button
                        className="update-btn update-btn-primary"
                        onClick={handleUpdate}
                        disabled={isDownloading}
                    >
                        {isDownloading ? (
                            <>
                                <RefreshCw size={18} className="spinning" />
                                Mengunduh...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Update Sekarang
                            </>
                        )}
                    </button>

                    <button
                        className="update-btn update-btn-secondary"
                        onClick={handleDismiss}
                    >
                        Nanti Saja
                    </button>
                </div>
            </div>

            <style>{`
                .update-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    padding: 20px;
                }
                
                .update-dialog {
                    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 20px;
                    padding: 32px 24px;
                    max-width: 360px;
                    width: 100%;
                    text-align: center;
                    position: relative;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }
                
                .update-close {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: rgba(255, 255, 255, 0.6);
                    transition: all 0.2s;
                }
                
                .update-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }
                
                .update-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: white;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .update-title {
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0 0 12px;
                }
                
                .update-version {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 1rem;
                    margin: 0 0 20px;
                    line-height: 1.6;
                }
                
                .update-current {
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .update-notes {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                    text-align: left;
                }
                
                .update-notes h4 {
                    color: #10b981;
                    font-size: 0.875rem;
                    margin: 0 0 8px;
                }
                
                .update-notes p {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.875rem;
                    margin: 0;
                    line-height: 1.5;
                    white-space: pre-line;
                }
                
                .update-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .update-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 24px;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                
                .update-btn-primary {
                    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                    color: white;
                }
                
                .update-btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
                }
                
                .update-btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                .update-btn-secondary {
                    background: transparent;
                    color: rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .update-btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                
                .spinning {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
