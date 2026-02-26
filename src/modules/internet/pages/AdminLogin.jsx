// Admin Login Page
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function AdminLogin() {
    const navigate = useNavigate()
    const { signIn, isAuthenticated } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/internet/admin')
        }
    }, [isAuthenticated, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            await signIn(formData.email, formData.password)
            navigate('/internet/admin')
        } catch (err) {
            console.error('Login error:', err)
            if (err.message.includes('Invalid')) {
                setError('Email atau password salah')
            } else {
                setError(err.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <Shield size={36} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-sm)' }}>
                        Admin Login
                    </h1>
                    <p className="text-muted">
                        Griya Sakinah Internet Management
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)',
                            marginBottom: 'var(--space-lg)',
                            color: 'var(--color-danger)',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)'
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="admin@griyasakinah.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            <>
                                <Shield size={18} />
                                Login
                            </>
                        )}
                    </button>
                </form>

                <div style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-xl)',
                    paddingTop: 'var(--space-lg)',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <Link to="/internet" className="text-muted" style={{ fontSize: '0.875rem' }}>
                        ← Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
