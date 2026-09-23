import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, LogIn, ArrowLeft, Shield, User, Lock, Delete } from 'lucide-react';
import './Login.css';

const Login = () => {
    const { login, loginWithPin, loginAsDeveloper, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedMode, setSelectedMode] = useState(null); // 'admin' | 'developer'
    const pinInputRef = useRef(null);

    const PIN_LENGTH = 4;

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/angsuran/admin/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Focus pin input when admin mode selected
    useEffect(() => {
        if (selectedMode === 'admin' && pinInputRef.current) {
            pinInputRef.current.focus();
        }
    }, [selectedMode]);

    // Auto-submit when PIN is complete
    useEffect(() => {
        if (pin.length === PIN_LENGTH && selectedMode === 'admin') {
            handlePinSubmit();
        }
    }, [pin]);

    const handlePinDigit = (digit) => {
        if (pin.length < PIN_LENGTH) {
            setPin(prev => prev + digit);
            setError('');
        }
    };

    const handlePinDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError('');
    };

    const handlePinSubmit = async () => {
        if (pin.length !== PIN_LENGTH) return;

        setLoading(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 300));

        const result = await loginWithPin(pin);
        if (!result.success) {
            setError(result.error);
            setPin('');
        }

        setLoading(false);
    };

    const handleDeveloperLogin = async () => {
        setLoading(true);
        setError('');

        await new Promise(resolve => setTimeout(resolve, 300));

        const result = await loginAsDeveloper();
        if (!result.success) {
            setError(result.error);
        }

        setLoading(false);
    };

    // Hidden PIN input for keyboard support
    const handleKeyDown = (e) => {
        if (selectedMode !== 'admin') return;

        if (e.key >= '0' && e.key <= '9') {
            handlePinDigit(e.key);
        } else if (e.key === 'Backspace') {
            handlePinDelete();
        }
    };

    // Mode selection screen
    if (!selectedMode) {
        return (
            <div className="login-container" onKeyDown={handleKeyDown}>
                <div className="login-background">
                    <div className="login-gradient"></div>
                    <div className="login-pattern"></div>
                </div>

                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <Home size={32} />
                        </div>
                        <h1>Griya Sakinah</h1>
                        <p>Sistem Pembayaran Angsuran</p>
                    </div>

                    <div className="mode-selector">
                        <p className="mode-label">Masuk sebagai:</p>

                        <button
                            className="mode-card admin"
                            onClick={() => setSelectedMode('admin')}
                        >
                            <div className="mode-icon admin">
                                <Shield size={28} />
                            </div>
                            <div className="mode-info">
                                <span className="mode-title">Admin</span>
                                <span className="mode-desc">Masuk dengan PIN</span>
                            </div>
                            <LogIn size={20} className="mode-arrow" />
                        </button>

                        <button
                            className="mode-card developer"
                            onClick={handleDeveloperLogin}
                            disabled={loading}
                        >
                            <div className="mode-icon developer">
                                <User size={28} />
                            </div>
                            <div className="mode-info">
                                <span className="mode-title">Developer</span>
                                <span className="mode-desc">Masuk langsung</span>
                            </div>
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                <LogIn size={20} className="mode-arrow" />
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="login-error">
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="login-footer">
                        <Link to="/" className="portal-link">
                            <ArrowLeft size={16} />
                            Kembali ke Portal Griya Sakinah
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Admin PIN entry screen
    return (
        <div className="login-container" tabIndex={0} onKeyDown={handleKeyDown}>
            <div className="login-background">
                <div className="login-gradient"></div>
                <div className="login-pattern"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <Lock size={28} />
                    </div>
                    <h1>Masukkan PIN</h1>
                    <p>Masukkan 4 digit PIN admin</p>
                </div>

                {error && (
                    <div className="login-error">
                        <span>{error}</span>
                    </div>
                )}

                {/* PIN Dots */}
                <div className="pin-dots">
                    {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                        <div
                            key={i}
                            className={`pin-dot ${i < pin.length ? 'filled' : ''} ${loading ? 'loading' : ''}`}
                        />
                    ))}
                </div>

                {/* Hidden input for mobile keyboard */}
                <input
                    ref={pinInputRef}
                    type="tel"
                    className="pin-hidden-input"
                    value={pin}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
                        setPin(val);
                        setError('');
                    }}
                    maxLength={PIN_LENGTH}
                    autoFocus
                    inputMode="numeric"
                    pattern="[0-9]*"
                />

                {/* Numpad */}
                <div className="pin-numpad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                        <button
                            key={digit}
                            className="numpad-btn"
                            onClick={() => handlePinDigit(String(digit))}
                            disabled={loading || pin.length >= PIN_LENGTH}
                            type="button"
                        >
                            {digit}
                        </button>
                    ))}
                    <button
                        className="numpad-btn back-btn"
                        onClick={() => setSelectedMode(null)}
                        type="button"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <button
                        className="numpad-btn"
                        onClick={() => handlePinDigit('0')}
                        disabled={loading || pin.length >= PIN_LENGTH}
                        type="button"
                    >
                        0
                    </button>
                    <button
                        className="numpad-btn delete-btn"
                        onClick={handlePinDelete}
                        disabled={loading || pin.length === 0}
                        type="button"
                    >
                        <Delete size={20} />
                    </button>
                </div>

                <div className="login-footer">
                    <Link to="/" className="portal-link">
                        <ArrowLeft size={16} />
                        Kembali ke Portal
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
