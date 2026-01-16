import { useState } from 'react';
import { Brain, MessageCircle, Stethoscope, ListChecks, Sparkles, Loader2, Check } from 'lucide-react';
import { analyzeEmotionFromText } from '../services/seftAIService';

/**
 * Smart Emotion Finder - Premium 3-tab emotion identification
 * Modes: Story (AI), Physical Symptoms, Direct Selection
 */
export default function SmartEmotionFinder({
    emosiList,
    onSelectEmosi,
    selectedEmosi,
    onMasalahChange,
    SAKIT_KE_EMOSI
}) {
    const [finderMode, setFinderMode] = useState('story');
    const [storyText, setStoryText] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [filterSakit, setFilterSakit] = useState('');
    const [searchEmosi, setSearchEmosi] = useState('');
    const [filterKategori, setFilterKategori] = useState('');

    const kategoris = [...new Set(emosiList.map(e => e.kategori))];

    // AI Story Analysis handler
    const handleAnalyzeStory = async () => {
        if (!storyText.trim() || storyText.length < 10) return;

        setAiLoading(true);
        setAiResult(null);

        try {
            const result = await analyzeEmotionFromText(storyText);
            setAiResult(result);

            // Auto-select first detected emotion if available
            if (result.emotions && result.emotions.length > 0) {
                const firstEmotion = result.emotions[0];
                const matched = emosiList.find(e =>
                    e.nama.toLowerCase() === firstEmotion.toLowerCase() ||
                    e.nama.toLowerCase().includes(firstEmotion.toLowerCase())
                );
                if (matched) {
                    onSelectEmosi(matched);
                    if (result.rootCause && onMasalahChange) {
                        onMasalahChange(result.rootCause);
                    }
                }
            }
        } catch (error) {
            console.error('AI Analysis error:', error);
        } finally {
            setAiLoading(false);
        }
    };

    const filteredEmosi = emosiList.filter(e => {
        const matchSearch = e.nama.toLowerCase().includes(searchEmosi.toLowerCase());
        const matchKategori = !filterKategori || e.kategori === filterKategori;
        return matchSearch && matchKategori;
    }).slice(0, 20);

    return (
        <div style={{
            background: 'linear-gradient(145deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 4px 20px rgba(139,92,246,0.15)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(139,92,246,0.4)'
                }}>
                    <Brain size={22} color="#fff" />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                        Smart Emotion Finder
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>
                        Pilih cara yang paling nyaman untuk menemukan emosi
                    </p>
                </div>
            </div>

            {/* 3 Mode Tabs */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '16px'
            }}>
                {[
                    { id: 'story', icon: MessageCircle, label: 'Ceritakan', desc: 'AI Analisis' },
                    { id: 'physical', icon: Stethoscope, label: 'Gejala Fisik', desc: 'Psikosomatis' },
                    { id: 'direct', icon: ListChecks, label: 'Pilih Langsung', desc: 'Sudah Tau' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFinderMode(tab.id)}
                        style={{
                            padding: '12px 8px',
                            borderRadius: '12px',
                            border: finderMode === tab.id
                                ? '2px solid #8b5cf6'
                                : '1px solid rgba(255,255,255,0.15)',
                            background: finderMode === tab.id
                                ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.2))'
                                : 'rgba(255,255,255,0.05)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            transform: finderMode === tab.id ? 'scale(1.02)' : 'scale(1)'
                        }}
                    >
                        <tab.icon
                            size={20}
                            style={{
                                color: finderMode === tab.id ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                                marginBottom: '4px'
                            }}
                        />
                        <div style={{
                            fontSize: '0.8rem',
                            fontWeight: finderMode === tab.id ? '600' : '400',
                            color: finderMode === tab.id ? '#fff' : 'rgba(255,255,255,0.7)'
                        }}>
                            {tab.label}
                        </div>
                        <div style={{
                            fontSize: '0.65rem',
                            color: finderMode === tab.id ? '#a78bfa' : 'rgba(255,255,255,0.4)'
                        }}>
                            {tab.desc}
                        </div>
                    </button>
                ))}
            </div>

            {/* Story Mode - AI Analysis */}
            {finderMode === 'story' && (
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '12px',
                    padding: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Sparkles size={16} style={{ color: '#fbbf24' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                            Ceritakan perasaan Anda, AI akan mendeteksi emosi
                        </span>
                    </div>
                    <textarea
                        value={storyText}
                        onChange={(e) => setStoryText(e.target.value)}
                        placeholder="Contoh: Saya merasa sangat kesal dengan atasan saya yang tidak pernah menghargai kerja keras saya..."
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            fontSize: '0.9rem',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                        }}
                    />
                    <button
                        onClick={handleAnalyzeStory}
                        disabled={aiLoading || storyText.length < 10}
                        style={{
                            width: '100%',
                            marginTop: '12px',
                            padding: '12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: aiLoading || storyText.length < 10
                                ? 'rgba(139,92,246,0.3)'
                                : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: aiLoading || storyText.length < 10 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: aiLoading || storyText.length < 10 ? 'none' : '0 4px 15px rgba(139,92,246,0.4)'
                        }}
                    >
                        {aiLoading ? (
                            <>
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                Menganalisis...
                            </>
                        ) : (
                            <>
                                <Brain size={18} />
                                Analisis dengan AI
                            </>
                        )}
                    </button>

                    {/* AI Result */}
                    {aiResult && (
                        <div style={{
                            marginTop: '16px',
                            padding: '14px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))',
                            border: '1px solid rgba(34,197,94,0.3)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Check size={16} style={{ color: '#22c55e' }} />
                                <span style={{ fontWeight: '600', color: '#22c55e' }}>Emosi Terdeteksi:</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                {aiResult.emotions?.map((emotion, idx) => {
                                    const matched = emosiList.find(e =>
                                        e.nama.toLowerCase().includes(emotion.toLowerCase())
                                    );
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => matched && onSelectEmosi(matched)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                border: selectedEmosi?.nama === matched?.nama
                                                    ? '2px solid #22c55e'
                                                    : '1px solid rgba(34,197,94,0.4)',
                                                background: selectedEmosi?.nama === matched?.nama
                                                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                                    : 'rgba(34,197,94,0.2)',
                                                color: '#fff',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: matched ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {emotion} {selectedEmosi?.nama === matched?.nama && '✓'}
                                        </button>
                                    );
                                })}
                            </div>
                            {aiResult.rootCause && (
                                <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>
                                    <strong>Akar Masalah:</strong> {aiResult.rootCause}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Physical Mode */}
            {finderMode === 'physical' && (
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '12px',
                    padding: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Stethoscope size={16} style={{ color: '#22c55e' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                            Pilih keluhan fisik, kami rekomendasikan emosi terkait
                        </span>
                    </div>
                    <select
                        className="spiritual-select"
                        value={filterSakit}
                        onChange={(e) => setFilterSakit(e.target.value)}
                        style={{ marginBottom: '12px', width: '100%' }}
                    >
                        <option value="">-- Pilih Gejala Fisik --</option>
                        <optgroup label="🧠 Kepala & Otak">
                            <option value="Kepala/Migrain">Kepala/Migrain</option>
                            <option value="Vertigo">Vertigo</option>
                        </optgroup>
                        <optgroup label="❤️ Dada & Paru">
                            <option value="Dada/Jantung">Dada/Jantung</option>
                            <option value="Paru-paru/Asma">Paru-paru/Asma</option>
                        </optgroup>
                        <optgroup label="🫁 Perut & Pencernaan">
                            <option value="Lambung/Maag">Lambung/Maag</option>
                            <option value="Usus/Diare">Usus/Diare</option>
                        </optgroup>
                        <optgroup label="🦴 Punggung">
                            <option value="Punggung Bawah">Punggung Bawah</option>
                            <option value="Bahu Tegang">Bahu Tegang</option>
                        </optgroup>
                        <optgroup label="😴 Tidur">
                            <option value="Insomnia">Insomnia</option>
                            <option value="Kelelahan Kronis">Kelelahan Kronis</option>
                        </optgroup>
                    </select>

                    {/* Show recommendations */}
                    {filterSakit && SAKIT_KE_EMOSI && SAKIT_KE_EMOSI[filterSakit] && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))',
                            borderRadius: '10px',
                            padding: '14px',
                            border: '1px solid rgba(34,197,94,0.3)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Check size={16} style={{ color: '#22c55e' }} />
                                <span style={{ fontWeight: '600', color: '#22c55e' }}>Emosi Rekomendasi:</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {SAKIT_KE_EMOSI[filterSakit].map((emosiName, idx) => {
                                    const matchingEmosi = emosiList.find(e =>
                                        e.nama.toLowerCase().includes(emosiName.toLowerCase()) ||
                                        emosiName.toLowerCase().includes(e.nama.toLowerCase())
                                    );
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => matchingEmosi && onSelectEmosi(matchingEmosi)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                border: selectedEmosi?.nama === matchingEmosi?.nama
                                                    ? '2px solid #22c55e'
                                                    : '1px solid rgba(34,197,94,0.4)',
                                                background: selectedEmosi?.nama === matchingEmosi?.nama
                                                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                                    : 'rgba(34,197,94,0.2)',
                                                color: '#fff',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: matchingEmosi ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {emosiName} {selectedEmosi?.nama === matchingEmosi?.nama && '✓'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Direct Mode */}
            {finderMode === 'direct' && (
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '12px',
                    padding: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <ListChecks size={16} style={{ color: '#60a5fa' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                            Filter dan pilih emosi langsung
                        </span>
                    </div>

                    {/* Category Filter */}
                    <select
                        className="spiritual-select"
                        value={filterKategori}
                        onChange={(e) => setFilterKategori(e.target.value)}
                        style={{ marginBottom: '12px', width: '100%' }}
                    >
                        <option value="">Semua Kategori</option>
                        {kategoris.map(k => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </select>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Cari emosi..."
                        value={searchEmosi}
                        onChange={(e) => setSearchEmosi(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            fontSize: '0.9rem',
                            marginBottom: '12px'
                        }}
                    />

                    {/* Quick Results */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {filteredEmosi.map(emosi => (
                            <button
                                key={emosi.id}
                                onClick={() => onSelectEmosi(emosi)}
                                style={{
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    border: selectedEmosi?.id === emosi.id
                                        ? '2px solid #6366f1'
                                        : '1px solid rgba(99,102,241,0.4)',
                                    background: selectedEmosi?.id === emosi.id
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : 'rgba(99,102,241,0.2)',
                                    color: '#fff',
                                    fontSize: '0.8rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                {emosi.nama} {selectedEmosi?.id === emosi.id && '✓'}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
