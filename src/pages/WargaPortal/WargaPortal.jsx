import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Home,
    Wifi,
    CreditCard,
    Heart,
    Search,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    AlertCircle,
    User
} from 'lucide-react';
import { supabase } from '../../modules/angsuran/lib/supabase';
import './WargaPortal.css';

export default function WargaPortal() {
    const [blokInput, setBlokInput] = useState('');
    const [wargaData, setWargaData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    // Service data states
    const [angsuranData, setAngsuranData] = useState(null);
    const [internetData, setInternetData] = useState(null);
    const [mushollaData, setMushollaData] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!blokInput.trim()) return;

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            // Lookup warga by blok
            const { data: warga, error: wargaError } = await supabase
                .from('warga_users')
                .select('*')
                .eq('blok', blokInput.toUpperCase().trim())
                .eq('is_active', true)
                .maybeSingle();

            if (wargaError || !warga) {
                setError('Blok tidak ditemukan. Pastikan nomor blok benar.');
                setWargaData(null);
                return;
            }

            setWargaData(warga);

            // Fetch service data based on access rights
            if (warga.can_view_angsuran) {
                await fetchAngsuranData(warga.blok);
            }
            if (warga.can_view_internet) {
                await fetchInternetData(warga.blok);
            }
            if (warga.can_view_musholla) {
                await fetchMushollaData(warga.blok);
            }

        } catch {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAngsuranData = async (blok) => {
        try {
            const { data, error } = await supabase
                .from('warga')
                .select('*, pembayaran(*)')
                .eq('blok', blok)
                .maybeSingle();

            if (!error && data) {
                const totalBayar = data.pembayaran?.reduce((sum, p) => sum + (p.jumlah || 0), 0) || 0;
                const sisaHutang = (data.harga_rumah || 0) - (data.dp || 0) - totalBayar;
                setAngsuranData({
                    ...data,
                    totalBayar,
                    sisaHutang,
                    progress: Math.min(100, (totalBayar / ((data.harga_rumah || 1) - (data.dp || 0))) * 100)
                });
            }
        } catch {
            // Angsuran data not available for this blok
        }
    };

    const fetchInternetData = async (blok) => {
        try {
            const { data, error } = await supabase
                .from('internet_warga')
                .select('*, internet_pembayaran(*)')
                .eq('blok', blok)
                .maybeSingle();

            if (!error && data) {
                const currentMonth = new Date().toISOString().slice(0, 7);
                const paid = data.internet_pembayaran?.some(p =>
                    p.bulan?.startsWith(currentMonth) && p.status === 'lunas'
                );
                setInternetData({
                    ...data,
                    isPaidThisMonth: paid,
                    lastPayment: data.internet_pembayaran?.[0]
                });
            }
        } catch {
            // Internet data not available for this blok
        }
    };

    const fetchMushollaData = async (blok) => {
        try {
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .ilike('donor_name', `%${blok}%`)
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error) {
                const totalDonasi = data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
                setMushollaData({
                    donations: data || [],
                    totalDonasi
                });
            }
        } catch {
            // Musholla data not available for this blok
        }
    };

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const resetSearch = () => {
        setBlokInput('');
        setWargaData(null);
        setSearched(false);
        setError('');
        setAngsuranData(null);
        setInternetData(null);
        setMushollaData(null);
    };

    return (
        <div className="warga-portal">
            {/* Header */}
            <header className="warga-header">
                <Link to="/" className="back-btn">
                    <ArrowLeft size={18} />
                    <span>Portal</span>
                </Link>
                <div className="header-title">
                    <h1>Cek Status Layanan</h1>
                    <p>Masukkan nomor blok untuk melihat status Anda</p>
                </div>
            </header>

            {/* Search Form */}
            {!wargaData && (
                <div className="search-container">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-icon-wrapper">
                            <Home size={32} />
                        </div>
                        <h2>Masukkan Nomor Blok</h2>
                        <p>Contoh: A1, B10, C5</p>

                        <div className="search-input-group">
                            <input
                                type="text"
                                value={blokInput}
                                onChange={(e) => setBlokInput(e.target.value.toUpperCase())}
                                placeholder="Nomor Blok"
                                className="search-input"
                                maxLength={10}
                                autoFocus
                            />
                            <button type="submit" className="search-btn" disabled={loading}>
                                {loading ? (
                                    <div className="spinner" />
                                ) : (
                                    <>
                                        <Search size={18} />
                                        Cari
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* Dashboard */}
            {wargaData && (
                <div className="warga-dashboard">
                    {/* User Info Card */}
                    <div className="user-card">
                        <div className="user-avatar">
                            <User size={32} />
                        </div>
                        <div className="user-info">
                            <h2>{wargaData.nama}</h2>
                            <span className="user-blok">Blok {wargaData.blok}</span>
                        </div>
                        <button onClick={resetSearch} className="change-btn">
                            Ganti Blok
                        </button>
                    </div>

                    {/* Service Cards */}
                    <div className="services-grid">
                        {/* Angsuran Card */}
                        {wargaData.can_view_angsuran && (
                            <div className="service-card angsuran">
                                <div className="service-header">
                                    <div className="service-icon emerald">
                                        <CreditCard size={24} />
                                    </div>
                                    <h3>Status Angsuran</h3>
                                </div>

                                {angsuranData ? (
                                    <div className="service-content">
                                        <div className="progress-section">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${angsuranData.progress}%` }}
                                                />
                                            </div>
                                            <span className="progress-text">
                                                {angsuranData.progress.toFixed(1)}% Lunas
                                            </span>
                                        </div>
                                        <div className="stats-row">
                                            <div className="stat">
                                                <span className="stat-label">Sudah Dibayar</span>
                                                <span className="stat-value success">
                                                    {formatRupiah(angsuranData.totalBayar)}
                                                </span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Sisa Hutang</span>
                                                <span className="stat-value danger">
                                                    {formatRupiah(angsuranData.sisaHutang)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-data">
                                        <Clock size={20} />
                                        <span>Data tidak tersedia</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Internet Card */}
                        {wargaData.can_view_internet && (
                            <div className="service-card internet">
                                <div className="service-header">
                                    <div className="service-icon blue">
                                        <Wifi size={24} />
                                    </div>
                                    <h3>Status Internet</h3>
                                </div>

                                {internetData ? (
                                    <div className="service-content">
                                        <div className={`status-badge ${internetData.isPaidThisMonth ? 'success' : 'warning'}`}>
                                            {internetData.isPaidThisMonth ? (
                                                <>
                                                    <CheckCircle size={18} />
                                                    <span>Lunas Bulan Ini</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={18} />
                                                    <span>Belum Bayar</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="stats-row">
                                            <div className="stat">
                                                <span className="stat-label">Paket</span>
                                                <span className="stat-value">
                                                    {internetData.paket || 'Standard'}
                                                </span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-label">Iuran/Bulan</span>
                                                <span className="stat-value">
                                                    {formatRupiah(internetData.iuran || 50000)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-data">
                                        <Clock size={20} />
                                        <span>Belum terdaftar Internet</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Musholla Card */}
                        {wargaData.can_view_musholla && (
                            <div className="service-card musholla">
                                <div className="service-header">
                                    <div className="service-icon purple">
                                        <Heart size={24} />
                                    </div>
                                    <h3>Donasi Musholla</h3>
                                </div>

                                {mushollaData ? (
                                    <div className="service-content">
                                        <div className="total-donation">
                                            <TrendingUp size={18} />
                                            <span>Total Donasi Anda</span>
                                            <strong>{formatRupiah(mushollaData.totalDonasi)}</strong>
                                        </div>
                                        {mushollaData.donations.length > 0 && (
                                            <div className="recent-list">
                                                <span className="list-title">Riwayat Terakhir:</span>
                                                {mushollaData.donations.slice(0, 3).map((d, i) => (
                                                    <div key={i} className="list-item">
                                                        <span>{new Date(d.created_at).toLocaleDateString('id-ID')}</span>
                                                        <span>{formatRupiah(d.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="no-data">
                                        <Heart size={20} />
                                        <span>Belum ada riwayat donasi</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* No Access Message */}
                    {!wargaData.can_view_angsuran && !wargaData.can_view_internet && !wargaData.can_view_musholla && (
                        <div className="no-access-message">
                            <AlertCircle size={24} />
                            <p>Akses layanan Anda belum diaktifkan. Hubungi admin.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
