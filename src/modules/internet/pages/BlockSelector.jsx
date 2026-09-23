// Block Selector Page - Premium with PIN Protection
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wifi, ArrowRight, Lock, X, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { supabase } from '../config/supabase'

const PIN_STORAGE_KEY = 'griya_internet_pin'

// Get saved PINs from localStorage
function getSavedPins() {
    try {
        return JSON.parse(localStorage.getItem(PIN_STORAGE_KEY) || '{}')
    } catch { return {} }
}

function savePinForBlock(blockId, pin) {
    const saved = getSavedPins()
    saved[blockId] = pin
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(saved))
}

function hasSavedPin(blockId) {
    return !!getSavedPins()[blockId]
}

function getSavedPin(blockId) {
    return getSavedPins()[blockId] || ''
}

export default function BlockSelector() {
    const navigate = useNavigate()
    const [showPinModal, setShowPinModal] = useState(false)
    const [selectedBlock, setSelectedBlock] = useState(null)
    const [pin, setPin] = useState(['', '', '', ''])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const inputRefs = useRef([])

    const blocks = [
        {
            id: 'A',
            label: 'Blok A',
            subtitle: 'Perumahan Griya Sakinah',
            emoji: '🏠',
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            path: '/blok-a/internet'
        },
        {
            id: 'B',
            label: 'Blok B',
            subtitle: 'Perumahan Griya Sakinah',
            emoji: '🏡',
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            path: '/blok-b/internet'
        }
    ]

    const handleBlockClick = async (block) => {
        // Check if PIN is already saved in localStorage
        if (hasSavedPin(block.id)) {
            // Verify saved PIN is still valid
            setLoading(true)
            try {
                const savedPin = getSavedPin(block.id)
                const isValid = await verifyPin(block.id, savedPin)
                if (isValid) {
                    navigate(block.path)
                    return
                }
                // PIN no longer valid, clear it and ask again
                const saved = getSavedPins()
                delete saved[block.id]
                localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(saved))
            } catch {
                // Network error, try anyway with saved PIN
            } finally {
                setLoading(false)
            }
        }

        // Show PIN modal
        setSelectedBlock(block)
        setPin(['', '', '', ''])
        setError('')
        setShowPinModal(true)

        // Focus first input after render
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }

    const verifyPin = async (blockId, pinCode) => {
        if (!supabase) return false
        const key = `pin_blok_${blockId.toLowerCase()}`
        const { data, error } = await supabase
            .from('internet_settings')
            .select('value')
            .eq('key', key)
            .single()

        if (error || !data) return false
        return data.value === pinCode
    }

    const handlePinSubmit = async () => {
        const pinCode = pin.join('')
        if (pinCode.length < 4) {
            setError('Masukkan 4 digit kode akses')
            return
        }

        setLoading(true)
        setError('')

        try {
            const isValid = await verifyPin(selectedBlock.id, pinCode)
            if (isValid) {
                savePinForBlock(selectedBlock.id, pinCode)
                setShowSuccess(true)
                setTimeout(() => {
                    navigate(selectedBlock.path)
                }, 800)
            } else {
                setError('Kode akses salah')
                setPin(['', '', '', ''])
                setTimeout(() => inputRefs.current[0]?.focus(), 100)
            }
        } catch (err) {
            setError('Gagal verifikasi. Coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const handlePinInput = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return

        const newPin = [...pin]
        newPin[index] = value
        setPin(newPin)
        setError('')

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all 4 digits entered
        if (value && index === 3 && newPin.every(d => d !== '')) {
            setTimeout(() => {
                const pinCode = newPin.join('')
                if (pinCode.length === 4) {
                    handlePinSubmitDirect(newPin)
                }
            }, 150)
        }
    }

    const handlePinSubmitDirect = async (pinArr) => {
        const pinCode = pinArr.join('')
        setLoading(true)
        setError('')

        try {
            const isValid = await verifyPin(selectedBlock.id, pinCode)
            if (isValid) {
                savePinForBlock(selectedBlock.id, pinCode)
                setShowSuccess(true)
                setTimeout(() => navigate(selectedBlock.path), 800)
            } else {
                setError('Kode akses salah')
                setPin(['', '', '', ''])
                setTimeout(() => inputRefs.current[0]?.focus(), 100)
            }
        } catch {
            setError('Gagal verifikasi. Coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        if (e.key === 'Enter') {
            handlePinSubmit()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
        if (pasted.length > 0) {
            const newPin = ['', '', '', '']
            pasted.split('').forEach((char, i) => { newPin[i] = char })
            setPin(newPin)
            if (pasted.length === 4) {
                setTimeout(() => handlePinSubmitDirect(newPin), 150)
            } else {
                inputRefs.current[pasted.length]?.focus()
            }
        }
    }

    return (
        <div className="block-selector-page">
            {/* Background decorations */}
            <div className="block-selector-bg">
                <div className="block-selector-orb block-selector-orb-1" />
                <div className="block-selector-orb block-selector-orb-2" />
                <div className="block-selector-orb block-selector-orb-3" />
            </div>

            <div className="block-selector-container">
                {/* Header */}
                <div className="block-selector-header">
                    <div className="block-selector-logo">
                        <Wifi size={28} />
                    </div>
                    <h1 className="block-selector-title">Internet Sakinah</h1>
                    <p className="block-selector-subtitle">
                        Pilih blok perumahan Anda untuk melihat dashboard transparansi keuangan internet
                    </p>
                </div>

                {/* Block Cards */}
                <div className="block-selector-grid">
                    {blocks.map(block => (
                        <button
                            key={block.id}
                            className="block-selector-card"
                            onClick={() => handleBlockClick(block)}
                            disabled={loading}
                            style={{ '--block-color': block.color }}
                        >
                            <div className="block-selector-card-header" style={{ background: block.gradient }}>
                                <div className="block-selector-card-emoji">{block.emoji}</div>
                                <span className="block-selector-card-id">{block.label}</span>
                            </div>
                            <div className="block-selector-card-body">
                                <p className="block-selector-card-subtitle">{block.subtitle}</p>
                                <div className="block-selector-card-action">
                                    <div className="block-selector-card-action-left">
                                        <Lock size={14} />
                                        <span>Masuk Dashboard</span>
                                    </div>
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                            {hasSavedPin(block.id) && (
                                <div className="block-selector-card-saved">
                                    <ShieldCheck size={12} />
                                    <span>Tersimpan</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Admin link */}
                <div className="block-selector-footer">
                    <button
                        className="block-selector-admin-link"
                        onClick={() => navigate('/internet/admin/login')}
                    >
                        🔐 Login Admin
                    </button>
                </div>
            </div>

            {/* PIN Modal */}
            {showPinModal && (
                <div className="pin-modal-overlay" onClick={() => !loading && setShowPinModal(false)}>
                    <div
                        className={`pin-modal ${showSuccess ? 'pin-modal-success' : ''}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            className="pin-modal-close"
                            onClick={() => setShowPinModal(false)}
                            disabled={loading}
                        >
                            <X size={18} />
                        </button>

                        {showSuccess ? (
                            <div className="pin-modal-success-content">
                                <div className="pin-modal-success-icon">
                                    <ShieldCheck size={40} />
                                </div>
                                <h3>Akses Diberikan!</h3>
                                <p>Mengalihkan ke Dashboard {selectedBlock?.label}...</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="pin-modal-header">
                                    <div
                                        className="pin-modal-badge"
                                        style={{ background: selectedBlock?.gradient }}
                                    >
                                        <Lock size={20} />
                                    </div>
                                    <h3 className="pin-modal-title">Kode Akses {selectedBlock?.label}</h3>
                                    <p className="pin-modal-desc">
                                        Masukkan 4 digit kode akses untuk melihat dashboard
                                    </p>
                                </div>

                                {/* PIN Input */}
                                <div className="pin-input-group" onPaste={handlePaste}>
                                    {pin.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={el => inputRefs.current[i] = el}
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={1}
                                            className={`pin-input ${error ? 'pin-input-error' : ''} ${digit ? 'pin-input-filled' : ''}`}
                                            value={digit}
                                            onChange={e => handlePinInput(i, e.target.value)}
                                            onKeyDown={e => handleKeyDown(i, e)}
                                            disabled={loading}
                                            autoComplete="off"
                                        />
                                    ))}
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="pin-modal-error">
                                        <span>⚠️ {error}</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    className="pin-modal-submit"
                                    onClick={handlePinSubmit}
                                    disabled={loading || pin.some(d => !d)}
                                    style={{ background: selectedBlock?.gradient }}
                                >
                                    {loading ? (
                                        <span className="pin-modal-loading">Memverifikasi...</span>
                                    ) : (
                                        <>
                                            <ShieldCheck size={16} />
                                            <span>Verifikasi</span>
                                        </>
                                    )}
                                </button>

                                <p className="pin-modal-hint">
                                    Hubungi admin blok Anda jika belum memiliki kode akses
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
