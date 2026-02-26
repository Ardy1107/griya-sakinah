import { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * ModuleErrorBoundary — catches runtime errors within a module
 * and shows a friendly fallback UI instead of crashing the entire portal.
 */
export default class ModuleErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            const moduleName = this.props.moduleName || 'Modul';

            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    padding: '2rem',
                    fontFamily: 'Inter, system-ui, sans-serif'
                }}>
                    <div style={{
                        maxWidth: '440px',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '20px',
                        padding: '3rem 2rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{
                            color: '#f1f5f9',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            marginBottom: '0.75rem'
                        }}>
                            Oops! {moduleName} Error
                        </h2>
                        <p style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.95rem',
                            lineHeight: 1.6,
                            marginBottom: '2rem'
                        }}>
                            Terjadi kesalahan pada modul {moduleName}.
                            Modul lain tetap berfungsi normal.
                        </p>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                aria-label={`Coba muat ulang modul ${moduleName}`}
                            >
                                🔄 Coba Lagi
                            </button>
                            <Link
                                to="/"
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#94a3b8',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s'
                                }}
                                aria-label="Kembali ke halaman utama"
                            >
                                🏠 Ke Beranda
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
