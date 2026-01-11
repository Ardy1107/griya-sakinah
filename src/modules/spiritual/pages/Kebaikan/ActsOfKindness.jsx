import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gift, Check, Plus, Heart, Sparkles } from 'lucide-react';

const KATEGORI_KEBAIKAN = [
    { id: 'keluarga', label: 'Keluarga', icon: '👨‍👩‍👧‍👦', color: '#f97316' },
    { id: 'tetangga', label: 'Tetangga', icon: '🏘️', color: '#22c55e' },
    { id: 'teman', label: 'Teman/Rekan', icon: '🤝', color: '#3b82f6' },
    { id: 'asing', label: 'Orang Asing', icon: '👤', color: '#a855f7' },
    { id: 'hewan', label: 'Hewan/Lingkungan', icon: '🌿', color: '#14b8a6' },
];

const CONTOH_KEBAIKAN = [
    'Memberi sedekah',
    'Membantu tetangga',
    'Tersenyum kepada orang lain',
    'Memberi makan kucing/burung',
    'Membuang sampah pada tempatnya',
    'Mengucapkan terima kasih',
    'Membukakan pintu untuk orang lain',
    'Menyapa lebih dulu',
    'Mengerjakan tugas rumah',
    'Meminjamkan barang',
    'Memberikan pujian tulus',
    'Mendoakan orang lain',
    'Memaafkan kesalahan orang',
    'Mendengarkan curhat teman',
    'Berbagi makanan',
];

export default function ActsOfKindness() {
    const [kebaikanList, setKebaikanList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        kebaikan: '',
        kategori: 'keluarga',
        catatan: ''
    });

    const todayCount = kebaikanList.length;
    const targetHarian = 3;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.kebaikan.trim()) return;

        setKebaikanList(prev => [...prev, {
            id: Date.now(),
            ...formData,
            waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }]);
        setFormData({ kebaikan: '', kategori: 'keluarga', catatan: '' });
        setShowForm(false);
    };

    const handleQuickAdd = (kebaikan) => {
        setKebaikanList(prev => [...prev, {
            id: Date.now(),
            kebaikan,
            kategori: 'asing',
            catatan: '',
            waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual/kebaikan" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
                <div>
                    <h1>
                        <Gift size={28} />
                        Kebaikan Harian
                    </h1>
                    <p className="subtitle">Catat kebaikan yang kamu lakukan hari ini</p>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '1rem',
                    fontWeight: '700'
                }}>
                    {todayCount}/{targetHarian}
                </div>
            </div>

            {/* Hadis */}
            <div style={{
                background: 'rgba(249, 115, 22, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.875rem',
                border: '1px solid rgba(249, 115, 22, 0.3)'
            }}>
                <strong>HR. Muslim:</strong>
                <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
                    "Setiap kebaikan adalah sedekah."
                </p>
            </div>

            {/* Progress */}
            <div className="spiritual-card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span>Progress Hari Ini</span>
                    <span style={{ fontWeight: '600', color: '#f97316' }}>
                        {todayCount}/{targetHarian} kebaikan
                    </span>
                </div>
                <div className="spiritual-progress" style={{ height: '12px' }}>
                    <div
                        className="spiritual-progress-bar"
                        style={{
                            width: `${Math.min((todayCount / targetHarian) * 100, 100)}%`,
                            background: 'linear-gradient(90deg, #f97316, #fb923c)'
                        }}
                    />
                </div>
                {todayCount >= targetHarian && (
                    <div style={{ marginTop: '12px', textAlign: 'center', color: '#22c55e' }}>
                        🎉 Target harian tercapai! Alhamdulillah!
                    </div>
                )}
            </div>

            {/* Quick Add */}
            <div className="spiritual-card" style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '16px' }}>⚡ Tambah Cepat</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {CONTOH_KEBAIKAN.slice(0, 6).map(item => (
                        <button
                            key={item}
                            onClick={() => handleQuickAdd(item)}
                            style={{
                                padding: '8px 12px',
                                background: 'var(--spiritual-bg)',
                                border: '1px solid var(--spiritual-border)',
                                borderRadius: '20px',
                                color: 'var(--spiritual-text)',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            + {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Button */}
            <button
                onClick={() => setShowForm(true)}
                className="spiritual-btn spiritual-btn-success"
                style={{ width: '100%', marginBottom: '24px' }}
            >
                <Plus size={18} />
                Catat Kebaikan Baru
            </button>

            {/* Form Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    zIndex: 100
                }}>
                    <div className="spiritual-card" style={{ width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Catat Kebaikan</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="spiritual-form-group">
                                <label className="spiritual-label">Kebaikan yang dilakukan</label>
                                <input
                                    type="text"
                                    className="spiritual-input"
                                    placeholder="Contoh: Membantu ibu memasak"
                                    value={formData.kebaikan}
                                    onChange={(e) => setFormData({ ...formData, kebaikan: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="spiritual-form-group">
                                <label className="spiritual-label">Kategori</label>
                                <select
                                    className="spiritual-select"
                                    value={formData.kategori}
                                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                >
                                    {KATEGORI_KEBAIKAN.map(k => (
                                        <option key={k.id} value={k.id}>{k.icon} {k.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    className="spiritual-btn spiritual-btn-secondary"
                                    style={{ flex: 1 }}
                                    onClick={() => setShowForm(false)}
                                >
                                    Batal
                                </button>
                                <button type="submit" className="spiritual-btn spiritual-btn-success" style={{ flex: 1 }}>
                                    <Check size={18} />
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Kebaikan List */}
            <h3 style={{ marginBottom: '16px' }}>📝 Kebaikan Hari Ini</h3>
            {kebaikanList.length === 0 ? (
                <div className="spiritual-card" style={{ textAlign: 'center', color: 'var(--spiritual-text-muted)' }}>
                    <Heart size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p>Belum ada kebaikan dicatat hari ini</p>
                    <p style={{ fontSize: '0.875rem' }}>Yuk mulai berbuat kebaikan! 💖</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {kebaikanList.map((item, idx) => {
                        const kategori = KATEGORI_KEBAIKAN.find(k => k.id === item.kategori);
                        return (
                            <div key={item.id} className="spiritual-check-item completed">
                                <div className="spiritual-checkbox">
                                    <Check size={14} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="spiritual-check-text">{item.kebaikan}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>
                                        {kategori?.icon} {kategori?.label} • {item.waktu}
                                    </div>
                                </div>
                                <Sparkles size={16} style={{ color: '#f97316' }} />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reward Section */}
            {todayCount >= 3 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2))',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginTop: '24px'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⭐</div>
                    <div style={{ fontWeight: '600' }}>
                        MasyaAllah! {todayCount} kebaikan hari ini!
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)', marginTop: '4px' }}>
                        Semoga menjadi amal jariyah yang terus mengalir pahalanya
                    </div>
                </div>
            )}
        </div>
    );
}
