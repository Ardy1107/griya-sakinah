import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Shield, Calendar, AlertTriangle, Clock,
    Users, ChevronRight, Bell, Activity, BarChart3,
    MapPin, TrendingUp, CheckCircle, FileText, Zap
} from 'lucide-react';
import {
    fetchSchedules, fetchAlerts, subscribeToPanicAlerts,
    getShift, getAlertType, timeAgo, fetchSecurityStats, getMyActiveCheckin,
    checkin, checkout, getCurrentPosition
} from '../services/keamananService';
import '../keamanan.css';

export default function SecurityDashboard() {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [activeCheckin, setActiveCheckin] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);
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
            const [sched, alerts, secStats] = await Promise.all([
                fetchSchedules({ month: now.getMonth() + 1, year: now.getFullYear() }),
                fetchAlerts(),
                fetchSecurityStats(),
            ]);
            setSchedules(sched);
            setRecentAlerts(alerts.slice(0, 10));
            setStats(secStats);

            if (user) {
                const myCheckin = await getMyActiveCheckin(user.id);
                setActiveCheckin(myCheckin);
            }
        } catch (err) {
            console.error('Load security data error:', err);
        }
        setLoading(false);
    }

    async function handleCheckin(scheduleId) {
        if (checkingIn) return;
        setCheckingIn(true);
        try {
            let coords = null;
            try { coords = await getCurrentPosition(); } catch { }
            const result = await checkin(scheduleId, user.id, coords);
            setActiveCheckin(result);
        } catch (err) {
            alert('Gagal check-in: ' + err.message);
        }
        setCheckingIn(false);
    }

    async function handleCheckout() {
        if (!activeCheckin) return;
        try {
            await checkout(activeCheckin.id);
            setActiveCheckin(null);
        } catch (err) {
            alert('Gagal check-out: ' + err.message);
        }
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
                    <button className="btn-admin" onClick={() => navigate('/keamanan/admin')}>⚙️</button>
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

            {/* Active Checkin Banner */}
            {activeCheckin && (
                <div className="checkin-active-banner">
                    <div className="checkin-pulse" />
                    <div className="checkin-info">
                        <strong>Ronda Aktif</strong>
                        <span>Sejak {new Date(activeCheckin.checkin_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <button className="btn-checkout" onClick={handleCheckout}>Check-out</button>
                </div>
            )}

            {/* Active Alerts Banner */}
            {activeAlerts.length > 0 && (
                <div className="active-alerts-banner">
                    <AlertTriangle size={18} />
                    <span><strong>{activeAlerts.length}</strong> alert aktif saat ini!</span>
                    <button onClick={() => navigate('/keamanan/riwayat')}>Lihat</button>
                </div>
            )}

            {loading ? (
                <div className="loading-state"><div className="loading-spinner" /><p>Memuat...</p></div>
            ) : (
                <>
                    {/* Analytics Stats */}
                    {stats && (
                        <div className="stats-grid">
                            <div className="stat-card stat-alert">
                                <div className="stat-icon"><Bell size={20} /></div>
                                <div>
                                    <span className="stat-value">{stats.totalAlerts}</span>
                                    <span className="stat-label">Alert Bulan Ini</span>
                                </div>
                            </div>
                            <div className="stat-card stat-response">
                                <div className="stat-icon"><Zap size={20} /></div>
                                <div>
                                    <span className="stat-value">{stats.avgResponseMin}<small>min</small></span>
                                    <span className="stat-label">Rata-rata Respon</span>
                                </div>
                            </div>
                            <div className="stat-card stat-coverage">
                                <div className="stat-icon"><Shield size={20} /></div>
                                <div>
                                    <span className="stat-value">{stats.coverage}<small>%</small></span>
                                    <span className="stat-label">Coverage Ronda</span>
                                </div>
                            </div>
                            <div className="stat-card stat-incident">
                                <div className="stat-icon"><FileText size={20} /></div>
                                <div>
                                    <span className="stat-value">{stats.totalIncidents}</span>
                                    <span className="stat-label">Laporan Insiden</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <button className="quick-action-btn" onClick={() => navigate('/keamanan/lapor')}>
                            <FileText size={18} />
                            <span>Lapor Insiden</span>
                        </button>
                        <button className="quick-action-btn" onClick={() => navigate('/keamanan/riwayat')}>
                            <BarChart3 size={18} />
                            <span>Riwayat Alert</span>
                        </button>
                    </div>

                    {/* Today's Schedule with Check-in */}
                    <section className="section">
                        <div className="section-header">
                            <h2><Clock size={18} /> Jadwal Ronda Hari Ini</h2>
                        </div>
                        {todaySchedule.length === 0 ? (
                            <div className="empty-mini">Tidak ada jadwal ronda hari ini</div>
                        ) : todaySchedule.map(s => {
                            const shift = getShift(s.shift);
                            return (
                                <div key={s.id} className="schedule-card">
                                    <span className="shift-icon">{shift.icon}</span>
                                    <div className="schedule-info">
                                        <h4>{shift.label}</h4>
                                        <p>{(s.assigned_bloks || []).join(', ') || 'Semua blok'}</p>
                                    </div>
                                    <div className="schedule-actions">
                                        <span className={`status-badge ${s.status}`}>{s.status}</span>
                                        {!activeCheckin && user && s.status !== 'completed' && (
                                            <button className="btn-checkin"
                                                onClick={() => handleCheckin(s.id)}
                                                disabled={checkingIn}>
                                                {checkingIn ? '...' : '✅ Check-in'}
                                            </button>
                                        )}
                                    </div>
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
                                        <div className="alert-meta">
                                            <span className="alert-time">{timeAgo(alert.created_at)}</span>
                                            {alert.latitude && (
                                                <a href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                                                    target="_blank" rel="noopener" className="alert-map-link">
                                                    <MapPin size={12} /> Peta
                                                </a>
                                            )}
                                            {alert.photo_url && (
                                                <a href={alert.photo_url} target="_blank" rel="noopener" className="alert-photo-link">
                                                    📷 Foto
                                                </a>
                                            )}
                                        </div>
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
