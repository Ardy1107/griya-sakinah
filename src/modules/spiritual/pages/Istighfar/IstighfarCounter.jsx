import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, RotateCcw, Target, Flame } from 'lucide-react';

export default function IstighfarCounter() {
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState(100);
    const [todayTotal, setTodayTotal] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const progress = Math.min((count / target) * 100, 100);

    const handleTap = () => {
        setCount(prev => prev + 1);
        setTodayTotal(prev => prev + 1);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 150);

        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    };

    const handleReset = () => {
        if (count > 0 && window.confirm('Reset hitungan sesi ini?')) {
            setCount(0);
        }
    };

    const handleResetAll = () => {
        if (window.confirm('Reset semua hitungan hari ini?')) {
            setCount(0);
            setTodayTotal(0);
        }
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                <div>
                    <h1>
                        <RefreshCw size={28} />
                        Istighfar Counter
                    </h1>
                    <p className="subtitle">Tasbih Digital - 100x/hari</p>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Target size={16} />
                    {target}x
                </div>
            </div>

            {/* Hadis-Hadis Tentang Istighfar */}
            <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
                <h4 style={{ marginBottom: '16px', color: '#a78bfa' }}>📖 Keutamaan Istighfar</h4>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: '4px' }}>HR. Abu Dawud & Ibnu Majah</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Barangsiapa istiqomah beristighfar, Allah akan memberikan <strong>jalan keluar</strong> dari setiap kesempitan dan <strong>rezeki</strong> dari arah yang tidak disangka."
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: '4px' }}>HR. Bukhari</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Demi Allah, sungguh aku beristighfar kepada Allah dan bertaubat lebih dari <strong>70 kali sehari</strong>."
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: '4px' }}>HR. Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Barangsiapa mengucapkan sayyidul istighfar dan <strong>yakin</strong>, lalu mati hari itu, ia masuk surga."
                    </p>
                </div>

                <div>
                    <div style={{ fontSize: '0.75rem', color: '#a78bfa', marginBottom: '4px' }}>QS. Nuh 71:10-12</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Mohonlah ampun kepada Rabb-mu. Niscaya Dia menurunkan <strong>hujan lebat</strong>, memperbanyak harta dan anak, dan memberikan kebun-kebun."
                    </p>
                </div>
            </div>

            {/* Main Counter */}
            <div className="spiritual-card" style={{ marginBottom: '16px', textAlign: 'center' }}>
                {/* Circular Progress */}
                <div style={{
                    position: 'relative',
                    width: '200px',
                    height: '200px',
                    margin: '0 auto 24px',
                }}>
                    <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Background circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="rgba(139, 92, 246, 0.2)"
                            strokeWidth="12"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 90}`}
                            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#a78bfa" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: '700',
                            color: '#8b5cf6',
                            transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.15s ease'
                        }}>
                            {count}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)' }}>
                            / {target}
                        </div>
                    </div>
                </div>

                {/* Tap Button */}
                <button
                    onClick={handleTap}
                    style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        border: 'none',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                        transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                        marginBottom: '16px'
                    }}
                >
                    TAP
                </button>

                {/* Istighfar Text */}
                <div style={{
                    padding: '16px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontFamily: "'Amiri', serif",
                        direction: 'rtl',
                        marginBottom: '8px'
                    }}>
                        أَسْتَغْفِرُ اللهَ الْعَظِيْمَ
                    </div>
                    <div style={{ fontSize: '0.875rem' }}>
                        Astaghfirullahal 'Azhim
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)', marginTop: '4px' }}>
                        "Aku memohon ampun kepada Allah Yang Maha Agung"
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <div>
                        <div style={{ fontWeight: '600', color: '#8b5cf6' }}>{count}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>Sesi ini</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', color: '#22c55e' }}>{todayTotal}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>Hari ini</div>
                    </div>
                </div>

                {count >= target && (
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '8px',
                        color: '#22c55e'
                    }}>
                        🎉 Alhamdulillah! Target {target}x tercapai!
                    </div>
                )}
            </div>

            {/* Target Settings */}
            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '12px' }}>🎯 Target Harian</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[33, 70, 100, 300, 1000].map(t => (
                        <button
                            key={t}
                            onClick={() => setTarget(t)}
                            className={`spiritual-btn ${target === t ? 'spiritual-btn-primary' : 'spiritual-btn-secondary'}`}
                            style={{ flex: 1, minWidth: '60px' }}
                        >
                            {t}x
                        </button>
                    ))}
                </div>
            </div>

            {/* Reset Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={handleReset}
                    className="spiritual-btn spiritual-btn-secondary"
                    style={{ flex: 1 }}
                >
                    <RotateCcw size={16} />
                    Reset Sesi
                </button>
                <button
                    onClick={handleResetAll}
                    className="spiritual-btn spiritual-btn-secondary"
                    style={{ flex: 1 }}
                >
                    Reset Semua
                </button>
            </div>
        </div>
    );
}
