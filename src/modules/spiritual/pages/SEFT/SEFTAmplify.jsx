import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, ChevronDown, Sparkles } from 'lucide-react';
import { getEmosiPositif, createSeftSession } from '../../services/spiritualService';

// Afirmasi Generator untuk Amplify
function generateAfirmasi(emosi) {
    return `Ya Allah... Ya Tuhan...

Mengapa Engkau begitu baik padaku, hingga aku Kau karuniai makin hari makin ${emosi.toLowerCase()}...

Makin hari makin bertambah ${emosi.toLowerCase()} dalam hidupku...

Padahal aku ini banyak salahnya, sedikit amalnya...

Alhamdulillah... Alhamdulillah... Alhamdulillah...`;
}

export default function SEFTAmplify() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [emosiList, setEmosiList] = useState([]);
    const [selectedEmosi, setSelectedEmosi] = useState(null);
    const [target, setTarget] = useState('');
    const [ratingSebelum, setRatingSebelum] = useState(5);
    const [ratingSesudah, setRatingSesudah] = useState(5);
    const [afirmasi, setAfirmasi] = useState('');
    const [showEmosiDropdown, setShowEmosiDropdown] = useState(false);
    const [searchEmosi, setSearchEmosi] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadEmosi();
    }, []);

    const loadEmosi = async () => {
        try {
            // Mock data for now
            setEmosiList([
                { id: 1, nama: 'Syukur Mendalam', level_hawkins: 700 },
                { id: 2, nama: 'Cinta pada Allah', level_hawkins: 700 },
                { id: 3, nama: 'Bahagia', level_hawkins: 540 },
                { id: 4, nama: 'Damai', level_hawkins: 600 },
                { id: 5, nama: 'Tenang', level_hawkins: 250 },
                { id: 6, nama: 'Percaya Diri', level_hawkins: 200 },
                { id: 7, nama: 'Berani', level_hawkins: 200 },
                { id: 8, nama: 'Ikhlas', level_hawkins: 350 },
                { id: 9, nama: 'Sabar', level_hawkins: 350 },
                { id: 10, nama: 'Welas Asih', level_hawkins: 500 },
                { id: 11, nama: 'Disiplin Kebahagiaan', level_hawkins: 540 },
                { id: 12, nama: 'Hubungan Saling Menguntungkan', level_hawkins: 500 },
                { id: 13, nama: 'Inspirasi Terus Mengalir', level_hawkins: 400 },
                { id: 14, nama: 'Jago Menghasilkan Uang', level_hawkins: 350 },
                { id: 15, nama: 'Allah Selalu Menjagaku', level_hawkins: 600 },
                { id: 16, nama: 'Impian Tercapai dengan Mudah', level_hawkins: 540 },
                { id: 17, nama: 'Rezeki Melimpah', level_hawkins: 500 },
                { id: 18, nama: 'Sehat Wal Afiat', level_hawkins: 400 },
                { id: 19, nama: 'Berkah dalam Keluarga', level_hawkins: 500 },
                { id: 20, nama: 'Penuh Energi', level_hawkins: 310 },
                { id: 21, nama: 'Fokus dan Produktif', level_hawkins: 310 },
                { id: 22, nama: 'Dikelilingi Orang Baik', level_hawkins: 350 },
                { id: 23, nama: 'Selalu Dilindungi Allah', level_hawkins: 600 },
                { id: 24, nama: 'Hati Lapang', level_hawkins: 400 },
            ]);
        } catch (error) {
            console.error('Failed to load emosi:', error);
        }
    };

    const filteredEmosi = emosiList.filter(e =>
        e.nama.toLowerCase().includes(searchEmosi.toLowerCase())
    );

    const handleSelectEmosi = (emosi) => {
        setSelectedEmosi(emosi);
        setShowEmosiDropdown(false);
        setSearchEmosi('');
    };

    const handleNextStep = () => {
        if (step === 1 && selectedEmosi) {
            setAfirmasi(generateAfirmasi(selectedEmosi.nama));
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/spiritual/seft');
        } catch (error) {
            console.error('Failed to save session:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="spiritual-container">
            {/* Back Button */}
            <Link to="/spiritual/seft" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            {/* Header */}
            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                <div>
                    <h1>
                        <Plus size={28} />
                        SEFT Amplify
                    </h1>
                    <p className="subtitle">Ledakkan & Perbesar Emosi Positif</p>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.875rem'
                }}>
                    Step {step} / 4
                </div>
            </div>

            {/* Progress */}
            <div className="spiritual-progress" style={{ marginBottom: '24px' }}>
                <div className="spiritual-progress-bar" style={{
                    width: `${step * 25}%`,
                    background: 'linear-gradient(90deg, #22c55e, #4ade80)'
                }} />
            </div>

            {/* Step 1: Pilih Emosi Positif */}
            {step === 1 && (
                <div className="spiritual-card">
                    <h3 style={{ marginBottom: '20px' }}>Langkah 1: Pilih Emosi Positif</h3>

                    {/* Emosi Dropdown */}
                    <div className="spiritual-form-group">
                        <label className="spiritual-label">Emosi Positif yang Ingin Diperbesar</label>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowEmosiDropdown(!showEmosiDropdown)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'var(--spiritual-bg)',
                                    border: '1px solid var(--spiritual-border)',
                                    borderRadius: '8px',
                                    color: 'var(--spiritual-text)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <span>{selectedEmosi ? selectedEmosi.nama : 'Pilih emosi positif...'}</span>
                                <ChevronDown size={18} />
                            </button>

                            {showEmosiDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    background: 'var(--spiritual-card)',
                                    border: '1px solid var(--spiritual-border)',
                                    borderRadius: '8px',
                                    marginTop: '4px',
                                    maxHeight: '300px',
                                    overflow: 'auto',
                                    zIndex: 10
                                }}>
                                    <input
                                        type="text"
                                        placeholder="Cari emosi..."
                                        value={searchEmosi}
                                        onChange={(e) => setSearchEmosi(e.target.value)}
                                        className="spiritual-input"
                                        style={{ margin: '8px', width: 'calc(100% - 16px)' }}
                                    />
                                    {filteredEmosi.map(emosi => (
                                        <div
                                            key={emosi.id}
                                            onClick={() => handleSelectEmosi(emosi)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid var(--spiritual-border)',
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--spiritual-bg)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span>{emosi.nama}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>
                                                Level {emosi.level_hawkins}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Target */}
                    <div className="spiritual-form-group">
                        <label className="spiritual-label">Target/Konteks (Opsional)</label>
                        <textarea
                            className="spiritual-textarea"
                            placeholder="Contoh: dalam pekerjaan, dalam keluarga, dalam ibadah..."
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Rating Sebelum */}
                    <div className="spiritual-form-group">
                        <label className="spiritual-label">Rating Intensitas Saat Ini</label>
                        <div className="spiritual-rating">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={ratingSebelum}
                                onChange={(e) => setRatingSebelum(parseInt(e.target.value))}
                                className="spiritual-rating-slider"
                                style={{ background: 'linear-gradient(90deg, #22c55e, #4ade80)' }}
                            />
                            <div className="spiritual-rating-value" style={{ color: '#22c55e' }}>
                                {ratingSebelum}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                <span>Lemah</span>
                                <span>Sangat Kuat</span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="spiritual-btn spiritual-btn-success"
                        style={{ width: '100%' }}
                        onClick={handleNextStep}
                        disabled={!selectedEmosi}
                    >
                        Lanjut ke Step 2
                    </button>
                </div>
            )}

            {/* Step 2: Afirmasi */}
            {step === 2 && (
                <div className="spiritual-card">
                    <h3 style={{ marginBottom: '20px' }}>Langkah 2: Doa Afirmasi Diri</h3>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        lineHeight: '1.8',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid rgba(34, 197, 94, 0.3)'
                    }}>
                        {afirmasi}
                    </div>

                    <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '0.875rem'
                    }}>
                        <strong>Instruksi:</strong>
                        <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
                            <li>Baca afirmasi dengan penuh penghayatan</li>
                            <li>Rasakan emosi positif dari dalam hati</li>
                            <li>Bayangkan energi positif menyebar ke seluruh tubuh</li>
                            <li>Ucapkan dengan rasa syukur yang mendalam</li>
                        </ol>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="spiritual-btn spiritual-btn-secondary"
                            style={{ flex: 1 }}
                            onClick={() => setStep(1)}
                        >
                            Kembali
                        </button>
                        <button
                            className="spiritual-btn spiritual-btn-success"
                            style={{ flex: 1 }}
                            onClick={handleNextStep}
                        >
                            Lanjut Ekspansi
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Ekspansi */}
            {step === 3 && (
                <div className="spiritual-card">
                    <h3 style={{ marginBottom: '20px' }}>Langkah 3: Ekspansi Energi</h3>

                    <div style={{
                        background: 'var(--spiritual-bg)',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ marginBottom: '16px', textAlign: 'center' }}>
                            <Sparkles size={48} style={{ color: '#22c55e' }} />
                        </p>
                        <p style={{ marginBottom: '16px' }}>
                            Sambil merasakan: <strong style={{ color: '#22c55e' }}>"{selectedEmosi?.nama}"</strong>
                        </p>
                        <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
                            <li>Pejamkan mata, tarik napas dalam</li>
                            <li>Rasakan energi positif di dada</li>
                            <li>Bayangkan energi ini meledak dan menyebar</li>
                            <li>Biarkan mengisi seluruh tubuh dari kepala hingga kaki</li>
                            <li>Rasakan tubuh dipenuhi cahaya {selectedEmosi?.nama.toLowerCase()}</li>
                            <li>Anchor dengan menyentuh dada sambil berkata "Ya Allah"</li>
                        </ol>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="spiritual-btn spiritual-btn-secondary"
                            style={{ flex: 1 }}
                            onClick={() => setStep(2)}
                        >
                            Kembali
                        </button>
                        <button
                            className="spiritual-btn spiritual-btn-success"
                            style={{ flex: 1 }}
                            onClick={handleNextStep}
                        >
                            Selesai Ekspansi
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Rating Sesudah */}
            {step === 4 && (
                <div className="spiritual-card">
                    <h3 style={{ marginBottom: '20px' }}>Langkah 4: Rating Sesudah</h3>

                    <div className="spiritual-form-group">
                        <label className="spiritual-label">Rating Intensitas (Sesudah Amplify)</label>
                        <div className="spiritual-rating">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={ratingSesudah}
                                onChange={(e) => setRatingSesudah(parseInt(e.target.value))}
                                className="spiritual-rating-slider"
                            />
                            <div className="spiritual-rating-value" style={{ color: '#22c55e' }}>
                                {ratingSesudah}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                <span>Lemah</span>
                                <span>Sangat Kuat</span>
                            </div>
                        </div>
                    </div>

                    {/* Result */}
                    <div style={{
                        background: ratingSesudah > ratingSebelum
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(59, 130, 246, 0.1)',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Peningkatan Intensitas</div>
                        <div style={{
                            fontSize: '3rem',
                            fontWeight: '700',
                            color: '#22c55e'
                        }}>
                            +{Math.max(0, ratingSesudah - ratingSebelum)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)' }}>
                            {ratingSebelum} → {ratingSesudah}
                        </div>
                        <div style={{
                            marginTop: '12px',
                            fontSize: '1.5rem'
                        }}>
                            🎉 Amplified!
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="spiritual-btn spiritual-btn-secondary"
                            style={{ flex: 1 }}
                            onClick={() => setStep(3)}
                        >
                            Ulangi
                        </button>
                        <button
                            className="spiritual-btn spiritual-btn-success"
                            style={{ flex: 1 }}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <Check size={18} />
                            {saving ? 'Menyimpan...' : 'Simpan Sesi'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
