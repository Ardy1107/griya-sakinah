/**
 * Multi-Modal Health Scan Component
 * Combines 5 diagnostic methods for comprehensive health screening
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, MessageCircle as Tongue, Hand, SmilePlus,
    ClipboardList, ArrowLeft, ArrowRight, Camera,
    Upload, X, Loader2, AlertTriangle, CheckCircle,
    Activity, Heart, Pill, Sparkles
} from 'lucide-react';
import {
    analyzeIridology,
    analyzeTongueWithGemini,
    analyzeNailWithGemini,
    analyzeFaceWithGemini,
    combineMultiModalAnalysis
} from '../../services/geminiVisionService';
import {
    QUESTIONNAIRE_SECTIONS,
    FREQUENCY_OPTIONS,
    YESNO_OPTIONS,
    SCALE_OPTIONS,
    calculateQuestionnaireScore
} from '../../data/symptomQuestionnaire';
import '../../spiritual.css';

// Organ to Emotion mapping (same as IridologyAnalysis)
const ORGAN_EMOTIONS = {
    'Hati': ['Marah', 'Frustrasi', 'Dendam', 'Benci'],
    'Jantung': ['Patah Hati', 'Kesepian', 'Sedih Mendalam'],
    'Ginjal': ['Takut', 'Cemas', 'Trauma'],
    'Limpa': ['Khawatir', 'Overthinking', 'Ragu-ragu'],
    'Lambung': ['Khawatir', 'Overthinking', 'Cemas'],
    'Paru': ['Sedih', 'Duka', 'Kehilangan'],
    'Otak': ['Stres', 'Overthinking', 'Perfeksionis'],
    'Usus Besar': ['Cemas', 'Tidak Bisa Melepaskan'],
    'Adrenal': ['Burnout', 'Kelelahan Kronis'],
    'Tiroid': ['Sensitif', 'Mudah Tersinggung'],
    'Kandung Kemih': ['Takut Gagal', 'Insecure'],
    'Organ Reproduksi': ['Trauma Seksual', 'Malu'],
};

// Organ to Herbal mapping (capsule-based 600mg)
const ORGAN_HERBS = {
    'Hati': [
        { name: 'Temulawak', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Kunyit', dosage: '1 kapsul (600mg)', schedule: 'pagi' },
    ],
    'Jantung': [
        { name: 'Rosella Merah', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Gamat Emas', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    'Ginjal': [
        { name: 'Pegagan', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
        { name: 'Habbatussauda', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
    'Limpa': [
        { name: 'Kulit Manggis', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
    'Lambung': [
        { name: 'Kunyit', dosage: '1 kapsul (600mg)', schedule: 'sebelum makan' },
        { name: 'Temulawak', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
    'Paru': [
        { name: 'Jahe Merah', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Kitolod', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    'Otak': [
        { name: 'Pegagan', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Ginseng Panax', dosage: '1 kapsul (600mg)', schedule: 'pagi' },
    ],
    'Usus Besar': [
        { name: 'Jati Cina', dosage: '1 kapsul (600mg)', schedule: 'malam' },
    ],
    'Adrenal': [
        { name: 'Ginseng Panax', dosage: '1 kapsul (600mg)', schedule: 'pagi' },
        { name: 'Habbatussauda', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
};

const SCAN_TYPES = [
    { id: 'iris', label: 'Iris (Mata)', icon: Eye, weight: '30%', required: true },
    { id: 'tongue', label: 'Lidah', icon: Tongue, weight: '25%', required: false },
    { id: 'nail', label: 'Kuku/Tangan', icon: Hand, weight: '15%', required: false },
    { id: 'face', label: 'Wajah', icon: SmilePlus, weight: '15%', required: false },
];

// Upload Box Component with Premium iOS Dark Styling
function UploadBox({ label, type, preview, onUpload, onRemove, color = '#3b82f6', small = false }) {
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(type, file);
        }
    };

    if (preview) {
        return (
            <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: small ? '1' : '16/10',
                background: '#000'
            }}>
                <img
                    src={preview}
                    alt={label}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
                <button
                    onClick={() => onRemove(type)}
                    style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'rgba(239,68,68,0.9)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={16} />
                </button>
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '8px 12px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <CheckCircle size={14} style={{ color: '#22c55e' }} />
                    <span style={{ fontSize: '12px', color: '#fff' }}>{label}</span>
                </div>
            </div>
        );
    }

    return (
        <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: small ? '20px 12px' : '24px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: `2px dashed ${color}40`,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            aspectRatio: small ? '1' : 'auto',
            minHeight: small ? 'auto' : '100px'
        }}>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Camera size={20} style={{ color }} />
            </div>
            <span style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center'
            }}>
                {label}
            </span>
        </label>
    );
}

export default function MultiModalScan() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1-5 steps
    const [photos, setPhotos] = useState({
        irisRight: null, irisLeft: null,
        tongue: null, nailRight: null, nailLeft: null, face: null
    });
    const [photoPreviews, setPhotoPreviews] = useState({});
    const [answers, setAnswers] = useState({});
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handlePhotoUpload = (type, file) => {
        if (file) {
            setPhotos(prev => ({ ...prev, [type]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviews(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (type) => {
        setPhotos(prev => ({ ...prev, [type]: null }));
        setPhotoPreviews(prev => ({ ...prev, [type]: null }));
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const runAnalysis = async () => {
        setAnalyzing(true);
        setError(null);
        setStep(4);

        const analysisResults = {};

        try {
            // Analyze Iris (if provided)
            if (photos.irisRight || photos.irisLeft) {
                setAnalysisProgress('👁️ Menganalisis iris mata...');
                const irisResult = await analyzeIridology(photos.irisRight, photos.irisLeft);
                analysisResults.iris = irisResult;
            }

            // Analyze Tongue (if provided)
            if (photos.tongue) {
                setAnalysisProgress('👅 Menganalisis lidah...');
                const tongueResult = await analyzeTongueWithGemini(photos.tongue);
                analysisResults.tongue = tongueResult;
            }

            // Analyze Nail (if provided)
            if (photos.nail) {
                setAnalysisProgress('✋ Menganalisis kuku...');
                const nailResult = await analyzeNailWithGemini(photos.nail);
                analysisResults.nail = nailResult;
            }

            // Analyze Face (if provided)
            if (photos.face) {
                setAnalysisProgress('😊 Menganalisis wajah...');
                const faceResult = await analyzeFaceWithGemini(photos.face);
                analysisResults.face = faceResult;
            }

            // Calculate questionnaire score
            setAnalysisProgress('📝 Menghitung skor kuesioner...');
            const questionnaireScore = calculateQuestionnaireScore(answers);

            // Combine all results
            setAnalysisProgress('🔬 Menggabungkan hasil analisis...');
            const combinedResults = combineMultiModalAnalysis(analysisResults, questionnaireScore);

            // Generate recommendations
            const recommendations = generateRecommendations(combinedResults);

            setResults({
                ...combinedResults,
                ...recommendations
            });

            setStep(5);

        } catch (err) {
            console.error('Analysis failed:', err);
            setError(err.message);
            setStep(2);
        } finally {
            setAnalyzing(false);
            setAnalysisProgress('');
        }
    };

    const generateRecommendations = (combinedResults) => {
        const emotions = [];
        const herbs = [];

        combinedResults.organPriorities?.forEach(({ organ }) => {
            // Match emotions
            Object.entries(ORGAN_EMOTIONS).forEach(([key, emotionList]) => {
                if (organ.toLowerCase().includes(key.toLowerCase())) {
                    emotionList.forEach(e => {
                        if (!emotions.find(em => em.name === e)) {
                            emotions.push({ name: e, organ: key });
                        }
                    });
                }
            });

            // Match herbs
            Object.entries(ORGAN_HERBS).forEach(([key, herbList]) => {
                if (organ.toLowerCase().includes(key.toLowerCase())) {
                    herbList.forEach(h => {
                        if (!herbs.find(hb => hb.name === h.name)) {
                            herbs.push({ ...h, organ: key });
                        }
                    });
                }
            });
        });

        return {
            emotionRecommendations: emotions.slice(0, 8),
            herbalRecommendations: herbs.slice(0, 10)
        };
    };

    const canProceedFromStep2 = () => {
        return photos.irisRight || photos.irisLeft || photos.tongue || photos.nail || photos.face;
    };

    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = QUESTIONNAIRE_SECTIONS.reduce((acc, s) => acc + s.questions.length, 0);

    return (
        <div className="spiritual-container">
            {/* Header */}
            <div className="spiritual-header" style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '20px'
            }}>
                <button onClick={() => navigate('/spiritual')} className="back-button">
                    <ArrowLeft size={20} />
                    Kembali
                </button>
                <div className="header-content" style={{ textAlign: 'center' }}>
                    <Activity size={28} style={{ marginBottom: '8px' }} />
                    <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>Multi-Modal Health Scan</h1>
                    <p style={{ fontSize: '13px', opacity: 0.9 }}>Skrining kesehatan holistik dengan 5 metode AI</p>
                </div>
                <div className="step-indicator" style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px'
                }}>
                    Step {step}/5
                </div>
            </div>

            {/* Disclaimer */}
            <div className="spiritual-disclaimer" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: '#f59e0b' }}>
                <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
                <span><strong>Penting:</strong> Ini adalah skrining awal, bukan diagnosa medis. Konsultasikan dengan dokter untuk keluhan serius.</span>
            </div>

            <div className="spiritual-content">
                {/* Step 1: Introduction */}
                {step === 1 && (
                    <div className="spiritual-card" style={{
                        background: 'linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <h2 style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            marginBottom: '20px', fontSize: '22px', color: '#fff'
                        }}>
                            <Sparkles size={28} style={{ color: '#10b981' }} />
                            Selamat Datang di Health Scan
                        </h2>

                        <p style={{
                            marginBottom: '20px',
                            color: 'rgba(255,255,255,0.8)',
                            lineHeight: '1.6'
                        }}>
                            Multi-Modal Health Scan menggabungkan <strong style={{ color: '#10b981' }}>5 metode diagnosa</strong> untuk memberikan gambaran kesehatan yang lebih akurat:
                        </p>

                        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                            {[
                                { icon: '👁️', title: 'Iris Scan', weight: '30%', desc: 'Iridologi berbasis Bernard Jensen Chart', color: '#3b82f6' },
                                { icon: '👅', title: 'Tongue Scan', weight: '25%', desc: 'Diagnosa lidah Traditional Chinese Medicine', color: '#ec4899' },
                                { icon: '✋', title: 'Nail Scan', weight: '15%', desc: 'Analisis kuku dan tangan', color: '#f59e0b' },
                                { icon: '😊', title: 'Face Mapping', weight: '15%', desc: 'Pemetaan wajah TCM', color: '#8b5cf6' },
                                { icon: '📝', title: 'Kuesioner', weight: '15%', desc: '25 pertanyaan gejala kesehatan', color: '#10b981' },
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    gap: '14px',
                                    alignItems: 'center',
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '14px',
                                        background: `linear-gradient(135deg, ${item.color}40, ${item.color}20)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        flexShrink: 0,
                                        border: `1px solid ${item.color}50`
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '4px'
                                        }}>
                                            <strong style={{ color: '#fff', fontSize: '15px' }}>{item.title}</strong>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                background: item.color,
                                                color: '#fff',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>{item.weight}</span>
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '13px',
                                            color: 'rgba(255,255,255,0.6)',
                                            lineHeight: '1.4'
                                        }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            style={{
                                width: '100%',
                                padding: '16px 24px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                border: 'none',
                                borderRadius: '14px',
                                color: '#fff',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Mulai Scan <ArrowRight size={20} />
                        </button>
                    </div>
                )}

                {/* Step 2: Photo Upload */}
                {step === 2 && (
                    <div className="spiritual-card" style={{
                        background: 'linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h2 style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px',
                            fontSize: '20px',
                            color: '#fff'
                        }}>
                            <Camera size={24} style={{ color: '#10b981' }} />
                            Upload Foto
                        </h2>
                        <p style={{
                            marginBottom: '24px',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '14px'
                        }}>
                            Upload minimal 1 foto. Semakin banyak foto, semakin akurat hasilnya.
                        </p>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            {/* Iris Upload Section */}
                            <div style={{
                                background: 'rgba(59,130,246,0.1)',
                                borderRadius: '16px',
                                padding: '16px',
                                border: '1px solid rgba(59,130,246,0.2)'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <h4 style={{
                                        color: '#fff',
                                        fontSize: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '8px'
                                    }}>
                                        👁️ Iris Mata
                                        <span style={{
                                            background: '#3b82f6',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            fontSize: '11px'
                                        }}>30%</span>
                                    </h4>
                                    <p style={{
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.6)',
                                        lineHeight: '1.5',
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '10px 12px',
                                        borderRadius: '8px'
                                    }}>
                                        💡 <strong>Tips Foto Iris:</strong><br />
                                        • Gunakan cahaya terang alami (dekat jendela)<br />
                                        • Fokuskan kamera pada bola mata<br />
                                        • Buka mata lebar-lebar<br />
                                        • Hindari flash kamera langsung ke mata
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <UploadBox
                                        label="Mata Kanan"
                                        type="irisRight"
                                        preview={photoPreviews.irisRight}
                                        onUpload={handlePhotoUpload}
                                        onRemove={removePhoto}
                                    />
                                    <UploadBox
                                        label="Mata Kiri"
                                        type="irisLeft"
                                        preview={photoPreviews.irisLeft}
                                        onUpload={handlePhotoUpload}
                                        onRemove={removePhoto}
                                    />
                                </div>
                            </div>

                            {/* Tongue Upload Section */}
                            <div style={{
                                background: 'rgba(236,72,153,0.1)',
                                borderRadius: '16px',
                                padding: '16px',
                                border: '1px solid rgba(236,72,153,0.2)'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <h4 style={{
                                        color: '#fff',
                                        fontSize: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '8px'
                                    }}>
                                        👅 Lidah
                                        <span style={{
                                            background: '#ec4899',
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            fontSize: '11px'
                                        }}>25%</span>
                                    </h4>
                                    <p style={{
                                        fontSize: '12px',
                                        color: 'rgba(255,255,255,0.6)',
                                        lineHeight: '1.5',
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '10px 12px',
                                        borderRadius: '8px'
                                    }}>
                                        💡 <strong>Tips Foto Lidah:</strong><br />
                                        • Julurkan lidah keluar sepenuhnya<br />
                                        • Foto pagi hari sebelum makan/minum<br />
                                        • Pastikan seluruh permukaan lidah terlihat<br />
                                        • Gunakan cahaya terang agar warna terlihat jelas
                                    </p>
                                </div>
                                <UploadBox
                                    label="Foto Lidah"
                                    type="tongue"
                                    preview={photoPreviews.tongue}
                                    onUpload={handlePhotoUpload}
                                    onRemove={removePhoto}
                                    color="#ec4899"
                                />
                            </div>

                            {/* Nail & Face Section */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {/* Nail - Left/Right Hands */}
                                <div style={{
                                    background: 'rgba(245,158,11,0.1)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    border: '1px solid rgba(245,158,11,0.2)'
                                }}>
                                    <h4 style={{
                                        color: '#fff',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginBottom: '8px'
                                    }}>
                                        ✋ Kuku Tangan
                                        <span style={{
                                            background: '#f59e0b',
                                            padding: '2px 6px',
                                            borderRadius: '8px',
                                            fontSize: '10px'
                                        }}>15%</span>
                                    </h4>
                                    <p style={{
                                        fontSize: '11px',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginBottom: '10px',
                                        lineHeight: '1.4'
                                    }}>
                                        Foto 5 jari tanpa cat kuku, background terang
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <UploadBox
                                            label="Kanan"
                                            type="nailRight"
                                            preview={photoPreviews.nailRight}
                                            onUpload={handlePhotoUpload}
                                            onRemove={removePhoto}
                                            color="#f59e0b"
                                            small
                                        />
                                        <UploadBox
                                            label="Kiri"
                                            type="nailLeft"
                                            preview={photoPreviews.nailLeft}
                                            onUpload={handlePhotoUpload}
                                            onRemove={removePhoto}
                                            color="#f59e0b"
                                            small
                                        />
                                    </div>
                                </div>

                                {/* Face */}
                                <div style={{
                                    background: 'rgba(139,92,246,0.1)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    border: '1px solid rgba(139,92,246,0.2)'
                                }}>
                                    <h4 style={{
                                        color: '#fff',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginBottom: '8px'
                                    }}>
                                        😊 Wajah
                                        <span style={{
                                            background: '#8b5cf6',
                                            padding: '2px 6px',
                                            borderRadius: '8px',
                                            fontSize: '10px'
                                        }}>15%</span>
                                    </h4>
                                    <p style={{
                                        fontSize: '11px',
                                        color: 'rgba(255,255,255,0.5)',
                                        marginBottom: '10px',
                                        lineHeight: '1.4'
                                    }}>
                                        Selfie tanpa makeup, ekspresi netral
                                    </p>
                                    <UploadBox
                                        label="Wajah"
                                        type="face"
                                        preview={photoPreviews.face}
                                        onUpload={handlePhotoUpload}
                                        onRemove={removePhoto}
                                        color="#8b5cf6"
                                        small
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                marginTop: '16px',
                                padding: '12px 16px',
                                background: 'rgba(239,68,68,0.15)',
                                borderRadius: '10px',
                                border: '1px solid rgba(239,68,68,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                color: '#ef4444',
                                fontSize: '13px'
                            }}>
                                <AlertTriangle size={18} /> {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    padding: '14px 20px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <ArrowLeft size={16} /> Kembali
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!canProceedFromStep2()}
                                style={{
                                    flex: 1,
                                    padding: '14px 20px',
                                    background: canProceedFromStep2()
                                        ? 'linear-gradient(135deg, #10b981, #059669)'
                                        : 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: canProceedFromStep2() ? '#fff' : 'rgba(255,255,255,0.4)',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: canProceedFromStep2() ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                Lanjut ke Kuesioner <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Questionnaire */}
                {step === 3 && (
                    <div className="spiritual-card">
                        <h2 className="section-title">
                            <ClipboardList className="section-icon" />
                            Kuesioner Gejala
                        </h2>
                        <p style={{ marginBottom: '16px' }}>
                            Jawab pertanyaan berikut untuk meningkatkan akurasi. ({answeredQuestions}/{totalQuestions})
                        </p>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                            {QUESTIONNAIRE_SECTIONS.map((section) => (
                                <div key={section.id} style={{ marginBottom: '20px' }}>
                                    <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{section.icon}</span> {section.title}
                                    </h4>
                                    {section.questions.map((q) => (
                                        <QuestionItem
                                            key={q.id}
                                            question={q}
                                            value={answers[q.id]}
                                            onChange={(val) => handleAnswerChange(q.id, val)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setStep(2)} className="secondary-btn">
                                <ArrowLeft size={16} /> Kembali
                            </button>
                            <button
                                onClick={runAnalysis}
                                className="primary-btn"
                                style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)' }}
                            >
                                🔬 Mulai Analisis AI
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Analyzing */}
                {step === 4 && analyzing && (
                    <div className="spiritual-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <Loader2 size={64} style={{ animation: 'spin 1s linear infinite', color: '#10b981', marginBottom: '24px' }} />
                        <h2 style={{ marginBottom: '16px' }}>Menganalisis...</h2>
                        <p style={{ opacity: 0.8 }}>{analysisProgress}</p>
                        <div style={{
                            marginTop: '24px',
                            height: '4px',
                            background: '#e2e8f0',
                            borderRadius: '2px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                                width: '60%',
                                animation: 'progress 2s ease-in-out infinite'
                            }} />
                        </div>
                    </div>
                )}

                {/* Step 5: Results */}
                {step === 5 && results && (
                    <ResultsDisplay
                        results={results}
                        onStartSEFT={() => navigate('/spiritual/seft/release')}
                        onRescan={() => {
                            setStep(1);
                            setPhotos({});
                            setPhotoPreviews({});
                            setAnswers({});
                            setResults(null);
                        }}
                    />
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes progress { 0%,100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
                
                .upload-box {
                    border: 2px dashed var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: var(--bg-secondary);
                }
                .upload-box:hover { border-color: #10b981; }
                .upload-box.has-photo { border-style: solid; border-color: #10b981; }
                
                .question-item {
                    background: var(--bg-secondary);
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                }
                .question-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 8px;
                }
                .option-btn {
                    padding: 6px 12px;
                    border-radius: 20px;
                    border: 1px solid var(--border-color);
                    background: transparent;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }
                .option-btn.selected {
                    background: #10b981;
                    color: white;
                    border-color: #10b981;
                }
                .option-btn:hover:not(.selected) {
                    border-color: #10b981;
                }
            `}</style>
        </div>
    );
}

// Photo Upload Box Component
function PhotoUploadBox({ label, type, preview, onUpload, onRemove }) {
    const inputId = `photo-${type}`;

    return (
        <div className={`upload-box ${preview ? 'has-photo' : ''}`}>
            {preview ? (
                <div style={{ position: 'relative' }}>
                    <img
                        src={preview}
                        alt={label}
                        style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <button
                        onClick={() => onRemove(type)}
                        style={{
                            position: 'absolute', top: '-8px', right: '-8px',
                            background: '#ef4444', color: 'white', border: 'none',
                            borderRadius: '50%', width: '24px', height: '24px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <label htmlFor={inputId} style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontSize: '12px' }}>{label}</p>
                    <input
                        id={inputId}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        onChange={(e) => onUpload(type, e.target.files[0])}
                    />
                </label>
            )}
        </div>
    );
}

// Question Item Component
function QuestionItem({ question, value, onChange }) {
    const options = question.type === 'frequency' ? FREQUENCY_OPTIONS
        : question.type === 'yesno' ? YESNO_OPTIONS
            : SCALE_OPTIONS;

    return (
        <div className="question-item">
            <p style={{ margin: 0, fontSize: '14px', marginBottom: '8px' }}>{question.text}</p>
            <div className="question-options">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`option-btn ${value === opt.value ? 'selected' : ''}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Results Display Component
function ResultsDisplay({ results, onStartSEFT, onRescan }) {
    const { combinedConfidence, totalMethodsUsed, organPriorities, emotionRecommendations, herbalRecommendations } = results;

    return (
        <>
            {/* Combined Score Card */}
            <div className="spiritual-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                <h2 style={{ marginBottom: '8px' }}>Hasil Analisis Multi-Modal</h2>
                <div style={{ fontSize: '64px', fontWeight: 'bold', margin: '16px 0' }}>
                    {combinedConfidence}%
                </div>
                <p style={{ opacity: 0.9 }}>Combined Confidence Score</p>
                <p style={{ fontSize: '14px', opacity: 0.8 }}>{totalMethodsUsed} metode dianalisis</p>
            </div>

            {/* Organ Priorities */}
            <div className="spiritual-card">
                <h3 className="section-title">
                    <AlertTriangle className="section-icon" style={{ color: '#f59e0b' }} />
                    Organ yang Perlu Perhatian
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {organPriorities?.slice(0, 8).map((item, idx) => (
                        <div key={idx} style={{
                            padding: '8px 12px',
                            borderRadius: '20px',
                            background: item.priority === 'tinggi' ? '#fef2f2' : item.priority === 'sedang' ? '#fffbeb' : '#f0fdf4',
                            border: `1px solid ${item.priority === 'tinggi' ? '#fca5a5' : item.priority === 'sedang' ? '#fcd34d' : '#86efac'}`,
                            fontSize: '14px'
                        }}>
                            <strong>{item.organ}</strong>
                            <span style={{ fontSize: '11px', marginLeft: '4px', opacity: 0.7 }}>
                                ({item.sources.join(', ')})
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Emotion Recommendations */}
            {emotionRecommendations?.length > 0 && (
                <div className="spiritual-card">
                    <h3 className="section-title">
                        <Heart className="section-icon" style={{ color: '#ec4899' }} />
                        Emosi untuk SEFT Release
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {emotionRecommendations.map((e, idx) => (
                            <span key={idx} style={{
                                padding: '6px 12px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
                                fontSize: '13px'
                            }}>
                                {e.name} <span style={{ opacity: 0.6 }}>({e.organ})</span>
                            </span>
                        ))}
                    </div>
                    <button onClick={onStartSEFT} className="primary-btn" style={{ width: '100%', background: '#ec4899' }}>
                        Mulai SEFT Release <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* Herbal Schedule */}
            {herbalRecommendations?.length > 0 && (
                <div className="spiritual-card">
                    <h3 className="section-title">
                        <Pill className="section-icon" style={{ color: '#22c55e' }} />
                        Jadwal Herbal Harian
                    </h3>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {['pagi', 'siang', 'sore', 'malam', 'sebelum makan'].map(time => {
                            const herbsAtTime = herbalRecommendations.filter(h => h.schedule === time);
                            if (herbsAtTime.length === 0) return null;
                            return (
                                <div key={time} style={{
                                    padding: '12px',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '8px'
                                }}>
                                    <strong style={{ textTransform: 'capitalize' }}>⏰ {time}</strong>
                                    {herbsAtTime.map((h, idx) => (
                                        <p key={idx} style={{ margin: '4px 0 0 16px', fontSize: '14px' }}>
                                            • {h.name} - <span style={{ opacity: 0.7 }}>{h.dosage}</span>
                                        </p>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Rescan Button */}
            <button
                onClick={onRescan}
                className="secondary-btn"
                style={{ width: '100%', marginTop: '16px' }}
            >
                🔄 Scan Ulang dengan Foto Baru
            </button>
        </>
    );
}
