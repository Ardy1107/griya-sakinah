import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Flame, BookOpen, Check } from 'lucide-react';

export default function AbundanceDashboard() {
    const dailyPractice = [
        { id: 1, name: 'Doa Para Nabi', completed: true },
        { id: 2, name: 'ABC Clearing', completed: true },
        { id: 3, name: 'Light of Abundance', completed: false },
        { id: 4, name: 'Doa Logos', completed: false },
        { id: 5, name: 'Toples Syukur (TOSCA)', completed: false },
    ];

    const principles = [
        { id: 1, name: 'Abundance Identity (Be-1)', desc: 'Sadar kita adalah Masterpiece ciptaan Tuhan' },
        { id: 2, name: 'Abundance Mission (Be-2)', desc: 'Sadar tujuan diciptakan untuk mencintai-Nya' },
        { id: 3, name: 'Abundance Mind (Be-3)', desc: 'Bersihkan hambatan pikiran' },
        { id: 4, name: 'Abundance Heart (Be-4)', desc: 'Luaskan hati, luaskan rezeki' },
        { id: 5, name: 'Abundance Spirit (Be-5)', desc: 'Ask, and it is given' },
        { id: 6, name: 'Abundance Soul (Be-6)', desc: 'Rahasia hati para Nabi' },
        { id: 7, name: 'Abundance Action (Do)', desc: 'Ambition for Greater Good' },
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

            {/* Formula */}
            <div className="spiritual-card" style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '12px' }}>Abundance Formula</h3>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#f59e0b',
                    marginBottom: '8px'
                }}>
                    Be² × Do = Have
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)' }}>
                    "Be" jauh lebih penting daripada "Do"
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

            {/* 7 Principles */}
            <div className="spiritual-card">
                <h3 style={{ marginBottom: '16px' }}>7 Spiritual Principles</h3>

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
