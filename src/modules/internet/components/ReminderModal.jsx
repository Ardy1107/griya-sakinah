// Monthly Reminder Modal - Shows rules reminder each month
import { X, AlertCircle, CheckCircle } from 'lucide-react'

const RULES = [
    'Pembayaran internet antara tanggal 1-10 setiap bulan',
    'Keterlambatan akan diberikan peringatan',
    'Tunggakan 3 bulan = pemutusan sementara',
    'Aktifkan kembali setelah pelunasan'
]

export default function ReminderModal({ onClose }) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 'var(--space-md)'
        }}>
            <div className="card" style={{
                maxWidth: '450px',
                width: '100%',
                animation: 'fadeIn 0.3s ease'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-lg)'
                }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <AlertCircle size={24} style={{ color: 'var(--color-warning)' }} />
                        Pengingat Bulanan
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '4px'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: 'var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-lg)'
                }}>
                    <p style={{
                        marginBottom: 'var(--space-md)',
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)'
                    }}>
                        📋 <strong>Peraturan Pembayaran Internet</strong>
                    </p>

                    <ul style={{
                        margin: 0,
                        paddingLeft: 'var(--space-lg)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-sm)'
                    }}>
                        {RULES.map((rule, i) => (
                            <li key={i} style={{ fontSize: '0.875rem' }}>{rule}</li>
                        ))}
                    </ul>
                </div>

                {/* Info */}
                <p className="text-muted" style={{
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    marginBottom: 'var(--space-lg)'
                }}>
                    Himbauan ini muncul setiap awal bulan sebagai pengingat.
                </p>

                {/* Button */}
                <button
                    onClick={onClose}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                >
                    <CheckCircle size={18} />
                    Saya Mengerti
                </button>
            </div>
        </div>
    )
}
