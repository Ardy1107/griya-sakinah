import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Scan, Heart, Leaf, AlertCircle, ChevronRight, Info, Clock, Check, Loader2, Camera, Upload, X, Image } from 'lucide-react';
import { getDeviceId } from '../../services/spiritualService';
import { analyzeIridology } from '../../services/geminiVisionService';

// ============ ORGAN MAPPING (Bernard Jensen Chart) ============
const ORGAN_MAP = {
    right: {
        '12:00': { organ: 'Otak', system: 'Kepala & Otak', emoji: '🧠' },
        '1:00': { organ: 'Paru Kanan', system: 'Pernapasan', emoji: '🫁' },
        '2:00': { organ: 'Paru Kanan', system: 'Pernapasan', emoji: '🫁' },
        '3:00': { organ: 'Hati', system: 'Pencernaan', emoji: '🫀' },
        '4:00': { organ: 'Ginjal Kanan', system: 'Urologi', emoji: '💧' },
        '5:00': { organ: 'Adrenal Kanan', system: 'Endokrin', emoji: '⚡' },
        '6:00': { organ: 'Organ Reproduksi', system: 'Reproduksi', emoji: '🌺' },
        '7:00': { organ: 'Usus Besar', system: 'Pencernaan', emoji: '🔄' },
        '8:00': { organ: 'Usus Besar', system: 'Pencernaan', emoji: '🔄' },
        '9:00': { organ: 'Jantung', system: 'Kardiovaskular', emoji: '❤️' },
        '10:00': { organ: 'Pankreas', system: 'Endokrin', emoji: '🍬' },
        '11:00': { organ: 'Tiroid', system: 'Endokrin', emoji: '🦋' },
    },
    left: {
        '12:00': { organ: 'Otak', system: 'Kepala & Otak', emoji: '🧠' },
        '1:00': { organ: 'Jantung', system: 'Kardiovaskular', emoji: '❤️' },
        '2:00': { organ: 'Limpa', system: 'Limfatik', emoji: '🩸' },
        '3:00': { organ: 'Pankreas', system: 'Endokrin', emoji: '🍬' },
        '4:00': { organ: 'Ginjal Kiri', system: 'Urologi', emoji: '💧' },
        '5:00': { organ: 'Adrenal Kiri', system: 'Endokrin', emoji: '⚡' },
        '6:00': { organ: 'Organ Reproduksi', system: 'Reproduksi', emoji: '🌺' },
        '7:00': { organ: 'Usus Besar', system: 'Pencernaan', emoji: '🔄' },
        '8:00': { organ: 'Usus Besar', system: 'Pencernaan', emoji: '🔄' },
        '9:00': { organ: 'Paru Kiri', system: 'Pernapasan', emoji: '🫁' },
        '10:00': { organ: 'Paru Kiri', system: 'Pernapasan', emoji: '🫁' },
        '11:00': { organ: 'Tiroid', system: 'Endokrin', emoji: '🦋' },
    }
};

// Emotion recommendations per organ
const ORGAN_EMOTIONS = {
    'Hati': ['Marah', 'Dengki', 'Dendam', 'Benci'],
    'Ginjal Kanan': ['Takut', 'Cemas', 'Trauma'],
    'Ginjal Kiri': ['Takut', 'Cemas', 'Trauma'],
    'Paru Kanan': ['Sedih', 'Duka', 'Kehilangan'],
    'Paru Kiri': ['Sedih', 'Duka', 'Kehilangan'],
    'Lambung': ['Khawatir', 'Overthinking', 'Cemas'],
    'Jantung': ['Patah Hati', 'Kesepian', 'Sedih Mendalam'],
    'Kulit': ['Malu', 'Merasa Tidak Berharga', 'Rendah Diri'],
    'Usus Besar': ['Cemas', 'Trauma Masa Kecil', 'Tidak Bisa Melepaskan'],
    'Otak': ['Stres', 'Overthinking', 'Perfeksionis'],
    'Tiroid': ['Tidak Bisa Ekspresikan Diri', 'Merasa Tidak Didengar'],
    'Pankreas': ['Kehilangan Kemanisan Hidup', 'Kepahitan'],
    'Limpa': ['Obsesi', 'Worry Berlebihan'],
    'Adrenal Kanan': ['Kelelahan', 'Burnout', 'Stres Kronis'],
    'Adrenal Kiri': ['Kelelahan', 'Burnout', 'Stres Kronis'],
    'Organ Reproduksi': ['Trauma Seksual', 'Malu', 'Rasa Bersalah'],
    'Liver': ['Marah', 'Dengki', 'Dendam', 'Benci'],
    'Kidney': ['Takut', 'Cemas', 'Trauma'],
    'Lung': ['Sedih', 'Duka', 'Kehilangan'],
    'Heart': ['Patah Hati', 'Kesepian', 'Sedih Mendalam'],
    'Brain': ['Stres', 'Overthinking', 'Perfeksionis'],
    'Stomach': ['Khawatir', 'Overthinking', 'Cemas'],
    'Colon': ['Cemas', 'Trauma Masa Kecil', 'Tidak Bisa Melepaskan'],
};

// Herbal recommendations per organ (Dosage: 600mg/kapsul)
// Batas aman: 1-2 kapsul per dosis, max 3x sehari
const ORGAN_HERBS = {
    'Hati': [
        { name: 'Temulawak', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Kunyit', dosage: '1 kapsul (600mg)', schedule: 'pagi' },
        { name: 'Rosella Merah', dosage: '2 kapsul (1200mg)', schedule: 'sore' },
    ],
    'Ginjal Kanan': [
        { name: 'Pegagan', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
        { name: 'Habbatussauda', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Daun Kelor', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    'Ginjal Kiri': [
        { name: 'Pegagan', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
        { name: 'Habbatussauda', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Daun Kelor', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    'Paru Kanan': [
        { name: 'Jahe Merah', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Kitolod', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
        { name: 'Daun Katuk', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
    'Paru Kiri': [
        { name: 'Jahe Merah', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Kitolod', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
        { name: 'Daun Katuk', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
    'Lambung': [
        { name: 'Kunyit', dosage: '1 kapsul (600mg)', schedule: 'sebelum makan' },
        { name: 'Temulawak', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Jati Cina', dosage: '1 kapsul (600mg)', schedule: 'malam' },
    ],
    'Pankreas': [
        { name: 'Daun Kelor', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Kunyit', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    'Jantung': [
        { name: 'Rosella Merah', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Ginseng Panax', dosage: '1 kapsul (600mg)', schedule: 'pagi' },
        { name: 'Gamat Emas', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    'Limpa': [
        { name: 'Kulit Manggis', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Rosella Merah', dosage: '2 kapsul (1200mg)', schedule: 'sore' },
    ],
    'Otak': [
        { name: 'Pegagan', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Ginseng Panax', dosage: '1 kapsul (600mg)', schedule: 'pagi' },
        { name: 'Habbatussauda', dosage: '2 kapsul (1200mg)', schedule: 'malam' },
    ],
    'Tiroid': [
        { name: 'Daun Kelor', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Gamat Emas', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    'Usus Besar': [
        { name: 'Jati Cina', dosage: '1 kapsul (600mg)', schedule: 'malam' },
        { name: 'Kunyit', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Daun Katuk', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    'Adrenal Kanan': [
        { name: 'Ginseng Panax', dosage: '1 kapsul (600mg)', schedule: 'pagi' },
        { name: 'Habbatussauda', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
    'Adrenal Kiri': [
        { name: 'Ginseng Panax', dosage: '1 kapsul (600mg)', schedule: 'pagi' },
        { name: 'Habbatussauda', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
    'Organ Reproduksi': [
        { name: 'Daun Katuk', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Gamat Emas', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    // English mappings
    'Liver': [
        { name: 'Temulawak', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Kunyit', dosage: '1 kapsul (600mg)', schedule: 'pagi' },
    ],
    'Kidney': [
        { name: 'Pegagan', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
        { name: 'Habbatussauda', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
    'Lung': [
        { name: 'Jahe Merah', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Kitolod', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    'Heart': [
        { name: 'Rosella Merah', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Gamat Emas', dosage: '2 kapsul (1200mg)', schedule: 'siang' },
    ],
    'Brain': [
        { name: 'Pegagan', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
        { name: 'Ginseng Panax', dosage: '1 kapsul (600mg)', schedule: 'pagi' },
    ],
    'Stomach': [
        { name: 'Kunyit', dosage: '1 kapsul (600mg)', schedule: 'sebelum makan' },
        { name: 'Temulawak', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
    'Colon': [
        { name: 'Jati Cina', dosage: '1 kapsul (600mg)', schedule: 'malam' },
        { name: 'Kunyit', dosage: '2 kapsul (1200mg)', schedule: 'pagi' },
    ],
};

export default function IridologyAnalysis() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: upload, 2: analyzing, 3: results
    const [photos, setPhotos] = useState({ right: null, left: null });
    const [photoPreviews, setPhotoPreviews] = useState({ right: null, left: null });
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const rightInputRef = useRef(null);
    const leftInputRef = useRef(null);

    const handlePhotoUpload = (eye, file) => {
        if (file) {
            setPhotos(prev => ({ ...prev, [eye]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviews(prev => ({ ...prev, [eye]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = (eye) => {
        setPhotos(prev => ({ ...prev, [eye]: null }));
        setPhotoPreviews(prev => ({ ...prev, [eye]: null }));
    };

    // Helper function to find matching organ key from API response
    const findMatchingOrganKeys = (organString) => {
        const allOrganKeys = Object.keys(ORGAN_EMOTIONS);
        const matches = [];

        // Split by comma and check each part
        const parts = organString.split(',').map(s => s.trim().toLowerCase());

        for (const key of allOrganKeys) {
            const keyLower = key.toLowerCase();
            // Check if any part matches or contains the key
            for (const part of parts) {
                if (part.includes(keyLower) || keyLower.includes(part)) {
                    if (!matches.includes(key)) {
                        matches.push(key);
                    }
                }
            }
            // Also check full string
            if (organString.toLowerCase().includes(keyLower)) {
                if (!matches.includes(key)) {
                    matches.push(key);
                }
            }
        }

        return matches;
    };

    const analyzePhotos = async () => {
        if (!photos.right && !photos.left) {
            setError('Silakan upload minimal satu foto mata');
            return;
        }

        setAnalyzing(true);
        setError(null);
        setStep(2);

        try {
            // Call Gemini Vision API for real analysis
            const apiResult = await analyzeIridology(photos.right, photos.left);
            setAiResponse(apiResult);

            // Extract detected organs from API response
            let detectedOrgans = apiResult.combinedOrgans || [];

            // Also extract from individual eye results if available
            if (apiResult.rightEye?.detectedZones) {
                apiResult.rightEye.detectedZones.forEach(zone => {
                    if (zone.organ && !detectedOrgans.includes(zone.organ)) {
                        detectedOrgans.push(zone.organ);
                    }
                });
            }
            if (apiResult.leftEye?.detectedZones) {
                apiResult.leftEye.detectedZones.forEach(zone => {
                    if (zone.organ && !detectedOrgans.includes(zone.organ)) {
                        detectedOrgans.push(zone.organ);
                    }
                });
            }

            // Generate emotions and herbs based on detected organs
            const emotions = [];
            const herbs = [];
            const matchedOrganKeys = new Set();

            // For each detected organ string, find matching organ keys
            detectedOrgans.forEach(organString => {
                const matchingKeys = findMatchingOrganKeys(organString);
                matchingKeys.forEach(key => matchedOrganKeys.add(key));
            });

            console.log('🔍 Detected organs:', detectedOrgans);
            console.log('🔑 Matched organ keys:', Array.from(matchedOrganKeys));

            // Now get emotions and herbs for matched keys
            matchedOrganKeys.forEach(organKey => {
                const emotionList = ORGAN_EMOTIONS[organKey] || [];
                emotionList.forEach(e => {
                    if (!emotions.find(em => em.name === e)) {
                        emotions.push({ name: e, organ: organKey });
                    }
                });

                const herbList = ORGAN_HERBS[organKey] || [];
                herbList.forEach(h => {
                    if (!herbs.find(hb => hb.name === h.name)) {
                        herbs.push({ ...h, organ: organKey });
                    }
                });
            });

            // Group herbs by schedule
            const herbsBySchedule = {
                pagi: herbs.filter(h => h.schedule === 'pagi' || h.schedule === 'sebelum makan'),
                siang: herbs.filter(h => h.schedule === 'siang'),
                sore: herbs.filter(h => h.schedule === 'sore'),
                malam: herbs.filter(h => h.schedule === 'malam'),
            };

            // Build analysis notes from AI response
            let analysisNotes = 'Analisis dilakukan oleh AI berdasarkan pola iris yang terdeteksi.';
            if (apiResult.rightEye?.overallObservation) {
                analysisNotes += ' Mata Kanan: ' + apiResult.rightEye.overallObservation;
            }
            if (apiResult.leftEye?.overallObservation) {
                analysisNotes += ' Mata Kiri: ' + apiResult.leftEye.overallObservation;
            }

            setAnalysisResult({
                organs: detectedOrgans,
                zones: {
                    right: apiResult.rightEye?.detectedZones || [],
                    left: apiResult.leftEye?.detectedZones || []
                },
                emotions,
                herbs,
                herbsBySchedule,
                confidence: apiResult.confidence || 0,
                analysisNotes
            });

            setStep(3);
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.message || 'Terjadi kesalahan saat menganalisis foto. Silakan coba lagi.');
            setStep(1);
        } finally {
            setAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setStep(1);
        setPhotos({ right: null, left: null });
        setPhotoPreviews({ right: null, left: null });
        setAnalysisResult(null);
        setAiResponse(null);
        setError(null);
    };

    return (
        <div className="spiritual-container">
            {/* Back Button */}
            <Link to="/spiritual/seft" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            {/* Header */}
            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <div>
                    <h1>
                        <Eye size={28} />
                        Analisis Iridologi
                    </h1>
                    <p>Upload Foto Mata → AI Analisis → Rekomendasi</p>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.875rem'
                }}>
                    Step {step} / 3
                </div>
            </div>

            {/* Disclaimer */}
            <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.8rem',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
            }}>
                <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                <div>
                    <strong>Disclaimer:</strong> Iridologi adalah metode alternatif, bukan diagnosa medis.
                    Konsultasikan dengan dokter untuk keluhan serius.
                </div>
            </div>

            {/* Progress Bar */}
            <div className="spiritual-progress" style={{ marginBottom: '24px' }}>
                <div className="spiritual-progress-bar" style={{ width: `${step * 33.33}%` }} />
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444'
                }}>
                    {error}
                </div>
            )}

            {/* Step 1: Photo Upload */}
            {step === 1 && (
                <div className="spiritual-card">
                    <h3 style={{ marginBottom: '16px' }}>📸 Upload Foto Mata</h3>

                    <div style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        fontSize: '0.85rem',
                        lineHeight: '1.6'
                    }}>
                        <strong>Tips untuk hasil terbaik:</strong>
                        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                            <li>Foto dalam cahaya terang & merata</li>
                            <li>Buka mata lebar-lebar</li>
                            <li>Fokuskan kamera pada iris (bagian berwarna)</li>
                            <li>Hindari pantulan cahaya di mata</li>
                        </ul>
                    </div>

                    {/* Photo Upload Areas */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                        {/* Right Eye */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                👁️ Mata Kanan (Sisi Kanan Tubuh)
                            </label>
                            {photoPreviews.right ? (
                                <div style={{
                                    position: 'relative',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '2px solid var(--spiritual-border)'
                                }}>
                                    <img
                                        src={photoPreviews.right}
                                        alt="Mata Kanan"
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <button
                                        onClick={() => removePhoto('right')}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'white'
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        left: '8px',
                                        background: 'rgba(34, 197, 94, 0.9)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Check size={14} /> Uploaded
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => rightInputRef.current?.click()}
                                    style={{
                                        background: 'var(--spiritual-bg)',
                                        border: '2px dashed var(--spiritual-border)',
                                        borderRadius: '12px',
                                        padding: '40px 20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Camera size={40} style={{ color: 'var(--spiritual-text-muted)', marginBottom: '12px' }} />
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>Tap untuk upload foto</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)', marginTop: '4px' }}>
                                        atau ambil foto langsung
                                    </div>
                                </div>
                            )}
                            <input
                                ref={rightInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                style={{ display: 'none' }}
                                onChange={(e) => handlePhotoUpload('right', e.target.files[0])}
                            />
                        </div>

                        {/* Left Eye */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                👁️ Mata Kiri (Sisi Kiri Tubuh)
                            </label>
                            {photoPreviews.left ? (
                                <div style={{
                                    position: 'relative',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '2px solid var(--spiritual-border)'
                                }}>
                                    <img
                                        src={photoPreviews.left}
                                        alt="Mata Kiri"
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <button
                                        onClick={() => removePhoto('left')}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'white'
                                        }}
                                    >
                                        <X size={18} />
                                    </button>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        left: '8px',
                                        background: 'rgba(34, 197, 94, 0.9)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Check size={14} /> Uploaded
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => leftInputRef.current?.click()}
                                    style={{
                                        background: 'var(--spiritual-bg)',
                                        border: '2px dashed var(--spiritual-border)',
                                        borderRadius: '12px',
                                        padding: '40px 20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Camera size={40} style={{ color: 'var(--spiritual-text-muted)', marginBottom: '12px' }} />
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>Tap untuk upload foto</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)', marginTop: '4px' }}>
                                        atau ambil foto langsung
                                    </div>
                                </div>
                            )}
                            <input
                                ref={leftInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                style={{ display: 'none' }}
                                onChange={(e) => handlePhotoUpload('left', e.target.files[0])}
                            />
                        </div>
                    </div>

                    {/* Analyze Button */}
                    <button
                        onClick={analyzePhotos}
                        disabled={!photos.right && !photos.left}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: (photos.right || photos.left)
                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                : 'var(--spiritual-bg)',
                            border: 'none',
                            borderRadius: '12px',
                            color: (photos.right || photos.left) ? 'white' : 'var(--spiritual-text-muted)',
                            fontWeight: '600',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: (photos.right || photos.left) ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <Scan size={20} />
                        Mulai Analisis AI
                    </button>
                </div>
            )}

            {/* Step 2: Analyzing */}
            {step === 2 && (
                <div className="spiritual-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 24px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Loader2 size={40} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                    <h3 style={{ marginBottom: '12px' }}>🔬 Menganalisis Foto Mata...</h3>
                    <p style={{ color: 'var(--spiritual-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                        AI sedang mengidentifikasi pola iris dan zona yang perlu perhatian
                    </p>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxWidth: '300px',
                        margin: '0 auto'
                    }}>
                        {['Memproses gambar...', 'Menganalisis zona iris...', 'Mencocokkan pola...'].map((text, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 16px',
                                background: 'var(--spiritual-bg)',
                                borderRadius: '8px',
                                fontSize: '0.85rem'
                            }}>
                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', opacity: 0.7 }} />
                                {text}
                            </div>
                        ))}
                    </div>

                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}

            {/* Step 3: Results */}
            {step === 3 && analysisResult && (
                <div>
                    {/* Analysis Summary */}
                    <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Scan size={20} style={{ color: '#6366f1' }} />
                                Hasil Analisis
                            </h3>
                            <span style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                color: '#22c55e',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                Confidence: {analysisResult.confidence}%
                            </span>
                        </div>

                        {/* Uploaded Photos Preview */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            {photoPreviews.right && (
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', marginBottom: '4px', color: 'var(--spiritual-text-muted)' }}>
                                        Mata Kanan
                                    </div>
                                    <img
                                        src={photoPreviews.right}
                                        alt="Mata Kanan"
                                        style={{
                                            width: '100%',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </div>
                            )}
                            {photoPreviews.left && (
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', marginBottom: '4px', color: 'var(--spiritual-text-muted)' }}>
                                        Mata Kiri
                                    </div>
                                    <img
                                        src={photoPreviews.left}
                                        alt="Mata Kiri"
                                        style={{
                                            width: '100%',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--spiritual-text-muted)', lineHeight: '1.6' }}>
                            {analysisResult.analysisNotes}
                        </p>
                    </div>

                    {/* Organs Detected */}
                    <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                            Organ yang Perlu Perhatian
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {analysisResult.organs.map(organ => (
                                <span key={organ} style={{
                                    padding: '8px 16px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}>
                                    {organ}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Emotions to Release */}
                    <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Heart size={20} style={{ color: '#ef4444' }} />
                            Emosi yang Perlu Dirilis (SEFT)
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {analysisResult.emotions.slice(0, 8).map((emotion, i) => (
                                <div key={i} style={{
                                    padding: '12px',
                                    background: 'var(--spiritual-bg)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '500' }}>{emotion.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                            Terkait: {emotion.organ}
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '4px 8px',
                                        background: i < 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                        color: i < 3 ? '#ef4444' : '#f59e0b',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        fontWeight: '600'
                                    }}>
                                        {i < 3 ? 'PRIORITAS' : 'SEDANG'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/spiritual/seft/release')}
                            style={{
                                width: '100%',
                                marginTop: '16px',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            Mulai SEFT Release <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Herbal Schedule */}
                    <div className="spiritual-card">
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Leaf size={20} style={{ color: '#22c55e' }} />
                            Jadwal Herbal Harian
                        </h3>

                        {['pagi', 'siang', 'sore', 'malam'].map(schedule => (
                            analysisResult.herbsBySchedule[schedule]?.length > 0 && (
                                <div key={schedule} style={{ marginBottom: '16px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}>
                                        <Clock size={16} />
                                        {schedule === 'pagi' && '☀️ Pagi'}
                                        {schedule === 'siang' && '🌤️ Siang'}
                                        {schedule === 'sore' && '🌅 Sore'}
                                        {schedule === 'malam' && '🌙 Malam'}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {analysisResult.herbsBySchedule[schedule].map((herb, i) => (
                                            <div key={i} style={{
                                                padding: '12px',
                                                background: 'rgba(34, 197, 94, 0.1)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    background: 'rgba(34, 197, 94, 0.2)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    🌿
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{herb.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                                        {herb.dosage}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}

                        <div style={{
                            padding: '12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            marginTop: '8px'
                        }}>
                            <Info size={16} style={{ display: 'inline', marginRight: '8px', color: '#6366f1' }} />
                            <strong>Durasi:</strong> 4-8 minggu untuk hasil optimal. Konsistensi adalah kunci!
                        </div>
                    </div>

                    {/* Start Over */}
                    <button
                        onClick={resetAnalysis}
                        style={{
                            width: '100%',
                            marginTop: '16px',
                            padding: '14px',
                            background: 'var(--spiritual-bg)',
                            border: '1px solid var(--spiritual-border)',
                            borderRadius: '12px',
                            color: 'var(--spiritual-text)',
                            cursor: 'pointer'
                        }}
                    >
                        Analisis Ulang dengan Foto Baru
                    </button>
                </div>
            )}
        </div>
    );
}
