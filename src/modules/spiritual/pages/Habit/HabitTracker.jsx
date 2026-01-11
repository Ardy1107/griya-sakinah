import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Flame, Sun, Moon, BookOpen, Heart, Sparkles } from 'lucide-react';

export default function HabitTracker() {
    const [habits, setHabits] = useState({
        // Shalat Wajib
        subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false,
        // Shalat Sunnah
        tahajud: false, dhuha: false, rawatib: false, witir: false,
        // Zikir
        istighfar: false, tasbih: false, shalawat: false,
        // Quran
        waqiah: false, mulk: false, tilawah: false,
        // Sedekah
        sedekah: false,
        // Penghapus Dosa
        taubat: false, wudhu: false, jamaah: false, puasa: false
    });
    const [sedekahAmount, setSedekahAmount] = useState('');

    const toggleHabit = (key) => {
        setHabits(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const habitCategories = [
        {
            title: 'Shalat Wajib',
            icon: <Moon size={18} />,
            color: '#3b82f6',
            items: [
                { key: 'subuh', label: 'Subuh' },
                { key: 'dzuhur', label: 'Dzuhur' },
                { key: 'ashar', label: 'Ashar' },
                { key: 'maghrib', label: 'Maghrib' },
                { key: 'isya', label: 'Isya' },
            ]
        },
        {
            title: 'Shalat Sunnah',
            icon: <Sun size={18} />,
            color: '#f59e0b',
            items: [
                { key: 'tahajud', label: 'Tahajud' },
                { key: 'dhuha', label: 'Dhuha' },
                { key: 'rawatib', label: 'Rawatib' },
                { key: 'witir', label: 'Witir' },
            ]
        },
        {
            title: 'Zikir',
            icon: <Sparkles size={18} />,
            color: '#8b5cf6',
            items: [
                { key: 'istighfar', label: 'Istighfar 100x' },
                { key: 'tasbih', label: 'Tasbih/Tahmid/Takbir' },
                { key: 'shalawat', label: 'Shalawat 100x' },
            ]
        },
        {
            title: 'Quran',
            icon: <BookOpen size={18} />,
            color: '#10b981',
            items: [
                { key: 'waqiah', label: 'Al-Waqi\'ah' },
                { key: 'mulk', label: 'Al-Mulk' },
                { key: 'tilawah', label: 'Tilawah/Muraja\'ah' },
            ]
        },
        {
            title: 'Sedekah',
            icon: <Heart size={18} />,
            color: '#ec4899',
            items: [
                { key: 'sedekah', label: 'Sedekah Harian' },
            ]
        },
        {
            title: 'Penghapus Dosa',
            icon: <Flame size={18} />,
            color: '#ef4444',
            items: [
                { key: 'taubat', label: 'Shalat Taubat' },
                { key: 'wudhu', label: 'Wudhu Sempurna 5x' },
                { key: 'jamaah', label: 'Shalat Berjamaah' },
                { key: 'puasa', label: 'Puasa Senin/Kamis' },
            ]
        }
    ];

    const getProgress = () => {
        const total = Object.keys(habits).length;
        const completed = Object.values(habits).filter(Boolean).length;
        return { total, completed, percentage: Math.round((completed / total) * 100) };
    };

    const progress = getProgress();

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali ke Dashboard
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                <div>
                    <h1>
                        <CheckSquare size={28} />
                        Habit Tracker
                    </h1>
                    <p className="subtitle">Track Amalan Harian Anda</p>
                </div>
                <div className="spiritual-streak">
                    <Flame size={18} />
                    <span>🔥 7 hari</span>
                </div>
            </div>

            {/* Progress */}
            <div className="spiritual-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span>Progress Hari Ini</span>
                    <span style={{ fontWeight: '600', color: 'var(--spiritual-primary-light)' }}>
                        {progress.completed}/{progress.total} ({progress.percentage}%)
                    </span>
                </div>
                <div className="spiritual-progress" style={{ height: '12px' }}>
                    <div
                        className="spiritual-progress-bar"
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
            </div>

            {/* Habit Categories */}
            {habitCategories.map(category => (
                <div key={category.title} className="spiritual-card" style={{ marginBottom: '16px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                        color: category.color
                    }}>
                        {category.icon}
                        <h3 style={{ color: 'var(--spiritual-text)' }}>{category.title}</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {category.items.map(item => (
                            <div
                                key={item.key}
                                onClick={() => toggleHabit(item.key)}
                                className={`spiritual-check-item ${habits[item.key] ? 'completed' : ''}`}
                            >
                                <div className="spiritual-checkbox">
                                    {habits[item.key] && '✓'}
                                </div>
                                <span className="spiritual-check-text">{item.label}</span>
                            </div>
                        ))}

                        {/* Sedekah Amount Input */}
                        {category.title === 'Sedekah' && habits.sedekah && (
                            <input
                                type="number"
                                className="spiritual-input"
                                placeholder="Nominal sedekah (Rp)"
                                value={sedekahAmount}
                                onChange={(e) => setSedekahAmount(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{ marginTop: '8px' }}
                            />
                        )}
                    </div>
                </div>
            ))}

            {/* Dalil */}
            <div style={{
                padding: '16px',
                background: 'var(--spiritual-card)',
                borderRadius: '12px',
                fontSize: '0.875rem'
            }}>
                <strong>Keutamaan Istighfar:</strong>
                <p style={{ marginTop: '8px', color: 'var(--spiritual-text-muted)', fontStyle: 'italic' }}>
                    "Demi Allah, sungguh aku beristighfar kepada Allah dan bertobat kepada-Nya dalam sehari sebanyak lebih dari tujuh puluh kali." (HR. Bukhari)
                </p>
            </div>
        </div>
    );
}
