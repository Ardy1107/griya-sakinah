import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Vote, Plus, Clock, CheckCircle2, XCircle,
    TrendingUp, Users, ChevronRight, BarChart3
} from 'lucide-react';
import { fetchPolls, getPollStatus, formatDeadline } from '../services/votingService';
import '../voting.css';

export default function VotingList() {
    const navigate = useNavigate();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('active');
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });
    const isAdmin = user?.role === 'superadmin' || user?.role === 'super_admin' || user?.role === 'admin';

    useEffect(() => { loadPolls(); }, []);

    async function loadPolls() {
        setLoading(true);
        try {
            const data = await fetchPolls();
            setPolls(data);
        } catch (err) {
            console.error('Load polls error:', err);
        }
        setLoading(false);
    }

    const filtered = polls.filter(p => {
        const status = getPollStatus(p);
        if (tab === 'active') return status === 'active';
        return status === 'closed';
    });

    const statusIcon = (poll) => {
        const st = getPollStatus(poll);
        if (st === 'active') return <Clock size={14} className="status-icon active" />;
        return <CheckCircle2 size={14} className="status-icon closed" />;
    };

    return (
        <div className="voting-container">
            <header className="voting-header">
                <button className="btn-back" onClick={() => navigate('/komunitas')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <Vote size={24} />
                    <h1>Voting & Polling</h1>
                </div>
                {isAdmin && (
                    <button className="btn-add" onClick={() => navigate('/voting/buat')}>
                        <Plus size={18} />
                        <span>Buat</span>
                    </button>
                )}
            </header>

            {/* Tabs */}
            <div className="voting-tabs">
                <button className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
                    <Clock size={16} /> Aktif
                </button>
                <button className={`tab ${tab === 'closed' ? 'active' : ''}`} onClick={() => setTab('closed')}>
                    <BarChart3 size={16} /> Selesai
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Memuat polling...</p>
                </div>
            ) : (
                <div className="polls-list">
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <Vote size={48} />
                            <h3>{tab === 'active' ? 'Belum ada polling aktif' : 'Belum ada polling selesai'}</h3>
                            <p>Polling akan muncul di sini.</p>
                        </div>
                    ) : filtered.map(poll => (
                        <div key={poll.id} className="poll-card" onClick={() => navigate(`/voting/${poll.id}`)}>
                            <div className="poll-card-top">
                                {statusIcon(poll)}
                                <span className={`poll-status ${getPollStatus(poll)}`}>
                                    {getPollStatus(poll) === 'active' ? 'Berlangsung' : 'Selesai'}
                                </span>
                                <span className="poll-deadline">
                                    {getPollStatus(poll) === 'active'
                                        ? formatDeadline(poll.ends_at)
                                        : new Date(poll.ends_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                                    }
                                </span>
                            </div>
                            <h3>{poll.title}</h3>
                            {poll.description && <p className="poll-desc">{poll.description}</p>}
                            <div className="poll-card-footer">
                                <span className="poll-creator">
                                    <Users size={14} /> {poll.creator?.full_name || 'Admin'}
                                </span>
                                <ChevronRight size={18} className="poll-arrow" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
