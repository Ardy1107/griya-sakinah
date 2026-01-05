// WhatsApp Share Component
import { MessageCircle, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { generateWhatsAppUrl, generateReceiptMessage } from '../utils/helpers'

export default function WhatsAppShare({ resident, payment, receiptUrl }) {
    const [copied, setCopied] = useState(false)

    if (!resident?.no_whatsapp) {
        return (
            <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.875rem'
            }}>
                Nomor WhatsApp tidak tersedia
            </div>
        )
    }

    const message = generateReceiptMessage(resident, payment, receiptUrl || 'Kwitansi dalam proses')
    const whatsappUrl = generateWhatsAppUrl(resident.no_whatsapp, message)

    const copyMessage = async () => {
        try {
            await navigator.clipboard.writeText(message)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <div style={{
            background: 'rgba(37, 211, 102, 0.1)',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)'
        }}>
            <h4 style={{
                color: '#25d366',
                marginBottom: 'var(--space-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                fontSize: '0.9375rem'
            }}>
                <MessageCircle size={18} />
                Kirim ke WhatsApp
            </h4>

            {/* Preview */}
            <div style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-md)',
                fontSize: '0.8125rem',
                whiteSpace: 'pre-wrap',
                maxHeight: '150px',
                overflow: 'auto'
            }}>
                {message}
            </div>

            {/* Actions */}
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success"
                    style={{
                        background: '#25d366',
                        flex: 1
                    }}
                >
                    <MessageCircle size={16} />
                    Kirim WhatsApp
                    <ExternalLink size={14} />
                </a>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={copyMessage}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Disalin!' : 'Salin'}
                </button>
            </div>

            <p className="text-muted mt-2" style={{ fontSize: '0.75rem', textAlign: 'center' }}>
                Akan membuka WhatsApp dengan pesan otomatis
            </p>
        </div>
    )
}
