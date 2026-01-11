import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Coins, Plus, Check, Target, TrendingUp } from 'lucide-react';

const KATEGORI_SEDEKAH = [
    { id: 'uang', label: 'Uang', icon: '💵' },
    { id: 'makanan', label: 'Makanan', icon: '🍚' },
    { id: 'pakaian', label: 'Pakaian', icon: '👕' },
    { id: 'waktu', label: 'Waktu/Tenaga', icon: '⏰' },
    { id: 'ilmu', label: 'Ilmu', icon: '📚' },
    { id: 'lainnya', label: 'Lainnya', icon: '🎁' },
];

export default function SedekahTracker() {
    const [sedekahLog, setSedekahLog] = useState([]);
    const [targetBulanan, setTargetBulanan] = useState(100000);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        jumlah: '',
        kategori: 'uang',
        catatan: ''
    });

    const today = new Date();
    const thisMonthTotal = sedekahLog
        .filter(s => {
            const date = new Date(s.tanggal);
            return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        })
        .reduce((sum, s) => sum + (s.jumlah || 0), 0);

    const progress = Math.min((thisMonthTotal / targetBulanan) * 100, 100);

    const handleSubmit = (e) => {
        e.preventDefault();
        const jumlah = parseInt(formData.jumlah) || 0;

        setSedekahLog([...sedekahLog, {
            id: Date.now(),
            tanggal: today.toISOString().split('T')[0],
            jumlah,
            kategori: formData.kategori,
            catatan: formData.catatan
        }]);
        setFormData({ jumlah: '', kategori: 'uang', catatan: '' });
        setShowForm(false);
    };

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <div>
                    <h1>
                        <Coins size={28} />
                        Sedekah Tracker
                    </h1>
                    <p className="subtitle">Catat setiap sedekah Anda</p>
                </div>
            </div>

            {/* Hadis-Hadis Tentang Sedekah */}
            <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
                <h4 style={{ marginBottom: '16px', color: '#34d399' }}>📖 Keutamaan Sedekah</h4>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '4px' }}>HR. Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Sedekah <strong>tidak akan mengurangi harta</strong>. Allah akan menambah kemuliaan bagi yang memaafkan."
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '4px' }}>HR. Bukhari & Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Setiap kebaikan adalah sedekah. <strong>Senyum</strong> kepada saudaramu adalah sedekah."
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '4px' }}>HR. Tirmidzi</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Sedekah itu <strong>memadamkan murka Rabb</strong> dan menolak kematian yang buruk."
                    </p>
                </div>

                <div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '4px' }}>QS. Al-Baqarah 2:261</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir benih yang menumbuhkan <strong>700 butir</strong>."
                    </p>
                </div>
            </div>

            {/* Progress Bulanan */}
            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={16} />
                        Target Bulan Ini
                    </span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>
                        {formatCurrency(thisMonthTotal)} / {formatCurrency(targetBulanan)}
                    </span>
                </div>
                <div className="spiritual-progress" style={{ height: '16px', marginBottom: '12px' }}>
                    <div
                        className="spiritual-progress-bar"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #10b981, #34d399)'
                        }}
                    />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{progress.toFixed(0)}% tercapai</span>
                    <span>Sisa: {formatCurrency(Math.max(0, targetBulanan - thisMonthTotal))}</span>
                </div>
                {progress >= 100 && (
                    <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#22c55e'
                    }}>
                        🎉 Alhamdulillah! Target bulan ini tercapai!
                    </div>
                )}
            </div>

            {/* Set Target */}
            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '12px' }}>🎯 Atur Target Bulanan</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[50000, 100000, 200000, 500000, 1000000].map(t => (
                        <button
                            key={t}
                            onClick={() => setTargetBulanan(t)}
                            className={`spiritual-btn ${targetBulanan === t ? 'spiritual-btn-primary' : 'spiritual-btn-secondary'}`}
                            style={{ flex: 1, minWidth: '80px', fontSize: '0.75rem' }}
                        >
                            {t >= 1000000 ? `${t / 1000000}jt` : `${t / 1000}rb`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Sedekah Button */}
            <button
                onClick={() => setShowForm(true)}
                className="spiritual-btn spiritual-btn-success"
                style={{ width: '100%', marginBottom: '16px' }}
            >
                <Plus size={18} />
                Catat Sedekah
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
                        <h3 style={{ marginBottom: '20px' }}>Catat Sedekah</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="spiritual-form-group">
                                <label className="spiritual-label">Jumlah (Rp)</label>
                                <input
                                    type="number"
                                    className="spiritual-input"
                                    placeholder="Contoh: 10000"
                                    value={formData.jumlah}
                                    onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
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
                                    {KATEGORI_SEDEKAH.map(k => (
                                        <option key={k.id} value={k.id}>{k.icon} {k.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="spiritual-form-group">
                                <label className="spiritual-label">Catatan (opsional)</label>
                                <input
                                    type="text"
                                    className="spiritual-input"
                                    placeholder="Contoh: Untuk masjid"
                                    value={formData.catatan}
                                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
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
                                <button type="submit" className="spiritual-btn spiritual-btn-success" style={{ flex: 1 }}>
                                    <Check size={18} />
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Recent Log */}
            {sedekahLog.length > 0 && (
                <div className="spiritual-card">
                    <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={16} />
                        Riwayat Sedekah
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {sedekahLog.slice().reverse().slice(0, 10).map(log => {
                            const kategori = KATEGORI_SEDEKAH.find(k => k.id === log.kategori);
                            return (
                                <div key={log.id} className="spiritual-check-item completed">
                                    <span style={{ fontSize: '1.25rem' }}>{kategori?.icon || '💰'}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600' }}>{formatCurrency(log.jumlah)}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>
                                            {kategori?.label} • {new Date(log.tanggal).toLocaleDateString('id-ID')}
                                            {log.catatan && ` • ${log.catatan}`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
