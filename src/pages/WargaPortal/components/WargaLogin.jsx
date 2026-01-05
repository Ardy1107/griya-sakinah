// Warga Login Component
import { useState } from 'react'
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react'

export default function WargaLogin({ onLogin, onClose, onGuestMode }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            setError('Email dan password harus diisi')
            return
        }

        setLoading(true)
        setError('')

        const result = await onLogin(email, password)

        if (result.error) {
            setError(result.error.message || 'Login gagal')
        }

        setLoading(false)
    }

    return (
        <div className="warga-login-overlay">
            <div className="warga-login-modal">
                <div className="warga-login-header">
                    <div className="warga-login-icon">
                        <User size={28} />
                    </div>
                    <h2>Login Warga</h2>
                    <p>Masuk untuk akses dashboard personal</p>
                </div>

                <form onSubmit={handleSubmit} className="warga-login-form">
                    {error && (
                        <div className="warga-login-error">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="warga-input-group">
                        <Mail className="warga-input-icon" size={18} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="warga-input"
                        />
                    </div>

                    <div className="warga-input-group">
                        <Lock className="warga-input-icon" size={18} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="warga-input"
                        />
                        <button
                            type="button"
                            className="warga-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="warga-login-btn primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading-spinner" />
                        ) : (
                            <>
                                <LogIn size={18} />
                                Masuk
                            </>
                        )}
                    </button>
                </form>

                <div className="warga-login-divider">
                    <span>atau</span>
                </div>

                <button
                    type="button"
                    className="warga-login-btn secondary"
                    onClick={onGuestMode}
                >
                    Lanjut Tanpa Login
                </button>

                <p className="warga-login-note">
                    Belum punya akun? Hubungi admin perumahan
                </p>
            </div>
        </div>
    )
}
