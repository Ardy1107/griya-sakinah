import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Check, Plus } from 'lucide-react';

export default function DoaDiamdiam() {
    const [ringContacts, setRingContacts] = useState([
        // Ring 0 - Diri Sendiri
        { ring: 0, nama: 'Diri Sendiri', hubungan: 'Saya', completed: false },
        // Ring 1 - Keluarga Inti
        { ring: 1, nama: 'Ayah', hubungan: 'Orang Tua', completed: false },
        { ring: 1, nama: 'Ibu', hubungan: 'Orang Tua', completed: false },
        { ring: 1, nama: 'Istri/Suami', hubungan: 'Pasangan', completed: false },
        // Ring 2 - Anak-anak
        { ring: 2, nama: 'Anak 1', hubungan: 'Anak', completed: false },
        // Ring 3 - Keluarga Besar
        { ring: 3, nama: 'Kakak/Adik', hubungan: 'Saudara', completed: false },
        { ring: 3, nama: 'Mertua', hubungan: 'Keluarga', completed: false },
        // Ring 4 - Sahabat Dekat
        { ring: 4, nama: 'Sahabat 1', hubungan: 'Teman Dekat', completed: false },
        // Ring 5 - Guru/Mentor
        { ring: 5, nama: 'Ustadz/Guru', hubungan: 'Pembimbing Spiritual', completed: false },
        // Ring 6 - Rekan Kerja
        { ring: 6, nama: 'Rekan Kerja', hubungan: 'Kolega', completed: false },
        // Ring 7 - Tetangga
        { ring: 7, nama: 'Tetangga', hubungan: 'Tetangga', completed: false },
        // Ring 8 - Komunitas
        { ring: 8, nama: 'Anggota Komunitas', hubungan: 'Komunitas', completed: false },
        // Ring 9 - Orang yang Berbuat Baik
        { ring: 9, nama: 'Orang yang pernah membantu', hubungan: 'Penolong', completed: false },
        // Ring 10 - Orang yang Menyakiti
        { ring: 10, nama: 'Orang yang menyakiti', hubungan: 'Perlu dimaafkan', completed: false },
    ]);

    // 11 Ring System - Berdasarkan Kedekatan Hubungan
    const ringInfo = [
        { ring: 0, name: 'Diri Sendiri', color: '#3b82f6', target: 1, desc: 'Mulai dari diri sendiri' },
        { ring: 1, name: 'Keluarga Inti', color: '#ef4444', target: 3, desc: 'Ayah, Ibu, Pasangan' },
        { ring: 2, name: 'Anak-anak', color: '#f97316', target: 1, desc: 'Anak kandung/asuh' },
        { ring: 3, name: 'Keluarga Besar', color: '#eab308', target: 2, desc: 'Saudara, Mertua, Keponakan' },
        { ring: 4, name: 'Sahabat Dekat', color: '#84cc16', target: 1, desc: 'Teman paling dekat' },
        { ring: 5, name: 'Guru & Mentor', color: '#22c55e', target: 1, desc: 'Ustadz, Guru, Coach' },
        { ring: 6, name: 'Rekan Kerja', color: '#14b8a6', target: 1, desc: 'Kolega, Bos, Karyawan' },
        { ring: 7, name: 'Tetangga', color: '#06b6d4', target: 1, desc: 'Tetangga kiri-kanan' },
        { ring: 8, name: 'Komunitas', color: '#0ea5e9', target: 1, desc: 'Jamaah, Grup, Organisasi' },
        { ring: 9, name: 'Orang Baik', color: '#8b5cf6', target: 1, desc: 'Yang pernah membantu' },
        { ring: 10, name: 'Yang Menyakiti', color: '#a855f7', target: 1, desc: 'Butuh dimaafkan 🤍' },
    ];

    const toggleComplete = (index) => {
        setRingContacts(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], completed: !updated[index].completed };
            return updated;
        });
    };

    const getCompletedCount = () => ringContacts.filter(c => c.completed).length;
    const getTotalTarget = () => ringInfo.reduce((sum, r) => sum + r.target, 0); // Auto-calculate from rings

    return (
        <div className="spiritual-container">
            <Link to="/spiritual/kebaikan" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}>
                <div>
                    <h1>
                        <Heart size={28} />
                        Doa Diam-diam
                    </h1>
                    <p className="subtitle">11 Ring System - Minimal 11 orang/hari</p>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '1rem',
                    fontWeight: '700'
                }}>
                    {getCompletedCount()}/11
                </div>
            </div>

            {/* Hadis */}
            <div style={{
                background: 'rgba(20, 184, 166, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.875rem',
                border: '1px solid rgba(20, 184, 166, 0.3)'
            }}>
                <strong>HR. Muslim No. 4912:</strong>
                <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
                    "Tidak ada seorang muslim pun yang mendoakan kebaikan bagi saudaranya tanpa sepengetahuannya, melainkan malaikat akan berkata: 'Dan bagimu juga kebaikan yang sama.'"
                </p>
            </div>

            {/* Cara Mendoakan dengan Salam - SUPER DETAIL */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(139, 92, 246, 0.1))',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid rgba(124, 58, 237, 0.3)'
            }}>
                <h4 style={{ marginBottom: '16px', color: '#a78bfa', fontSize: '1.1rem' }}>
                    🤲 Cara Mendoakan: Ucapkan Salam dengan Penuh Makna
                </h4>

                {/* Arabic Text */}
                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '1.8rem',
                        fontFamily: "'Amiri', serif",
                        direction: 'rtl',
                        lineHeight: '2.5',
                        marginBottom: '12px',
                        color: '#fbbf24'
                    }}>
                        اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '8px' }}>
                        Assalamu'alaikum Warahmatullahi Wabarakatuh
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                        Salam sempurna yang diajarkan Rasulullah ﷺ
                    </div>
                </div>

                {/* Detailed Word Breakdown */}
                <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ color: '#fbbf24', marginBottom: '12px' }}>📖 Makna Kata Per Kata:</h5>

                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ color: '#22c55e' }}>السَّلَامُ (As-Salaam)</strong>
                            <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>Asmaul Husna ke-6</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                            <strong>Arti:</strong> Keselamatan, kedamaian, kesejahteraan dari segala marabahaya.<br />
                            <strong>As-Salaam</strong> adalah salah satu nama Allah. Imam Ibn Katsir menjelaskan:
                            "Saat mengucapkan salam, kita sedang memohonkan agar orang tersebut dilindungi oleh
                            Allah As-Salaam (Yang Maha Memberi Keselamatan) dari segala keburukan lahir dan batin."
                        </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#3b82f6' }}>عَلَيْكُمْ ('Alaikum)</strong>
                        </div>
                        <p style={{ fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                            <strong>Arti:</strong> Atas kalian, semoga tercurah kepada kalian.<br />
                            Bentuk jamak menunjukkan doa ini mencakup orang yang disalam dan seluruh keluarganya,
                            orang-orang di sekitarnya, dan para malaikat yang menyertainya.
                        </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#ef4444' }}>وَرَحْمَةُ اللهِ (Wa Rahmatullah)</strong>
                        </div>
                        <p style={{ fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                            <strong>Arti:</strong> Dan rahmat Allah.<br />
                            <strong>Rahmat</strong> mencakup kasih sayang, kelembutan, dan kebaikan Allah yang tak terbatas.
                            Imam Nawawi berkata: "Rahmat Allah lebih luas dari langit dan bumi. Saat mengucapkan ini,
                            kita mendoakan agar orang tersebut dilimpahi kasih sayang Allah dalam segala urusannya."
                        </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#f59e0b' }}>وَبَرَكَاتُهُ (Wa Barakatuh)</strong>
                        </div>
                        <p style={{ fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                            <strong>Arti:</strong> Dan keberkahan-Nya (bentuk jamak dari barakah).<br />
                            <strong>Barakah</strong> = bertambah, tumbuh, berkembang. Ibn Qayyim Al-Jauziyah menjelaskan:
                            "Barakah adalah kebaikan yang terus bertambah dan berkembang. Sedikit yang penuh barakah
                            lebih baik dari banyak yang tidak ada barakahnya. Ini doa agar hidupnya penuh keberkahan
                            dalam waktu, harta, ilmu, keluarga, dan seluruh aspek kehidupannya."
                        </p>
                    </div>
                </div>

                {/* Hadith References */}
                <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ color: '#14b8a6', marginBottom: '12px' }}>📚 Dalil Hadits:</h5>

                    <div style={{ background: 'rgba(20, 184, 166, 0.15)', borderRadius: '10px', padding: '14px', marginBottom: '10px', borderLeft: '4px solid #14b8a6' }}>
                        <strong>HR. Bukhari No. 6227</strong>
                        <p style={{ fontSize: '0.85rem', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                            "Rasulullah ﷺ bersabda: 'Sesungguhnya Allah menciptakan Adam dengan tinggi 60 hasta.
                            Kemudian Allah berfirman: Pergilah dan ucapkan salam kepada sekelompok malaikat itu,
                            dan dengarkanlah bagaimana mereka menjawab salammu, karena itulah salammu dan salam
                            keturunanmu.' Maka Adam berkata: 'Assalamu'alaikum.' Mereka menjawab:
                            'Assalamu'alaika warahmatullah.' Mereka menambahkan 'warahmatullah'."
                        </p>
                    </div>

                    <div style={{ background: 'rgba(20, 184, 166, 0.15)', borderRadius: '10px', padding: '14px', marginBottom: '10px', borderLeft: '4px solid #14b8a6' }}>
                        <strong>HR. Abu Dawud No. 5195</strong>
                        <p style={{ fontSize: '0.85rem', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                            "Imran bin Husain berkata: Seorang laki-laki datang kepada Nabi ﷺ dan mengucapkan:
                            'Assalamu'alaikum.' Beliau menjawab dan berkata: '10 kebaikan.' Kemudian datang laki-laki
                            lain dan mengucapkan: 'Assalamu'alaikum warahmatullah.' Beliau menjawab dan berkata:
                            '20 kebaikan.' Kemudian datang lagi laki-laki lain dan mengucapkan: 'Assalamu'alaikum
                            warahmatullahi wabarakatuh.' Beliau menjawab dan berkata: '30 kebaikan.'"
                        </p>
                    </div>

                    <div style={{ background: 'rgba(20, 184, 166, 0.15)', borderRadius: '10px', padding: '14px', marginBottom: '10px', borderLeft: '4px solid #14b8a6' }}>
                        <strong>HR. Muslim No. 54</strong>
                        <p style={{ fontSize: '0.85rem', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                            "Rasulullah ﷺ bersabda: 'Kalian tidak akan masuk surga sampai kalian beriman, dan
                            kalian tidak beriman sampai kalian saling mencintai. Maukah aku tunjukkan sesuatu
                            yang jika kalian lakukan, kalian akan saling mencintai? Sebarkanlah salam di antara kalian.'"
                        </p>
                    </div>

                    <div style={{ background: 'rgba(20, 184, 166, 0.15)', borderRadius: '10px', padding: '14px', borderLeft: '4px solid #14b8a6' }}>
                        <strong>HR. Muslim No. 2841</strong>
                        <p style={{ fontSize: '0.85rem', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                            "Tidak ada seorang muslim pun yang mendoakan kebaikan bagi saudaranya tanpa
                            sepengetahuannya, melainkan malaikat akan berkata: 'Wa laka bimitslihi'
                            (Dan bagimu juga kebaikan yang sama)."
                        </p>
                    </div>
                </div>

                {/* Summary Box */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                    <strong style={{ color: '#22c55e' }}>✨ Kesimpulan - Saat Mengucapkan Salam, Anda Mendoakan:</strong>
                    <p style={{ marginTop: '10px', fontSize: '0.95rem', lineHeight: '1.8', margin: '10px 0 0 0' }}>
                        "Semoga <strong>keselamatan</strong> (dari segala bahaya fisik dan spiritual),
                        <strong> kedamaian</strong> (ketenangan jiwa dan pikiran),
                        <strong> rahmat Allah</strong> (kasih sayang dan pertolongan-Nya yang tak terbatas),
                        dan <strong>keberkahan</strong> (kebaikan yang terus bertambah dalam umur, harta, ilmu,
                        keluarga, dan seluruh aspek kehidupan) selalu tercurah atas kamu."
                    </p>
                </div>

                {/* Keutamaan */}
                <div style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    padding: '14px',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    border: '1px solid rgba(251, 191, 36, 0.3)'
                }}>
                    <strong style={{ color: '#fbbf24' }}>🌟 Keutamaan Salam Sempurna:</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.85rem', lineHeight: '1.7' }}>
                        <li><strong>30 kebaikan</strong> per salam (assalamu'alaikum warahmatullahi wabarakatuh)</li>
                        <li><strong>Malaikat mengaminkan</strong> dan mendoakan balik untuk Anda</li>
                        <li><strong>Menumbuhkan cinta</strong> antar sesama muslim</li>
                        <li><strong>Salah satu sebab masuk surga</strong></li>
                        <li><strong>Sunnah Nabi ﷺ</strong> dan para sahabat</li>
                    </ul>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--spiritual-text-muted)', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                    <strong>💡 Cara Praktik:</strong><br />
                    1. Dalam hati, bayangkan wajah orang yang ingin didoakan<br />
                    2. Sebut namanya dalam hati<br />
                    3. Ucapkan "Assalamu'alaikum Warahmatullahi Wabarakatuh" dengan penuh keikhlasan<br />
                    4. Yakin bahwa malaikat sedang mengaminkan dan mendoakan Anda juga
                </div>
            </div>

            {/* Progress */}
            <div className="spiritual-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span>Progress Hari Ini</span>
                    <span style={{ fontWeight: '600', color: '#14b8a6' }}>
                        {getCompletedCount()}/{getTotalTarget()} ({Math.round((getCompletedCount() / getTotalTarget()) * 100)}%)
                    </span>
                </div>
                <div className="spiritual-progress" style={{ height: '12px' }}>
                    <div
                        className="spiritual-progress-bar"
                        style={{
                            width: `${(getCompletedCount() / getTotalTarget()) * 100}%`,
                            background: 'linear-gradient(90deg, #14b8a6, #0d9488)'
                        }}
                    />
                </div>
                <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    gap: '4px',
                    flexWrap: 'wrap'
                }}>
                    {ringInfo.map(r => (
                        <div
                            key={r.ring}
                            className={`spiritual-ring ring-${r.ring}`}
                            title={r.name}
                            style={{ fontSize: '0.65rem' }}
                        >
                            {r.ring}
                        </div>
                    ))}
                    <span style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)', marginLeft: '8px' }}>
                        = Ring 0-10 (11 Ring)
                    </span>
                </div>
            </div>

            {/* Ring Groups */}
            {ringInfo.map(ring => {
                const contacts = ringContacts.filter(c => c.ring === ring.ring);
                const completedInRing = contacts.filter(c => c.completed).length;

                return (
                    <div key={ring.ring} className="spiritual-card" style={{ marginBottom: '16px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <div
                                className={`spiritual-ring ring-${ring.ring}`}
                                style={{ width: '36px', height: '36px', fontSize: '1rem' }}
                            >
                                {ring.ring}
                            </div>
                            <div>
                                <h4>{ring.name}</h4>
                                <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                    {completedInRing}/{ring.target} didoakan
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {contacts.map((contact, idx) => {
                                const globalIdx = ringContacts.findIndex(c => c === contact);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => toggleComplete(globalIdx)}
                                        className={`spiritual-check-item ${contact.completed ? 'completed' : ''}`}
                                    >
                                        <div className="spiritual-checkbox">
                                            {contact.completed && <Check size={14} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="spiritual-check-text">{contact.nama}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>
                                                {contact.hubungan}
                                            </div>
                                        </div>
                                        {contact.completed && (
                                            <span style={{ fontSize: '0.7rem', color: '#14b8a6' }}>
                                                ✨ Amin
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Malaikat Message */}
            {getCompletedCount() > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(13, 148, 136, 0.2))',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginTop: '24px'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👼</div>
                    <div style={{ fontWeight: '600' }}>
                        Malaikat telah mengaminkan {getCompletedCount()} doa Anda!
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)', marginTop: '4px' }}>
                        "Amin, dan bagimu juga kebaikan yang sama"
                    </div>
                </div>
            )}
        </div>
    );
}
