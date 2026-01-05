import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    getPaymentsSync as getPayments,
    getUnitsSync as getUnits
} from '../../utils/database';
import {
    Search,
    Calendar,
    Filter,
    Eye,
    X,
    Download,
    CreditCard,
    User,
    Hash,
    FileText,
    ExternalLink,
    Image
} from 'lucide-react';
import InfoTooltip from '../../components/InfoTooltip/InfoTooltip';
import './TransactionHistory.css';

const TransactionHistory = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        const allPayments = getPayments();
        const allUnits = getUnits();

        // Enrich payments with unit data
        const enrichedPayments = allPayments.map(payment => {
            const unit = allUnits.find(u => u.id === payment.unitId);
            return {
                ...payment,
                blockNumber: unit?.blockNumber || '-',
                residentName: unit?.residentName || '-',
                phone: unit?.phone || '-'
            };
        });

        // Sort by date descending (newest first)
        enrichedPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

        setPayments(enrichedPayments);
        setUnits(allUnits);
        setLoading(false);
    };

    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const filteredPayments = payments.filter(payment => {
        const matchSearch =
            payment.blockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.residentName.toLowerCase().includes(searchTerm.toLowerCase());

        const paymentDate = new Date(payment.paymentDate);
        const matchMonth = !filterMonth || paymentDate.getMonth() === parseInt(filterMonth);
        const matchYear = paymentDate.getFullYear() === filterYear;
        const matchStatus = filterStatus === 'all' || payment.status === filterStatus;

        return matchSearch && matchMonth && matchYear && matchStatus;
    });

    const handleViewDetail = (payment) => {
        setSelectedPayment(payment);
        setShowDetail(true);
    };

    const months = [
        { value: '', label: 'Semua Bulan' },
        { value: '0', label: 'Januari' },
        { value: '1', label: 'Februari' },
        { value: '2', label: 'Maret' },
        { value: '3', label: 'April' },
        { value: '4', label: 'Mei' },
        { value: '5', label: 'Juni' },
        { value: '6', label: 'Juli' },
        { value: '7', label: 'Agustus' },
        { value: '8', label: 'September' },
        { value: '9', label: 'Oktober' },
        { value: '10', label: 'November' },
        { value: '11', label: 'Desember' }
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    return (
        <div className="transaction-history-page">
            <div className="page-header">
                <div>
                    <h1>
                        📋 Riwayat Transaksi
                        <InfoTooltip text="Halaman ini menampilkan semua pembayaran yang telah dicatat dalam sistem" position="right" />
                    </h1>
                    <p>Lihat detail semua pembayaran yang sudah masuk</p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Cari blok atau nama..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <InfoTooltip text="Cari berdasarkan nomor blok atau nama penghuni" position="bottom" />
                </div>

                <div className="filter-group">
                    <select
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>

                    <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(parseInt(e.target.value))}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Semua Status</option>
                        <option value="lunas">Lunas</option>
                        <option value="pending">Pending</option>
                    </select>
                    <InfoTooltip text="Filter data berdasarkan periode dan status pembayaran" position="bottom" />
                </div>
            </div>

            {/* Summary Card */}
            <div className="summary-card">
                <div className="summary-item">
                    <span className="summary-label">Total Transaksi</span>
                    <span className="summary-value">{filteredPayments.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Total Nominal</span>
                    <span className="summary-value green">
                        {formatRupiah(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
                    </span>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="transactions-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Memuat data...</p>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="empty-state">
                        <CreditCard size={48} />
                        <h3>Tidak ada transaksi</h3>
                        <p>Tidak ditemukan transaksi yang sesuai filter</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Blok</th>
                                    <th>Nama Penghuni</th>
                                    <th>Kategori</th>
                                    <th>Angsuran</th>
                                    <th>Nominal</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id}>
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={14} />
                                                {formatDate(payment.paymentDate)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="block-badge">{payment.blockNumber}</span>
                                        </td>
                                        <td>{payment.residentName}</td>
                                        <td>
                                            <span className={`category-badge ${payment.category}`}>
                                                {payment.category === 'pokok' ? 'Pokok' : 'Tambahan'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="installment-badge">
                                                Ke-{payment.installmentNo}
                                            </span>
                                        </td>
                                        <td className="amount-cell">{formatRupiah(payment.amount)}</td>
                                        <td>
                                            <span className={`status-badge ${payment.status}`}>
                                                {payment.status === 'lunas' ? '✓ Lunas' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="view-btn"
                                                onClick={() => handleViewDetail(payment)}
                                                title="Lihat detail lengkap pembayaran"
                                            >
                                                <Eye size={16} />
                                                <span>Detail</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetail && selectedPayment && (
                <div className="modal-overlay" onClick={() => setShowDetail(false)}>
                    <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📋 Detail Pembayaran</h2>
                            <button className="close-button" onClick={() => setShowDetail(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3><User size={16} /> Informasi Penghuni</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Blok</span>
                                        <span className="detail-value block-badge">{selectedPayment.blockNumber}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Nama</span>
                                        <span className="detail-value">{selectedPayment.residentName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3><CreditCard size={16} /> Detail Pembayaran</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Tanggal Bayar</span>
                                        <span className="detail-value">{formatDate(selectedPayment.paymentDate)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Periode</span>
                                        <span className="detail-value">{selectedPayment.paymentMonthDisplay || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Kategori</span>
                                        <span className={`detail-value category-badge ${selectedPayment.category}`}>
                                            {selectedPayment.category === 'pokok' ? 'Pembayaran Pokok' : 'Kelebihan Bangunan'}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Angsuran Ke</span>
                                        <span className="detail-value">{selectedPayment.installmentNo}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Nominal</span>
                                        <span className="detail-value amount">{formatRupiah(selectedPayment.amount)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status</span>
                                        <span className={`detail-value status-badge ${selectedPayment.status}`}>
                                            {selectedPayment.status === 'lunas' ? '✓ Lunas' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedPayment.notes && (
                                <div className="detail-section">
                                    <h3><FileText size={16} /> Catatan</h3>
                                    <p className="notes-text">{selectedPayment.notes}</p>
                                </div>
                            )}

                            {selectedPayment.evidenceUrl && (
                                <div className="detail-section">
                                    <h3><Image size={16} /> Bukti Pembayaran</h3>
                                    <div className="evidence-preview-container">
                                        <img
                                            src={selectedPayment.evidenceUrl}
                                            alt="Bukti Transfer"
                                            className="evidence-image-preview"
                                            onError={(e) => {
                                                e.target.style.display = 'none'; // Hide if not an image or load fails
                                            }}
                                        />
                                        <a
                                            href={selectedPayment.evidenceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="evidence-link-button"
                                        >
                                            <ExternalLink size={16} />
                                            Lihat Bukti Original
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
