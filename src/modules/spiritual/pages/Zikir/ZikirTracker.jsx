import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Check, RotateCcw } from 'lucide-react';

export default function ZikirTracker() {
    const [activeTab, setActiveTab] = useState('harian');
    const [zikirCounts, setZikirCounts] = useState({});

    const zikirList = {
        harian: [
            { id: 1, nama: 'Istighfar', latin: 'Astaghfirullahal adzim', target: 100 },
            { id: 2, nama: 'Tasbih', latin: 'Subhanallah', target: 33 },
            { id: 3, nama: 'Tahmid', latin: 'Alhamdulillah', target: 33 },
            { id: 4, nama: 'Takbir', latin: 'Allahu Akbar', target: 33 },
            { id: 5, nama: 'Tahlil', latin: 'La ilaha illallah', target: 100 },
            { id: 6, nama: 'Shalawat', latin: 'Allahumma shalli ala Muhammad', target: 100 },
            { id: 7, nama: 'Hauqalah', latin: 'La haula wa la quwwata illa billah', target: 10 },
        ],
        pagi: [
            { id: 8, nama: 'Ayat Kursi', latin: 'Allahu la ilaha illa huwal hayyul qayyum...', target: 1 },
            { id: 9, nama: 'Al-Ikhlas', latin: 'Qul huwallahu ahad...', target: 3 },
            { id: 10, nama: 'Al-Falaq', latin: 'Qul a\'udzu birabbil falaq...', target: 3 },
            { id: 11, nama: 'An-Nas', latin: 'Qul a\'udzu birabbin nas...', target: 3 },
            { id: 12, nama: 'Sayyidul Istighfar', latin: 'Allahumma anta rabbi la ilaha illa anta...', target: 1 },
        ],
        petang: [
            { id: 13, nama: 'Ayat Kursi', latin: 'Allahu la ilaha illa huwal hayyul qayyum...', target: 1 },
            { id: 14, nama: 'Al-Ikhlas', latin: 'Qul huwallahu ahad...', target: 3 },
            { id: 15, nama: 'Al-Falaq', latin: 'Qul a\'udzu birabbil falaq...', target: 3 },
            { id: 16, nama: 'An-Nas', latin: 'Qul a\'udzu birabbin nas...', target: 3 },
        ],
    };

    const incrementCount = (id, target) => {
        setZikirCounts(prev => ({
            ...prev,
            [id]: Math.min((prev[id] || 0) + 1, target)
        }));
    };

    const resetCount = (id) => {
        setZikirCounts(prev => ({
            ...prev,
            [id]: 0
        }));
    };

    const getCount = (id) => zikirCounts[id] || 0;

    const getTotalProgress = () => {
        const currentList = zikirList[activeTab];
        const totalTarget = currentList.reduce((sum, z) => sum + z.target, 0);
        const currentTotal = currentList.reduce((sum, z) => sum + getCount(z.id), 0);
        return Math.round((currentTotal / totalTarget) * 100);
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali ke Dashboard
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                <div>
                    <h1>
                        <Moon size={28} />
                        Zikir Pagi Petang
                    </h1>
                    <p className="subtitle">Al-Ma'tsurat & Wirid Harian</p>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.875rem'
                }}>
                    {getTotalProgress()}% Selesai
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button
                    onClick={() => setActiveTab('harian')}
                    className={`spiritual-btn ${activeTab === 'harian' ? 'spiritual-btn-primary' : 'spiritual-btn-secondary'}`}
                    style={{ flex: 1 }}
                >
                    📿 Harian
                </button>
                <button
                    onClick={() => setActiveTab('pagi')}
                    className={`spiritual-btn ${activeTab === 'pagi' ? 'spiritual-btn-primary' : 'spiritual-btn-secondary'}`}
                    style={{ flex: 1 }}
                >
                    <Sun size={16} /> Pagi
                </button>
                <button
                    onClick={() => setActiveTab('petang')}
                    className={`spiritual-btn ${activeTab === 'petang' ? 'spiritual-btn-primary' : 'spiritual-btn-secondary'}`}
                    style={{ flex: 1 }}
                >
                    <Moon size={16} /> Petang
                </button>
            </div>

            {/* Progress */}
            <div className="spiritual-progress" style={{ marginBottom: '24px', height: '12px' }}>
                <div
                    className="spiritual-progress-bar"
                    style={{ width: `${getTotalProgress()}%` }}
                />
            </div>

            {/* Zikir List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {zikirList[activeTab].map(zikir => {
                    const count = getCount(zikir.id);
                    const isComplete = count >= zikir.target;
                    const progress = (count / zikir.target) * 100;

                    return (
                        <div
                            key={zikir.id}
                            className="spiritual-card"
                            style={{
                                border: isComplete ? '2px solid #22c55e' : '1px solid var(--spiritual-border)',
                                cursor: 'pointer'
                            }}
                            onClick={() => !isComplete && incrementCount(zikir.id, zikir.target)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '4px'
                                    }}>
                                        {isComplete && (
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: '#22c55e',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Check size={14} />
                                            </div>
                                        )}
                                        <h4 style={{ textDecoration: isComplete ? 'line-through' : 'none' }}>
                                            {zikir.nama}
                                        </h4>
                                    </div>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--spiritual-text-muted)',
                                        fontStyle: 'italic'
                                    }}>
                                        {zikir.latin}
                                    </p>

                                    {/* Progress bar */}
                                    <div style={{
                                        height: '4px',
                                        background: 'var(--spiritual-border)',
                                        borderRadius: '2px',
                                        marginTop: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${progress}%`,
                                            background: isComplete ? '#22c55e' : 'var(--spiritual-primary)',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    marginLeft: '16px'
                                }}>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: isComplete ? '#22c55e' : 'var(--spiritual-primary-light)'
                                    }}>
                                        {count}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                        / {zikir.target}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            resetCount(zikir.id);
                                        }}
                                        style={{
                                            marginTop: '4px',
                                            padding: '4px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--spiritual-text-muted)'
                                        }}
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dalil */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'var(--spiritual-card)',
                borderRadius: '12px',
                fontSize: '0.875rem'
            }}>
                <strong>Keutamaan Istighfar:</strong>
                <p style={{ marginTop: '8px', color: 'var(--spiritual-text-muted)', fontStyle: 'italic' }}>
                    "Barangsiapa memperbanyak istighfar, niscaya Allah akan memberikan jalan keluar bagi setiap kesedihannya, kelapangan untuk setiap kesempitannya, dan rezeki dari arah yang tidak disangka-sangka." (HR. Abu Dawud)
                </p>
            </div>
        </div>
    );
}
