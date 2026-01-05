// Resident Form - Compact inline version
import { useState } from 'react'
import { User, Home, Phone, Loader2, Check, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useAdminOperations } from '../hooks/useSupabase'
import { validatePhoneNumber } from '../utils/helpers'

export default function ResidentForm({ onSuccess }) {
    const { createResident, loading } = useAdminOperations()
    const [isExpanded, setIsExpanded] = useState(false)

    const [formData, setFormData] = useState({
        blok_rumah: '',
        nama_warga: '',
        no_whatsapp: ''
    })

    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError(null)
        setSuccess(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        // Validation
        if (!formData.blok_rumah.trim()) {
            setError('Blok rumah wajib diisi')
            return
        }

        if (!formData.nama_warga.trim()) {
            setError('Nama warga wajib diisi')
            return
        }

        if (formData.no_whatsapp && !validatePhoneNumber(formData.no_whatsapp)) {
            setError('Format nomor WhatsApp tidak valid')
            return
        }

        try {
            await createResident({
                blok_rumah: formData.blok_rumah.trim().toUpperCase(),
                nama_warga: formData.nama_warga.trim(),
                no_whatsapp: formData.no_whatsapp.trim() || null
            })

            setSuccess(true)
            setFormData({
                blok_rumah: '',
                nama_warga: '',
                no_whatsapp: ''
            })
            setIsExpanded(false)

            if (onSuccess) onSuccess()

            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            if (err.message.includes('duplicate') || err.message.includes('unique')) {
                setError('Blok rumah sudah terdaftar')
            } else {
                setError(err.message)
            }
        }
    }

    return (
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            {/* Compact Header - Click to expand */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md) var(--space-lg)',
                    cursor: 'pointer',
                    background: isExpanded ? 'transparent' : 'var(--bg-tertiary)',
                    borderRadius: isExpanded ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <Plus size={18} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600 }}>Tambah Warga</span>
                </div>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {/* Expandable Form */}
            {isExpanded && (
                <form onSubmit={handleSubmit} style={{ padding: 'var(--space-md) var(--space-lg) var(--space-lg)' }}>
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-sm) var(--space-md)',
                            marginBottom: 'var(--space-md)',
                            color: 'var(--color-danger)',
                            fontSize: '0.8rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-sm) var(--space-md)',
                            marginBottom: 'var(--space-md)',
                            color: 'var(--color-success)',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)'
                        }}>
                            <Check size={14} />
                            Berhasil!
                        </div>
                    )}

                    {/* Compact inline inputs */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr 140px auto',
                        gap: 'var(--space-sm)',
                        alignItems: 'center'
                    }}>
                        <div style={{ position: 'relative' }}>
                            <Home size={14} style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }} />
                            <input
                                type="text"
                                name="blok_rumah"
                                value={formData.blok_rumah}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Blok"
                                style={{ paddingLeft: '32px', fontSize: '0.875rem' }}
                                required
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <User size={14} style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }} />
                            <input
                                type="text"
                                name="nama_warga"
                                value={formData.nama_warga}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Nama warga"
                                style={{ paddingLeft: '32px', fontSize: '0.875rem' }}
                                required
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Phone size={14} style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }} />
                            <input
                                type="tel"
                                name="no_whatsapp"
                                value={formData.no_whatsapp}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="WhatsApp"
                                style={{ paddingLeft: '32px', fontSize: '0.875rem' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={loading}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
