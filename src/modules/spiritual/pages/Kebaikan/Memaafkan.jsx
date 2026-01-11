import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Check, Plus, X } from 'lucide-react';

export default function Memaafkan() {
    const [orangList, setOrangList] = useState([
        { id: 1, nama: '', kesalahan: '', sudahMaafkan: false, tanggal: '' }
    ]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        nama: '',
        kesalahan: '',
    });

    const completedCount = orangList.filter(o => o.sudahMaafkan && o.nama).length;
    const totalWithNama = orangList.filter(o => o.nama).length;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.nama.trim()) return;

        setOrangList(prev => [...prev, {
            id: Date.now(),
            nama: formData.nama,
            kesalahan: formData.kesalahan,
            sudahMaafkan: false,
            tanggal: ''
        }]);
        setFormData({ nama: '', kesalahan: '' });
        setShowForm(false);
    };

    const toggleMaafkan = (id) => {
        setOrangList(prev => prev.map(o =>
            o.id === id
                ? { ...o, sudahMaafkan: !o.sudahMaafkan, tanggal: !o.sudahMaafkan ? new Date().toLocaleDateString('id-ID') : '' }
                : o
        ));
    };

    const removeOrang = (id) => {
        setOrangList(prev => prev.filter(o => o.id !== id));
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual/kebaikan" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <div>
                    <h1>
                        <Heart size={28} />
                        Memaafkan
                    </h1>
                    <p className="subtitle">Bebaskan hatimu dari dendam dan sakit hati</p>
                </div>
            </div>

            {/* Ayat */}
            <div style={{
                background: 'rgba(236, 72, 153, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.875rem',
                border: '1px solid rgba(236, 72, 153, 0.3)'
            }}>
                <strong>QS. An-Nur 24:22:</strong>
                <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
                    "...dan hendaklah mereka memaafkan dan berlapang dada. Apakah kamu tidak ingin bahwa Allah mengampunimu?"
                </p>
            </div>

            {/* Cara Memaafkan */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(139, 92, 246, 0.1))',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid rgba(124, 58, 237, 0.3)'
            }}>
                <h4 style={{ marginBottom: '12px', color: '#a78bfa' }}>🤲 Langkah Memaafkan</h4>
                <ol style={{ paddingLeft: '16px', lineHeight: '2', fontSize: '0.875rem' }}>
                    <li><strong>Akui</strong> - Akui rasa sakit dan ketidaknyamanan yang dirasakan</li>
                    <li><strong>Niatkan</strong> - Niatkan untuk memaafkan karena Allah SWT</li>
                    <li><strong>Doakan</strong> - Doakan kebaikan untuk orang tersebut</li>
                    <li><strong>Lepaskan</strong> - Lepaskan beban dan serahkan kepada Allah</li>
                    <li><strong>Bersyukur</strong> - Bersyukur atas hikmah di balik kejadian</li>
                </ol>

                <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '16px'
                }}>
                    <strong>Doa saat Memaafkan:</strong>
                    <p style={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        "Ya Allah, aku memaafkan [nama] dengan ikhlas karena-Mu. Aku mohon Engkau gantikan sakit hatiku dengan kelapangan dada dan kebahagiaanku."
                    </p>
                </div>
            </div>

            {/* Add Button */}
            <button
                onClick={() => setShowForm(true)}
                className="spiritual-btn spiritual-btn-primary"
                style={{ width: '100%', marginBottom: '24px' }}
            >
                <Plus size={18} />
                Tambah Orang untuk Dimaafkan
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
                        <h3 style={{ marginBottom: '20px' }}>Tambah Orang</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="spiritual-form-group">
                                <label className="spiritual-label">Nama/Inisial</label>
                                <input
                                    type="text"
                                    className="spiritual-input"
                                    placeholder="Contoh: Pak Ahmad atau A"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="spiritual-form-group">
                                <label className="spiritual-label">Kesalahan yang dilakukan (opsional, rahasia)</label>
                                <textarea
                                    className="spiritual-textarea"
                                    placeholder="Tuliskan untuk melepaskan beban..."
                                    value={formData.kesalahan}
                                    onChange={(e) => setFormData({ ...formData, kesalahan: e.target.value })}
                                    rows={3}
                                />
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
                                <button type="submit" className="spiritual-btn spiritual-btn-primary" style={{ flex: 1 }}>
                                    <Check size={18} />
                                    Tambah
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Progress */}
            {totalWithNama > 0 && (
                <div className="spiritual-card" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span>Progress Memaafkan</span>
                        <span style={{ fontWeight: '600', color: '#ec4899' }}>
                            {completedCount}/{totalWithNama} dimaafkan
                        </span>
                    </div>
                    <div className="spiritual-progress" style={{ height: '12px' }}>
                        <div
                            className="spiritual-progress-bar"
                            style={{
                                width: `${totalWithNama > 0 ? (completedCount / totalWithNama) * 100 : 0}%`,
                                background: 'linear-gradient(90deg, #ec4899, #f472b6)'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* List */}
            <h3 style={{ marginBottom: '16px' }}>📋 Daftar Orang</h3>
            {orangList.filter(o => o.nama).length === 0 ? (
                <div className="spiritual-card" style={{ textAlign: 'center', color: 'var(--spiritual-text-muted)' }}>
                    <Heart size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p>Belum ada orang dalam daftar</p>
                    <p style={{ fontSize: '0.875rem' }}>Tambahkan orang yang ingin kamu maafkan 💗</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orangList.filter(o => o.nama).map(orang => (
                        <div
                            key={orang.id}
                            className={`spiritual-check-item ${orang.sudahMaafkan ? 'completed' : ''}`}
                            style={{ alignItems: 'flex-start' }}
                        >
                            <div
                                className="spiritual-checkbox"
                                onClick={() => toggleMaafkan(orang.id)}
                                style={{ cursor: 'pointer', marginTop: '4px' }}
                            >
                                {orang.sudahMaafkan && <Check size={14} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="spiritual-check-text" style={{ fontWeight: '600' }}>
                                    {orang.nama}
                                </div>
                                {orang.kesalahan && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)', marginTop: '4px' }}>
                                        {orang.kesalahan}
                                    </div>
                                )}
                                {orang.sudahMaafkan && (
                                    <div style={{ fontSize: '0.7rem', color: '#22c55e', marginTop: '4px' }}>
                                        ✨ Dimaafkan {orang.tanggal}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => removeOrang(orang.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--spiritual-text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Completion Message */}
            {completedCount > 0 && completedCount === totalWithNama && totalWithNama > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2))',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginTop: '24px'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💗</div>
                    <div style={{ fontWeight: '600' }}>
                        Alhamdulillah! Hatimu telah lapang
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)', marginTop: '4px' }}>
                        Semoga Allah SWT juga mengampuni dosa-dosamu
                    </div>
                </div>
            )}
        </div>
    );
}
