import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Plus, Save, Heart } from 'lucide-react';

export default function SyukurJournal() {
    const [syukurList, setSyukurList] = useState([
        { kategori: 'iman', isi: 'Masih diberi kesempatan shalat 5 waktu' },
        { kategori: 'kesehatan', isi: 'Badan sehat, bisa beraktivitas' },
        { kategori: 'keluarga', isi: 'Keluarga dalam keadaan baik' },
    ]);
    const [newSyukur, setNewSyukur] = useState('');
    const [newKategori, setNewKategori] = useState('rezeki');
    const [sedekahAmount, setSedekahAmount] = useState('');

    const kategoriList = [
        { id: 'iman', label: '🤲 Nikmat Iman', color: '#8b5cf6' },
        { id: 'kesehatan', label: '💪 Nikmat Kesehatan', color: '#22c55e' },
        { id: 'keluarga', label: '👨‍👩‍👧‍👦 Nikmat Keluarga', color: '#f97316' },
        { id: 'rezeki', label: '💰 Nikmat Rezeki', color: '#eab308' },
        { id: 'kecil', label: '✨ Nikmat Kecil', color: '#06b6d4' },
    ];

    const addSyukur = () => {
        if (newSyukur.trim()) {
            setSyukurList([...syukurList, { kategori: newKategori, isi: newSyukur }]);
            setNewSyukur('');
        }
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali ke Dashboard
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
                <div>
                    <h1>
                        <Sun size={28} />
                        Syukur & Cinta
                    </h1>
                    <p className="subtitle">Gratitude Journal + Toples Syukur</p>
                </div>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <Link
                    to="/spiritual/syukur/qalbu"
                    className="spiritual-btn spiritual-btn-secondary"
                    style={{ flex: 1 }}
                >
                    <Heart size={16} />
                    Qalbu Meter
                </Link>
            </div>

            {/* Ayat */}
            <div style={{
                background: 'rgba(249, 115, 22, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '0.875rem',
                border: '1px solid rgba(249, 115, 22, 0.3)'
            }}>
                <strong>QS. Ibrahim 14:7</strong>
                <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
                    "Jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu."
                </p>
            </div>

            {/* Add Syukur */}
            <div className="spiritual-card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Tambah Syukur Hari Ini</h3>

                <div className="spiritual-form-group">
                    <label className="spiritual-label">Kategori</label>
                    <select
                        className="spiritual-select"
                        value={newKategori}
                        onChange={(e) => setNewKategori(e.target.value)}
                    >
                        {kategoriList.map(k => (
                            <option key={k.id} value={k.id}>{k.label}</option>
                        ))}
                    </select>
                </div>

                <div className="spiritual-form-group">
                    <label className="spiritual-label">Apa yang kamu syukuri?</label>
                    <textarea
                        className="spiritual-textarea"
                        placeholder="Tuliskan syukur hari ini..."
                        value={newSyukur}
                        onChange={(e) => setNewSyukur(e.target.value)}
                        rows={2}
                    />
                </div>

                <button
                    className="spiritual-btn spiritual-btn-primary"
                    style={{ width: '100%' }}
                    onClick={addSyukur}
                >
                    <Plus size={18} />
                    Tambah Syukur
                </button>
            </div>

            {/* Syukur List */}
            <div className="spiritual-card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Syukur Hari Ini ({syukurList.length})</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {syukurList.map((s, idx) => {
                        const kat = kategoriList.find(k => k.id === s.kategori);
                        return (
                            <div
                                key={idx}
                                style={{
                                    padding: '12px 16px',
                                    background: 'var(--spiritual-bg)',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${kat?.color || '#f97316'}`
                                }}
                            >
                                <div style={{ fontSize: '0.7rem', color: kat?.color, marginBottom: '4px' }}>
                                    {kat?.label}
                                </div>
                                <div>{s.isi}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Toples Syukur */}
            <div className="spiritual-card">
                <h3 style={{ marginBottom: '16px' }}>🫙 Toples Syukur (TOSCA)</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)', marginBottom: '16px' }}>
                    Tulis syukur + sisihkan sedekah. Setelah 1 bulan, buka dan sedekahkan.
                </p>

                <div className="spiritual-form-group">
                    <label className="spiritual-label">Nominal Sedekah Hari Ini</label>
                    <input
                        type="number"
                        className="spiritual-input"
                        placeholder="Rp 10.000"
                        value={sedekahAmount}
                        onChange={(e) => setSedekahAmount(e.target.value)}
                    />
                </div>

                <button className="spiritual-btn spiritual-btn-success" style={{ width: '100%' }}>
                    <Save size={18} />
                    Simpan ke Toples
                </button>

                <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)' }}>Total Toples Bulan Ini</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>
                        Rp 350.000
                    </div>
                </div>
            </div>
        </div>
    );
}
