/**
 * SEFT Proxy Child - Untuk Anak & Bayi
 * Dengan setup awal dan penutup yang benar
 * Menggunakan usapan lembut untuk anak-anak
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Baby, Play, CheckCircle, ChevronRight } from 'lucide-react';

const CHILD_ISSUES = [
    { category: 'Kesehatan', items: ['Demam', 'Batuk/Pilek', 'Rewel', 'Sulit Tidur', 'Tidak Nafsu Makan'] },
    { category: 'Emosi', items: ['Takut', 'Cemas', 'Menangis Terus', 'Tantrum', 'Mimpi Buruk'] },
    { category: 'Perkembangan', items: ['Sulit Bicara', 'Terlambat Jalan', 'Tidak Fokus', 'Hiperaktif'] },
    { category: 'Bayi', items: ['Kolik', 'Gumoh', 'Alergi', 'Gangguan Pencernaan', 'Sering Terbangun'] }
];

// Titik usapan lembut untuk anak (7 titik)
const GENTLE_POINTS = [
    { id: 1, name: 'Kepala', desc: 'Usap lembut ubun-ubun', emoji: '👶', action: 'Usap memutar perlahan' },
    { id: 2, name: 'Dahi', desc: 'Usap lembut area dahi', emoji: '✨', action: 'Usap dari tengah ke samping' },
    { id: 3, name: 'Pipi', desc: 'Usap lembut kedua pipi', emoji: '🥰', action: 'Usap dengan ibu jari' },
    { id: 4, name: 'Dada', desc: 'Usap lembut area dada', emoji: '💕', action: 'Usap memutar searah jarum jam' },
    { id: 5, name: 'Perut', desc: 'Usap lembut perut', emoji: '🌟', action: 'Usap memutar perlahan' },
    { id: 6, name: 'Punggung', desc: 'Usap lembut punggung', emoji: '🙏', action: 'Usap dari atas ke bawah' },
    { id: 7, name: 'Telapak Kaki', desc: 'Usap telapak kaki', emoji: '👣', action: 'Pijat lembut dengan ibu jari' }
];

export default function SEFTProxyChild() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [childName, setChildName] = useState('');
    const [childAge, setChildAge] = useState('');
    const [selectedIssues, setSelectedIssues] = useState([]);
    const [currentPoint, setCurrentPoint] = useState(0);
    const [setupDone, setSetupDone] = useState(false);

    const toggleIssue = (issue) => {
        setSelectedIssues(prev =>
            prev.includes(issue)
                ? prev.filter(i => i !== issue)
                : [...prev, issue]
        );
    };

    // Kalimat setup menjadi proxy untuk anak
    const getSetupPhrase = () => {
        return `Ya Allah, dengan izin-Mu dan kasih sayang-Mu,
saya menjadi wakil dari ${childName}.
Saya adalah ${childName}, ${childName} adalah saya.
Dengan cinta, saya menerima semua yang ${childName} rasakan.
Semua healing ini untuk ${childName}.`;
    };

    // Kalimat afirmasi saat mengusap
    const getAffirmation = () => {
        const masalah = selectedIssues.join(', ');
        return `Ya Allah, meskipun ${childName} mengalami ${masalah},
saya ikhlas dan pasrah kepada-Mu.
Sembuhkan ${childName} dengan kasih sayang-Mu.
${childName} adalah anak yang sehat dan bahagia.`;
    };

    // Kalimat penutup keluar dari proxy
    const getClosingPhrase = () => {
        return `Ya Allah, dengan izin-Mu, saya keluar dari ${childName}.
Saya kembali menjadi diri saya sendiri.
Saya pasrahkan ${childName} kepada perlindungan-Mu.
Jadikan ${childName} anak yang sehat, cerdas, dan sholeh/sholehah.
Aamiin Ya Rabbal Aalamiin.`;
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
        if (currentPoint < GENTLE_POINTS.length - 1) {
            setCurrentPoint(prev => prev + 1);
        } else {
            setStep(4);
        }
    };

    const finishSession = () => {
        setStep(5);
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual/seft" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            {/* Header */}
            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' }}>
                <div>
                    <h1 style={{ fontSize: '22px' }}>
                        <Baby size={24} />
                        SEFT untuk Anak
                    </h1>
                    <p className="subtitle" style={{ fontSize: '13px' }}>Terapi Lembut untuk Buah Hati</p>
                </div>
            </div>

            {/* Step 1: Child Info */}
            {step === 1 && (
                <div className="spiritual-card">
                    {/* Info Box */}
                    <div style={{
                        background: 'rgba(236,72,153,0.1)',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '20px',
                        border: '1px solid rgba(236,72,153,0.2)'
                    }}>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', margin: 0 }}>
                            💕 Untuk anak & bayi, gunakan <strong>usapan lembut</strong> penuh kasih sayang.
                            Anda juga akan menjadi "wakil" anak dengan membaca doa setup
                            di awal dan doa penutup di akhir sesi.
                        </p>
                    </div>

                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                        <Heart size={18} style={{ color: '#ec4899' }} />
                        Data Anak
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '8px' }}>
                            Nama Anak
                        </label>
                        <input
                            type="text"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            placeholder="Nama panggilan..."
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
                            Usia
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            {['0-6 bulan', '6-12 bulan', '1-3 tahun', '3-7 tahun'].map(age => (
                                <button
                                    key={age}
                                    onClick={() => setChildAge(age)}
                                    style={{
                                        padding: '12px',
                                        background: childAge === age ? 'linear-gradient(135deg, #ec4899, #f472b6)' : 'rgba(255,255,255,0.05)',
                                        border: childAge === age ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontSize: '13px',
                                        fontWeight: childAge === age ? '600' : '400',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {age}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        disabled={!childName || !childAge}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: childName && childAge ? 'linear-gradient(135deg, #ec4899, #f472b6)' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: childName && childAge ? 'pointer' : 'not-allowed',
                            opacity: childName && childAge ? 1 : 0.5,
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

            {/* Step 2: Select Issues */}
            {step === 2 && (
                <div className="spiritual-card">
                    <h3 style={{ marginBottom: '6px', fontSize: '16px' }}>Keluhan {childName}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                        Pilih keluhan yang dialami anak
                    </p>

                    {CHILD_ISSUES.map(category => (
                        <div key={category.category} style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '12px', color: '#f472b6', marginBottom: '8px', fontWeight: '600' }}>
                                {category.category}
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {category.items.map(issue => (
                                    <button
                                        key={issue}
                                        onClick={() => toggleIssue(issue)}
                                        style={{
                                            padding: '8px 12px',
                                            background: selectedIssues.includes(issue)
                                                ? 'linear-gradient(135deg, #ec4899, #f472b6)'
                                                : 'rgba(255,255,255,0.05)',
                                            border: selectedIssues.includes(issue) ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '20px',
                                            color: '#fff',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {issue}
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
                            disabled={selectedIssues.length === 0}
                            style={{
                                flex: 2,
                                padding: '14px',
                                background: selectedIssues.length > 0 ? 'linear-gradient(135deg, #ec4899, #f472b6)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: selectedIssues.length > 0 ? 'pointer' : 'not-allowed',
                                opacity: selectedIssues.length > 0 ? 1 : 0.5
                            }}
                        >
                            Mulai Terapi
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Setup */}
            {step === 3 && !setupDone && (
                <div className="spiritual-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ec4899, #f472b6)',
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

                    <h3 style={{ marginBottom: '6px', fontSize: '16px' }}>Setup - Menjadi Wakil {childName}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '12px' }}>
                        Letakkan tangan di dada, pejamkan mata, baca dengan penuh kasih
                    </p>

                    <div style={{
                        background: 'rgba(236,72,153,0.12)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        textAlign: 'left',
                        border: '1px solid rgba(236,72,153,0.2)'
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
                        Baca 3 kali dengan penuh perasaan dan kasih sayang
                    </p>

                    <button
                        onClick={completeSetup}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #ec4899, #f472b6)',
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
                        Sudah, Mulai Usapan
                    </button>
                </div>
            )}

            {/* Gentle Points */}
            {step === 3 && setupDone && (
                <div className="spiritual-card" style={{ textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '36px'
                    }}>
                        {GENTLE_POINTS[currentPoint].emoji}
                    </div>

                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                        Titik {currentPoint + 1} dari {GENTLE_POINTS.length}
                    </div>
                    <h3 style={{ marginBottom: '4px', fontSize: '18px' }}>
                        {GENTLE_POINTS[currentPoint].name}
                    </h3>
                    <p style={{ color: '#f472b6', marginBottom: '6px', fontSize: '13px' }}>
                        {GENTLE_POINTS[currentPoint].desc}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '12px' }}>
                        ✋ {GENTLE_POINTS[currentPoint].action}
                    </p>

                    <div style={{
                        background: 'rgba(236,72,153,0.12)',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '16px',
                        textAlign: 'left',
                        border: '1px solid rgba(236,72,153,0.2)'
                    }}>
                        <p style={{
                            fontSize: '13px',
                            color: 'rgba(255,255,255,0.9)',
                            lineHeight: '1.7',
                            margin: 0
                        }}>
                            <strong>Bacakan dengan lembut:</strong><br />
                            <span style={{ fontStyle: 'italic' }}>"{getAffirmation()}"</span>
                        </p>
                    </div>

                    {/* Progress */}
                    <div style={{
                        display: 'flex',
                        gap: '6px',
                        marginBottom: '16px',
                        justifyContent: 'center'
                    }}>
                        {GENTLE_POINTS.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: i <= currentPoint ? '#f472b6' : 'rgba(255,255,255,0.2)'
                                }}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextPoint}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #ec4899, #f472b6)',
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
                        {currentPoint < GENTLE_POINTS.length - 1 ? 'Titik Selanjutnya' : 'Selesai Usapan'}
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* Step 4: Closing */}
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
                        Penutup - Doa untuk {childName}
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontSize: '12px' }}>
                        Letakkan tangan di dada, baca doa penutup
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
                        Alhamdulillah! 🌟
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
                        Terapi untuk <strong>{childName}</strong> selesai.<br />
                        Semoga Allah melindungi dan menyembuhkan.
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => {
                                setStep(1);
                                setChildName('');
                                setChildAge('');
                                setSelectedIssues([]);
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
