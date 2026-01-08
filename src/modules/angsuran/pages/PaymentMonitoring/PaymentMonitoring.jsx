import { useState, useEffect } from 'react';
import {
    getUnitsSync,
    getPaymentsSync
} from '../../utils/database';
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Image as ImageIcon
} from 'lucide-react';
import './PaymentMonitoring.css';

const PaymentMonitoring = () => {
    const [units, setUnits] = useState([]);
    const [payments, setPayments] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, lunas, belum

    // Modal State
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const unitsData = await getUnitsSync();
                const paymentsData = await getPaymentsSync();
                setUnits(Array.isArray(unitsData) ? unitsData : []);
                setPayments(Array.isArray(paymentsData) ? paymentsData : []);
            } catch (err) {
                console.error('Error loading monitoring data:', err);
                setUnits([]);
                setPayments([]);
            }
        };
        loadData();
    }, []);

    // Helper: Get payment for specific unit, month, year
    const getPaymentStatus = (unitId, monthIndex) => {
        // monthIndex 0-11
        return payments.find(p => {
            const date = new Date(p.createdAt); // Or use p.paymentMonthKey if available
            // Better to parse p.paymentMonthKey usually "MM-YYYY"
            // But let's check p.paymentMonthKey format from Payments.jsx
            // It seems p.paymentMonthKey is used there.
            // Let's assume database stores paymentMonthKey as "M-YYYY" (0-indexed month) or "MM-YYYY"

            // Re-reading Payments.jsx logic: 
            // paymentMonthKey: getMonthYearKey(formData.paymentMonth)
            // formatMonthYearKey: `${month}-${year}`

            if (p.unitId !== unitId) return false;
            if (!p.paymentMonthKey) return false;

            const [m, y] = p.paymentMonthKey.split('-');
            return parseInt(m) === monthIndex && parseInt(y) === selectedYear && p.category === 'pokok';
        });
    };

    const getThumbnailUrl = (url) => {
        try {
            const match = url.match(/\/d\/(.+?)\/view/);
            const id = match ? match[1] : null;
            return id ? `https://lh3.googleusercontent.com/d/${id}=s400` : null;
        } catch (e) { return null; }
    };

    const handleCellClick = (payment) => {
        if (payment) {
            setSelectedPayment(payment);
            setShowModal(true);
        }
    };

    const filteredUnits = units.filter(unit => {
        const matchesSearch = unit.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.blockNumber.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'all') return matchesSearch;

        // Complex filter logic could go here if needed
        return matchesSearch;
    });

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    return (
        <div className="monitoring-page">
            <div className="page-header">
                <div>
                    <h1>Monitoring Pembayaran</h1>
                    <p>Pantau status pembayaran angsuran per unit</p>
                </div>
                <div className="year-selector">
                    <button onClick={() => setSelectedYear(selectedYear - 1)}>
                        <ChevronLeft size={20} />
                    </button>
                    <span className="current-year">{selectedYear}</span>
                    <button onClick={() => setSelectedYear(selectedYear + 1)}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="monitoring-controls">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Cari Penghuni / Blok..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Add Legend */}
                <div className="status-legend">
                    <div className="legend-item">
                        <CheckCircle size={16} className="text-success" /> Lunas
                    </div>
                    {/* 
                    <div className="legend-item">
                        <XCircle size={16} className="text-danger" /> Belum
                    </div>
                */}
                </div>
            </div>

            <div className="monitoring-matrix-container">
                <table className="monitoring-table">
                    <thead>
                        <tr>
                            <th className="sticky-col">Unit Info</th>
                            {months.map(m => <th key={m}>{m}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUnits.length > 0 ? filteredUnits.map(unit => (
                            <tr key={unit.id}>
                                <td className="sticky-col unit-info-cell">
                                    <div className="unit-block">{unit.blockNumber}</div>
                                    <div className="unit-name">{unit.residentName}</div>
                                </td>
                                {months.map((_, index) => {
                                    const payment = getPaymentStatus(unit.id, index);
                                    return (
                                        <td key={index} className="status-cell" onClick={() => handleCellClick(payment)}>
                                            {payment ? (
                                                <div className={`status-indicator ${payment.status}`}>
                                                    <CheckCircle size={20} />
                                                </div>
                                            ) : (
                                                <div className="status-empty">
                                                    <div className="dot"></div>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="13" className="empty-state">Data tidak ditemukan</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Payment Detail Modal */}
            {showModal && selectedPayment && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Detail Pembayaran</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="detail-row">
                                <span className="label">Bulan</span>
                                <span className="value">{selectedPayment.paymentMonthDisplay}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Nominal</span>
                                <span className="value">Rp {parseInt(selectedPayment.amount).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Status</span>
                                <span className="status-badge lunas">Lunas</span>
                            </div>

                            <div className="evidence-section">
                                <h4>Bukti Pembayaran</h4>
                                {selectedPayment.evidenceLink ? (
                                    <div className="evidence-preview">
                                        {getThumbnailUrl(selectedPayment.evidenceLink) ? (
                                            <a href={selectedPayment.evidenceLink} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={getThumbnailUrl(selectedPayment.evidenceLink)}
                                                    alt="Bukti"
                                                    className="evidence-img"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/400x300?text=Error+Loading+Image';
                                                    }}
                                                />
                                                <div className="hover-hint">
                                                    <ExternalLink size={24} />
                                                    Buka Ukuran Asli
                                                </div>
                                            </a>
                                        ) : (
                                            <a href={selectedPayment.evidenceLink} target="_blank" rel="noopener noreferrer" className="link-only">
                                                <ExternalLink size={20} />
                                                Buka Link Bukti
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="no-evidence">Tidak ada bukti dilampirkan</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentMonitoring;
