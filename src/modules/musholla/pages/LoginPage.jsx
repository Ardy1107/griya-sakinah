import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { signIn } from '../lib/supabase';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error } = await signIn(email, password);

            if (error) {
                setError(error.message || 'Login gagal. Periksa email dan password.');
            } else if (data?.user) {
                navigate('/musholla/admin');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Coba lagi.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div
                className="glass-light"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '40px',
                    borderRadius: 'var(--radius-xl)'
                }}
            >
                {/* Header */}
                <div className="text-center mb-xl">
                    <div
                        style={{
                            width: 72,
                            height: 72,
                            margin: '0 auto 16px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, var(--islamic-green-light), var(--islamic-green))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(5, 150, 105, 0.4)'
                        }}
                    >
                        <span style={{ fontSize: '36px' }}>🕌</span>
                    </div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '8px'
                    }}>
                        Admin Login
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Musholla As-Sakinah
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div
                        className="flex items-center gap-sm"
                        style={{
                            padding: '12px 16px',
                            background: 'rgba(225, 29, 72, 0.1)',
                            border: '1px solid rgba(225, 29, 72, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '20px',
                            color: 'var(--danger)'
                        }}
                    >
                        <AlertCircle size={18} />
                        <span style={{ fontSize: '14px' }}>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label
                            className="form-label"
                            style={{ marginBottom: '8px', display: 'block' }}
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            className="input"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label
                            className="form-label"
                            style={{ marginBottom: '8px', display: 'block' }}
                        >
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: '48px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={loading || !email || !password}
                        style={{ width: '100%' }}
                    >
                        <LogIn size={18} />
                        Masuk
                    </Button>
                </form>

                {/* Back Link */}
                <div className="text-center" style={{ marginTop: '24px' }}>
                    <a
                        href="/musholla"
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '14px',
                            textDecoration: 'none'
                        }}
                    >
                        ← Kembali ke Dashboard Publik
                    </a>
                </div>

                {/* SuperAdmin Quick Access */}
                <div style={{
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '12px',
                        textAlign: 'center',
                        marginBottom: '12px'
                    }}>
                        Atau masuk via Admin Portal
                    </p>
                    <a
                        href="/admin"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '12px 16px',
                            background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                            color: 'white',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        🔐 Login sebagai SuperAdmin
                    </a>
                </div>
            </div>
        </div>
    );
}
