import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, RefreshCw, Share2, Heart } from 'lucide-react';

const MOTIVASI_HARIAN = [
    {
        id: 1,
        sumber: 'HR. Bukhari',
        text: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.',
        kategori: 'kebaikan'
    },
    {
        id: 2,
        sumber: 'QS. Al-Baqarah 2:286',
        text: 'Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.',
        kategori: 'tawakal'
    },
    {
        id: 3,
        sumber: 'HR. Muslim',
        text: 'Janganlah kamu meremehkan suatu kebaikan apapun, walaupun hanya bermuka manis kepada saudaramu.',
        kategori: 'kebaikan'
    },
    {
        id: 4,
        sumber: 'QS. Asy-Syarh 94:5-6',
        text: 'Sesungguhnya sesudah kesulitan itu ada kemudahan. Sesungguhnya sesudah kesulitan itu ada kemudahan.',
        kategori: 'sabar'
    },
    {
        id: 5,
        sumber: 'HR. Tirmidzi',
        text: 'Barangsiapa bertakwa kepada Allah, niscaya Allah akan memberikannya jalan keluar dan memberinya rezeki dari arah yang tidak disangka.',
        kategori: 'tawakal'
    },
    {
        id: 6,
        sumber: 'QS. Ibrahim 14:7',
        text: 'Jika kamu bersyukur, niscaya Aku akan menambah nikmat kepadamu.',
        kategori: 'syukur'
    },
    {
        id: 7,
        sumber: 'HR. Bukhari & Muslim',
        text: 'Doa adalah senjata orang beriman, tiang agama, dan cahaya langit dan bumi.',
        kategori: 'doa'
    },
    {
        id: 8,
        sumber: 'QS. Al-Insyirah 94:5',
        text: 'Karena sesungguhnya sesudah kesulitan itu ada kemudahan.',
        kategori: 'sabar'
    },
    {
        id: 9,
        sumber: 'HR. Ahmad',
        text: 'Shalat adalah tiang agama. Barangsiapa menegakkannya berarti ia menegakkan agama.',
        kategori: 'ibadah'
    },
    {
        id: 10,
        sumber: 'QS. Ar-Ra\'d 13:28',
        text: 'Ingatlah, hanya dengan mengingat Allah-lah hati menjadi tenteram.',
        kategori: 'zikir'
    },
    {
        id: 11,
        sumber: 'HR. Abu Dawud',
        text: 'Barangsiapa istiqomah beristighfar, Allah akan memberikan jalan keluar dari setiap kesempitan.',
        kategori: 'istighfar'
    },
    {
        id: 12,
        sumber: 'QS. An-Nahl 16:97',
        text: 'Barangsiapa yang mengerjakan amal saleh, baik laki-laki maupun perempuan dalam keadaan beriman, maka sesungguhnya akan Kami berikan kepadanya kehidupan yang baik.',
        kategori: 'amal'
    },
    {
        id: 13,
        sumber: 'HR. Muslim',
        text: 'Sedekah tidak akan mengurangi harta.',
        kategori: 'sedekah'
    },
    {
        id: 14,
        sumber: 'QS. Al-Ankabut 29:45',
        text: 'Dan dirikanlah shalat. Sesungguhnya shalat itu mencegah dari perbuatan keji dan mungkar.',
        kategori: 'ibadah'
    },
    {
        id: 15,
        sumber: 'HR. Tirmidzi',
        text: 'Setiap kebaikan adalah sedekah.',
        kategori: 'kebaikan'
    },
    {
        id: 16,
        sumber: 'QS. Ali Imran 3:134',
        text: 'Dan orang-orang yang menahan amarahnya dan memaafkan kesalahan orang lain. Allah menyukai orang-orang yang berbuat kebajikan.',
        kategori: 'akhlak'
    },
    {
        id: 17,
        sumber: 'HR. Bukhari',
        text: 'Sebaik-baik kalian adalah yang mempelajari Al-Quran dan mengajarkannya.',
        kategori: 'quran'
    },
    {
        id: 18,
        sumber: 'QS. Al-Baqarah 2:152',
        text: 'Maka ingatlah kepada-Ku, niscaya Aku ingat kepadamu.',
        kategori: 'zikir'
    },
    {
        id: 19,
        sumber: 'HR. Muslim',
        text: 'Mendoakan kebaikan untuk saudaramu tanpa sepengetahuannya, malaikat akan berkata: Amin, dan bagimu juga kebaikan yang sama.',
        kategori: 'doa'
    },
    {
        id: 20,
        sumber: 'QS. At-Talaq 65:2-3',
        text: 'Barangsiapa bertakwa kepada Allah niscaya Dia akan mengadakan baginya jalan keluar, dan memberinya rezeki dari arah yang tiada disangka-sangkanya.',
        kategori: 'tawakal'
    }
];

export default function MotivasiHarian() {
    const [currentMotivasi, setCurrentMotivasi] = useState(null);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        // Get motivasi based on day of year
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const index = dayOfYear % MOTIVASI_HARIAN.length;
        setCurrentMotivasi(MOTIVASI_HARIAN[index]);
    }, []);

    const handleRefresh = () => {
        const randomIndex = Math.floor(Math.random() * MOTIVASI_HARIAN.length);
        setCurrentMotivasi(MOTIVASI_HARIAN[randomIndex]);
    };

    const handleShare = () => {
        if (navigator.share && currentMotivasi) {
            navigator.share({
                title: 'Motivasi Islami',
                text: `"${currentMotivasi.text}" - ${currentMotivasi.sumber}`
            });
        }
    };

    const toggleFavorite = (id) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const isFavorite = currentMotivasi && favorites.includes(currentMotivasi.id);

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <div>
                    <h1>
                        <Sparkles size={28} />
                        Motivasi Harian
                    </h1>
                    <p className="subtitle">Hadis & Ayat Pilihan</p>
                </div>
            </div>

            {/* Today's Motivasi */}
            {currentMotivasi && (
                <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '24px',
                        fontSize: '0.75rem',
                        color: 'var(--spiritual-text-muted)'
                    }}>
                        ✨ Motivasi untuk hari ini
                    </div>

                    <div style={{
                        padding: '24px',
                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.1))',
                        borderRadius: '16px',
                        marginBottom: '24px',
                        border: '1px solid rgba(236, 72, 153, 0.3)'
                    }}>
                        <div style={{
                            fontSize: '1.25rem',
                            lineHeight: '1.8',
                            textAlign: 'center',
                            marginBottom: '16px',
                            fontWeight: '500'
                        }}>
                            "{currentMotivasi.text}"
                        </div>
                        <div style={{
                            textAlign: 'center',
                            color: '#ec4899',
                            fontWeight: '600'
                        }}>
                            — {currentMotivasi.sumber}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={() => toggleFavorite(currentMotivasi.id)}
                            className="spiritual-btn spiritual-btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Heart size={16} fill={isFavorite ? '#ec4899' : 'none'} color={isFavorite ? '#ec4899' : 'currentColor'} />
                            {isFavorite ? 'Favorit' : 'Simpan'}
                        </button>
                        <button
                            onClick={handleShare}
                            className="spiritual-btn spiritual-btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Share2 size={16} />
                            Bagikan
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="spiritual-btn spiritual-btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <RefreshCw size={16} />
                            Acak
                        </button>
                    </div>
                </div>
            )}

            {/* More Quotes */}
            <div className="spiritual-card">
                <h4 style={{ marginBottom: '16px' }}>📜 Koleksi Motivasi</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {MOTIVASI_HARIAN.slice(0, 5).map(m => (
                        <div
                            key={m.id}
                            onClick={() => setCurrentMotivasi(m)}
                            style={{
                                padding: '12px',
                                background: 'var(--spiritual-bg)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                border: currentMotivasi?.id === m.id ? '2px solid #ec4899' : '1px solid var(--spiritual-border)'
                            }}
                        >
                            <div style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                                "{m.text.substring(0, 80)}..."
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#ec4899' }}>
                                {m.sumber}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
