import { useState, useEffect } from 'react';
import {
    getUnitsSync as getUnits,
    getPaymentsSync as getPayments,
    createPayment,
    createAuditLog,
    getPaymentsByUnitSync as getPaymentsByUnit
} from '../../utils/database';
import {
    generateKwitansi,
    generateWhatsAppLink,
    getPaymentConfirmationMessage
} from '../../utils/pdfGenerator';
import { useAuth } from '../../contexts/AuthContext';
import DatePicker, { formatFullDate, getDateKey, formatMonthYear, getMonthYearKey } from '../../components/MonthPicker/MonthPicker';
import {
    Plus,
    Search,
    Download,
    MessageCircle,
    Calendar,
    CreditCard,
    CheckCircle,
    X,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import FileUpload from '../../components/FileUpload/FileUpload';
import './Payments.css';

const Payments = () => {
    const { user } = useAuth();
    const [units, setUnits] = useState([]);
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastPayment, setLastPayment] = useState(null);
    const [lastPaymentUnit, setLastPaymentUnit] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState('');

    const currentDate = new Date();
    const [formData, setFormData] = useState({
        unitId: '',
        category: 'pokok',
        amount: '',
        installmentNo: 1,
        paymentMonth: { day: currentDate.getDate(), month: currentDate.getMonth(), year: currentDate.getFullYear() },
        status: 'lunas',
        notes: '',
        evidenceLink: ''
    });

    const loadData = () => {
        const unitsData = getUnits();
        const paymentsData = getPayments();
        setUnits(unitsData);
        setPayments(paymentsData);
        setFilteredPayments(paymentsData);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let filtered = [...payments];

        if (searchTerm) {
            filtered = filtered.filter(payment => {
                const unit = units.find(u => u.id === payment.unitId);
                return unit?.blockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    unit?.residentName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        if (filterCategory !== 'all') {
            filtered = filtered.filter(p => p.category === filterCategory);
        }

        // Sort by date descending
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFilteredPayments(filtered);
    }, [searchTerm, filterCategory, payments, units]);

    // Auto-calculate installment number and check duplicates
    useEffect(() => {
        if (formData.unitId && formData.category) {
            const unitPayments = getPaymentsByUnit(formData.unitId)
                .filter(p => p.category === formData.category);

            const nextInstallment = unitPayments.length + 1;

            // Check for duplicate payment in the same month
            const monthKey = getMonthYearKey(formData.paymentMonth);
            const duplicate = unitPayments.find(p => p.paymentMonthKey === monthKey);

            if (duplicate) {
                setDuplicateWarning(`Sudah ada pembayaran ${formData.category} untuk tanggal ${formatFullDate(formData.paymentMonth)}`);
            } else {
                setDuplicateWarning('');
            }

            setFormData(prev => ({
                ...prev,
                installmentNo: nextInstallment
            }));
        }
    }, [formData.unitId, formData.category, formData.paymentMonth]);

    const handleOpenModal = () => {
        const now = new Date();
        setFormData({
            unitId: '',
            category: 'pokok',
            amount: '',
            installmentNo: 1,
            paymentMonth: { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() },
            status: 'lunas',
            notes: '',
            evidenceLink: ''
        });
        setDuplicateWarning('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newPayment = createPayment({
            ...formData,
            amount: parseInt(formData.amount),
            paymentMonthKey: getMonthYearKey(formData.paymentMonth),
            paymentMonthDisplay: formatFullDate(formData.paymentMonth),
            createdBy: user.id
        });

        const unit = units.find(u => u.id === formData.unitId);

        createAuditLog(
            user.id,
            'CREATE_PAYMENT',
            `Payment ${formData.category} for ${unit?.blockNumber}: Rp ${formData.amount} (${formatFullDate(formData.paymentMonth)})`
        );

        setLastPayment(newPayment);
        setLastPaymentUnit(unit);

        loadData();
        handleCloseModal();
        setShowSuccessModal(true);
    };

    const handleGenerateKwitansi = () => {
        if (lastPayment && lastPaymentUnit) {
            generateKwitansi(lastPayment, lastPaymentUnit);
            createAuditLog(user.id, 'GENERATE_KWITANSI', `Generated receipt for ${lastPaymentUnit.blockNumber}`);
        }
    };

    const handleSendWhatsApp = () => {
        if (lastPayment && lastPaymentUnit) {
            const message = getPaymentConfirmationMessage(lastPaymentUnit, lastPayment);
            const link = generateWhatsAppLink(lastPaymentUnit.phone, message);
            window.open(link, '_blank');
        }
    };

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
            month: 'short',
            year: 'numeric'
        });
    };

    const getUnitById = (id) => units.find(u => u.id === id);

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    return (
        <div className="payments-page">
            <div className="page-header">
                <div>
                    <h1>Pembayaran</h1>
                    <p>Input dan kelola pembayaran angsuran</p>
                </div>
                <button className="primary-button" onClick={handleOpenModal}>
                    <Plus size={20} />
                    <span>Input Pembayaran</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Cari blok atau nama..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filterCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterCategory('all')}
                    >
                        Semua
                    </button>
                    <button
                        className={`filter-tab ${filterCategory === 'pokok' ? 'active' : ''}`}
                        onClick={() => setFilterCategory('pokok')}
                    >
                        Angsuran Pokok
                    </button>
                    <button
                        className={`filter-tab ${filterCategory === 'tambahan' ? 'active' : ''}`}
                        onClick={() => setFilterCategory('tambahan')}
                    >
                        Bangunan Tambahan
                    </button>
                </div>
            </div>

            {/* Payments Table */}
            <div className="payments-card">
                {filteredPayments.length === 0 ? (
                    <div className="empty-state">
                        <CreditCard size={64} />
                        <h3>Belum ada data pembayaran</h3>
                        <p>Klik tombol "Input Pembayaran" untuk mencatat pembayaran baru</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Periode</th>
                                    <th>Blok</th>
                                    <th>Nama</th>
                                    <th>Kategori</th>
                                    <th>Angsuran</th>
                                    <th>Nominal</th>
                                    <th>Status</th>
                                    <th>Bukti</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map(payment => {
                                    const unit = getUnitById(payment.unitId);
                                    return (
                                        <tr key={payment.id}>
                                            <td>
                                                <div className="date-cell">
                                                    <Calendar size={14} />
                                                    {formatDate(payment.createdAt)}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="period-badge">
                                                    {payment.paymentMonthDisplay || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="block-badge">{unit?.blockNumber || '-'}</span>
                                            </td>
                                            <td>{unit?.residentName || '-'}</td>
                                            <td>
                                                <span className={`category-badge ${payment.category}`}>
                                                    {payment.category === 'pokok' ? 'Pokok' : 'Tambahan'}
                                                </span>
                                            </td>
                                            <td>#{payment.installmentNo}</td>
                                            <td className="amount-cell">{formatRupiah(payment.amount)}</td>
                                            <td>
                                                <span className={`status-badge ${payment.status}`}>
                                                    {payment.status === 'lunas' && <CheckCircle size={14} />}
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td>
                                                {payment.evidenceLink ? (
                                                    <a
                                                        href={payment.evidenceLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="evidence-link"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Input Payment Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Input Pembayaran Baru</h2>
                            <button className="close-button" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Pilih Unit</label>
                                <select
                                    value={formData.unitId}
                                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Pilih Unit --</option>
                                    {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.blockNumber} - {unit.residentName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Periode Pembayaran</label>
                                <DatePicker
                                    value={formData.paymentMonth}
                                    onChange={(val) => setFormData({ ...formData, paymentMonth: val })}
                                    minYear={2025}
                                />
                            </div>

                            {duplicateWarning && (
                                <div className="warning-box">
                                    <AlertCircle size={18} />
                                    <span>{duplicateWarning}</span>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Kategori Pembayaran</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="pokok"
                                            checked={formData.category === 'pokok'}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        />
                                        <span className="radio-custom"></span>
                                        <span>Angsuran Pokok</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="tambahan"
                                            checked={formData.category === 'tambahan'}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        />
                                        <span className="radio-custom"></span>
                                        <span>Bangunan Tambahan</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nominal Pembayaran</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="Masukkan nominal"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Angsuran Ke-</label>
                                    <input
                                        type="number"
                                        value={formData.installmentNo}
                                        readOnly
                                        className="readonly-input"
                                    />
                                    <span className="input-hint">Otomatis</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="lunas">Lunas</option>
                                    <option value="izin">Izin/Dispensasi</option>
                                    <option value="belum">Belum Bayar</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Bukti Pembayaran</label>
                                <FileUpload
                                    existingLink={formData.evidenceLink}
                                    onFileUploaded={(link) => setFormData({ ...formData, evidenceLink: link })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Catatan (Opsional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Tambahkan catatan jika perlu..."
                                    rows="2"
                                />
                            </div>

                            {/* Summary */}
                            <div className="payment-summary">
                                <div className="summary-row">
                                    <span>Periode</span>
                                    <span>{formatFullDate(formData.paymentMonth)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Angsuran</span>
                                    <span>#{formData.installmentNo}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>TOTAL</span>
                                    <span>
                                        {formData.amount
                                            ? formatRupiah(parseInt(formData.amount))
                                            : '-'
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="secondary-button" onClick={handleCloseModal}>
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={!!duplicateWarning}
                                >
                                    <CreditCard size={18} />
                                    Simpan Pembayaran
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
                    <div className="modal success-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="success-icon">
                            <CheckCircle size={48} />
                        </div>
                        <h2>Pembayaran Berhasil Disimpan!</h2>
                        <p>
                            Pembayaran untuk <strong>{lastPaymentUnit?.blockNumber}</strong> telah dicatat.
                            <br />
                            <span className="success-period">{lastPayment?.paymentMonthDisplay}</span>
                        </p>

                        <div className="success-actions">
                            <button className="action-card" onClick={handleGenerateKwitansi}>
                                <Download size={24} />
                                <span>Download Kwitansi PDF</span>
                            </button>
                            <button className="action-card whatsapp" onClick={handleSendWhatsApp}>
                                <MessageCircle size={24} />
                                <span>Kirim Konfirmasi WA</span>
                            </button>
                        </div>

                        <button
                            className="close-success"
                            onClick={() => setShowSuccessModal(false)}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
