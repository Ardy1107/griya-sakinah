import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function DoaCollection() {
    const [activeCategory, setActiveCategory] = useState('para_nabi');
    const [expandedDoa, setExpandedDoa] = useState(null);
    const [copied, setCopied] = useState(null);

    const categories = [
        { id: 'para_nabi', name: 'Doa Para Nabi', icon: '🤲' },
        { id: 'sulaiman', name: 'Doa Sulaiman', icon: '👑' },
        { id: 'logos', name: 'Doa Logos', icon: '💫' },
        { id: 'afirmasi', name: 'Doa Afirmasi', icon: '✨' },
        { id: 'harian', name: 'Doa Harian', icon: '🌙' },
    ];

    const doaList = {
        para_nabi: [
            {
                id: 1,
                nama: 'Doa Nabi Adam AS',
                arab: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
                latin: 'Rabbana dzalamna anfusana wa in lam taghfir lana wa tarhamna lanakunanna minal khasirin',
                arti: 'Ya Tuhan kami, kami telah menzalimi diri kami sendiri. Jika Engkau tidak mengampuni kami dan memberi rahmat kepada kami, niscaya kami termasuk orang-orang yang rugi.',
                dalil: 'QS. Al-A\'raf 7:23',
                keutamaan: 'Doa pengakuan kesalahan dan permohonan ampunan'
            },
            {
                id: 2,
                nama: 'Doa Nabi Yunus AS',
                arab: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
                latin: 'La ilaha illa anta subhanaka inni kuntu minadz dzalimin',
                arti: 'Tidak ada Tuhan selain Engkau, Mahasuci Engkau. Sungguh, aku termasuk orang-orang yang zalim.',
                dalil: 'QS. Al-Anbiya 21:87',
                keutamaan: 'Doa pembebas dari kesulitan'
            },
            {
                id: 3,
                nama: 'Doa Nabi Musa AS (Rezeki)',
                arab: 'رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
                latin: 'Rabbi inni lima anzalta ilayya min khairin faqir',
                arti: 'Ya Tuhanku, sungguh aku sangat membutuhkan setiap kebaikan yang Engkau turunkan kepadaku.',
                dalil: 'QS. Al-Qashash 28:24',
                keutamaan: 'Doa penarik rezeki'
            },
            {
                id: 4,
                nama: 'Doa Nabi Ayub AS',
                arab: 'رَبِّ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ',
                latin: 'Rabbi anni massaniyad dhurru wa anta arhamur rahimin',
                arti: 'Ya Tuhanku, sungguh aku telah ditimpa penyakit, padahal Engkau Tuhan Yang Maha Penyayang dari semua yang penyayang.',
                dalil: 'QS. Al-Anbiya 21:83',
                keutamaan: 'Doa kesembuhan dan pertolongan'
            },
            {
                id: 5,
                nama: 'Doa Ashabul Kahfi',
                arab: 'رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
                latin: 'Rabbana atina min ladunka rahmatan wa hayyi lana min amrina rasyada',
                arti: 'Ya Tuhan kami, berikanlah rahmat kepada kami dari sisi-Mu dan sempurnakanlah petunjuk yang lurus bagi kami dalam urusan kami.',
                dalil: 'QS. Al-Kahf 18:10',
                keutamaan: 'Doa meminta petunjuk dan rahmat'
            },
        ],
        sulaiman: [
            {
                id: 6,
                nama: 'Doa Sulaiman (Kerajaan)',
                arab: 'رَبِّ اغْفِرْ لِي وَهَبْ لِي مُلْكًا لَا يَنْبَغِي لِأَحَدٍ مِنْ بَعْدِي إِنَّكَ أَنْتَ الْوَهَّابُ',
                latin: 'Rabbighfir li wahab li mulkan la yanbaghi li ahadin min ba\'di innaka antal wahhab',
                arti: 'Ya Tuhanku, ampunilah aku dan anugerahkanlah kepadaku kerajaan yang tidak dimiliki oleh siapapun setelahku. Sungguh Engkau Maha Pemberi.',
                dalil: 'QS. Shad 38:35',
                keutamaan: 'Doa manifestasi dan keberlimpahan'
            },
            {
                id: 7,
                nama: 'Doa Sulaiman (Syukur)',
                arab: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ',
                latin: 'Rabbi awzi\'ni an asykura ni\'matakal lati an\'amta alayya wa ala walidayya',
                arti: 'Ya Tuhanku, anugerahkanlah aku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau berikan kepadaku dan kepada kedua orang tuaku.',
                dalil: 'QS. An-Naml 27:19',
                keutamaan: 'Doa memohon syukur'
            },
        ],
        logos: [
            {
                id: 8,
                nama: 'Doa Logos',
                arab: null,
                latin: 'Yaa Allah, hamba mohon agar mulai saat ini, apapun yang hamba lakukan, apapun pekerjaan hamba, apapun yang Kau karuniakan pada hamba:\n\nKau tolong hamba untuk lebih dekat dengan-Mu, lebih Kau cintai, dan lebih mencintai-Mu. Lebih ridho pada-Mu dan Kau ridhoi.\n\nMembawa manfaat sebesar-besarnya pada sebanyak mungkin makhluk-Mu. Jadikan hamba rohmatan lil alamin.\n\nDan setiap hari bertambah baik dan bertambah baik, hingga saatnya aku kembali pada-Mu dalam kondisi yang terbaik, husnul khotimah dalam pelukan cinta-Mu.',
                arti: 'Doa niat utama - menjadi orang yang mencintai Allah, bermanfaat, dan versi terbaik diri',
                dalil: 'Ahmad Faiz Zainudin',
                keutamaan: 'Doa mencapai cinta Allah'
            },
        ],
        afirmasi: [
            {
                id: 9,
                nama: 'Discipline of Bliss',
                arab: null,
                latin: 'Yaa Allah.. Yaa Tuhan..\n\nMengapa Engkau begitu baik padaku, hingga aku Kau karuniai makin hari makin BAHAGIA, makin DAMAI hidupku, apapun yang terjadi, padahal aku ini banyak dosanya, sedikit amalnya?',
                arti: 'Afirmasi kebahagiaan dan kedamaian',
                dalil: 'AFZ - 7 Identitas Pengundang Abundance',
                keutamaan: 'Identitas #1 - Discipline of Bliss'
            },
            {
                id: 10,
                nama: 'God Always Have My Back',
                arab: null,
                latin: 'Yaa Allah.. Yaa Tuhan..\n\nMengapa Engkau begitu baik padaku, hingga Kau karuniai makin hari makin Kau dukung, Kau kuatkan, dan Kau hebatkan diriku, padahal aku ini banyak salahnya, sedikit amalnya?',
                arti: 'Afirmasi dukungan Allah',
                dalil: 'AFZ - 7 Identitas Pengundang Abundance',
                keutamaan: 'Identitas #6 - God Always Have My Back'
            },
        ],
        harian: [
            {
                id: 11,
                nama: 'Doa Kebaikan Dunia Akhirat',
                arab: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
                latin: 'Rabbana atina fid dunya hasanatan wa fil akhirati hasanatan wa qina adzaban nar',
                arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.',
                dalil: 'QS. Al-Baqarah 2:201',
                keutamaan: 'Doa meminta kebaikan dunia dan akhirat'
            },
            {
                id: 12,
                nama: 'Doa Pelunas Hutang',
                arab: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
                latin: 'Allahummakfini bihalalika an haramik wa aghnini bifadhlika amman siwak',
                arti: 'Ya Allah, cukupkanlah aku dengan rezeki halal-Mu dari yang haram, dan kayakan aku dengan karunia-Mu dari selain-Mu.',
                dalil: 'HR. Tirmidzi',
                keutamaan: 'Doa agar terbebas dari hutang dan kecukupan'
            },
        ],
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali ke Dashboard
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <div>
                    <h1>
                        <BookOpen size={28} />
                        Koleksi Doa
                    </h1>
                    <p className="subtitle">Doa Para Nabi, Logos, dan Afirmasi</p>
                </div>
            </div>

            {/* Category Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                marginBottom: '24px',
                paddingBottom: '8px'
            }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`spiritual-btn ${activeCategory === cat.id ? 'spiritual-btn-primary' : 'spiritual-btn-secondary'}`}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            {/* Doa List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {doaList[activeCategory]?.map(doa => (
                    <div key={doa.id} className="spiritual-card">
                        <div
                            onClick={() => setExpandedDoa(expandedDoa === doa.id ? null : doa.id)}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <div>
                                <h3 style={{ marginBottom: '4px' }}>{doa.nama}</h3>
                                <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                    {doa.dalil}
                                </div>
                            </div>
                            {expandedDoa === doa.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>

                        {expandedDoa === doa.id && (
                            <div style={{ marginTop: '16px' }}>
                                {doa.arab && (
                                    <div style={{
                                        background: 'var(--spiritual-bg)',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        direction: 'rtl',
                                        fontSize: '1.5rem',
                                        lineHeight: '2',
                                        fontFamily: 'Traditional Arabic, serif'
                                    }}>
                                        {doa.arab}
                                    </div>
                                )}

                                <div style={{
                                    background: 'var(--spiritual-bg)',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    whiteSpace: 'pre-wrap',
                                    fontStyle: 'italic'
                                }}>
                                    {doa.latin}
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <strong>Arti:</strong>
                                    <p style={{ marginTop: '4px', color: 'var(--spiritual-text-muted)' }}>
                                        {doa.arti}
                                    </p>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    flexWrap: 'wrap',
                                    marginTop: '16px'
                                }}>
                                    <button
                                        className="spiritual-btn spiritual-btn-secondary"
                                        onClick={() => handleCopy(doa.latin)}
                                    >
                                        {copied === doa.latin ? <Check size={16} /> : <Copy size={16} />}
                                        {copied === doa.latin ? 'Tersalin!' : 'Salin Latin'}
                                    </button>
                                    {doa.arab && (
                                        <button
                                            className="spiritual-btn spiritual-btn-secondary"
                                            onClick={() => handleCopy(doa.arab)}
                                        >
                                            {copied === doa.arab ? <Check size={16} /> : <Copy size={16} />}
                                            {copied === doa.arab ? 'Tersalin!' : 'Salin Arab'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
