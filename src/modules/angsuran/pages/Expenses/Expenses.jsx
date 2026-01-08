import { useState, useEffect } from 'react';
import {
    getExpensesSync,
    createExpense,
    deleteExpense,
    createAuditLog,
    getMonthlyBalanceSync
} from '../../utils/database';
import { useAuth } from '../../contexts/AuthContext';
import {
    Plus,
    Search,
    Trash2,
    X,
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    User,
    ChevronLeft,
    ChevronRight,
    FileText,
    ExternalLink,
    Eye
} from 'lucide-react';
import './Expenses.css';

const Expenses = () => {
    const { user, isAdmin } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [balance, setBalance] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });

    const [formData, setFormData] = useState({
        workerName: '',
        description: '',
        amount: '',
        notes: ''
    });

    const loadData = async () => {
        try {
            const data = await getExpensesSync() || [];
            const expensesArr = Array.isArray(data) ? data : [];
            setExpenses(expensesArr);

            // Filter by selected month/year
            const filtered = expensesArr.filter(e => {
                const date = new Date(e.createdAt);
                return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
            });
            setFilteredExpenses(filtered);

            // Get balance
            const bal = await getMonthlyBalanceSync(selectedMonth, selectedYear) || { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
            setBalance(bal);
        } catch (err) {
            console.error('Error loading expenses:', err);
            setExpenses([]);
            setFilteredExpenses([]);
            setBalance({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        let filtered = expenses.filter(e => {
            const date = new Date(e.createdAt);
            return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        });

        if (searchTerm) {
            filtered = filtered.filter(e =>
                e.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort by date descending
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFilteredExpenses(filtered);
    }, [searchTerm, expenses, selectedMonth, selectedYear]);

    const handleOpenModal = () => {
        setFormData({
            workerName: '',
            description: '',
            amount: '',
            notes: ''
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        await createExpense({
            ...formData,
            amount: parseInt(formData.amount),
            createdBy: user.id
        });

        await createAuditLog({
            userId: user.id,
            action: 'CREATE_EXPENSE',
            details: `Expense to ${formData.workerName}: Rp ${formData.amount}`
        });

        loadData();
        handleCloseModal();
    };

    const handleDelete = async (expense) => {
        if (window.confirm(`Hapus pengeluaran untuk "${expense.workerName}"?`)) {
            await deleteExpense(expense.id);
            await createAuditLog({ userId: user.id, action: 'DELETE_EXPENSE', details: `Deleted expense: ${expense.workerName}` });
            loadData();
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

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const goToPrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    return (
        <div className="expenses-page">
            <div className="page-header">
                <div>
                    <h1>{isAdmin() ? 'Pengeluaran' : '📤 Pengeluaran'}</h1>
                    <p>{isAdmin() ? 'Catat pembayaran ke tukang dan pengeluaran lainnya' : 'Lihat daftar pengeluaran dan penggunaan dana'}</p>
                </div>
                {isAdmin() && (
                    <button className="primary-button" onClick={handleOpenModal}>
                        <Plus size={20} />
                        <span>Tambah Pengeluaran</span>
                    </button>
                )}
            </div>

            {/* Month Selector & Summary Cards */}
            <div className="summary-section">
                <div className="month-selector">
                    <button onClick={goToPrevMonth}>
                        <ChevronLeft size={20} />
                    </button>
                    <span className="current-month">
                        {monthNames[selectedMonth]} {selectedYear}
                    </span>
                    <button onClick={goToNextMonth}>
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="summary-cards">
                    <div className="summary-card income">
                        <div className="card-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="card-content">
                            <span className="card-label">Total Angsuran</span>
                            <span className="card-value">{formatRupiah(balance.totalIncome)}</span>
                            <span className="card-badge">{balance.paymentCount} transaksi</span>
                        </div>
                    </div>

                    <div className="summary-card expense">
                        <div className="card-icon">
                            <TrendingDown size={24} />
                        </div>
                        <div className="card-content">
                            <span className="card-label">Total Pengeluaran</span>
                            <span className="card-value">{formatRupiah(balance.totalExpenses)}</span>
                            <span className="card-badge">{balance.expenseCount} transaksi</span>
                        </div>
                    </div>

                    <div className="summary-card balance">
                        <div className="card-icon">
                            <Wallet size={24} />
                        </div>
                        <div className="card-content">
                            <span className="card-label">Saldo untuk Bu Devi</span>
                            <span className="card-value">{formatRupiah(balance.netBalance)}</span>
                            <span className="card-badge highlight">Angsuran - Pengeluaran</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Cari nama tukang atau deskripsi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-info">
                    {filteredExpenses.length} pengeluaran bulan ini
                </div>
            </div>

            {/* Expenses List */}
            <div className="expenses-card">
                {filteredExpenses.length === 0 ? (
                    <div className="empty-state">
                        <Wallet size={64} />
                        <h3>Belum ada pengeluaran</h3>
                        <p>Klik tombol "Tambah Pengeluaran" untuk mencatat pembayaran ke tukang</p>
                    </div>
                ) : (
                    <div className="expenses-list">
                        {filteredExpenses.map(expense => (
                            <div
                                key={expense.id}
                                className="expense-item clickable"
                                onClick={() => setSelectedExpense(expense)}
                            >
                                <div className="expense-icon">
                                    <User size={20} />
                                </div>
                                <div className="expense-info">
                                    <div className="expense-header">
                                        <span className="worker-name">{expense.workerName}</span>
                                        <span className="expense-amount">-{formatRupiah(expense.amount)}</span>
                                    </div>
                                    <div className="expense-details">
                                        {expense.description && (
                                            <span className="expense-desc">
                                                <FileText size={14} />
                                                {expense.description}
                                            </span>
                                        )}
                                        <span className="expense-date">
                                            <Calendar size={14} />
                                            {formatDate(expense.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="expense-actions">
                                    <button
                                        className="view-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedExpense(expense);
                                        }}
                                    >
                                        <Eye size={16} />
                                    </button>
                                    {isAdmin() && (
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(expense);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Tambah Pengeluaran</h2>
                            <button className="close-button" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Nama Tukang / Penerima</label>
                                <input
                                    type="text"
                                    value={formData.workerName}
                                    onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                                    placeholder="Contoh: Pak Budi, Tukang Listrik, dll."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Deskripsi Pekerjaan</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Contoh: Perbaikan atap Unit A-01"
                                />
                            </div>

                            <div className="form-group">
                                <label>Nominal Pembayaran</label>
                                <div className="input-with-prefix">
                                    <span className="prefix">Rp</span>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="Masukkan nominal"
                                        required
                                    />
                                </div>
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

                            {/* Preview */}
                            <div className="expense-preview">
                                <div className="preview-row">
                                    <span>Penerima</span>
                                    <span>{formData.workerName || '-'}</span>
                                </div>
                                <div className="preview-row total">
                                    <span>TOTAL</span>
                                    <span className="amount-red">
                                        {formData.amount ? formatRupiah(parseInt(formData.amount)) : '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="secondary-button" onClick={handleCloseModal}>
                                    Batal
                                </button>
                                <button type="submit" className="primary-button danger">
                                    <DollarSign size={18} />
                                    Simpan Pengeluaran
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expense Detail Modal */}
            {selectedExpense && (
                <div className="modal-overlay" onClick={() => setSelectedExpense(null)}>
                    <div className="modal expense-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Detail Pengeluaran</h2>
                            <button className="close-button" onClick={() => setSelectedExpense(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="expense-detail-content">
                            <div className="detail-row">
                                <span className="detail-label">Penerima</span>
                                <span className="detail-value">{selectedExpense.workerName}</span>
                            </div>

                            {selectedExpense.description && (
                                <div className="detail-row">
                                    <span className="detail-label">Deskripsi</span>
                                    <span className="detail-value">{selectedExpense.description}</span>
                                </div>
                            )}

                            <div className="detail-row">
                                <span className="detail-label">Nominal</span>
                                <span className="detail-value amount">-{formatRupiah(selectedExpense.amount)}</span>
                            </div>

                            <div className="detail-row">
                                <span className="detail-label">Tanggal</span>
                                <span className="detail-value">{formatDate(selectedExpense.createdAt)}</span>
                            </div>

                            {selectedExpense.notes && (
                                <div className="detail-row notes">
                                    <span className="detail-label">Catatan</span>
                                    <span className="detail-value">{selectedExpense.notes}</span>
                                </div>
                            )}

                            {/* Receipt Photo Section */}
                            <div className="receipt-section">
                                <span className="detail-label">Bukti Penyerahan</span>
                                {selectedExpense.evidenceLink ? (
                                    <div className="receipt-container">
                                        <img
                                            src={selectedExpense.evidenceLink}
                                            alt="Bukti penyerahan"
                                            className="receipt-image"
                                        />
                                        <a
                                            href={selectedExpense.evidenceLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="view-full-link"
                                        >
                                            <ExternalLink size={16} />
                                            Lihat ukuran penuh
                                        </a>
                                    </div>
                                ) : (
                                    <div className="no-receipt">
                                        <FileText size={32} />
                                        <p>Belum ada bukti foto</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="secondary-button"
                                onClick={() => setSelectedExpense(null)}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
