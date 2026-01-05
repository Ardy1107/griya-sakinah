import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../contexts/CommunityContext';
import { ArrowLeft, RefreshCw, Trophy, Users, Calendar, Gift, Video, Download, Smartphone, Monitor, X } from 'lucide-react';
import './ArisanPage.css';

const formatRupiah = (value) => {
    return `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
};

// Detect mobile device
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth < 768;
};

const ArisanPage = () => {
    const { arisan, spinArisan, resetArisan } = useCommunity();
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [spinDuration, setSpinDuration] = useState(10);
    const wheelRef = useRef(null);

    // Video Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
    const [recordingError, setRecordingError] = useState(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const spinContainerRef = useRef(null);

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);
    const [showRecordGuide, setShowRecordGuide] = useState(false);

    // Check if mobile on mount
    useEffect(() => {
        setIsMobile(isMobileDevice());
        const handleResize = () => setIsMobile(isMobileDevice());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const eligibleMembers = arisan.members.filter(m => !m.hasWon);
    const totalMembers = arisan.members.length;

    // Start Recording Function
    const startRecording = async () => {
        try {
            setRecordingError(null);
            setRecordedVideoUrl(null);
            recordedChunksRef.current = [];

            // Request screen capture with better quality
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: false
            });

            // Find the best supported mimeType
            let mimeType = 'video/webm';
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                mimeType = 'video/webm;codecs=vp8';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setRecordedVideoUrl(url);
                setIsRecording(false);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            // Start with timeslice to get data every second
            mediaRecorder.start(1000);
            setIsRecording(true);

            return true;
        } catch (err) {
            console.error('Recording error:', err);
            setRecordingError('Tidak bisa merekam. Pastikan Anda mengizinkan screen sharing.');
            setIsRecording(false);
            return false;
        }
    };

    // Stop Recording Function
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    // Download Video Function
    const downloadVideo = () => {
        if (recordedVideoUrl) {
            const a = document.createElement('a');
            a.href = recordedVideoUrl;
            const date = new Date().toISOString().split('T')[0];
            a.download = `arisan-spin-${date}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const handleSpin = async () => {
        if (isSpinning || eligibleMembers.length === 0) return;

        setIsSpinning(true);
        setWinner(null);

        // Spin animation
        const wheel = wheelRef.current;
        const rotationsPerSecond = 360;
        const totalRotation = rotationsPerSecond * spinDuration + Math.random() * 720;
        wheel.style.transition = `transform ${spinDuration}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
        wheel.style.transform = `rotate(${totalRotation}deg)`;

        setTimeout(() => {
            const result = spinArisan();
            setWinner(result);
            setShowConfetti(true);
            setIsSpinning(false);

            // Stop recording after winner is shown
            setTimeout(() => {
                stopRecording();
            }, 2000);

            setTimeout(() => setShowConfetti(false), 5000);
        }, spinDuration * 1000);
    };

    // Handle Spin with Recording
    const handleSpinWithRecord = async () => {
        const started = await startRecording();
        if (started) {
            // Small delay to ensure recording has started
            setTimeout(() => {
                handleSpin();
            }, 500);
        }
    };

    const handleReset = () => {
        if (window.confirm('Yakin ingin reset arisan? Semua riwayat akan dihapus.')) {
            resetArisan();
            setWinner(null);
            setRecordedVideoUrl(null);
            if (wheelRef.current) {
                wheelRef.current.style.transition = 'none';
                wheelRef.current.style.transform = 'rotate(0deg)';
            }
        }
    };

    const durationOptions = [5, 10, 15, 20, 30];

    return (
        <div className="arisan-page">
            {showConfetti && <div className="confetti-overlay" />}

            {/* Header */}
            <header className="arisan-header">
                <Link to="/komunitas" className="back-button">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1>Arisan Warga</h1>
                    <p>{arisan.name}</p>
                </div>
            </header>

            {/* Stats */}
            <div className="arisan-stats">
                <div className="stat-card">
                    <Gift size={24} />
                    <div>
                        <span className="value">{formatRupiah(arisan.amount)}</span>
                        <span className="label">Per Bulan</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Users size={24} />
                    <div>
                        <span className="value">{totalMembers}</span>
                        <span className="label">Anggota</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Trophy size={24} />
                    <div>
                        <span className="value">{eligibleMembers.length}</span>
                        <span className="label">Belum Dapat</span>
                    </div>
                </div>
            </div>

            {/* Spin Wheel Section */}
            <div className="spin-section" ref={spinContainerRef}>
                {/* Duration Selector */}
                <div className="duration-selector">
                    <label>Durasi Putar:</label>
                    <div className="duration-options">
                        {durationOptions.map(sec => (
                            <button
                                key={sec}
                                className={`duration-btn ${spinDuration === sec ? 'active' : ''}`}
                                onClick={() => setSpinDuration(sec)}
                                disabled={isSpinning}
                            >
                                {sec}s
                            </button>
                        ))}
                    </div>
                </div>

                <div className="wheel-container">
                    <div className="wheel-pointer">▼</div>
                    <div className="wheel" ref={wheelRef}>
                        {eligibleMembers.map((member, index) => {
                            const rotation = (360 / eligibleMembers.length) * index;
                            const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6'];
                            return (
                                <div
                                    key={member.id}
                                    className="wheel-segment"
                                    style={{
                                        transform: `rotate(${rotation}deg)`,
                                        background: colors[index % colors.length]
                                    }}
                                >
                                    <span>{member.name}</span>
                                </div>
                            );
                        })}
                        <div className="wheel-center">
                            <Gift size={32} />
                        </div>
                    </div>
                </div>

                {/* Spin Buttons */}
                <div className="spin-buttons">
                    <button
                        className={`spin-button ${isSpinning ? 'spinning' : ''}`}
                        onClick={handleSpin}
                        disabled={isSpinning || eligibleMembers.length === 0}
                    >
                        <RefreshCw size={24} className={isSpinning ? 'spin-icon' : ''} />
                        {isSpinning ? `Memutar ${spinDuration}s...` : 'PUTAR!'}
                    </button>


                    <button
                        className="record-spin-button"
                        onClick={() => isMobile ? setShowRecordGuide(true) : handleSpinWithRecord()}
                        disabled={isSpinning || eligibleMembers.length === 0 || isRecording}
                        title="Putar & Rekam Video untuk dibagikan ke WhatsApp"
                    >
                        <Video size={20} />
                        {isRecording ? 'Merekam...' : isMobile ? '📹 Rekam' : 'Putar + Rekam'}
                    </button>
                </div>

                {/* Mobile Recording Guide Modal */}
                {showRecordGuide && (
                    <div className="record-guide-overlay" onClick={() => setShowRecordGuide(false)}>
                        <div className="record-guide-modal" onClick={e => e.stopPropagation()}>
                            <button className="close-guide-btn" onClick={() => setShowRecordGuide(false)}>
                                <X size={20} />
                            </button>
                            <div className="guide-icon">
                                <Smartphone size={48} />
                            </div>
                            <h3>Cara Rekam di HP</h3>
                            <div className="guide-steps">
                                <div className="guide-step">
                                    <span className="step-num">1</span>
                                    <p><strong>Buka Screen Recorder HP</strong><br />
                                        Geser dari atas layar, cari ikon "Screen Record" atau "Rekam Layar"</p>
                                </div>
                                <div className="guide-step">
                                    <span className="step-num">2</span>
                                    <p><strong>Mulai Rekam</strong><br />
                                        Tekan tombol rekam, tunggu hitungan mundur</p>
                                </div>
                                <div className="guide-step">
                                    <span className="step-num">3</span>
                                    <p><strong>Putar Arisan</strong><br />
                                        Kembali ke halaman ini, tekan tombol "PUTAR!"</p>
                                </div>
                                <div className="guide-step">
                                    <span className="step-num">4</span>
                                    <p><strong>Stop & Bagikan</strong><br />
                                        Setelah pemenang muncul, stop rekaman, lalu bagikan ke WhatsApp</p>
                                </div>
                            </div>
                            <button className="guide-close-btn" onClick={() => setShowRecordGuide(false)}>
                                Mengerti, Saya Mau Rekam!
                            </button>
                        </div>
                    </div>
                )}

                {/* Recording Status - Desktop only */}
                {isRecording && !isMobile && (
                    <div className="recording-indicator">
                        <span className="recording-dot"></span>
                        Sedang merekam... Video akan tersimpan setelah pemenang muncul
                    </div>
                )}

                {/* Recording Error */}
                {recordingError && (
                    <div className="recording-error">
                        ⚠️ {recordingError}
                    </div>
                )}

                {/* Download Video Button - Desktop only */}
                {recordedVideoUrl && !isSpinning && !isMobile && (
                    <div className="download-video-section">
                        <button className="download-video-btn" onClick={downloadVideo}>
                            <Download size={20} />
                            Download Video untuk WhatsApp
                        </button>
                        <p className="download-hint">Klik untuk simpan video dan bagikan ke grup WA</p>
                    </div>
                )}

                {eligibleMembers.length === 0 && (
                    <p className="no-eligible">Semua anggota sudah dapat arisan!</p>
                )}
            </div>

            {/* Winner Announcement */}
            {winner && (
                <div className="winner-card">
                    <Trophy size={48} />
                    <h2>🎉 Selamat!</h2>
                    <p className="winner-name">{winner.name}</p>
                    <p className="winner-blok">Blok {winner.blok}</p>
                    <p className="winner-amount">Mendapat {formatRupiah(arisan.amount * totalMembers)}</p>
                </div>
            )}

            {/* Members List */}
            <div className="members-section">
                <div className="section-header">
                    <h2>Daftar Anggota</h2>
                    <button className="reset-btn" onClick={handleReset}>
                        Reset Arisan
                    </button>
                </div>
                <div className="members-grid">
                    {arisan.members.map(member => (
                        <div key={member.id} className={`member-card ${member.hasWon ? 'won' : ''}`}>
                            <div className="member-avatar">
                                {member.name.charAt(0)}
                            </div>
                            <div className="member-info">
                                <span className="member-name">{member.name}</span>
                                <span className="member-blok">Blok {member.blok}</span>
                            </div>
                            {member.hasWon && (
                                <div className="won-badge">
                                    <Trophy size={14} />
                                    Sudah Dapat
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* History */}
            {arisan.history.length > 0 && (
                <div className="history-section">
                    <h2>Riwayat Pemenang</h2>
                    <div className="history-list">
                        {arisan.history.map((item, idx) => (
                            <div key={idx} className="history-item">
                                <div className="history-date">
                                    <Calendar size={14} />
                                    {new Date(item.date).toLocaleDateString('id-ID')}
                                </div>
                                <div className="history-winner">
                                    <Trophy size={14} />
                                    {item.winner} (Blok {item.blok})
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArisanPage;
