import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Flame, BookOpen, Check } from 'lucide-react';

export default function AbundanceDashboard() {
    const dailyPractice = [
        { id: 1, name: 'Doa Para Nabi', completed: true },
        { id: 2, name: 'Istighfar & Taubat', completed: true },
        { id: 3, name: 'Dzikir Pagi Petang', completed: false },
        { id: 4, name: 'Shalawat Nabi ﷺ', completed: false },
        { id: 5, name: 'Toples Syukur (TOSCA)', completed: false },
    ];

    const principles = [
        { id: 1, name: 'Mengenal Diri (Be-1)', desc: 'Sadar kita adalah hamba Allah yang diciptakan dalam sebaik-baik bentuk' },
        { id: 2, name: 'Mengenal Tujuan (Be-2)', desc: 'QS. Adz-Dzariyat:56 - Diciptakan untuk beribadah kepada Allah' },
        { id: 3, name: 'Bersihkan Pikiran (Be-3)', desc: 'Husnudzan kepada Allah, bersihkan prasangka buruk' },
        { id: 4, name: 'Luaskan Hati (Be-4)', desc: 'QS. Alam Nasyrah:1 - Alam nasyrah laka sadrak' },
        { id: 5, name: 'Bermunajat (Be-5)', desc: 'QS. Ghafir:60 - Berdoalah kepada-Ku, niscaya Aku kabulkan' },
        { id: 6, name: 'Rahasia Nabi (Be-6)', desc: 'Tawakal, sabar, syukur - sifat para Nabi' },
        { id: 7, name: 'Ikhtiar Terbaik (Do)', desc: 'Berusaha maksimal, hasil serahkan kepada Allah' },
    ];

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali ke Dashboard
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
                <div>
                    <h1>
                        <Sparkles size={28} />
                        Full Abundance
                    </h1>
                    <p className="subtitle">Program 38 Hari - Ahmad Faiz Zainudin</p>
                </div>
                <div className="spiritual-streak">
                    <Flame size={18} />
                    <span>Hari ke-12</span>
                </div>
            </div>

            {/* Formula Islami */}
            <div className="spiritual-card" style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '12px' }}>Kunci Keberkahan Rezeki</h3>
                <div style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#f59e0b',
                    marginBottom: '8px',
                    lineHeight: '1.6'
                }}>
                    Istighfar + Taqwa = Rezeki dari Arah Tidak Disangka
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)', fontStyle: 'italic' }}>
                    "Barangsiapa bertakwa kepada Allah, niscaya Dia akan membukakan jalan keluar baginya, dan memberinya rezeki dari arah yang tidak disangka-sangkanya."<br />
                    <strong>— QS. At-Talaq: 2-3</strong>
                </p>
            </div>

            {/* Daily Practice */}
            <div className="spiritual-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <BookOpen size={20} />
                    <h3>Latihan Harian (~20 menit)</h3>
                </div>

                <div className="spiritual-checklist">
                    {dailyPractice.map(item => (
                        <div
                            key={item.id}
                            className={`spiritual-check-item ${item.completed ? 'completed' : ''}`}
                        >
                            <div className="spiritual-checkbox">
                                {item.completed && <Check size={14} />}
                            </div>
                            <span className="spiritual-check-text">{item.name}</span>
                        </div>
                    ))}
                </div>

                <div className="spiritual-progress" style={{ marginTop: '16px' }}>
                    <div
                        className="spiritual-progress-bar"
                        style={{
                            width: '40%',
                            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                        }}
                    />
                </div>
                <div style={{
                    marginTop: '8px',
                    fontSize: '0.75rem',
                    color: 'var(--spiritual-text-muted)',
                    textAlign: 'right'
                }}>
                    2/5 selesai hari ini
                </div>
            </div>

            {/* 7 Prinsip Islami */}
            <div className="spiritual-card">
                <h3 style={{ marginBottom: '16px' }}>7 Prinsip Keberkahan</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {principles.map(p => (
                        <div
                            key={p.id}
                            style={{
                                padding: '12px 16px',
                                background: 'var(--spiritual-bg)',
                                borderRadius: '8px',
                                borderLeft: '4px solid #f59e0b'
                            }}
                        >
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                {p.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                {p.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Access */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Link
                    to="/spiritual/doa"
                    className="spiritual-btn spiritual-btn-secondary"
                    style={{ flex: 1 }}
                >
                    🤲 Doa Para Nabi
                </Link>
                <Link
                    to="/spiritual/seft"
                    className="spiritual-btn spiritual-btn-secondary"
                    style={{ flex: 1 }}
                >
                    🎯 ABC/SEFT
                </Link>
            </div>
        </div>
    );
}
