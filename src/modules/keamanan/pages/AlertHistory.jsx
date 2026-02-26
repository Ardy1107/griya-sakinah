import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Filter } from 'lucide-react';
import { fetchAlerts, getAlertType, timeAgo } from '../services/keamananService';
import '../keamanan.css';

export default function AlertHistory() {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => { loadAlerts(); }, []);

    async function loadAlerts() {
        setLoading(true);
        try { setAlerts(await fetchAlerts()); }
        catch (err) { console.error(err); }
        setLoading(false);
    }

    const filtered = filter ? alerts.filter(a => a.status === filter) : alerts;

    return (
        <div className="keamanan-container">
            <header className="keamanan-header">
                <button className="btn-back" onClick={() => navigate('/keamanan')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <AlertTriangle size={24} />
                    <h1>Riwayat Alert</h1>
                </div>
            </header>

            <div className="filter-bar">
                <Filter size={16} />
                <select value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="">Semua Status</option>
                    <option value="active">🔴 Aktif</option>
                    <option value="responding">🟡 Ditangani</option>
                    <option value="resolved">🟢 Selesai</option>
                    <option value="false_alarm">❌ False Alarm</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-state"><div className="loading-spinner"></div></div>
            ) : (
                <div className="alerts-history">
                    {filtered.length === 0 ? (
                        <div className="empty-mini">Tidak ada alert ditemukan</div>
                    ) : filtered.map(alert => {
                        const type = getAlertType(alert.alert_type);
                        return (
                            <div key={alert.id} className={`alert-card ${alert.status}`}>
                                <span className="alert-icon">{type.icon}</span>
                                <div className="alert-info">
                                    <h4>{type.label} — Blok {alert.reporter_blok}</h4>
                                    <p>{alert.description || 'Butuh bantuan'}</p>
                                    <span className="alert-time">{timeAgo(alert.created_at)}</span>
                                    {alert.responder && <span className="alert-responder-tag">Ditangani: {alert.responder.full_name}</span>}
                                </div>
                                <span className={`alert-status ${alert.status}`}>
                                    {alert.status === 'active' ? '🔴' : alert.status === 'responding' ? '🟡' : alert.status === 'resolved' ? '🟢' : '❌'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
