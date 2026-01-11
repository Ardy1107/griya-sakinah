import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Users, HandHeart, Gift } from 'lucide-react';

export default function KebaikanTracker() {
    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali ke Dashboard
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}>
                <div>
                    <h1>
                        <Heart size={28} />
                        Kebaikan Harian
                    </h1>
                    <p className="subtitle">Berbuat baik kepada sesama</p>
                </div>
            </div>

            {/* Hadis */}
            <div style={{
                background: 'rgba(20, 184, 166, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '0.875rem',
                border: '1px solid rgba(20, 184, 166, 0.3)'
            }}>
                <strong>HR. Bukhari & Muslim:</strong>
                <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
                    "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya."
                </p>
            </div>

            {/* Menu Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Link to="/spiritual/kebaikan/doa-diamdiam" className="spiritual-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="spiritual-card-header">
                        <div className="spiritual-card-icon" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="spiritual-card-title">Doa Diam-diam</div>
                            <div className="spiritual-card-subtitle">Doakan 11 orang/hari dengan sistem Ring</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                        HR. Muslim: "Malaikat mengaminkan doamu" ✨
                    </div>
                </Link>

                <Link to="/spiritual/kebaikan/acts" className="spiritual-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="spiritual-card-header">
                        <div className="spiritual-card-icon" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
                            <Gift size={24} />
                        </div>
                        <div>
                            <div className="spiritual-card-title">Kebaikan Harian</div>
                            <div className="spiritual-card-subtitle">Catat kebaikan ke keluarga, tetangga, orang asing</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                        HR. Muslim: "Setiap kebaikan adalah sedekah" 🤲
                    </div>
                </Link>

                <Link to="/spiritual/kebaikan/memaafkan" className="spiritual-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="spiritual-card-header">
                        <div className="spiritual-card-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                            <Heart size={24} />
                        </div>
                        <div>
                            <div className="spiritual-card-title">Memaafkan</div>
                            <div className="spiritual-card-subtitle">Bebaskan hati dari dendam dan sakit hati</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                        QS. An-Nur: "Apakah kamu tidak ingin diampuni Allah?" 💗
                    </div>
                </Link>
            </div>
        </div>
    );
}

