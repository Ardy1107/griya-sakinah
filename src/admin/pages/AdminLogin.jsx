import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAdminAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!username || !password) {
            setError('Username dan password harus diisi');
            setIsLoading(false);
            return;
        }

        const result = await login(username, password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="admin-login-page">
            <div className="login-background">
                <div className="bg-shape bg-shape-1"></div>
                <div className="bg-shape bg-shape-2"></div>
                <div className="bg-shape bg-shape-3"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-icon">
                            <Shield size={32} />
                        </div>
                        <h1>Admin Portal</h1>
                        <p>Portal Griya Sakinah</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="login-error">
                                <AlertCircle size={16} />
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
                                autoComplete="username"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="spinner" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <Shield size={20} />
                                    <span>Masuk ke Admin Portal</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <a href="/" className="back-link">
                            ← Kembali ke Portal
                        </a>
                    </div>

                    <div className="demo-credentials">
                        <p><strong>Demo Access:</strong></p>
                        <code>superadmin / admin123</code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
