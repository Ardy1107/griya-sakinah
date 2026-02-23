/**
 * Takjil Admin - Edit Schedule + Completion Tracker
 * All data stored in Supabase for real-time updates
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, Shield, Eye, EyeOff, AlertCircle,
    CheckCircle, XCircle, BarChart3, Save, X, Edit2,
    Loader2, RefreshCw, Share2, Copy, Check
} from 'lucide-react';
import { supabaseMusholla as supabase } from '../../lib/supabaseMusholla';
import './TakjilAdmin.css';

const ADMIN_PASSWORD = 'takjil2026';
const COLS = ['nasi1', 'nasi2', 'takjil', 'minuman'];
const COL_LABELS = { nasi1: '🍱 Nasi 1', nasi2: '🍱 Nasi 2', takjil: '🧁 Takjil', minuman: '🥤 Minuman' };

const TakjilAdmin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState('');
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [editCell, setEditCell] = useState(null);
    const [editNama, setEditNama] = useState('');
    const [editBlok, setEditBlok] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        try {
            const ssoSession = localStorage.getItem('superadmin_session');
            if (ssoSession) {
                const parsed = JSON.parse(ssoSession);
                if (parsed.expiry > Date.now() && parsed.user) {
                    setIsAuthenticated(true);
                    return;
                }
            }
        } catch (e) { /* ignore */ }

        const auth = sessionStorage.getItem('takjil_admin_auth');
        if (auth === 'true') setIsAuthenticated(true);
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchSchedule();
    }, [isAuthenticated]);

    async function fetchSchedule() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('takjil_schedule')
                .select('*')
                .order('no', { ascending: true });
            if (error) throw error;
            setSchedule(data || []);
        } catch (err) {
            console.error('Error fetching schedule:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('takjil_admin_auth', 'true');
            setAuthError('');
        } else {
            setAuthError('Password salah!');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('takjil_admin_auth');
    };

    // Toggle completion status
    const toggleDone = async (row, col) => {
        const field = `${col}_done`;
        const newVal = !row[field];
        const key = `${row.id}-${col}`;
        setSaving(key);
        try {
            const { error } = await supabase
                .from('takjil_schedule')
                .update({ [field]: newVal, updated_at: new Date().toISOString() })
                .eq('id', row.id);
            if (error) throw error;
            setSchedule(prev => prev.map(r => r.id === row.id ? { ...r, [field]: newVal } : r));
        } catch (err) {
            console.error('Error toggling done:', err);
        } finally {
            setSaving(null);
        }
    };

    // Start editing a cell
    const startEdit = (row, col) => {
        setEditCell({ id: row.id, col });
        setEditNama(row[`${col}_nama`] || '');
        setEditBlok(row[`${col}_blok`] || '');
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditCell(null);
        setEditNama('');
        setEditBlok('');
    };

    // Save cell edit to Supabase
    const saveEdit = async () => {
        if (!editCell) return;
        const { id, col } = editCell;
        const key = `${id}-edit`;
        setSaving(key);
        try {
            const { error } = await supabase
                .from('takjil_schedule')
                .update({
                    [`${col}_nama`]: editNama || null,
                    [`${col}_blok`]: editBlok || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);
            if (error) throw error;
            setSchedule(prev => prev.map(r =>
                r.id === id
                    ? { ...r, [`${col}_nama`]: editNama || null, [`${col}_blok`]: editBlok || null }
                    : r
            ));
            cancelEdit();
        } catch (err) {
            console.error('Error saving edit:', err);
        } finally {
            setSaving(null);
        }
    };

    const handleShareLink = () => {
        const url = `${window.location.origin}/komunitas/takjil`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Stats
    const totalCells = schedule.reduce((count, row) => {
        COLS.forEach(col => {
            if (row[`${col}_nama`]) count++;
        });
        return count;
    }, 0);
    const completedCount = schedule.reduce((count, row) => {
        COLS.forEach(col => {
            if (row[`${col}_done`] && row[`${col}_nama`]) count++;
        });
        return count;
    }, 0);
    const percentage = totalCells > 0 ? Math.round((completedCount / totalCells) * 100) : 0;

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="takjil-login">
                <div className="login-card">
                    <div className="login-icon">🌙</div>
                    <h1>Admin Takjil</h1>
                    <p>Kelola jadwal & tracker buka puasa</p>
                    <form onSubmit={handleLogin}>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password admin"
                                autoFocus
                            />
                            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {authError && (
                            <div className="auth-error"><AlertCircle size={16} />{authError}</div>
                        )}
                        <button type="submit" className="login-button">
                            <Shield size={18} /> Masuk
                        </button>
                    </form>
                    <Link to="/komunitas" className="back-link">
                        <ArrowLeft size={16} /> Kembali ke Komunitas
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="takjil-admin">
                <div className="loading-state">
                    <Loader2 size={40} className="spin" />
                    <p>Memuat jadwal dari database...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="takjil-admin">
            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <Link to="/komunitas" className="back-btn"><ArrowLeft size={20} /></Link>
                    <div>
                        <h1>🌙 Admin Takjil</h1>
                        <p>Edit jadwal & tandai donatur yang sudah menunaikan</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="share-btn" onClick={handleShareLink} title="Salin link jadwal">
                        {copied ? <><Check size={16} /> Tersalin!</> : <><Share2 size={16} /> Share</>}
                    </button>
                    <button className="refresh-btn" onClick={fetchSchedule} title="Refresh data">
                        <RefreshCw size={16} />
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {/* Share Link Banner */}
            <div className="share-banner">
                <span>📱 Link untuk donatur:</span>
                <code>{window.location.origin}/komunitas/takjil</code>
                <button onClick={handleShareLink}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>

            {/* Stats */}
            <div className="tracker-stats">
                <div className="stat-card emerald">
                    <CheckCircle size={22} />
                    <div>
                        <span className="value">{completedCount}</span>
                        <span className="label">Sudah</span>
                    </div>
                </div>
                <div className="stat-card amber">
                    <XCircle size={22} />
                    <div>
                        <span className="value">{totalCells - completedCount}</span>
                        <span className="label">Belum</span>
                    </div>
                </div>
                <div className="stat-card blue">
                    <BarChart3 size={22} />
                    <div>
                        <span className="value">{percentage}%</span>
                        <span className="label">Progress</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-section">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="progress-text">{completedCount}/{totalCells} slot terpenuhi</span>
            </div>

            {/* Legend */}
            <div className="tracker-legend">
                <span>✅ Klik cell = tandai sudah · ✏️ Double-klik = edit nama</span>
                <div className="legend-items">
                    <span className="legend-done">✅ Sudah</span>
                    <span className="legend-pending">⏳ Belum</span>
                </div>
            </div>

            {/* Tracker Table */}
            <div className="tracker-table-wrapper">
                <table className="tracker-table">
                    <thead>
                        <tr>
                            <th style={{ width: '4%' }}>No</th>
                            <th style={{ width: '14%' }}>Tanggal</th>
                            <th style={{ width: '20.5%' }}>🍱 Nasi 1</th>
                            <th style={{ width: '20.5%' }}>🍱 Nasi 2</th>
                            <th style={{ width: '20.5%' }}>🧁 Takjil Kue</th>
                            <th style={{ width: '20.5%' }}>🥤 Minuman/Es</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((row, i) => {
                            // Insert divider rows
                            const rows = [];
                            if (row.no === 10 || row.no === 21) {
                                rows.push(<tr key={`div-${i}`} className="divider-row"><td colSpan="6"></td></tr>);
                            }
                            rows.push(
                                <tr key={row.id}>
                                    <td className="no-cell" data-label="No">{row.no}</td>
                                    <td className="date-cell" data-label="Tanggal">{row.tanggal}</td>
                                    {COLS.map(col => {
                                        const nama = row[`${col}_nama`];
                                        const blok = row[`${col}_blok`];
                                        const isDone = row[`${col}_done`];
                                        const isSaving = saving === `${row.id}-${col}`;
                                        const isEditing = editCell?.id === row.id && editCell?.col === col;

                                        // Editing mode
                                        if (isEditing) {
                                            return (
                                                <td key={col} className="editing-cell" data-label={COL_LABELS[col]}>
                                                    <input
                                                        type="text"
                                                        value={editNama}
                                                        onChange={e => setEditNama(e.target.value)}
                                                        placeholder="Nama"
                                                        autoFocus
                                                        className="edit-input"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editBlok}
                                                        onChange={e => setEditBlok(e.target.value)}
                                                        placeholder="Blok"
                                                        className="edit-input blok-input"
                                                    />
                                                    <div className="edit-actions">
                                                        <button className="edit-save" onClick={saveEdit} disabled={saving === `${row.id}-edit`}>
                                                            {saving === `${row.id}-edit` ? <Loader2 size={12} className="spin" /> : <Save size={12} />}
                                                        </button>
                                                        <button className="edit-cancel" onClick={cancelEdit}>
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td
                                                key={col}
                                                data-label={COL_LABELS[col]}
                                                className={`clickable-cell ${isDone ? 'cell-done' : 'cell-pending'}`}
                                                onClick={() => toggleDone(row, col)}
                                                onDoubleClick={(e) => { e.stopPropagation(); startEdit(row, col); }}
                                                title="Klik = tandai · Double-klik = edit"
                                            >
                                                <div className="cell-content">
                                                    {isSaving ? (
                                                        <Loader2 size={14} className="spin" />
                                                    ) : (
                                                        <>
                                                            <span className="cell-status-icon">{isDone ? '✅' : ''}</span>
                                                            <span className={`donor-name ${isDone ? 'done' : ''}`}>{nama || '-'}</span>
                                                            {blok && <span className="donor-blok">({blok})</span>}
                                                        </>
                                                    )}
                                                </div>
                                                <button
                                                    className="edit-cell-btn"
                                                    onClick={(e) => { e.stopPropagation(); startEdit(row, col); }}
                                                    title="Edit nama"
                                                >
                                                    <Edit2 size={10} />
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                            return rows;
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TakjilAdmin;
