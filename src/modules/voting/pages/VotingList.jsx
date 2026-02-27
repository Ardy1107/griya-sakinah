import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Vote, Plus, Clock, CheckCircle2, Users, Shield,
    ChevronRight, BarChart3, Eye
} from 'lucide-react';
import { fetchPolls, getPollStatus, formatDeadline } from '../services/votingService';
import '../voting.css';

export default function VotingList() {
    const navigate = useNavigate();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });
    const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';

    useEffect(() => { loadPolls(); }, []);

    async function loadPolls() {
        setLoading(true);
        try {
            const data = await fetchPolls();
            setPolls(data);
        } catch (err) {
            console.error('Load polls:', err);
        }
        setLoading(false);
    }

    const filtered = filter === 'all'
        ? polls
        : polls.filter(p => p.computedStatus === filter);

    const activeCount = polls.filter(p => p.computedStatus === 'active').length;
    const closedCount = polls.filter(p => p.computedStatus === 'closed').length;

    return (
        <div className="voting-container">
            <header className="voting-header">
                <button className="btn-back" onClick={() => navigate('/komunitas')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <Vote size={24} />
                    <h1>Voting Warga</h1>
                </div>
                {isAdmin && (
                    <button className="btn-create" onClick={() => navigate('/voting/buat')}>
                        <Plus size={18} />
                    </button>
                )}
            </header>

            {/* Stats */}
            <div className="voting-stats">
                <div className="v-stat">
                    <span className="v-stat-value">{polls.length}</span>
                    <span className="v-stat-label">Total</span>
                </div>
                <div className="v-stat active">
                    <span className="v-stat-value">{activeCount}</span>
                    <span className="v-stat-label">Aktif</span>
                </div>
                <div className="v-stat closed">
                    <span className="v-stat-value">{closedCount}</span>
                    <span className="v-stat-label">Selesai</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="voting-filter-tabs">
                {[
                    { key: 'all', label: 'Semua' },
                    { key: 'active', label: '🟢 Aktif' },
                    { key: 'closed', label: '🔴 Selesai' },
                ].map(f => (
                    <button key={f.key}
                        className={`filter-tab ${filter === f.key ? 'active' : ''}`}
                        onClick={() => setFilter(f.key)}>
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-state"><div className="loading-spinner" /><p>Memuat...</p></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <Vote size={48} />
                    <h3>{filter === 'all' ? 'Belum ada voting' : 'Tidak ada voting'}</h3>
                    <p>{isAdmin ? 'Buat voting pertama!' : 'Voting baru akan muncul di sini.'}</p>
                </div>
            ) : (
                <div className="polls-list">
                    {filtered.map(poll => {
                        const status = poll.computedStatus;
                        return (
                            <div key={poll.id} className={`poll-card ${status}`}
                                onClick={() => navigate(`/voting/${poll.id}`)}>
                                <div className="poll-card-header">
                                    <span className={`poll-status-dot ${status}`} />
                                    <span className="poll-status-text">
                                        {status === 'active' ? formatDeadline(poll.ends_at) : 'Selesai'}
                                    </span>
                                </div>
                                <h3 className="poll-card-title">{poll.title}</h3>
                                {poll.description && (
                                    <p className="poll-card-desc">{poll.description.substring(0, 100)}</p>
                                )}
                                <div className="poll-card-footer">
                                    <span className="poll-card-meta">
                                        {poll.poll_type === 'multiple' && <><Eye size={12} /> Multi</>}
                                        {poll.require_verification && <><Shield size={12} /> Verifikasi</>}
                                        {poll.is_anonymous && <>🙈 Anonim</>}
                                    </span>
                                    <span className="poll-card-creator">{poll.creator?.full_name}</span>
                                    <ChevronRight size={16} className="poll-card-arrow" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
