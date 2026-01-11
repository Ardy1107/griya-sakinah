/**
 * SEFT Proxy - Untuk Orang Dewasa
 * Melakukan SEFT untuk orang lain yang tidak bisa melakukan sendiri
 * Dengan setup awal (menjadi proxy) dan penutup (keluar dari proxy)
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Play, CheckCircle, ChevronRight, History, X, Trash2, Loader2 } from 'lucide-react';
import { createSeftProxy, getSeftProxyHistory, deleteSeftProxy, getDeviceId } from '../../services/spiritualService';

const PROXY_EMOSI = [
    { category: 'Kesehatan', emotions: ['Sakit', 'Tidak Enak Badan', 'Kelelahan Kronis', 'Insomnia', 'Nyeri'] },
    { category: 'Keluarga', emotions: ['Konflik', 'Komunikasi Buruk', 'Kesepian', 'Jarak Emosional'] },
    { category: 'Trauma', emotions: ['Kehilangan', 'Duka', 'Pengalaman Masa Lalu', 'Ketakutan'] },
    { category: 'Mental', emotions: ['Depresi', 'Kecemasan', 'Overthinking', 'Stres Berkepanjangan'] }
];

// 18 Titik Tapping SEFT dengan afirmasi lengkap
const TAPPING_POINTS = [
    { id: 1, name: 'Crown', indo: 'Ubun-ubun', position: 'Puncak kepala', emoji: '🔵' },
    { id: 2, name: 'Eyebrow', indo: 'Pangkal Alis', position: 'Ujung alis dekat hidung', emoji: '👁️' },
    { id: 3, name: 'Side of Eye', indo: 'Samping Mata', position: 'Tulang di ujung luar mata', emoji: '👀' },
    { id: 4, name: 'Under Eye', indo: 'Bawah Mata', position: 'Tulang bawah pupil', emoji: '👁️' },
    { id: 5, name: 'Under Nose', indo: 'Bawah Hidung', position: 'Antara hidung dan bibir', emoji: '👃' },
    { id: 6, name: 'Chin', indo: 'Dagu', position: 'Lipatan bawah bibir', emoji: '😶' },
    { id: 7, name: 'Collarbone', indo: 'Tulang Selangka', position: 'Bawah tonjolan selangka', emoji: '🦴' },
    { id: 8, name: 'Under Arm', indo: 'Bawah Ketiak', position: '4 jari bawah ketiak', emoji: '💪' },
    { id: 9, name: 'Gamut', indo: 'Punggung Tangan', position: 'Antara jari manis-kelingking', emoji: '✋' }
];

export default function SEFTProxy() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [targetName, setTargetName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [selectedEmotion, setSelectedEmotion] = useState(''); // Fokus 1 masalah per sesi (rekomendasi Pak Faiz)
    const [customProblem, setCustomProblem] = useState(''); // Untuk masalah spesifik
    const [currentPoint, setCurrentPoint] = useState(0);
    const [setupDone, setSetupDone] = useState(false);
    const [setupPhase, setSetupPhase] = useState(1); // 1 = Setup Mewakili, 2 = Setup Ikhlas Pasrah

    // History tracking
    const [proxyHistory, setProxyHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deviceId] = useState(() => getDeviceId());

    // Load history from Supabase
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getSeftProxyHistory(deviceId);
            setProxyHistory(data);
        } catch (error) {
            console.error('Error loading proxy history:', error);
        }
    };

    // Save session to Supabase
    const saveToHistory = async () => {
        setLoading(true);
        try {
            const proxyData = {
                device_id: deviceId,
                target_name: targetName,
                relationship: relationship,
                problem: customProblem || selectedEmotion,
                category: PROXY_EMOSI.find(p => p.emotions.includes(selectedEmotion))?.category || 'Lainnya',
                tanggal: new Date().toISOString().split('T')[0],
                completed: true
            };

            await createSeftProxy(proxyData);
            await loadHistory(); // Reload history
        } catch (error) {
            console.error('Error saving proxy session:', error);
        } finally {
            setLoading(false);
        }
    };

    // Delete from Supabase
    const deleteFromHistory = async (id) => {
        try {
            await deleteSeftProxy(id);
            setProxyHistory(prev => prev.filter(h => h.id !== id));
        } catch (error) {
            console.error('Error deleting proxy session:', error);
        }
    };

    const selectEmotion = (emotion) => {
        setSelectedEmotion(prev => prev === emotion ? '' : emotion);
    };

    // ============ KALIMAT SETUP SURROGATE SEFT - METODE PAK FAIZ ZAINUDIN ============
    // Surrogate SEFT = SEFTing Jarak Jauh, dilakukan 3 KALI Setup

    // Setup 1: Menjadi Wakil (Proxy)
    const getSetup1MenjadiProxy = () => {
        const masalah = customProblem || selectedEmotion.toLowerCase();
        return `Ya Allah, mulai sekarang saya mewakili ${relationship.toLowerCase()} saya, ${targetName}, yang sedang ${masalah || 'mengalami masalah'}.`;
    };

    // Setup 2: SEFTing sebagai Proxy (ikhlas + pasrah)
    const getSetup2SebagaiProxy = () => {
        const masalah = customProblem || selectedEmotion.toLowerCase();
        return `Ya Allah, meskipun saya (seakan menjadi ${targetName}) sedang ${masalah || 'mengalami masalah'}...

...tapi saya IKHLAS menerima kondisi ini...

...saya PASRAHKAN pada-Mu kesembuhan saya, kedamaian hati saya, dan penyelesaian masalah ini.`;
    };

    // Tune-In phrase (saat tapping)
    const getTuneInPhrase = () => {
        return `Ya Allah, saya ikhlas... saya pasrah...

(Pusatkan pikiran pada ${targetName}, berusaha berempati dengan kondisinya)`;
    };

    // Setup 3: Keluar dari Proxy (WAJIB! agar tidak terpapar energi negatif)
    const getSetup3KeluarProxy = () => {
        const harapan = ['Sakit', 'Tidak Enak Badan', 'Kelelahan Kronis', 'Insomnia', 'Nyeri'].includes(selectedEmotion)
            ? 'kesembuhan' : 'kedamaian hati';

        return `Ya Allah, sekarang saya sudah TIDAK mewakili ${relationship.toLowerCase()} saya, ${targetName}.

Saya kembali menjadi diri saya sendiri.

Semoga Engkau karuniai ${targetName} ${harapan}, ketenangan jiwa, dan keberkahan dalam hidupnya.

آمِينَ يَا رَبَّ الْعَالَمِينَ`;
    };

    // Affirmation saat tapping
    const getAffirmation = () => {
        return `Ya Allah, saya ikhlas, saya pasrah...`;
    };

    const startTapping = () => {
        setStep(3);
        setSetupDone(false);
    };

    const completeSetup = () => {
        setSetupDone(true);
        setCurrentPoint(0);
    };

    const nextPoint = () => {
        if (currentPoint < TAPPING_POINTS.length - 1) {
            setCurrentPoint(prev => prev + 1);
        } else {
            setStep(4); // Go to closing
        }
    };

    const finishSession = () => {
        saveToHistory(); // Save to history before finishing
        setStep(5); // Completed
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual/seft" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            {/* Header with History Button */}
            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <div>
                    <h1 style={{ fontSize: '22px' }}>
                        <Users size={24} />
                        SEFT Proxy
                    </h1>
                    <p className="subtitle" style={{ fontSize: '13px' }}>Terapi untuk Orang Tersayang</p>
                </div>
                <button
                    onClick={() => setShowHistory(true)}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem'
                    }}
                >
                    <History size={16} />
                    {proxyHistory.length}
                </button>
            </div>

            {/* History Modal */}
            {showHistory && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }} onClick={() => setShowHistory(false)}>
                    <div style={{
                        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                        borderRadius: '20px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <History size={20} style={{ color: '#8b5cf6' }} />
                                Riwayat Didoakan
                            </h3>
                            <button
                                onClick={() => setShowHistory(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#fff'
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {proxyHistory.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: 'rgba(255,255,255,0.5)'
                            }}>
                                Belum ada sesi proxy yang tercatat
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {proxyHistory.map(session => (
                                    <div
                                        key={session.id}
                                        style={{
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '12px',
                                            padding: '14px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                {session.target_name}
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    color: 'rgba(255,255,255,0.5)',
                                                    marginLeft: '8px'
                                                }}>
                                                    ({session.relationship})
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>
                                                {session.problem}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                                {session.tanggal} • {new Date(session.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <CheckCircle size={18} style={{ color: '#22c55e' }} />
                                            <button
                                                onClick={() => deleteFromHistory(session.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '6px',
                                                    color: '#ef4444',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{
                            marginTop: '20px',
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.5)'
                        }}>
                            Total: {proxyHistory.length} orang sudah didoakan
                        </div>
                    </div>
                </div>
            )}

            {/* Step 1: Target Info */}
            {step === 1 && (
                <div className="spiritual-card">
                    {/* Info Box */}
                    <div style={{
                        background: 'rgba(99,102,241,0.1)',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '20px',
                        border: '1px solid rgba(99,102,241,0.2)'
                    }}>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', margin: 0 }}>
                            💡 <strong>SEFT Proxy</strong> adalah teknik terapi di mana Anda
                            "menjadi" orang yang akan diterapi. Anda akan mengucapkan doa setup
                            untuk menjadi wakil mereka, lalu melakukan tapping, dan diakhiri
                            dengan doa penutup untuk keluar dari peran proxy.
                        </p>
                    </div>

                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                        <Heart size={18} style={{ color: '#ec4899' }} />
                        Untuk Siapa SEFT Ini?
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '8px' }}>
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            value={targetName}
                            onChange={(e) => setTargetName(e.target.value)}
                            placeholder="Contoh: Ahmad, Ibu Sri..."
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '15px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '8px' }}>
                            Hubungan
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            {['Pasangan', 'Orang Tua', 'Anak', 'Saudara', 'Teman', 'Lainnya'].map(rel => (
                                <button
                                    key={rel}
                                    onClick={() => setRelationship(rel)}
                                    style={{
                                        padding: '12px',
                                        background: relationship === rel ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                                        border: relationship === rel ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        fontWeight: relationship === rel ? '600' : '400',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {rel}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        disabled={!targetName || !relationship}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: targetName && relationship ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: targetName && relationship ? 'pointer' : 'not-allowed',
                            opacity: targetName && relationship ? 1 : 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        Lanjutkan
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* Step 2: Select ONE Problem (Rekomendasi Pak Faiz: 1 masalah per sesi) */}
            {step === 2 && (
                <div className="spiritual-card">
                    <h3 style={{ marginBottom: '6px', fontSize: '16px' }}>Pilih 1 Masalah {targetName}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                        ⚠️ Fokus 1 masalah per sesi (rekomendasi Pak Faiz untuk hasil optimal)
                    </p>

                    {PROXY_EMOSI.map(category => (
                        <div key={category.category} style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '12px', color: '#8b5cf6', marginBottom: '8px', fontWeight: '600' }}>
                                {category.category}
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {category.emotions.map(emotion => (
                                    <button
                                        key={emotion}
                                        onClick={() => selectEmotion(emotion)}
                                        style={{
                                            padding: '8px 12px',
                                            background: selectedEmotion === emotion
                                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                : 'rgba(255,255,255,0.05)',
                                            border: selectedEmotion === emotion ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '20px',
                                            color: '#fff',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {selectedEmotion === emotion && '✓ '}{emotion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Custom Problem Input */}
                    <div style={{ marginTop: '20px', marginBottom: '16px' }}>
                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '8px' }}>
                            Atau tuliskan masalah spesifik (opsional):
                        </label>
                        <input
                            type="text"
                            value={customProblem}
                            onChange={(e) => setCustomProblem(e.target.value)}
                            placeholder="Contoh: sakit perut mules, cemas ujian, dll..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            onClick={() => setStep(1)}
                            style={{
                                flex: 1,
                                padding: '14px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            Kembali
                        </button>
                        <button
                            onClick={startTapping}
                            disabled={!selectedEmotion && !customProblem}
                            style={{
                                flex: 2,
                                padding: '14px',
                                background: (selectedEmotion || customProblem) ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: (selectedEmotion || customProblem) ? 'pointer' : 'not-allowed',
                                opacity: (selectedEmotion || customProblem) ? 1 : 0.5
                            }}
                        >
                            Mulai Terapi
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Setup Phase 1 - Menjadi Proxy */}
            {step === 3 && !setupDone && setupPhase === 1 && (
                <div className="spiritual-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '50%',
                        width: '70px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '28px'
                    }}>
                        🙏
                    </div>

                    <div style={{
                        background: 'rgba(99,102,241,0.3)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        display: 'inline-block',
                        marginBottom: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                    }}>
                        SETUP 1 dari 3
                    </div>

                    <h3 style={{ marginBottom: '6px', fontSize: '16px' }}>Menjadi Wakil (Proxy)</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '12px' }}>
                        Tekan titik Sore Spot di dada sambil membaca dengan penghayatan
                    </p>

                    <div style={{
                        background: 'rgba(99,102,241,0.15)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        textAlign: 'left',
                        border: '1px solid rgba(99,102,241,0.2)'
                    }}>
                        <p style={{
                            fontSize: '15px',
                            color: '#fff',
                            lineHeight: '1.8',
                            margin: 0,
                            fontStyle: 'italic',
                            fontWeight: '500'
                        }}>
                            "{getSetup1MenjadiProxy()}"
                        </p>
                    </div>

                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                        Baca 1x dengan khusyuk, lalu lanjut ke Setup 2
                    </p>

                    <button
                        onClick={() => setSetupPhase(2)}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Play size={18} />
                        Sudah, Lanjut Setup 2
                    </button>
                </div>
            )}

            {/* Step 3: Setup Phase 2 - Ikhlas & Pasrah sebagai Proxy */}
            {step === 3 && !setupDone && setupPhase === 2 && (
                <div className="spiritual-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        borderRadius: '50%',
                        width: '70px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '28px'
                    }}>
                        💚
                    </div>

                    <div style={{
                        background: 'rgba(34,197,94,0.3)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        display: 'inline-block',
                        marginBottom: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                    }}>
                        SETUP 2 dari 3
                    </div>

                    <h3 style={{ marginBottom: '6px', fontSize: '16px' }}>Ikhlas & Pasrah</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '12px' }}>
                        Bayangkan Anda adalah {targetName}, rasakan empati dengan kondisinya
                    </p>

                    <div style={{
                        background: 'rgba(34,197,94,0.12)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        textAlign: 'left',
                        border: '1px solid rgba(34,197,94,0.2)'
                    }}>
                        <p style={{
                            fontSize: '15px',
                            color: '#fff',
                            lineHeight: '1.9',
                            margin: 0,
                            fontStyle: 'italic',
                            fontWeight: '500',
                            whiteSpace: 'pre-line'
                        }}>
                            "{getSetup2SebagaiProxy()}"
                        </p>
                    </div>

                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                        Tekan Sore Spot, baca dengan penuh penghayatan, lalu mulai Tapping
                    </p>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setSetupPhase(1)}
                            style={{
                                flex: 1,
                                padding: '14px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            Kembali
                        </button>
                        <button
                            onClick={() => {
                                setSetupDone(true);
                                setCurrentPoint(0);
                            }}
                            style={{
                                flex: 2,
                                padding: '14px',
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Play size={18} />
                            Mulai Tapping
                        </button>
                    </div>
                </div>
            )}

            {/* Tapping Points */}
            {step === 3 && setupDone && (
                <div className="spiritual-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '50%',
                        width: '70px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '28px'
                    }}>
                        {TAPPING_POINTS[currentPoint].emoji}
                    </div>

                    <div style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.5)',
                        marginBottom: '4px'
                    }}>
                        Titik {currentPoint + 1} dari {TAPPING_POINTS.length}
                    </div>
                    <h3 style={{ marginBottom: '4px', fontSize: '18px' }}>
                        {TAPPING_POINTS[currentPoint].indo}
                    </h3>
                    <p style={{ color: '#8b5cf6', marginBottom: '16px', fontSize: '13px' }}>
                        {TAPPING_POINTS[currentPoint].position}
                    </p>

                    <div style={{
                        background: 'rgba(99,102,241,0.12)',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '16px',
                        textAlign: 'left',
                        border: '1px solid rgba(99,102,241,0.2)'
                    }}>
                        <p style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.9)',
                            lineHeight: '1.7',
                            margin: 0
                        }}>
                            <strong>Ketuk 5-7x sambil ucapkan:</strong><br />
                            <span style={{ fontStyle: 'italic' }}>"{getAffirmation()}"</span>
                        </p>
                    </div>

                    {/* Progress dots */}
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        marginBottom: '16px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {TAPPING_POINTS.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: i <= currentPoint ? '#8b5cf6' : 'rgba(255,255,255,0.2)'
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextPoint}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {currentPoint < TAPPING_POINTS.length - 1 ? 'Titik Selanjutnya' : 'Selesai Tapping'}
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* Step 4: Setup 3 - Keluar dari Proxy (WAJIB!) */}
            {step === 4 && (
                <div className="spiritual-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                        borderRadius: '50%',
                        width: '70px',
                        height: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '28px'
                    }}>
                        🤲
                    </div>

                    <div style={{
                        background: 'rgba(245,158,11,0.3)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        display: 'inline-block',
                        marginBottom: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                    }}>
                        SETUP 3 dari 3 ⚠️ WAJIB
                    </div>

                    <h3 style={{ marginBottom: '6px', fontSize: '16px', color: '#f59e0b' }}>
                        Keluar dari Proxy
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '12px' }}>
                        ⚠️ INI WAJIB dilakukan agar tidak terpapar energi negatif!
                    </p>

                    {/* Breathing instruction */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '16px',
                        border: '1px dashed rgba(255,255,255,0.2)'
                    }}>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                            🌬️ Tarik napas dalam... hembuskan perlahan... (ulangi 3x)<br />
                            Lalu baca doa penutup berikut:
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(245,158,11,0.12)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        textAlign: 'left',
                        border: '1px solid rgba(245,158,11,0.2)'
                    }}>
                        <p style={{
                            fontSize: '15px',
                            color: '#fff',
                            lineHeight: '1.9',
                            margin: 0,
                            fontStyle: 'italic',
                            fontWeight: '500',
                            whiteSpace: 'pre-line'
                        }}>
                            "{getSetup3KeluarProxy()}"
                        </p>
                    </div>

                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                        Tekan Sore Spot, baca dengan khusyuk, rasakan kembali menjadi diri sendiri
                    </p>

                    <button
                        onClick={finishSession}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <CheckCircle size={18} />
                        Selesai - Kembali Menjadi Diri Sendiri
                    </button>
                </div>
            )}

            {/* Step 5: Completed */}
            {step === 5 && (
                <div className="spiritual-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <CheckCircle size={40} />
                    </div>

                    <h3 style={{ marginBottom: '8px', color: '#22c55e', fontSize: '18px' }}>
                        Alhamdulillah! ✨
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
                        SEFT Proxy untuk <strong>{targetName}</strong> telah selesai.<br />
                        Semoga Allah memberikan kesembuhan.
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => {
                                setStep(1);
                                setTargetName('');
                                setRelationship('');
                                setSelectedEmotions([]);
                                setCurrentPoint(0);
                                setSetupDone(false);
                            }}
                            style={{
                                flex: 1,
                                padding: '14px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            Ulangi
                        </button>
                        <button
                            onClick={() => navigate('/spiritual/seft')}
                            style={{
                                flex: 1,
                                padding: '14px',
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Selesai
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
