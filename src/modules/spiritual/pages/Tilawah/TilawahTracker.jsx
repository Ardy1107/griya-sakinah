import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bookmark, Check, ChevronRight, ChevronLeft } from 'lucide-react';

export default function TilawahTracker() {
    const [currentJuz, setCurrentJuz] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [todayPages, setTodayPages] = useState(0);
    const [targetDaily, setTargetDaily] = useState(4); // default 4 halaman/hari = khatam 5 bulan
    const [bookmarks, setBookmarks] = useState([]);
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);

    const totalPages = 604; // Total halaman mushaf standar
    const pagesPerJuz = Math.ceil(totalPages / 30);
    const progress = ((currentPage / totalPages) * 100).toFixed(1);
    const daysToKhatam = Math.ceil((totalPages - currentPage) / targetDaily);

    const handleAddPages = (pages) => {
        const newPage = Math.min(currentPage + pages, totalPages);
        setCurrentPage(newPage);
        setCurrentJuz(Math.ceil(newPage / pagesPerJuz));
        setTodayPages(todayPages + pages);
    };

    const addBookmark = () => {
        const newBookmark = {
            id: Date.now(),
            juz: currentJuz,
            page: currentPage,
            tanggal: new Date().toLocaleDateString('id-ID'),
            catatan: ''
        };
        setBookmarks([newBookmark, ...bookmarks.slice(0, 4)]);
        setShowBookmarkModal(false);
    };

    const goToBookmark = (bookmark) => {
        setCurrentJuz(bookmark.juz);
        setCurrentPage(bookmark.page);
    };

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}>
                <div>
                    <h1>
                        <BookOpen size={28} />
                        Tilawah Al-Quran
                    </h1>
                    <p className="subtitle">Target Khatam 30 Juz</p>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.875rem'
                }}>
                    Juz {currentJuz}/30
                </div>
            </div>

            {/* Hadis-Hadis Tentang Al-Quran */}
            <div style={{
                background: 'rgba(14, 165, 233, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(14, 165, 233, 0.3)'
            }}>
                <h4 style={{ marginBottom: '16px', color: '#38bdf8' }}>📖 Keutamaan Membaca Al-Quran</h4>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '4px' }}>HR. Bukhari</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Sebaik-baik kalian adalah yang <strong>mempelajari Al-Quran</strong> dan mengajarkannya."
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '4px' }}>HR. Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Bacalah Al-Quran, karena ia akan datang pada hari kiamat sebagai <strong>pemberi syafaat</strong> bagi pembacanya."
                    </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '4px' }}>HR. Tirmidzi</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Barangsiapa membaca <strong>satu huruf</strong> dari Al-Quran, maka baginya satu kebaikan yang dilipat gandakan menjadi <strong>sepuluh kebaikan</strong>."
                    </p>
                </div>

                <div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '4px' }}>HR. Bukhari & Muslim</div>
                    <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                        "Orang yang mahir Al-Quran bersama para malaikat yang mulia. Orang yang terbata-bata membacanya mendapat <strong>dua pahala</strong>."
                    </p>
                </div>
            </div>

            {/* Progress Visual */}
            <div className="spiritual-card" style={{ marginBottom: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: '#0ea5e9' }}>
                    {progress}%
                </div>
                <div style={{ color: 'var(--spiritual-text-muted)', marginBottom: '16px' }}>
                    Halaman {currentPage} dari {totalPages}
                </div>
                <div className="spiritual-progress" style={{ height: '16px', marginBottom: '16px' }}>
                    <div
                        className="spiritual-progress-bar"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem' }}>
                    <div>
                        <div style={{ fontWeight: '600', color: '#0ea5e9' }}>{todayPages}</div>
                        <div style={{ color: 'var(--spiritual-text-muted)' }}>Hari ini</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', color: '#22c55e' }}>{targetDaily}</div>
                        <div style={{ color: 'var(--spiritual-text-muted)' }}>Target/hari</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: '600', color: '#a855f7' }}>{daysToKhatam}</div>
                        <div style={{ color: 'var(--spiritual-text-muted)' }}>Hari lagi</div>
                    </div>
                </div>
            </div>

            {/* Current Position */}
            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '16px' }}>📖 Posisi Saat Ini</h4>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>Juz</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={() => setCurrentJuz(Math.max(1, currentJuz - 1))}
                                className="spiritual-btn spiritual-btn-secondary"
                                style={{ padding: '8px' }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={currentJuz}
                                onChange={(e) => {
                                    const val = Math.min(30, Math.max(1, parseInt(e.target.value) || 1));
                                    setCurrentJuz(val);
                                    setCurrentPage((val - 1) * pagesPerJuz + 1);
                                }}
                                className="spiritual-input"
                                style={{ textAlign: 'center', width: '60px' }}
                            />
                            <button
                                onClick={() => setCurrentJuz(Math.min(30, currentJuz + 1))}
                                className="spiritual-btn spiritual-btn-secondary"
                                style={{ padding: '8px' }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>Halaman</label>
                        <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={currentPage}
                            onChange={(e) => {
                                const val = Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1));
                                setCurrentPage(val);
                                setCurrentJuz(Math.ceil(val / pagesPerJuz));
                            }}
                            className="spiritual-input"
                            style={{ textAlign: 'center' }}
                        />
                    </div>
                </div>
                <button
                    onClick={() => setShowBookmarkModal(true)}
                    className="spiritual-btn spiritual-btn-secondary"
                    style={{ width: '100%' }}
                >
                    <Bookmark size={16} />
                    Simpan Bookmark
                </button>
            </div>

            {/* Quick Add */}
            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '16px' }}>➕ Tambah Bacaan Hari Ini</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[1, 2, 4, 5].map(pages => (
                        <button
                            key={pages}
                            onClick={() => handleAddPages(pages)}
                            className="spiritual-btn spiritual-btn-success"
                            style={{ padding: '12px 8px' }}
                        >
                            +{pages} hal
                        </button>
                    ))}
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--spiritual-text-muted)', textAlign: 'center' }}>
                    💡 Baca {targetDaily} halaman/hari = khatam {Math.ceil(totalPages / targetDaily / 30)} bulan
                </div>
            </div>

            {/* Set Target */}
            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '12px' }}>🎯 Target Harian</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[2, 4, 5, 10, 20].map(t => (
                        <button
                            key={t}
                            onClick={() => setTargetDaily(t)}
                            className={`spiritual-btn ${targetDaily === t ? 'spiritual-btn-primary' : 'spiritual-btn-secondary'}`}
                            style={{ flex: 1, minWidth: '60px' }}
                        >
                            {t} hal
                        </button>
                    ))}
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--spiritual-text-muted)' }}>
                    {targetDaily === 2 && "Khatam dalam ~10 bulan"}
                    {targetDaily === 4 && "Khatam dalam ~5 bulan"}
                    {targetDaily === 5 && "Khatam dalam ~4 bulan"}
                    {targetDaily === 10 && "Khatam dalam ~2 bulan"}
                    {targetDaily === 20 && "Khatam dalam ~1 bulan"}
                </div>
            </div>

            {/* Bookmarks */}
            {bookmarks.length > 0 && (
                <div className="spiritual-card">
                    <h4 style={{ marginBottom: '16px' }}>📑 Bookmark Terakhir</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {bookmarks.map(b => (
                            <div
                                key={b.id}
                                onClick={() => goToBookmark(b)}
                                className="spiritual-check-item"
                                style={{ cursor: 'pointer' }}
                            >
                                <Bookmark size={16} style={{ color: '#0ea5e9' }} />
                                <div style={{ flex: 1 }}>
                                    <div>Juz {b.juz} - Halaman {b.page}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>{b.tanggal}</div>
                                </div>
                                <ChevronRight size={16} style={{ color: 'var(--spiritual-text-muted)' }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bookmark Modal */}
            {showBookmarkModal && (
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
                    <div className="spiritual-card" style={{ width: '100%', maxWidth: '320px', textAlign: 'center' }}>
                        <Bookmark size={48} style={{ color: '#0ea5e9', marginBottom: '16px' }} />
                        <h3 style={{ marginBottom: '8px' }}>Simpan Bookmark?</h3>
                        <p style={{ color: 'var(--spiritual-text-muted)', marginBottom: '20px' }}>
                            Juz {currentJuz} - Halaman {currentPage}
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setShowBookmarkModal(false)}
                                className="spiritual-btn spiritual-btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={addBookmark}
                                className="spiritual-btn spiritual-btn-primary"
                                style={{ flex: 1 }}
                            >
                                <Check size={16} />
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
