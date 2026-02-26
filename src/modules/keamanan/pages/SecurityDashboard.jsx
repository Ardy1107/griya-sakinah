import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Shield, Calendar, AlertTriangle, Clock,
    Users, ChevronRight, Bell, Activity
} from 'lucide-react';
import { fetchSchedules, fetchAlerts, subscribeToPanicAlerts, getShift, getAlertType, timeAgo } from '../services/keamananService';
import '../keamanan.css';

export default function SecurityDashboard() {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });
    const isAdmin = user?.role === 'superadmin' || user?.role === 'super_admin' || user?.role === 'admin';

    useEffect(() => {
        loadData();
        const unsub = subscribeToPanicAlerts(newAlert => {
            setRecentAlerts(prev => [newAlert, ...prev].slice(0, 10));
        });
        return unsub;
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const now = new Date();
            const [sched, alerts] = await Promise.all([
                fetchSchedules({ month: now.getMonth() + 1, year: now.getFullYear() }),
                fetchAlerts(),
            ]);
            setSchedules(sched);
            setRecentAlerts(alerts.slice(0, 10));
        } catch (err) {
            console.error('Load security data error:', err);
        }
        setLoading(false);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySchedule = schedules.filter(s => s.schedule_date === todayStr);
    const activeAlerts = recentAlerts.filter(a => a.status === 'active');

    return (
        <div className="keamanan-container">
            <header className="keamanan-header">
                <button className="btn-back" onClick={() => navigate('/komunitas')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <Shield size={24} />
                    <h1>Keamanan Lingkungan</h1>
                </div>
                {isAdmin && (
                    <button className="btn-admin" onClick={() => navigate('/keamanan/admin')}>
                        ⚙️
                    </button>
                )}
            </header>

            {/* Panic Button CTA */}
            <div className="panic-cta" onClick={() => navigate('/keamanan/panic')}>
                <div className="panic-cta-icon">🚨</div>
                <div className="panic-cta-text">
                    <h3>Tombol Darurat</h3>
                    <p>Tekan jika butuh bantuan segera</p>
                </div>
                <ChevronRight size={20} />
            </div>

            {/* Active Alerts Banner */}
            {activeAlerts.length > 0 && (
                <div className="active-alerts-banner">
                    <AlertTriangle size={18} />
                    <span><strong>{activeAlerts.length}</strong> alert aktif saat ini!</span>
                    <button onClick={() => navigate('/keamanan/riwayat')}>Lihat</button>
                </div>
            )}

            {loading ? (
                <div className="loading-state"><div className="loading-spinner"></div><p>Memuat...</p></div>
            ) : (
                <>
                    {/* Quick Stats */}
                    <div className="stats-row">
                        <div className="stat-card">
                            <Calendar size={20} />
                            <div>
                                <span className="stat-value">{todaySchedule.length}</span>
                                <span className="stat-label">Ronda Hari Ini</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <Activity size={20} />
                            <div>
                                <span className="stat-value">{schedules.length}</span>
                                <span className="stat-label">Jadwal Bulan Ini</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <Bell size={20} />
                            <div>
                                <span className="stat-value">{activeAlerts.length}</span>
                                <span className="stat-label">Alert Aktif</span>
                            </div>
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <section className="section">
                        <div className="section-header">
                            <h2><Clock size={18} /> Jadwal Ronda Hari Ini</h2>
                            <button className="btn-link" onClick={() => navigate('/keamanan/ronda')}>
                                Lihat Semua <ChevronRight size={16} />
                            </button>
                        </div>
                        {todaySchedule.length === 0 ? (
                            <div className="empty-mini">Tidak ada jadwal ronda hari ini</div>
                        ) : todaySchedule.map(s => {
                            const shift = getShift(s.shift);
                            return (
                                <div key={s.id} className="schedule-card" onClick={() => navigate('/keamanan/ronda')}>
                                    <span className="shift-icon">{shift.icon}</span>
                                    <div className="schedule-info">
                                        <h4>{shift.label}</h4>
                                        <p>{(s.assigned_bloks || []).join(', ') || 'Semua blok'}</p>
                                    </div>
                                    <span className={`status-badge ${s.status}`}>{s.status}</span>
                                </div>
                            );
                        })}
                    </section>

                    {/* Recent Alerts */}
                    <section className="section">
                        <div className="section-header">
                            <h2><AlertTriangle size={18} /> Alert Terbaru</h2>
                            <button className="btn-link" onClick={() => navigate('/keamanan/riwayat')}>
                                Semua <ChevronRight size={16} />
                            </button>
                        </div>
                        {recentAlerts.length === 0 ? (
                            <div className="empty-mini">Belum ada alert. Lingkungan aman! ✅</div>
                        ) : recentAlerts.slice(0, 5).map(alert => {
                            const type = getAlertType(alert.alert_type);
                            return (
                                <div key={alert.id} className={`alert-card ${alert.status}`}>
                                    <span className="alert-icon">{type.icon}</span>
                                    <div className="alert-info">
                                        <h4>{type.label} — Blok {alert.reporter_blok}</h4>
                                        <p>{alert.description || 'Butuh bantuan segera'}</p>
                                        <span className="alert-time">{timeAgo(alert.created_at)}</span>
                                    </div>
                                    <span className={`alert-status ${alert.status}`}>
                                        {alert.status === 'active' ? '🔴' : alert.status === 'responding' ? '🟡' : '🟢'}
                                    </span>
                                </div>
                            );
                        })}
                    </section>
                </>
            )}
        </div>
    );
}
