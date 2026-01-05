// Confirmation Modal Component
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin?',
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger' // 'danger' | 'warning' | 'info'
}) {
    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="confirm-modal-content">
                    <div className={`confirm-modal-icon ${variant}`}>
                        <AlertTriangle size={32} />
                    </div>

                    <h3 className="confirm-modal-title">{title}</h3>
                    <p className="confirm-modal-message">{message}</p>

                    <div className="confirm-modal-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                        <button
                            className={`btn btn-${variant === 'danger' ? 'danger' : 'primary'}`}
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
