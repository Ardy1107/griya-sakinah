/**
 * SEFT Proxy - Untuk Orang Dewasa
 * Melakukan SEFT untuk orang lain yang tidak bisa melakukan sendiri
 * Dengan setup awal (menjadi proxy) dan penutup (keluar dari proxy)
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Play, CheckCircle, ChevronRight } from 'lucide-react';

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
    const [selectedEmotions, setSelectedEmotions] = useState([]);
    const [currentPoint, setCurrentPoint] = useState(0);
    const [setupDone, setSetupDone] = useState(false);

    const toggleEmotion = (emotion) => {
        setSelectedEmotions(prev =>
            prev.includes(emotion)
                ? prev.filter(e => e !== emotion)
                : [...prev, emotion]
        );
    };

    // Generate kalimat setup menjadi proxy
    const getSetupPhrase = () => {
        return `Ya Allah, dengan izin-Mu, saya menjadi wakil dari ${targetName}. 
Saya adalah ${targetName}. ${targetName} adalah saya.
Semua yang saya rasakan adalah yang ${targetName} rasakan.
Semua healing yang saya terima, diterima juga oleh ${targetName}.`;
    };

    // Generate kalimat afirmasi untuk setiap titik
    const getAffirmation = () => {
        const masalah = selectedEmotions.join(', ');
        return `Ya Allah, meskipun ${targetName} mengalami ${masalah}, 
saya ikhlas menerima kondisi ini sepenuhnya.
Saya pasrah kepada-Mu Ya Allah.
Saya mohon kesembuhan untuk ${targetName}.`;
    };

    // Generate kalimat penutup keluar dari proxy
    const getClosingPhrase = () => {
        return `Ya Allah, dengan izin-Mu, saya keluar dari ${targetName}.
Saya adalah saya sendiri kembali.
Saya ikhlas dan pasrah atas hasil terapi ini.
Semoga ${targetName} mendapat kesembuhan dari-Mu. Aamiin.`;
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
        setStep(5); // Completed
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual/seft" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            {/* Header */}
            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <div>
                    <h1 style={{ fontSize: '22px' }}>
                        <Users size={24} />
                        SEFT Proxy
                    </h1>
                    <p className="subtitle" style={{ fontSize: '13px' }}>Terapi untuk Orang Tersayang</p>
                </div>
            </div>

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

            {/* Step 2: Select Emotions */}
            {step === 2 && (
                <div className="spiritual-card">
                    <h3 style={{ marginBottom: '6px', fontSize: '16px' }}>Pilih Masalah {targetName}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                        Pilih satu atau lebih masalah yang dialami
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
                                        onClick={() => toggleEmotion(emotion)}
                                        style={{
                                            padding: '8px 12px',
                                            background: selectedEmotions.includes(emotion)
                                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                                : 'rgba(255,255,255,0.05)',
                                            border: selectedEmotions.includes(emotion) ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '20px',
                                            color: '#fff',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {emotion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

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
                            disabled={selectedEmotions.length === 0}
                            style={{
                                flex: 2,
                                padding: '14px',
                                background: selectedEmotions.length > 0 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: selectedEmotions.length > 0 ? 'pointer' : 'not-allowed',
                                opacity: selectedEmotions.length > 0 ? 1 : 0.5
                            }}
                        >
                            Mulai Terapi
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Setup & Tapping Session */}
            {step === 3 && !setupDone && (
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

                    <h3 style={{ marginBottom: '6px', fontSize: '16px' }}>Setup - Menjadi Proxy</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '12px' }}>
                        Tekan titik Sore Spot di dada sambil membaca
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
                            fontSize: '14px',
                            color: '#fff',
                            lineHeight: '1.8',
                            margin: 0,
                            fontStyle: 'italic'
                        }}>
                            "{getSetupPhrase()}"
                        </p>
                    </div>

                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                        Baca dengan penuh penghayatan 3x sambil tekan dada kiri
                    </p>

                    <button
                        onClick={completeSetup}
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
                        Sudah, Lanjut Tapping
                    </button>
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

            {/* Step 4: Closing - Keluar dari Proxy */}
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

                    <h3 style={{ marginBottom: '6px', fontSize: '16px', color: '#f59e0b' }}>
                        Penutup - Keluar dari Proxy
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '12px' }}>
                        Tekan titik Sore Spot sambil membaca doa penutup
                    </p>

                    <div style={{
                        background: 'rgba(245,158,11,0.12)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        textAlign: 'left',
                        border: '1px solid rgba(245,158,11,0.2)'
                    }}>
                        <p style={{
                            fontSize: '14px',
                            color: '#fff',
                            lineHeight: '1.8',
                            margin: 0,
                            fontStyle: 'italic'
                        }}>
                            "{getClosingPhrase()}"
                        </p>
                    </div>

                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                        Baca dengan khusyuk, tarik napas dalam, hembuskan
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
                        Selesai
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
