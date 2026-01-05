/**
 * Arisan + Spin Wheel System
 * Community Module - Griya Sakinah
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    Trophy,
    Play,
    RotateCcw,
    Plus,
    Trash2,
    Crown,
    History,
    Settings,
    ChevronRight,
    Check,
    X,
    Gift
} from 'lucide-react';
import './Arisan.css';

// Spin Wheel Component
const SpinWheel = ({ participants, onSpinEnd, disabled }) => {
    const canvasRef = useRef(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState(null);

    const colors = [
        '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
        '#EF4444', '#EC4899', '#06B6D4', '#84CC16'
    ];

    useEffect(() => {
        drawWheel();
    }, [participants, rotation]);

    const drawWheel = () => {
        const canvas = canvasRef.current;
        if (!canvas || participants.length === 0) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);

        const sliceAngle = (2 * Math.PI) / participants.length;

        participants.forEach((participant, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 2;
            const name = participant.name.length > 10
                ? participant.name.substring(0, 10) + '...'
                : participant.name;
            ctx.fillText(name, radius - 20, 5);
            ctx.restore();
        });

        ctx.restore();

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw pointer
        ctx.beginPath();
        ctx.moveTo(centerX + radius + 5, centerY);
        ctx.lineTo(centerX + radius - 25, centerY - 15);
        ctx.lineTo(centerX + radius - 25, centerY + 15);
        ctx.closePath();
        ctx.fillStyle = '#EF4444';
        ctx.fill();
    };

    const spin = () => {
        if (isSpinning || participants.length < 2) return;

        setIsSpinning(true);
        setWinner(null);

        const spinDuration = 5000; // 5 seconds
        const totalRotation = 360 * 5 + Math.random() * 360; // 5+ full rotations
        const startTime = Date.now();
        const startRotation = rotation;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);

            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const currentRotation = startRotation + totalRotation * easeOut;

            setRotation(currentRotation % 360);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Determine winner
                const finalAngle = (360 - (currentRotation % 360) + 90) % 360;
                const sliceAngle = 360 / participants.length;
                const winnerIndex = Math.floor(finalAngle / sliceAngle);
                const selectedWinner = participants[winnerIndex % participants.length];

                setWinner(selectedWinner);
                setIsSpinning(false);
                if (onSpinEnd) onSpinEnd(selectedWinner);
            }
        };

        requestAnimationFrame(animate);
    };

    return (
        <div className="spin-wheel-container">
            <canvas
                ref={canvasRef}
                width={350}
                height={350}
                className={`spin-wheel ${isSpinning ? 'spinning' : ''}`}
            />

            <button
                className={`spin-button ${isSpinning ? 'disabled' : ''}`}
                onClick={spin}
                disabled={disabled || isSpinning || participants.length < 2}
            >
                {isSpinning ? (
                    <RotateCcw size={24} className="spin-icon" />
                ) : (
                    <Play size={24} />
                )}
            </button>

            {winner && (
                <div className="winner-announcement">
                    <div className="winner-card">
                        <Crown size={32} className="crown-icon" />
                        <h3>Selamat!</h3>
                        <p className="winner-name">{winner.name}</p>
                        <p className="winner-block">{winner.block}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Arisan Dashboard
const ArisanDashboard = () => {
    const [participants, setParticipants] = useState([]);
    const [winners, setWinners] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newParticipant, setNewParticipant] = useState({ name: '', block: '' });
    const [currentPeriod, setCurrentPeriod] = useState('');
    const [settings, setSettings] = useState({
        contributionAmount: 100000,
        spinDuration: 5,
        excludePastWinners: true
    });

    useEffect(() => {
        // Load from localStorage
        const savedParticipants = localStorage.getItem('arisan_participants');
        const savedWinners = localStorage.getItem('arisan_winners');
        const savedSettings = localStorage.getItem('arisan_settings');

        if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
        if (savedWinners) setWinners(JSON.parse(savedWinners));
        if (savedSettings) setSettings(JSON.parse(savedSettings));

        // Set current period
        const now = new Date();
        setCurrentPeriod(`${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`);
    }, []);

    useEffect(() => {
        localStorage.setItem('arisan_participants', JSON.stringify(participants));
    }, [participants]);

    useEffect(() => {
        localStorage.setItem('arisan_winners', JSON.stringify(winners));
    }, [winners]);

    const eligibleParticipants = settings.excludePastWinners
        ? participants.filter(p => !winners.some(w => w.participantId === p.id))
        : participants;

    const handleAddParticipant = (e) => {
        e.preventDefault();
        if (!newParticipant.name || !newParticipant.block) return;

        const participant = {
            id: Date.now().toString(),
            name: newParticipant.name,
            block: newParticipant.block,
            joinedAt: new Date().toISOString()
        };

        setParticipants([...participants, participant]);
        setNewParticipant({ name: '', block: '' });
        setShowAddModal(false);
    };

    const handleRemoveParticipant = (id) => {
        setParticipants(participants.filter(p => p.id !== id));
    };

    const handleSpinEnd = (winner) => {
        const winRecord = {
            id: Date.now().toString(),
            participantId: winner.id,
            name: winner.name,
            block: winner.block,
            period: currentPeriod,
            wonAt: new Date().toISOString(),
            amount: settings.contributionAmount * participants.length
        };

        setWinners([winRecord, ...winners]);
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    const totalPot = settings.contributionAmount * participants.length;

    return (
        <div className="arisan-dashboard">
            {/* Header */}
            <div className="arisan-header">
                <div>
                    <h1>🎰 Arisan Griya Sakinah</h1>
                    <p>Periode: {currentPeriod}</p>
                </div>
                <button className="primary-button" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    <span>Tambah Peserta</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="arisan-stats">
                <div className="stat-card emerald">
                    <Users size={24} />
                    <div>
                        <span className="stat-value">{participants.length}</span>
                        <span className="stat-label">Total Peserta</span>
                    </div>
                </div>
                <div className="stat-card blue">
                    <Gift size={24} />
                    <div>
                        <span className="stat-value">{formatRupiah(totalPot)}</span>
                        <span className="stat-label">Total Pot</span>
                    </div>
                </div>
                <div className="stat-card purple">
                    <Trophy size={24} />
                    <div>
                        <span className="stat-value">{winners.length}</span>
                        <span className="stat-label">Sudah Menang</span>
                    </div>
                </div>
                <div className="stat-card gold">
                    <History size={24} />
                    <div>
                        <span className="stat-value">{eligibleParticipants.length}</span>
                        <span className="stat-label">Belum Menang</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="arisan-content">
                {/* Spin Wheel Section */}
                <div className="wheel-section">
                    <div className="section-header">
                        <h2><Play size={20} /> Spin Wheel</h2>
                        <span className="eligible-badge">
                            {eligibleParticipants.length} peserta eligible
                        </span>
                    </div>

                    {eligibleParticipants.length >= 2 ? (
                        <SpinWheel
                            participants={eligibleParticipants}
                            onSpinEnd={handleSpinEnd}
                        />
                    ) : (
                        <div className="empty-wheel">
                            <Users size={64} />
                            <h3>Minimal 2 Peserta</h3>
                            <p>Tambahkan peserta untuk memulai arisan</p>
                        </div>
                    )}
                </div>

                {/* Participants List */}
                <div className="participants-section">
                    <div className="section-header">
                        <h2><Users size={20} /> Daftar Peserta</h2>
                    </div>

                    <div className="participants-list">
                        {participants.length === 0 ? (
                            <div className="empty-state">
                                <Users size={48} />
                                <p>Belum ada peserta</p>
                            </div>
                        ) : (
                            participants.map(participant => {
                                const hasWon = winners.some(w => w.participantId === participant.id);
                                return (
                                    <div
                                        key={participant.id}
                                        className={`participant-card ${hasWon ? 'winner' : ''}`}
                                    >
                                        <div className="participant-info">
                                            <span className="participant-name">{participant.name}</span>
                                            <span className="participant-block">{participant.block}</span>
                                        </div>
                                        {hasWon ? (
                                            <span className="won-badge">
                                                <Crown size={14} /> Menang
                                            </span>
                                        ) : (
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemoveParticipant(participant.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Winner History */}
            {winners.length > 0 && (
                <div className="history-section">
                    <div className="section-header">
                        <h2><History size={20} /> Riwayat Pemenang</h2>
                    </div>
                    <div className="history-list">
                        {winners.map((winner, index) => (
                            <div key={winner.id} className="history-item">
                                <div className="history-rank">#{index + 1}</div>
                                <div className="history-info">
                                    <span className="history-name">{winner.name}</span>
                                    <span className="history-period">{winner.period}</span>
                                </div>
                                <span className="history-amount">{formatRupiah(winner.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Participant Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Tambah Peserta</h2>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddParticipant} className="modal-form">
                            <div className="form-group">
                                <label>Nama Peserta</label>
                                <input
                                    type="text"
                                    value={newParticipant.name}
                                    onChange={e => setNewParticipant({ ...newParticipant, name: e.target.value })}
                                    placeholder="Masukkan nama"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Blok Rumah</label>
                                <input
                                    type="text"
                                    value={newParticipant.block}
                                    onChange={e => setNewParticipant({ ...newParticipant, block: e.target.value })}
                                    placeholder="Contoh: A-01"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="primary-button">
                                    <Plus size={18} />
                                    Tambah
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArisanDashboard;
