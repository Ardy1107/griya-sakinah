import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Vote, CheckCircle2, Clock, Shield, Users,
    Lock, BarChart3, AlertTriangle
} from 'lucide-react';
import {
    fetchPollById, fetchPollOptions, fetchPollResults,
    submitVote, hasBlokVoted, getPollStatus, formatDeadline
} from '../services/votingService';
import '../voting.css';

export default function VotingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [poll, setPoll] = useState(null);
    const [results, setResults] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [nik, setNik] = useState('');
    const [alreadyVoted, setAlreadyVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    const blok = user ? `${user.blok || ''}${user.nomor || ''}`.toUpperCase() : '';

    useEffect(() => { loadPoll(); }, [id]);

    async function loadPoll() {
        setLoading(true);
        try {
            const [pollData, resultData] = await Promise.all([
                fetchPollById(id),
                fetchPollResults(id),
            ]);
            setPoll(pollData);
            setResults(resultData);
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

    async function handleVote() {
        if (!selectedOption) { setError('Pilih salah satu opsi'); return; }
        if (!user) { setError('Silakan login terlebih dahulu'); return; }
        if (!blok) { setError('Data blok rumah tidak ditemukan'); return; }
        if (poll.require_verification && !nik) { setError('Masukkan NIK untuk verifikasi'); return; }

        setVoting(true);
        setError('');
        try {
            await submitVote({
                pollId: id,
                optionId: selectedOption,
                voterId: user.id,
                voterBlok: blok,
                voterNik: nik || null,
            });
            setAlreadyVoted(true);
            setShowResults(true);
            const updated = await fetchPollResults(id);
            setResults(updated);
        } catch (err) {
            setError(err.message);
        }
        setVoting(false);
    }

    if (loading) return (
        <div className="voting-container">
            <div className="loading-state"><div className="loading-spinner"></div><p>Memuat...</p></div>
        </div>
    );
    if (!poll) return (
        <div className="voting-container">
            <div className="empty-state"><h3>Polling tidak ditemukan</h3></div>
        </div>
    );

    const status = getPollStatus(poll);
    const totalVotes = results.reduce((s, r) => s + r.votes, 0);
    const maxVotes = Math.max(...results.map(r => r.votes), 1);

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
            </header>

            <div className="poll-detail-card">
                {/* Status Banner */}
                <div className={`poll-banner ${status}`}>
                    {status === 'active' ? <Clock size={18} /> : <CheckCircle2 size={18} />}
                    <span>{status === 'active' ? `Berakhir: ${formatDeadline(poll.ends_at)}` : 'Voting Selesai'}</span>
                </div>

                <div className="poll-detail-body">
                    <h2>{poll.title}</h2>
                    {poll.description && <p className="poll-desc-detail">{poll.description}</p>}

                    <div className="poll-info-row">
                        <span><Users size={14} /> {totalVotes} suara</span>
                        {poll.require_verification && <span><Shield size={14} /> Verifikasi NIK</span>}
                        {!poll.is_anonymous && <span><Lock size={14} /> Terbuka</span>}
                    </div>

                    {/* Already voted message */}
                    {alreadyVoted && (
                        <div className="voted-badge">
                            <CheckCircle2 size={16} /> Blok {blok} sudah memberikan suara
                        </div>
                    )}

                    {/* Voting / Results Toggle */}
                    {!alreadyVoted && status === 'active' && !showResults ? (
                        <>
                            {/* Vote UI */}
                            <div className="vote-options">
                                {results.map(opt => (
                                    <button
                                        key={opt.id}
                                        className={`vote-option ${selectedOption === opt.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedOption(opt.id)}
                                    >
                                        <div className={`vote-radio ${selectedOption === opt.id ? 'checked' : ''}`} />
                                        <span>{opt.option_text}</span>
                                    </button>
                                ))}
                            </div>

                            {/* NIK verification */}
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

                            <button className="btn-vote" onClick={handleVote} disabled={voting || !selectedOption}>
                                <Vote size={18} />
                                {voting ? 'Mengirim suara...' : 'Kirim Suara'}
                            </button>

                            <button className="btn-see-results" onClick={() => setShowResults(true)}>
                                <BarChart3 size={16} /> Lihat Hasil Sementara
                            </button>
                        </>
                    ) : (
                        /* Results View */
                        <div className="results-section">
                            <h3><BarChart3 size={18} /> Hasil Voting</h3>
                            <div className="results-bars">
                                {results.map(opt => (
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
                                Total: <strong>{totalVotes}</strong> suara dari warga
                            </div>

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
