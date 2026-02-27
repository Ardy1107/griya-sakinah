import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Vote, CheckCircle2, Clock, Shield, Users,
    Lock, BarChart3, AlertTriangle, Download, Eye, TrendingUp
} from 'lucide-react';
import {
    fetchPollById, fetchPollResults, submitVote, hasBlokVoted,
    getPollStatus, formatDeadline, subscribeToVotes,
    exportResultsCSV, getBlokBreakdown, getQuorumPercentage
} from '../services/votingService';
import '../voting.css';

export default function VotingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [poll, setPoll] = useState(null);
    const [results, setResults] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [nik, setNik] = useState('');
    const [alreadyVoted, setAlreadyVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [liveUpdate, setLiveUpdate] = useState(false);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    const blok = user ? `${user.blok || ''}${user.nomor || ''}`.toUpperCase() : '';

    useEffect(() => {
        loadPoll();
        const unsub = subscribeToVotes(id, () => {
            setLiveUpdate(true);
            loadResults();
            setTimeout(() => setLiveUpdate(false), 1500);
        });
        return unsub;
    }, [id]);

    async function loadPoll() {
        setLoading(true);
        try {
            const pollData = await fetchPollById(id);
            setPoll(pollData);
            await loadResults();
            const status = getPollStatus(pollData);
            if (status === 'closed') setShowResults(true);
            if (user && blok) {
                const voted = await hasBlokVoted(id, blok);
                setAlreadyVoted(voted);
                if (voted) setShowResults(true);
            }
        } catch (err) {
            console.error('Load poll error:', err);
        }
        setLoading(false);
    }

    async function loadResults() {
        try {
            const data = await fetchPollResults(id);
            setResults(data);
        } catch { }
    }

    function toggleOption(optId) {
        const maxChoices = poll?.max_choices || 1;
        setSelectedOptions(prev => {
            if (prev.includes(optId)) return prev.filter(o => o !== optId);
            if (maxChoices === 1) return [optId];
            if (prev.length >= maxChoices) return prev;
            return [...prev, optId];
        });
    }

    async function handleVote() {
        if (selectedOptions.length === 0) { setError('Pilih opsi terlebih dahulu'); return; }
        if (!user) { setError('Silakan login terlebih dahulu'); return; }
        if (!blok) { setError('Data blok rumah tidak ditemukan'); return; }
        if (poll.require_verification && !nik) { setError('Masukkan NIK untuk verifikasi'); return; }

        setVoting(true); setError('');
        try {
            await submitVote({
                pollId: id,
                optionIds: selectedOptions,
                voterId: user.id,
                voterBlok: blok,
                voterNik: nik || null,
            });
            setAlreadyVoted(true);
            setShowResults(true);
            await loadResults();
        } catch (err) {
            setError(err.message);
        }
        setVoting(false);
    }

    if (loading) return (
        <div className="voting-container">
            <div className="loading-state"><div className="loading-spinner" /><p>Memuat...</p></div>
        </div>
    );
    if (!poll) return (
        <div className="voting-container">
            <div className="empty-state"><h3>Polling tidak ditemukan</h3></div>
        </div>
    );

    const status = getPollStatus(poll);
    const isMulti = (poll.max_choices || 1) > 1;
    const blokBreakdown = results ? getBlokBreakdown(results.votes) : [];
    const quorumPct = results ? getQuorumPercentage(results.totalVoters, poll.min_quorum) : 0;
    const maxVotes = results ? Math.max(...results.options.map(r => r.votes), 1) : 1;

    return (
        <div className="voting-container">
            <header className="voting-header">
                <button className="btn-back" onClick={() => navigate('/voting')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <Vote size={24} />
                    <h1>Detail Voting</h1>
                </div>
                {showResults && results && (
                    <button className="btn-export" onClick={() => exportResultsCSV(poll, results)}>
                        <Download size={16} />
                    </button>
                )}
            </header>

            <div className="poll-detail-card">
                {/* Status Banner */}
                <div className={`poll-banner ${status}`}>
                    {status === 'active' ? <Clock size={18} /> : <CheckCircle2 size={18} />}
                    <span>{status === 'active' ? `Berakhir: ${formatDeadline(poll.ends_at)}` : 'Voting Selesai'}</span>
                    {liveUpdate && <span className="live-badge">🔴 LIVE</span>}
                </div>

                <div className="poll-detail-body">
                    <h2>{poll.title}</h2>
                    {poll.description && <p className="poll-desc-detail">{poll.description}</p>}

                    <div className="poll-info-row">
                        <span><Users size={14} /> {results?.totalVoters || 0} blok</span>
                        {isMulti && <span><Eye size={14} /> Max {poll.max_choices} pilihan</span>}
                        {poll.require_verification && <span><Shield size={14} /> Verifikasi NIK</span>}
                        {poll.is_anonymous && <span><Lock size={14} /> Anonim</span>}
                    </div>

                    {/* Quorum Progress */}
                    {poll.min_quorum && (
                        <div className="quorum-section">
                            <div className="quorum-header">
                                <TrendingUp size={14} />
                                <span>Quorum: {results?.totalVoters || 0}/{poll.min_quorum} blok</span>
                                <span className={`quorum-pct ${quorumPct >= 100 ? 'met' : ''}`}>{quorumPct}%</span>
                            </div>
                            <div className="quorum-bar">
                                <div className="quorum-fill" style={{ width: `${Math.min(100, quorumPct)}%` }} />
                            </div>
                            {quorumPct < 100 && (
                                <small className="quorum-hint">Butuh {poll.min_quorum - (results?.totalVoters || 0)} blok lagi</small>
                            )}
                        </div>
                    )}

                    {/* Already voted */}
                    {alreadyVoted && (
                        <div className="voted-badge">
                            <CheckCircle2 size={16} /> Blok {blok} sudah memberikan suara
                        </div>
                    )}

                    {/* Voting / Results Toggle */}
                    {!alreadyVoted && status === 'active' && !showResults ? (
                        <>
                            <div className="vote-options">
                                {results?.options.map(opt => (
                                    <button
                                        key={opt.id}
                                        className={`vote-option ${selectedOptions.includes(opt.id) ? 'selected' : ''}`}
                                        onClick={() => toggleOption(opt.id)}
                                    >
                                        <div className={`vote-radio ${isMulti ? 'checkbox' : ''} ${selectedOptions.includes(opt.id) ? 'checked' : ''}`} />
                                        <span>{opt.option_text}</span>
                                    </button>
                                ))}
                            </div>

                            {isMulti && (
                                <small className="multi-hint">Pilih maksimal {poll.max_choices} opsi ({selectedOptions.length}/{poll.max_choices} dipilih)</small>
                            )}

                            {poll.require_verification && (
                                <div className="nik-section">
                                    <label><Shield size={14} /> Masukkan NIK (KK) untuk verifikasi</label>
                                    <input
                                        type="text" value={nik} onChange={e => setNik(e.target.value)}
                                        placeholder="16 digit NIK..." maxLength={16}
                                    />
                                    <small>1 rumah (blok) = 1 suara. NIK digunakan untuk verifikasi.</small>
                                </div>
                            )}

                            {error && (
                                <div className="vote-error">
                                    <AlertTriangle size={16} /> {error}
                                </div>
                            )}

                            <button className="btn-vote" onClick={handleVote} disabled={voting || selectedOptions.length === 0}>
                                <Vote size={18} />
                                {voting ? 'Mengirim suara...' : 'Kirim Suara'}
                            </button>

                            <button className="btn-see-results" onClick={() => setShowResults(true)}>
                                <BarChart3 size={16} /> Lihat Hasil Sementara
                            </button>
                        </>
                    ) : results && (
                        <div className="results-section">
                            <h3><BarChart3 size={18} /> Hasil Voting {liveUpdate && <span className="live-dot" />}</h3>

                            <div className="results-bars">
                                {results.options.map(opt => (
                                    <div key={opt.id} className="result-bar-row">
                                        <div className="result-label">
                                            <span className="result-text">{opt.option_text}</span>
                                            <span className="result-count">{opt.votes} suara ({opt.percentage}%)</span>
                                        </div>
                                        <div className="result-bar-bg">
                                            <div
                                                className="result-bar-fill"
                                                style={{
                                                    width: `${opt.percentage}%`,
                                                    background: opt.votes === maxVotes
                                                        ? 'linear-gradient(90deg, #10b981, #059669)'
                                                        : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="total-votes">
                                Total: <strong>{results.totalVotes}</strong> suara dari <strong>{results.totalVoters}</strong> blok
                            </div>

                            {/* Per-Blok Breakdown */}
                            {blokBreakdown.length > 0 && (
                                <div className="breakdown-section">
                                    <button className="btn-breakdown" onClick={() => setShowBreakdown(!showBreakdown)}>
                                        {showBreakdown ? 'Sembunyikan' : 'Partisipasi Per Blok'} ▾
                                    </button>
                                    {showBreakdown && (
                                        <div className="breakdown-grid">
                                            {blokBreakdown.map(b => (
                                                <div key={b.blok} className="breakdown-item">
                                                    <span className="breakdown-label">{b.blok}</span>
                                                    <span className="breakdown-count">{b.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Export */}
                            <button className="btn-export-results" onClick={() => exportResultsCSV(poll, results)}>
                                <Download size={16} /> Export Hasil (CSV)
                            </button>

                            {!alreadyVoted && status === 'active' && (
                                <button className="btn-back-vote" onClick={() => setShowResults(false)}>
                                    Kembali ke Voting
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
