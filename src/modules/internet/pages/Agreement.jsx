// Digital Agreement Page - Internet Sakinah
// Users select their name and sign digital agreement
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Check, AlertCircle, Loader2, PenTool, RotateCcw, ChevronDown, Download } from 'lucide-react'
import Header from '../components/Header'
import { useResidents } from '../hooks/useSupabase'
import { useBlock } from '../context/BlockContext'
import { supabase } from '../config/supabase'
import { downloadAgreementPDF } from '../utils/agreementPdf'

// Agreement rules/peraturan
const AGREEMENT_RULES = [
    {
        id: 1,
        text: 'Pembayaran internet wajib dilakukan antara tanggal 1 sampai tanggal 10 di setiap bulannya.'
    },
    {
        id: 2,
        text: 'Pembayaran bulanan harus dipatuhi sesuai dengan jadwal yang telah ditetapkan oleh pengelola.'
    },
    {
        id: 3,
        text: 'Keterlambatan pembayaran yang melewati tanggal 10 akan diberikan peringatan terlebih dahulu.'
    },
    {
        id: 4,
        text: 'Apabila tunggakan mencapai 3 bulan, sambungan internet akan diputus sementara secara otomatis.'
    },
    {
        id: 5,
        text: 'Layanan internet hanya akan diaktifkan kembali setelah seluruh total tunggakan dilunasi sepenuhnya.'
    },
    {
        id: 6,
        text: 'Gangguan teknis atau kerusakan perangkat harus segera dilaporkan kepada admin/pengelola untuk penanganan lebih lanjut.'
    },
    {
        id: 7,
        text: 'Dengan menandatangani dokumen ini, warga dianggap setuju dan tunduk pada seluruh peraturan yang berlaku.'
    }
]

export default function Agreement() {
    const { residents } = useResidents()
    const { blockId, blockName, isBlockSpecific, urlPrefix } = useBlock()

    const [selectedResident, setSelectedResident] = useState(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSignature, setHasSignature] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)
    const [existingAgreement, setExistingAgreement] = useState(null)
    const [checkingAgreement, setCheckingAgreement] = useState(false)
    const [downloadingPdf, setDownloadingPdf] = useState(false)

    const canvasRef = useRef(null)
    const ctxRef = useRef(null)

    // Initialize canvas when resident is selected (canvas becomes visible)
    useEffect(() => {
        // Small delay to ensure canvas is rendered
        const timer = setTimeout(() => {
            const canvas = canvasRef.current
            if (canvas && selectedResident && !existingAgreement) {
                const ctx = canvas.getContext('2d')
                ctx.strokeStyle = '#1e293b'
                ctx.lineWidth = 3
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
                ctxRef.current = ctx

                // Fill with white background
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                console.log('Canvas initialized:', canvas.width, canvas.height)
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [selectedResident, existingAgreement])

    // Check if resident already signed
    useEffect(() => {
        async function checkExistingAgreement() {
            if (!selectedResident) {
                setExistingAgreement(null)
                return
            }

            setCheckingAgreement(true)
            try {
                const { data, error } = await supabase
                    .from('internet_agreements')
                    .select('*')
                    .eq('resident_id', selectedResident.id)
                    .order('agreed_at', { ascending: false })
                    .limit(1)
                    .single()

                if (data && !error) {
                    setExistingAgreement(data)
                } else {
                    setExistingAgreement(null)
                }
            } catch (err) {
                setExistingAgreement(null)
            } finally {
                setCheckingAgreement(false)
            }
        }

        checkExistingAgreement()
    }, [selectedResident])

    // Drawing handlers - with proper coordinate scaling
    const getCanvasCoordinates = (e) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const clientX = e.clientX || e.touches?.[0]?.clientX
        const clientY = e.clientY || e.touches?.[0]?.clientY

        // Scale coordinates from CSS size to canvas resolution
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        }
    }

    const startDrawing = (e) => {
        if (existingAgreement) return

        const { x, y } = getCanvasCoordinates(e)

        ctxRef.current.beginPath()
        ctxRef.current.moveTo(x, y)
        setIsDrawing(true)
    }

    const draw = (e) => {
        if (!isDrawing || existingAgreement) return

        e.preventDefault()
        const { x, y } = getCanvasCoordinates(e)

        ctxRef.current.lineTo(x, y)
        ctxRef.current.stroke()
        setHasSignature(true)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearSignature = () => {
        const canvas = canvasRef.current
        const ctx = ctxRef.current
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
    }

    const handleSubmit = async () => {
        if (!selectedResident) {
            setError('Silakan pilih nama warga terlebih dahulu')
            return
        }

        if (!hasSignature) {
            setError('Silakan tanda tangan di area yang disediakan')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const canvas = canvasRef.current
            const signatureData = canvas.toDataURL('image/png')

            const { error: insertError } = await supabase
                .from('internet_agreements')
                .insert([{
                    resident_id: selectedResident.id,
                    blok_rumah: selectedResident.blok_rumah,
                    nama_warga: selectedResident.nama_warga,
                    signature_data: signatureData,
                    block_id: blockId || null,
                    user_agent: navigator.userAgent
                }])

            if (insertError) throw insertError

            setSuccess(true)
            setExistingAgreement({
                agreed_at: new Date().toISOString(),
                signature_data: signatureData
            })
        } catch (err) {
            setError(err.message || 'Gagal menyimpan persetujuan')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        if (!selectedResident || !existingAgreement) return

        setDownloadingPdf(true)
        try {
            await downloadAgreementPDF(selectedResident, existingAgreement, blockName)
        } catch (err) {
            setError('Gagal mengunduh PDF: ' + err.message)
        } finally {
            setDownloadingPdf(false)
        }
    }

    return (
        <div className="app-container">
            <Header />

            <main className="main-content">
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    {/* Header */}
                    <div className="card" style={{
                        textAlign: 'center',
                        marginBottom: 'var(--space-lg)',
                        background: 'linear-gradient(135deg, var(--bg-card), var(--bg-tertiary))'
                    }}>
                        <FileText size={48} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }} />
                        <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>
                            Peraturan Pembayaran Internet
                        </h1>
                        <p className="text-muted">
                            Perumahan Griya Sakinah {isBlockSpecific && `• ${blockName}`}
                        </p>
                    </div>

                    {/* Rules/Peraturan */}
                    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                        <h3 className="card-title" style={{ marginBottom: 'var(--space-lg)' }}>
                            📋 Ketentuan & Peraturan
                        </h3>

                        <ol style={{
                            paddingLeft: 'var(--space-lg)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-md)'
                        }}>
                            {AGREEMENT_RULES.map(rule => (
                                <li key={rule.id} style={{
                                    fontSize: '0.95rem',
                                    lineHeight: 1.6,
                                    color: 'var(--text-primary)'
                                }}>
                                    {rule.text}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Select Resident */}
                    <div className="card" style={{ marginBottom: 'var(--space-lg)', overflow: 'visible', position: 'relative', zIndex: 50 }}>
                        <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>
                            👤 Pilih Nama Anda
                        </h3>

                        <div style={{ position: 'relative', zIndex: 60 }}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="form-input"
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                {selectedResident ? (
                                    <span>
                                        <strong>{selectedResident.blok_rumah}</strong> - {selectedResident.nama_warga}
                                    </span>
                                ) : (
                                    <span className="text-muted">Pilih nama warga...</span>
                                )}
                                <ChevronDown size={18} />
                            </button>

                            {isDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    zIndex: 9999,
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                                }}>
                                    {residents.map(r => (
                                        <div
                                            key={r.id}
                                            onClick={() => {
                                                setSelectedResident(r)
                                                setIsDropdownOpen(false)
                                                setSuccess(false)
                                                clearSignature()
                                            }}
                                            style={{
                                                padding: 'var(--space-md)',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid var(--color-border)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            <strong>{r.blok_rumah}</strong> - {r.nama_warga}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Existing Agreement Notice */}
                        {checkingAgreement && (
                            <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-muted">Memeriksa status persetujuan...</span>
                            </div>
                        )}

                        {existingAgreement && !checkingAgreement && (
                            <div style={{
                                marginTop: 'var(--space-md)',
                                padding: 'var(--space-md)',
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid var(--color-success)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-sm)'
                            }}>
                                <Check size={20} style={{ color: 'var(--color-success)' }} />
                                <div>
                                    <strong style={{ color: 'var(--color-success)' }}>Sudah Menyetujui</strong>
                                    <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '2px' }}>
                                        Ditandatangani pada {new Date(existingAgreement.agreed_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="btn btn-secondary btn-sm"
                                        style={{ marginTop: 'var(--space-sm)' }}
                                        disabled={downloadingPdf}
                                    >
                                        {downloadingPdf ? (
                                            <><Loader2 size={14} className="animate-spin" /> Mengunduh...</>
                                        ) : (
                                            <><Download size={14} /> Download PDF</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Signature Canvas */}
                    {selectedResident && !existingAgreement && (
                        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                                <h3 className="card-title" style={{ marginBottom: 0 }}>
                                    <PenTool size={18} style={{ marginRight: '8px' }} />
                                    Tanda Tangan Digital
                                </h3>
                                <button
                                    onClick={clearSignature}
                                    className="btn btn-secondary btn-sm"
                                    disabled={!hasSignature}
                                >
                                    <RotateCcw size={14} />
                                    Hapus
                                </button>
                            </div>

                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--space-md)' }}>
                                Silakan tanda tangan di kotak di bawah menggunakan mouse atau jari (di layar sentuh)
                            </p>

                            <div style={{
                                border: '2px dashed var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                background: '#ffffff'
                            }}>
                                <canvas
                                    ref={canvasRef}
                                    width={650}
                                    height={200}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        cursor: 'crosshair',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                            </div>

                            {!hasSignature && (
                                <p className="text-muted" style={{
                                    textAlign: 'center',
                                    marginTop: 'var(--space-sm)',
                                    fontSize: '0.875rem'
                                }}>
                                    ↑ Area tanda tangan
                                </p>
                            )}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: 'var(--space-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--color-danger)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)'
                        }}>
                            <AlertCircle size={20} style={{ color: 'var(--color-danger)' }} />
                            <span style={{ color: 'var(--color-danger)' }}>{error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div style={{
                            padding: 'var(--space-lg)',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid var(--color-success)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-lg)',
                            textAlign: 'center'
                        }}>
                            <Check size={48} style={{ color: 'var(--color-success)', marginBottom: 'var(--space-md)' }} />
                            <h3 style={{ color: 'var(--color-success)', marginBottom: 'var(--space-sm)' }}>
                                Persetujuan Berhasil Disimpan!
                            </h3>
                            <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                                Terima kasih, {selectedResident?.nama_warga}. Persetujuan Anda telah tercatat.
                            </p>
                            <button
                                onClick={handleDownloadPDF}
                                className="btn btn-primary"
                                disabled={downloadingPdf}
                            >
                                {downloadingPdf ? (
                                    <><Loader2 size={16} className="animate-spin" /> Mengunduh...</>
                                ) : (
                                    <><Download size={16} /> Download Bukti Persetujuan (PDF)</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Submit Button */}
                    {selectedResident && !existingAgreement && !success && (
                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%' }}
                            disabled={loading || !hasSignature}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    Saya Setuju & Tanda Tangan
                                </>
                            )}
                        </button>
                    )}

                    {/* Back Link */}
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
                        <Link to={urlPrefix} className="text-muted" style={{ fontSize: '0.875rem' }}>
                            ← Kembali ke Dashboard
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <p className="footer-text">
                    © {new Date().getFullYear()} Griya Sakinah Internet Management
                </p>
            </footer>
        </div>
    )
}
