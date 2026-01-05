/**
 * Warga Search - Premium iOS Centered Layout
 * Search by blok number, hidden admin access via long-press logo
 */
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, CreditCard, Calendar, CheckCircle2, AlertCircle, TrendingUp, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './WargaSearch.css';

// Format currency
const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num || 0);
};

// Format date
const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export default function WargaSearch() {
    const [blokInput, setBlokInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [unitData, setUnitData] = useState(null);
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const navigate = useNavigate();
    const longPressTimer = useRef(null);
    const [isSecretLoading, setIsSecretLoading] = useState(false);

    // Long press handler for hidden admin access - auto login as developer
    const handleLogoMouseDown = (e) => {
        e.preventDefault(); // Prevent any default behavior
        longPressTimer.current = setTimeout(() => {
            setIsSecretLoading(true);
            // Clear welcome shown flag so popup shows
            sessionStorage.removeItem('welcomeShownThisLogin');
            // Set developer session directly
            const deviSession = {
                id: 'dev-devi',
                username: 'devi',
                name: 'Devi Indah Suhartatik',
                role: 'developer',
                moduleAccess: ['angsuran']
            };
            sessionStorage.setItem('angsuran_user', JSON.stringify(deviSession));
            localStorage.setItem('angsuran_user', JSON.stringify(deviSession));
            // Use full page reload to ensure AuthContext reads the new session
            window.location.href = '/angsuran/admin/dashboard';
        }, 3000); // 3 seconds
    };

    const handleLogoMouseUp = (e) => {
        e.preventDefault();
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!blokInput.trim()) return;

        setLoading(true);
        setError('');
        setSearched(true);
        setUnitData(null);
        setPayments([]);

        try {
            // Check if Supabase is configured
            if (!supabase) {
                setError('Database belum dikonfigurasi. Hubungi admin.');
                setLoading(false);
                return;
            }

            const searchTerm = blokInput.trim().toUpperCase();

            const { data: unit, error: unitError } = await supabase
                .from('units')
                .select('*')
                .eq('block_number', searchTerm)
                .single();

            if (unitError) {
                console.error('Query error:', unitError);
                if (unitError.code === 'PGRST116') {
                    setError(`Blok "${searchTerm}" tidak ditemukan. Cek nomor blok Anda.`);
                } else {
                    setError('Data belum tersedia. Silakan hubungi admin.');
                }
                setLoading(false);
                return;
            }

            if (!unit) {
                setError(`Blok "${searchTerm}" tidak ditemukan`);
                setLoading(false);
                return;
            }

            setUnitData(unit);

            const { data: paymentData } = await supabase
                .from('payments')
                .select('*')
                .eq('unit_id', unit.id)
                .order('payment_date', { ascending: false })
                .limit(12);

            setPayments(paymentData || []);
        } catch (err) {
            console.error('Search error:', err);
            setError('Koneksi bermasalah. Coba lagi nanti.');
        }

        setLoading(false);
    };

    const clearSearch = () => {
        setBlokInput('');
        setUnitData(null);
        setPayments([]);
        setSearched(false);
        setError('');
    };

    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const monthsPaid = payments.length;

    return (
        <div className="warga-search-page">
            <div className="search-container">
                {/* Card - Like Login */}
                <div className="search-card-wrapper">
                    {/* Logo with hidden admin access */}
                    <div className="search-logo">
                        <div
                            className="logo-icon"
                            onMouseDown={handleLogoMouseDown}
                            onMouseUp={handleLogoMouseUp}
                            onMouseLeave={handleLogoMouseUp}
                            onTouchStart={handleLogoMouseDown}
                            onTouchEnd={handleLogoMouseUp}
                        >
                            <Home size={32} />
                        </div>
                        <h1>Angsuran Sakinah</h1>
                        <p>Cek status angsuran rumah Anda</p>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="form-group">
                            <label>Nomor Blok</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    value={blokInput}
                                    onChange={(e) => setBlokInput(e.target.value.toUpperCase())}
                                    placeholder="Contoh: A1, B5, B20"
                                    maxLength={5}
                                    autoFocus
                                />
                                {blokInput && (
                                    <button type="button" className="clear-btn" onClick={clearSearch}>
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading || !blokInput.trim()}>
                            {loading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    <Search size={18} />
                                    Cek Angsuran
                                </>
                            )}
                        </button>
                    </form>

                    {/* Error */}
                    {error && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {unitData && (
                    <div className="results-card">
                        {/* Unit Info */}
                        <div className="unit-header">
                            <div className="unit-blok">{unitData.block_number}</div>
                            <div className="unit-info">
                                <h3>{unitData.resident_name || 'Pemilik'}</h3>
                                <span className="status-badge active">Aktif</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="stats-row">
                            <div className="stat-item">
                                <TrendingUp size={16} />
                                <span className="stat-value">{monthsPaid}</span>
                                <span className="stat-label">Bulan Bayar</span>
                            </div>
                            <div className="stat-item">
                                <CreditCard size={16} />
                                <span className="stat-value">{formatRupiah(totalPaid)}</span>
                                <span className="stat-label">Total Bayar</span>
                            </div>
                        </div>

                        {/* Payments */}
                        {payments.length > 0 ? (
                            <div className="payments-list">
                                <h4>Riwayat Pembayaran</h4>
                                {payments.slice(0, 5).map((payment, index) => (
                                    <div key={payment.id || index} className="payment-item">
                                        <CheckCircle2 size={14} />
                                        <span className="payment-date">{formatDate(payment.payment_date)}</span>
                                        <span className="payment-amount">{formatRupiah(payment.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-payments">
                                <Calendar size={24} />
                                <p>Belum ada pembayaran</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="warga-footer">
                <a href="/" className="portal-return-btn">
                    ← Kembali ke Portal Griya Sakinah
                </a>
                <p style={{ marginTop: '16px' }}>© 2026 Portal Griya Sakinah</p>
            </footer>
        </div>
    );
}
