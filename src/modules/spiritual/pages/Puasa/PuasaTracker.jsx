import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Check, Calendar, Flame } from 'lucide-react';

const JENIS_PUASA = [
    { id: 'senin', nama: 'Senin', hari: 1, keutamaan: 'Amalan diangkat ke Allah' },
    { id: 'kamis', nama: 'Kamis', hari: 4, keutamaan: 'Amalan diangkat ke Allah' },
    { id: 'ayyamul_bidh_13', nama: 'Ayyamul Bidh (13)', tanggal: 13, keutamaan: 'Seperti puasa setahun' },
    { id: 'ayyamul_bidh_14', nama: 'Ayyamul Bidh (14)', tanggal: 14, keutamaan: 'Seperti puasa setahun' },
    { id: 'ayyamul_bidh_15', nama: 'Ayyamul Bidh (15)', tanggal: 15, keutamaan: 'Seperti puasa setahun' },
    { id: 'arafah', nama: 'Arafah (9 Dzulhijjah)', special: true, keutamaan: 'Menghapus dosa 2 tahun' },
    { id: 'asyura', nama: 'Asyura (10 Muharram)', special: true, keutamaan: 'Menghapus dosa 1 tahun' },
];

export default function PuasaTracker() {
    const [puasaLog, setPuasaLog] = useState([]);
    const [showLog, setShowLog] = useState(false);
    const [selectedType, setSelectedType] = useState('senin');

    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dayOfWeek];
    const isSenin = dayOfWeek === 1;
    const isKamis = dayOfWeek === 4;

    const thisMonthCount = puasaLog.filter(p => {
        const date = new Date(p.tanggal);
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }).length;

    const totalPuasa = puasaLog.length;

    const handlePuasaToday = () => {
        const todayStr = today.toISOString().split('T')[0];
        const existing = puasaLog.find(p => p.tanggal === todayStr);
        if (!existing) {
            setPuasaLog([...puasaLog, {
                id: Date.now(),
                tanggal: todayStr,
                jenis: selectedType,
                hari: dayName
            }]);
        }
    };

    const isTodayLogged = puasaLog.some(p => p.tanggal === today.toISOString().split('T')[0]);

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <div>
                    <h1>
                        <Moon size={28} />
                        Puasa Sunnah
                    </h1>
                    <p className="subtitle">Senin-Kamis, Ayyamul Bidh</p>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Flame size={16} />
                    {totalPuasa} hari
                </div>
            </div>

            {/* Hadis-Hadis Tentang Puasa */}
            <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
                <h4 style={{ marginBottom: '16px', color: '#fbbf24' }}>📖 Keutamaan Puasa Sunnah</h4>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginBottom: '4px' }}>HR. Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Puasa Senin dan Kamis, karena pada hari itu <strong>amalan diangkat</strong> kepada Allah."
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginBottom: '4px' }}>HR. Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Puasa 3 hari setiap bulan (Ayyamul Bidh) sama seperti <strong>puasa setahun penuh</strong>."
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginBottom: '4px' }}>HR. Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Puasa Arafah menghapus dosa <strong>dua tahun</strong>: tahun lalu dan tahun yang akan datang."
                    </p>
                </div>

                <div>
                    <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginBottom: '4px' }}>HR. Bukhari & Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Setiap amalan anak Adam dilipat gandakan 10-700x, kecuali puasa. <strong>Puasa untuk-Ku</strong>, dan Aku yang akan membalasnya."
                    </p>
                </div>
            </div>

            {/* Today Status */}
            <div className="spiritual-card" style={{ marginBottom: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)', marginBottom: '8px' }}>
                    Hari ini: <strong>{dayName}</strong>
                </div>

                {(isSenin || isKamis) && !isTodayLogged && (
                    <div style={{
                        padding: '12px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        color: '#22c55e'
                    }}>
                        ✨ Hari ini adalah hari sunnah untuk berpuasa!
                    </div>
                )}

                {isTodayLogged ? (
                    <div style={{
                        padding: '20px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '12px'
                    }}>
                        <Check size={48} style={{ color: '#22c55e', marginBottom: '8px' }} />
                        <div style={{ fontWeight: '600', color: '#22c55e' }}>
                            Alhamdulillah, Anda puasa hari ini!
                        </div>
                    </div>
                ) : (
                    <>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="spiritual-select"
                            style={{ marginBottom: '16px' }}
                        >
                            {JENIS_PUASA.map(j => (
                                <option key={j.id} value={j.id}>{j.nama}</option>
                            ))}
                        </select>
                        <button
                            onClick={handlePuasaToday}
                            className="spiritual-btn spiritual-btn-success"
                            style={{ width: '100%' }}
                        >
                            <Moon size={18} />
                            Saya Puasa Hari Ini
                        </button>
                    </>
                )}
            </div>

            {/* Stats */}
            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                            {thisMonthCount}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>Bulan ini</div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--spiritual-border)', paddingLeft: '24px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>
                            {totalPuasa}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>Total</div>
                    </div>
                </div>
            </div>

            {/* Jenis Puasa */}
            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '16px' }}>📋 Jenis Puasa Sunnah</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {JENIS_PUASA.map(puasa => (
                        <div key={puasa.id} className="spiritual-check-item">
                            <Moon size={16} style={{ color: '#f59e0b' }} />
                            <div style={{ flex: 1 }}>
                                <div className="spiritual-check-text">{puasa.nama}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>
                                    {puasa.keutamaan}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Log Toggle */}
            {puasaLog.length > 0 && (
                <>
                    <button
                        onClick={() => setShowLog(!showLog)}
                        className="spiritual-btn spiritual-btn-secondary"
                        style={{ width: '100%', marginBottom: '16px' }}
                    >
                        <Calendar size={16} />
                        {showLog ? 'Sembunyikan' : 'Lihat'} Riwayat ({puasaLog.length})
                    </button>

                    {showLog && (
                        <div className="spiritual-card">
                            <h4 style={{ marginBottom: '16px' }}>📅 Riwayat Puasa</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {puasaLog.slice().reverse().map(log => (
                                    <div key={log.id} className="spiritual-check-item completed">
                                        <Check size={14} style={{ color: '#22c55e' }} />
                                        <div style={{ flex: 1 }}>
                                            <div>{log.hari}, {new Date(log.tanggal).toLocaleDateString('id-ID')}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>
                                                {JENIS_PUASA.find(j => j.id === log.jenis)?.nama || log.jenis}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
