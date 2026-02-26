import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Shield, Plus, Calendar, Clock, Users, Save,
    CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import {
    fetchSchedules, createSchedule, fetchAlerts, respondToAlert,
    resolveAlert, markFalseAlarm, SHIFTS, getAlertType, getShift, timeAgo
} from '../services/keamananService';
import '../keamanan.css';

export default function SecurityAdmin() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('schedules');
    const [schedules, setSchedules] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    const [form, setForm] = useState({
        schedule_date: new Date().toISOString().split('T')[0],
        shift: 'malam_1',
        assigned_bloks: '',
        notes: '',
    });

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        setLoading(true);
        try {
            const now = new Date();
            const [sched, alertData] = await Promise.all([
                fetchSchedules({ month: now.getMonth() + 1, year: now.getFullYear() }),
                fetchAlerts(),
            ]);
            setSchedules(sched);
            setAlerts(alertData);
        } catch (err) { console.error(err); }
        setLoading(false);
    }

    async function handleCreateSchedule(e) {
        e.preventDefault();
        try {
            const bloks = form.assigned_bloks ? form.assigned_bloks.split(',').map(b => b.trim()) : [];
            await createSchedule({
                schedule_date: form.schedule_date,
                shift: form.shift,
                assigned_bloks: bloks,
                notes: form.notes || null,
                created_by: user?.id,
            });
            setShowForm(false);
            setForm({ schedule_date: new Date().toISOString().split('T')[0], shift: 'malam_1', assigned_bloks: '', notes: '' });
            loadData();
        } catch (err) { alert('Gagal membuat jadwal: ' + err.message); }
    }

    async function handleRespond(alertId) {
        try { await respondToAlert(alertId, user?.id); loadData(); }
        catch (err) { alert(err.message); }
    }
    async function handleResolve(alertId) {
        try { await resolveAlert(alertId); loadData(); }
        catch (err) { alert(err.message); }
    }
    async function handleFalseAlarm(alertId) {
        if (!confirm('Tandai sebagai false alarm?')) return;
        try { await markFalseAlarm(alertId); loadData(); }
        catch (err) { alert(err.message); }
    }

    return (
        <div className="keamanan-container">
            <header className="keamanan-header">
                <button className="btn-back" onClick={() => navigate('/keamanan')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <Shield size={24} />
                    <h1>Admin Keamanan</h1>
                </div>
            </header>

            <div className="admin-tabs">
                <button className={`tab ${tab === 'schedules' ? 'active' : ''}`} onClick={() => setTab('schedules')}>
                    <Calendar size={16} /> Jadwal Ronda
                </button>
                <button className={`tab ${tab === 'alerts' ? 'active' : ''}`} onClick={() => setTab('alerts')}>
                    <AlertTriangle size={16} /> Alert
                    {alerts.filter(a => a.status === 'active').length > 0 && (
                        <span className="alert-count">{alerts.filter(a => a.status === 'active').length}</span>
                    )}
                </button>
            </div>

            {loading ? (
                <div className="loading-state"><div className="loading-spinner"></div><p>Memuat...</p></div>
            ) : tab === 'schedules' ? (
                <div className="admin-content">
                    <button className="btn-add" onClick={() => setShowForm(!showForm)}>
                        <Plus size={16} /> Tambah Jadwal
                    </button>

                    {showForm && (
                        <form className="schedule-form" onSubmit={handleCreateSchedule}>
                            <div className="form-group">
                                <label><Calendar size={14} /> Tanggal</label>
                                <input type="date" value={form.schedule_date}
                                    onChange={e => setForm(f => ({ ...f, schedule_date: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label><Clock size={14} /> Shift</label>
                                <select value={form.shift}
                                    onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}>
                                    {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label><Users size={14} /> Blok Petugas</label>
                                <input type="text" value={form.assigned_bloks}
                                    onChange={e => setForm(f => ({ ...f, assigned_bloks: e.target.value }))}
                                    placeholder="A1, A2, B3 (pisahkan koma)" />
                            </div>
                            <div className="form-group">
                                <label>Catatan</label>
                                <input type="text" value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    placeholder="Catatan tambahan..." />
                            </div>
                            <button type="submit" className="btn-save"><Save size={16} /> Simpan</button>
                        </form>
                    )}

                    <div className="schedule-list">
                        {schedules.map(s => {
                            const shift = getShift(s.shift);
                            return (
                                <div key={s.id} className="schedule-card">
                                    <span className="shift-icon">{shift.icon}</span>
                                    <div className="schedule-info">
                                        <h4>{new Date(s.schedule_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} — {shift.label}</h4>
                                        <p>Petugas: {(s.assigned_bloks || []).join(', ') || '-'}</p>
                                        {s.notes && <small>{s.notes}</small>}
                                    </div>
                                    <span className={`status-badge ${s.status}`}>{s.status}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="admin-content">
                    {alerts.length === 0 ? (
                        <div className="empty-mini">Belum ada alert</div>
                    ) : alerts.map(alert => {
                        const type = getAlertType(alert.alert_type);
                        return (
                            <div key={alert.id} className={`alert-admin-card ${alert.status}`}>
                                <div className="alert-admin-top">
                                    <span>{type.icon}</span>
                                    <strong>{type.label}</strong>
                                    <span className={`alert-status-tag ${alert.status}`}>{alert.status}</span>
                                    <span className="alert-time-tag">{timeAgo(alert.created_at)}</span>
                                </div>
                                <p>Blok <strong>{alert.reporter_blok}</strong> — {alert.reporter?.full_name || 'Warga'}</p>
                                {alert.description && <p className="alert-desc">{alert.description}</p>}
                                {alert.responder && <p className="alert-responder">Ditangani: {alert.responder.full_name}</p>}

                                {alert.status === 'active' && (
                                    <div className="alert-actions">
                                        <button className="btn-respond" onClick={() => handleRespond(alert.id)}>
                                            🏃 Respond
                                        </button>
                                        <button className="btn-false" onClick={() => handleFalseAlarm(alert.id)}>
                                            ❌ False Alarm
                                        </button>
                                    </div>
                                )}
                                {alert.status === 'responding' && (
                                    <div className="alert-actions">
                                        <button className="btn-resolve" onClick={() => handleResolve(alert.id)}>
                                            <CheckCircle size={16} /> Selesai
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
