import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useSuperadmin } from '../../contexts/SuperadminContext';
import './SuperadminPortal.css';

export default function SuperadminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useSuperadmin();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = login(username, password);

        if (result.success) {
            navigate('/superadmin');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="superadmin-login">
            <div className="login-container">
                <div className="login-card">
                    {/* Logo */}
                    <div className="login-logo">
                        <div className="logo-icon">
                            <Shield size={32} />
                        </div>
                        <h1>Superadmin Portal</h1>
                        <p>Griya Sakinah Management System</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukkan username"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-input">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="demo-credentials">
                        <p>Demo Credentials:</p>
                        <div className="credential-row">
                            <span className="label">Superadmin:</span>
                            <code>superadmin / super123</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
