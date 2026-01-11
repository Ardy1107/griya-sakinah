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
            // Emosi positif dengan kategori Islami dan kalimat sugesti
            setEmosiList([
                // MAQAM TERTINGGI - Hubungan dengan Allah
                {
                    id: 1, nama: 'Syukur Mendalam', kategori: 'Maqam Tertinggi', dalil: 'QS. Ibrahim:7',
                    sugesti: 'Alhamdulillah, makin hari makin bersyukur, nikmat Allah tak terhitung, selalu cukup, bahagia dengan yang ada'
                },
                {
                    id: 2, nama: 'Cinta pada Allah', kategori: 'Maqam Tertinggi', dalil: 'QS. Al-Baqarah:165',
                    sugesti: 'Makin cinta Allah, rindu bertemu Allah, Allah di atas segalanya, hati penuh mahabbah'
                },
                {
                    id: 15, nama: 'Allah Selalu Menjagaku', kategori: 'Maqam Tertinggi', dalil: 'QS. Ar-Ra\'d:11',
                    sugesti: 'Aman, dilindungi, dijaga Allah 24 jam, tak perlu khawatir, Allah cukup bagiku'
                },
                {
                    id: 23, nama: 'Selalu Dilindungi Allah', kategori: 'Maqam Tertinggi', dalil: 'QS. At-Taubah:51',
                    sugesti: 'Hasbunallah, Allah pelindungku, aman di mana saja, dalam genggaman Allah'
                },
                {
                    id: 4, nama: 'Damai', kategori: 'Maqam Tertinggi', dalil: 'QS. Al-Fajr:27-28',
                    sugesti: 'Tenang, damai, sejuk hati, tidak gelisah, hati tenteram, jiwa muthmainnah'
                },

                // AKHLAQUL MAHMUDAH - Sifat Terpuji
                {
                    id: 8, nama: 'Ikhlas', kategori: 'Akhlaqul Mahmudah', dalil: 'QS. Az-Zumar:2',
                    sugesti: 'Lillahi ta\'ala, tanpa pamrih, tidak mengharap balasan manusia, murni karena Allah'
                },
                {
                    id: 9, nama: 'Sabar', kategori: 'Akhlaqul Mahmudah', dalil: 'QS. Al-Baqarah:153',
                    sugesti: 'Tenang menghadapi cobaan, tidak terburu-buru, tabah, yakin ada hikmah, Allah bersama orang sabar'
                },
                {
                    id: 10, nama: 'Welas Asih', kategori: 'Akhlaqul Mahmudah', dalil: 'HR. Muslim',
                    sugesti: 'Penuh kasih sayang, lembut, mudah memaafkan, rahmatan lil alamin, mengasihi semua makhluk'
                },
                {
                    id: 3, nama: 'Bahagia', kategori: 'Akhlaqul Mahmudah', dalil: 'QS. Yunus:58',
                    sugesti: 'Bahagia dengan Islam, bahagia dengan takdir, hati riang, hidup penuh makna, selalu tersenyum'
                },
                {
                    id: 5, nama: 'Tenang', kategori: 'Akhlaqul Mahmudah', dalil: 'QS. Ar-Ra\'d:28',
                    sugesti: 'Hati tenang dengan dzikir, tidak cemas, rileks, santai tapi produktif, khusyuk'
                },
                {
                    id: 6, nama: 'Percaya Diri', kategori: 'Akhlaqul Mahmudah', dalil: 'QS. Ali Imran:139',
                    sugesti: 'Yakin dengan kemampuan, tidak minder, berani tampil, mukmin yang kuat, aku bisa dengan izin Allah'
                },
                {
                    id: 7, nama: 'Berani', kategori: 'Akhlaqul Mahmudah', dalil: 'QS. At-Taubah:51',
                    sugesti: 'Berani mengambil keputusan, berani berubah, berani jujur, takut hanya pada Allah'
                },
                {
                    id: 24, nama: 'Hati Lapang', kategori: 'Akhlaqul Mahmudah', dalil: 'QS. Alam Nasyrah:1',
                    sugesti: 'Dada lapang, tidak sempit, tidak pendendam, mudah memaafkan, legowo'
                },

                // KEBERKAHAN DUNIAWI - Rezeki & Keluarga
                {
                    id: 17, nama: 'Rezeki Melimpah', kategori: 'Keberkahan Duniawi', dalil: 'QS. At-Talaq:2-3',
                    sugesti: 'Rezeki datang dari arah tak terduga, selalu berkecukupan, pintu rezeki terbuka, berlimpah berkah'
                },
                {
                    id: 19, nama: 'Berkah dalam Keluarga', kategori: 'Keberkahan Duniawi', dalil: 'QS. Ar-Rum:21',
                    sugesti: 'Keluarga sakinah mawaddah warahmah, rumah penuh cinta, anak-anak shalih, harmonis'
                },
                {
                    id: 18, nama: 'Sehat Wal Afiat', kategori: 'Keberkahan Duniawi', dalil: 'HR. Tirmidzi',
                    sugesti: 'Sehat jasmani rohani, bugar, energik, badan kuat, imun tinggi, jauh dari penyakit'
                },
                {
                    id: 12, nama: 'Hubungan Baik dengan Sesama', kategori: 'Keberkahan Duniawi', dalil: 'HR. Bukhari',
                    sugesti: 'Disukai banyak orang, mudah akrab, silaturahmi lancar, tidak ada musuh, dicintai'
                },
                {
                    id: 22, nama: 'Dikelilingi Orang Baik', kategori: 'Keberkahan Duniawi', dalil: 'HR. Abu Dawud',
                    sugesti: 'Teman-teman shalih, lingkungan positif, berteman dengan ahli dzikir, jauh dari orang toxic'
                },

                // PRODUKTIVITAS HALAL
                {
                    id: 11, nama: 'Bahagia dengan Halal', kategori: 'Produktivitas Halal', dalil: 'QS. Al-Baqarah:172',
                    sugesti: 'Puas dengan yang halal, tidak tertarik haram, berkah dalam kesederhanaan'
                },
                {
                    id: 13, nama: 'Inspirasi dari Allah', kategori: 'Produktivitas Halal', dalil: 'QS. An-Nahl:68',
                    sugesti: 'Ide cemerlang terus mengalir, kreatif, inovatif, ilham dari Allah, pikiran jernih'
                },
                {
                    id: 14, nama: 'Rezeki Halal Berkah', kategori: 'Produktivitas Halal', dalil: 'QS. Al-Baqarah:168',
                    sugesti: 'Penghasilan halal, bisnis berkah, tidak korupsi, kerja jujur, amanah'
                },
                {
                    id: 16, nama: 'Doa Terkabul', kategori: 'Produktivitas Halal', dalil: 'QS. Ghafir:60',
                    sugesti: 'Doa ijabah, Allah dengar doaku, yakin dikabulkan, doa tanpa ragu'
                },
                {
                    id: 20, nama: 'Penuh Energi', kategori: 'Produktivitas Halal', dalil: 'HR. Bukhari',
                    sugesti: 'Semangat 45, tidak malas, produktif, bangun pagi, stamina kuat'
                },
                {
                    id: 21, nama: 'Fokus dan Produktif', kategori: 'Produktivitas Halal', dalil: 'HR. Tirmidzi',
                    sugesti: 'Konsentrasi tinggi, tidak mudah terdistraksi, kerja efektif, hasil maksimal'
                },
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
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--spiritual-bg)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span>{emosi.nama}</span>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                color: '#22c55e',
                                                textAlign: 'right',
                                                maxWidth: '120px'
                                            }}>
                                                {emosi.dalil}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sugesti Box - Muncul saat emosi dipilih */}
                    {selectedEmosi && selectedEmosi.sugesti && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginTop: '12px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                                color: '#22c55e',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}>
                                💡 Kata-kata Sugesti:
                            </div>
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#fff',
                                lineHeight: '1.6',
                                margin: 0,
                                fontStyle: 'italic'
                            }}>
                                "{selectedEmosi.sugesti}"
                            </p>
                            <p style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255,255,255,0.5)',
                                marginTop: '10px',
                                marginBottom: 0
                            }}>
                                📖 {selectedEmosi.dalil} | {selectedEmosi.kategori}
                            </p>
                        </div>
                    )}

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
