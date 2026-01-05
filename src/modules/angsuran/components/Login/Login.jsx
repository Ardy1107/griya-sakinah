import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import './Login.css';

const Login = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Secret long-press login
    const pressTimerRef = useRef(null);
    const [isSecretLoading, setIsSecretLoading] = useState(false);

    // Redirect if already authenticated (including superadmin SSO)
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/angsuran');
        }
    }, [isAuthenticated, navigate]);

    // Secret login - hold logo for 3 seconds
    const handleLogoPress = () => {
        pressTimerRef.current = setTimeout(async () => {
            setIsSecretLoading(true);
            // Auto-login as devi
            const result = await login('devi', 'sakinah2026');
            if (result.success) {
                navigate('/angsuran/admin/dashboard');
            }
            setIsSecretLoading(false);
        }, 3000);
    };

    const handleLogoRelease = () => {
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate slight delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = await login(username, password);

        if (!result.success) {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-gradient"></div>
                <div className="login-pattern"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <div
                        className={`login-logo ${isSecretLoading ? 'secret-loading' : ''}`}
                        onMouseDown={handleLogoPress}
                        onMouseUp={handleLogoRelease}
                        onMouseLeave={handleLogoRelease}
                        onTouchStart={handleLogoPress}
                        onTouchEnd={handleLogoRelease}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                        <Home size={32} />
                    </div>
                    <h1>Griya Sakinah</h1>
                    <p>Sistem Pembayaran Angsuran</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Masukkan username"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>Masuk</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <div className="credentials-list">
                        <span><strong>User:</strong> devi</span>
                        <span><strong>Pass:</strong> sakinah2026</span>
                    </div>
                    <Link to="/" className="portal-link">
                        <ArrowLeft size={16} />
                        Kembali ke Portal Griya Sakinah
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
