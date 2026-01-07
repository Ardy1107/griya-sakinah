import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUnitById, getPaymentsByUnit } from '../../utils/database';
import { generateWhatsAppLink, getPaymentConfirmationMessage } from '../../utils/pdfGenerator';
import {
    ArrowLeft,
    User,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    CheckCircle,
    Clock,
    ExternalLink,
    MessageCircle,
    TrendingUp
} from 'lucide-react';
import './UnitDetail.css';
import './UnitDetail_extras.css';

const UnitDetail = () => {
    const { unitId } = useParams();
    const navigate = useNavigate();
    const [unit, setUnit] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (unitId) {
                try {
                    const unitData = await getUnitById(unitId);
                    const paymentData = await getPaymentsByUnit(unitId);

                    setUnit(unitData);
                    setPayments(paymentData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
                } catch (err) {
                    console.error('Error loading unit data:', err);
                }
                setLoading(false);
            }
        };
        loadData();
    }, [unitId]);

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Calculate stats
    const getPokokPayments = () => payments.filter(p => p.category === 'pokok');
    const getTambahanPayments = () => payments.filter(p => p.category === 'tambahan');
    const getTotalPaid = () => payments.reduce((sum, p) => sum + p.amount, 0);

    const handleWhatsApp = () => {
        if (unit) {
            const message = `Assalamualaikum Bapak/Ibu ${unit.residentName} (Blok ${unit.blockNumber}),\n\nIni adalah pesan dari Admin Griya Sakinah.`;
            const link = generateWhatsAppLink(unit.phone, message);
            window.open(link, '_blank');
        }
    };

    if (loading) {
        return <div className="loading">Memuat...</div>;
    }

    if (!unit) {
        return (
            <div className="unit-detail">
                <div className="not-found">
                    <h2>Unit tidak ditemukan</h2>
                    <button onClick={() => navigate('/angsuran/units')} className="secondary-button">
                        <ArrowLeft size={18} />
                        Kembali ke Data Unit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="unit-detail">
            <div className="page-header">
                <button onClick={() => navigate('/angsuran/units')} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1>Detail Unit {unit.blockNumber}</h1>
                    <p>Informasi lengkap penghuni dan riwayat pembayaran</p>
                </div>
            </div>

            {/* Unit Info Card */}
            <div className="info-grid">
                <div className="info-card primary">
                    <div className="info-icon">
                        <User size={24} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">Nama Penghuni</span>
                        <span className="info-value">{unit.residentName}</span>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon blue">
                        <MapPin size={24} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">Blok</span>
                        <span className="info-value">{unit.blockNumber}</span>
                    </div>
                </div>

                <div className="info-card">
                    <div className="info-icon purple">
                        <Phone size={24} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">No. HP</span>
                        <span className="info-value">{unit.phone}</span>
                    </div>
                    <button className="wa-button" onClick={handleWhatsApp}>
                        <MessageCircle size={16} />
                    </button>
                </div>

                <div className="info-card">
                    <div className="info-icon yellow">
                        <Calendar size={24} />
                    </div>
                    <div className="info-content">
                        <span className="info-label">Jatuh Tempo</span>
                        <span className="info-value">Tanggal {unit.dueDay}</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card green">
                    <TrendingUp size={24} />
                    <div>
                        <span className="stat-value">{formatRupiah(getTotalPaid())}</span>
                        <span className="stat-label">Total Dibayar</span>
                    </div>
                </div>

                <div className="stat-card blue">
                    <CreditCard size={24} />
                    <div>
                        <span className="stat-value">{getPokokPayments().length}</span>
                        <span className="stat-label">Angsuran Pokok</span>
                    </div>
                </div>

                {unit.hasAddon && (
                    <div className="stat-card purple">
                        <CreditCard size={24} />
                        <div>
                            <span className="stat-value">{getTambahanPayments().length}</span>
                            <span className="stat-label">Angsuran Tambahan</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Bar for Pokok */}
            <div className="progress-section">
                <h3>Progress Angsuran Pokok</h3>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min((getPokokPayments().length / 120) * 100, 100)}%` }}
                    ></div>
                </div>
                <div className="progress-info">
                    <span>{getPokokPayments().length} dari 120 angsuran</span>
                    <span>{((getPokokPayments().length / 120) * 100).toFixed(1)}%</span>
                </div>
            </div>

            {/* Payment History */}
            <div className="history-section">
                <h3>
                    <Clock size={20} />
                    Riwayat Pembayaran
                </h3>

                {payments.length === 0 ? (
                    <div className="empty-state">
                        <CreditCard size={48} />
                        <p>Belum ada riwayat pembayaran</p>
                    </div>
                ) : (
                    <div className="payment-timeline">
                        {payments.map((payment, index) => (
                            <div key={payment.id} className="timeline-item">
                                <div className="timeline-dot">
                                    <CheckCircle size={16} />
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className={`category-badge ${payment.category}`}>
                                            {payment.category === 'pokok' ? 'Pokok' : 'Tambahan'}
                                        </span>
                                        <span className="installment">#{payment.installmentNo}</span>
                                        {payment.paymentMonthDisplay && (
                                            <span className="period">{payment.paymentMonthDisplay}</span>
                                        )}
                                    </div>
                                    <div className="timeline-amount">{formatRupiah(payment.amount)}</div>
                                    <div className="timeline-date">{formatDate(payment.createdAt)}</div>
                                    {payment.evidenceLink && (
                                        <div className="evidence-wrapper">
                                            <a
                                                href={payment.evidenceLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="evidence-thumb-link"
                                            >
                                                <img
                                                    src={payment.evidenceLink}
                                                    alt="Bukti"
                                                    className="evidence-thumb"
                                                    onError={(e) => {
                                                        e.target.parentElement.style.display = 'none';
                                                    }}
                                                />
                                            </a>
                                            <a
                                                href={payment.evidenceLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="evidence-link"
                                            >
                                                <ExternalLink size={12} />
                                                Lihat Bukti
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnitDetail;
