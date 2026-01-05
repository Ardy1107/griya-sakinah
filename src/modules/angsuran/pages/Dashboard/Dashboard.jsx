import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    getPaymentStatsSync as getPaymentStats,
    getAgingReceivableSync as getAgingReceivable,
    getMonthlyIncomeSync as getMonthlyIncome,
    getUnitsSync as getUnits,
    getPaymentsSync as getPayments,
    getMonthlyBalanceSync
} from '../../utils/database';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { generateWhatsAppLink, getReminderMessage } from '../../utils/pdfGenerator';
import {
    TrendingUp,
    Building2,
    AlertTriangle,
    Calendar,
    Phone,
    ExternalLink,
    RefreshCw,
    Clock,
    FileText,
    CreditCard,
    Bell,
    Wallet,
    Plus,
    X,
    User,
    MapPin
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalThisMonth: 0,
        totalUnits: 0,
        overdueUnits: 0,
        kelebihanBangunanCount: 0
    });
    const [expenseStats, setExpenseStats] = useState({
        totalExpenses: 0,
        netBalance: 0
    });
    const [agingData, setAgingData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [dueSoonUnits, setDueSoonUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showUnpaidModal, setShowUnpaidModal] = useState(false);
    const [unpaidUnits, setUnpaidUnits] = useState([]);

    // Show welcome popup for developer on every login
    useEffect(() => {
        if (user?.role === 'developer') {
            // Check if this is a fresh login (no welcomeShownThisLogin flag)
            const welcomeShown = sessionStorage.getItem('welcomeShownThisLogin');
            if (!welcomeShown) {
                setShowWelcome(true);
                sessionStorage.setItem('welcomeShownThisLogin', 'true');
                setTimeout(() => setShowWelcome(false), 5000);
            }
        }
    }, [user]);

    const loadData = () => {
        setLoading(true);
        const paymentStats = getPaymentStats();
        const aging = getAgingReceivable();
        const monthly = getMonthlyIncome();
        const units = getUnits();
        const payments = getPayments();

        // Count units with kelebihan bangunan payments
        const kelebihanUnits = new Set();
        payments.forEach(p => {
            if (p.category === 'tambahan') {
                kelebihanUnits.add(p.unitId);
            }
        });

        // Get expense data for current month
        const now = new Date();
        const balanceData = getMonthlyBalanceSync(now.getMonth(), now.getFullYear());
        setExpenseStats({
            totalExpenses: balanceData.totalExpenses,
            netBalance: balanceData.netBalance
        });

        // Calculate units due soon (within 5 days)
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const dueSoon = units.filter(unit => {
            const dueDay = unit.dueDay;
            const daysUntilDue = dueDay - currentDay;
            // Due within next 5 days (before or on due date)
            return daysUntilDue >= -2 && daysUntilDue <= 5;
        }).map(unit => ({
            ...unit,
            daysUntilDue: unit.dueDay - currentDay
        }));

        // Calculate unpaid units for this month (for modal)
        const paidUnitIdsThisMonth = new Set(
            payments
                .filter(p => {
                    const pDate = new Date(p.date);
                    return pDate.getMonth() === currentMonth &&
                        pDate.getFullYear() === currentYear &&
                        p.category === 'pokok';
                })
                .map(p => p.unitId)
        );

        const unpaidList = units
            .filter(unit => !paidUnitIdsThisMonth.has(unit.id))
            .map(unit => ({
                id: unit.id,
                blok: unit.blok,
                residentName: unit.residentName,
                phone: unit.phone,
                dueDay: unit.dueDay,
                monthlyFee: unit.monthlyFee || 200000
            }));

        setUnpaidUnits(unpaidList);

        setStats({
            ...paymentStats,
            kelebihanBangunanCount: kelebihanUnits.size
        });
        setAgingData(aging);
        setMonthlyData(monthly);
        setDueSoonUnits(dueSoon);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

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
            month: 'short',
            year: 'numeric'
        });
    };

    const getMaxMonthly = () => {
        return Math.max(...monthlyData.map(d => d.total), 1);
    };

    const handleSendReminder = (unit) => {
        const message = getReminderMessage(unit, 2500000);
        const link = generateWhatsAppLink(unit.phone, message);
        window.open(link, '_blank');
    };

    const getDueBadgeClass = (days) => {
        if (days < 0) return 'overdue';
        if (days <= 2) return 'urgent';
        return 'soon';
    };

    const getDueBadgeText = (days) => {
        if (days < 0) return `Lewat ${Math.abs(days)} hari`;
        if (days === 0) return 'Hari ini';
        return `${days} hari lagi`;
    };

    // Navigation helper - developer goes to monitoring, admin goes to specific pages
    const getNavTarget = (adminPath, devPath = '/monitoring') => {
        return isAdmin() ? adminPath : devPath;
    };

    const statCards = [
        {
            label: 'Pemasukan Bulan Ini',
            value: formatRupiah(stats.totalThisMonth),
            icon: TrendingUp,
            color: 'green',
            change: null,
            onClick: () => navigate(isAdmin() ? '/angsuran/payments' : '/angsuran/riwayat-transaksi'),
            tooltip: 'Total pembayaran yang diterima bulan ini'
        },
        {
            label: 'Pengeluaran Bulan Ini',
            value: formatRupiah(expenseStats.totalExpenses),
            icon: Wallet,
            color: 'orange',
            change: null,
            onClick: () => navigate('/angsuran/expenses'),
            tooltip: 'Total pengeluaran operasional bulan ini'
        },
        {
            label: 'Saldo Bersih',
            value: formatRupiah(expenseStats.netBalance),
            icon: CreditCard,
            color: expenseStats.netBalance >= 0 ? 'blue' : 'red',
            change: null,
            onClick: () => navigate('/angsuran/expenses'),
            tooltip: 'Selisih pemasukan dikurangi pengeluaran'
        },
        {
            label: 'Kelebihan Bangunan',
            value: `${stats.kelebihanBangunanCount} Unit`,
            icon: Plus,
            color: 'purple',
            change: stats.kelebihanBangunanCount > 0 ? 'Ada pembayaran tambahan' : null,
            onClick: () => navigate(isAdmin() ? '/angsuran/payments' : '/angsuran/riwayat-transaksi'),
            tooltip: 'Unit dengan pembayaran tambahan kelebihan bangunan'
        },
        {
            label: 'Total Unit',
            value: stats.totalUnits,
            icon: Building2,
            color: 'blue',
            change: null,
            onClick: () => navigate('/angsuran/units'),
            tooltip: 'Jumlah seluruh unit yang terdaftar'
        },
        {
            label: 'Unit Belum Bayar',
            value: stats.overdueUnits,
            icon: AlertTriangle,
            color: stats.overdueUnits > 0 ? 'red' : 'green',
            change: stats.overdueUnits > 0 ? 'Perlu tindakan' : 'Semua lancar',
            onClick: () => setShowUnpaidModal(true),
            tooltip: 'Klik untuk melihat daftar unit yang belum bayar'
        }
    ];

    const quickActions = [
        {
            label: 'Input Pembayaran',
            icon: CreditCard,
            color: 'green',
            onClick: () => navigate('/angsuran/payments'),
            tooltip: 'Catat pembayaran baru dari penghuni'
        },
        {
            label: 'Input Pengeluaran',
            icon: Wallet,
            color: 'orange',
            onClick: () => navigate('/angsuran/expenses'),
            tooltip: 'Catat pengeluaran operasional baru'
        },
        {
            label: 'Lihat Laporan',
            icon: FileText,
            color: 'purple',
            onClick: () => navigate('/angsuran/reports'),
            tooltip: 'Buka laporan keuangan bulanan'
        },
        {
            label: 'Tambah Unit',
            icon: Building2,
            color: 'blue',
            onClick: () => navigate('/angsuran/units'),
            tooltip: 'Tambahkan unit hunian baru'
        }
    ];

    return (
        <div className="dashboard">
            {/* Welcome Popup for Developer */}
            {showWelcome && (
                <div className="welcome-overlay">
                    <div className="welcome-popup">
                        <div className="welcome-icon">👋</div>
                        <h2>Selamat Datang!</h2>
                        <p className="welcome-name">Devi Indah Suhartatik</p>
                        <p className="welcome-subtitle">Di Aplikasi Griya Sakinah</p>
                        <div className="welcome-progress">
                            <div className="progress-bar"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Selamat datang, {user?.name}!</p>
                </div>
                <button className="refresh-button" onClick={loadData} disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Due Soon Alert - Only for Admin */}
            {isAdmin() && dueSoonUnits.length > 0 && (
                <div className="due-soon-alert">
                    <div className="alert-header">
                        <Bell size={20} />
                        <h4>Jatuh Tempo Segera ({dueSoonUnits.length} unit)</h4>
                    </div>
                    <div className="due-soon-list">
                        {dueSoonUnits.slice(0, 5).map(unit => (
                            <div
                                key={unit.id}
                                className="due-soon-item clickable"
                                onClick={() => navigate(`/angsuran/units/${unit.id}`)}
                            >
                                <span className="block-badge">{unit.blockNumber}</span>
                                <span className="resident-name">{unit.residentName}</span>
                                <span className={`due-badge ${getDueBadgeClass(unit.daysUntilDue)}`}>
                                    <Clock size={12} />
                                    {getDueBadgeText(unit.daysUntilDue)}
                                </span>
                                <button
                                    className="reminder-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendReminder(unit);
                                    }}
                                >
                                    <Phone size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            <div className="stat-cards">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`stat-card ${stat.color} clickable`}
                        onClick={stat.onClick}
                        title={stat.tooltip}
                    >
                        <div className="stat-icon">
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">{stat.label}</span>
                            <span className="stat-value">{stat.value}</span>
                            {stat.change && (
                                <span className={`stat-change ${stat.color}`}>{stat.change}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            {isAdmin() && (
                <div className="quick-actions">
                    <h3>Aksi Cepat</h3>
                    <div className="quick-actions-grid">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                className={`quick-action-btn ${action.color}`}
                                onClick={action.onClick}
                                title={action.tooltip}
                            >
                                <action.icon size={20} />
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="dashboard-grid">
                {/* Monthly Chart */}
                <div className="dashboard-card chart-card">
                    <div className="card-header">
                        <h3>Pemasukan 6 Bulan Terakhir</h3>
                    </div>
                    <div className="chart-container" style={{ height: '320px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={monthlyData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        color: '#F9FAFB',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: '#10B981' }}
                                    formatter={(value) => [formatRupiah(value), 'Pemasukan']}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Status Distribution */}
                <div className="dashboard-card clickable-card" onClick={() => navigate('/angsuran/monitoring')}>
                    <div className="card-header">
                        <h3>Status Pembayaran</h3>
                        <ExternalLink size={16} className="header-link-icon" />
                    </div>
                    <div className="status-list">
                        <div className="status-item">
                            <div className="status-dot green"></div>
                            <span className="status-label">Lunas Bulan Ini</span>
                            <span className="status-value">{stats.totalUnits - stats.overdueUnits} unit</span>
                        </div>
                        <div className="status-item">
                            <div className="status-dot red"></div>
                            <span className="status-label">Belum Bayar</span>
                            <span className="status-value">{stats.overdueUnits} unit</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aging Receivable Table */}
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>
                        <AlertTriangle size={20} className="header-icon" />
                        Aging Receivable (Tunggakan)
                    </h3>
                </div>

                {agingData.length === 0 ? (
                    <div className="empty-state">
                        <Building2 size={48} />
                        <p>Tidak ada tunggakan saat ini</p>
                        <span>Semua penghuni sudah membayar tepat waktu 🎉</span>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table hover-rows">
                            <thead>
                                <tr>
                                    <th>Blok</th>
                                    <th>Nama Penghuni</th>
                                    <th>Terakhir Bayar</th>
                                    <th>Durasi Tunggakan</th>
                                    <th>Total Dibayar</th>
                                    {isAdmin() && <th>Aksi</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {agingData.map((unit) => (
                                    <tr
                                        key={unit.id}
                                        onClick={() => navigate(`/angsuran/units/${unit.id}`)}
                                        className="clickable-row"
                                    >
                                        <td>
                                            <span className="block-badge">{unit.blockNumber}</span>
                                        </td>
                                        <td>{unit.residentName}</td>
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={14} />
                                                {formatDate(unit.lastPaymentDate)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`duration-badge ${unit.daysSincePayment > 60 ? 'critical' : 'warning'}`}>
                                                {unit.daysSincePayment} hari
                                            </span>
                                        </td>
                                        <td>{formatRupiah(unit.totalPaid)}</td>
                                        {isAdmin() && (
                                            <td>
                                                <button
                                                    className="action-button whatsapp"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSendReminder(unit);
                                                    }}
                                                >
                                                    <Phone size={14} />
                                                    <span>Ingatkan</span>
                                                    <ExternalLink size={12} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Unpaid Units Modal */}
            {showUnpaidModal && (
                <div className="modal-overlay" onClick={() => setShowUnpaidModal(false)}>
                    <div className="unpaid-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <AlertTriangle size={24} className="warning-icon" />
                                <div>
                                    <h3>Unit Belum Bayar Bulan Ini</h3>
                                    <p>{unpaidUnits.length} unit belum melakukan pembayaran</p>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowUnpaidModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-content">
                            {unpaidUnits.length === 0 ? (
                                <div className="empty-state">
                                    <div className="success-icon">✓</div>
                                    <p>Semua unit sudah melakukan pembayaran bulan ini!</p>
                                </div>
                            ) : (
                                <div className="unpaid-list">
                                    {unpaidUnits.map((unit) => (
                                        <div key={unit.id} className="unpaid-item" onClick={() => {
                                            setShowUnpaidModal(false);
                                            navigate(`/angsuran/units/${unit.id}`);
                                        }}>
                                            <div className="unit-info">
                                                <div className="unit-blok">
                                                    <MapPin size={16} />
                                                    <span>{unit.blok}</span>
                                                </div>
                                                <div className="unit-resident">
                                                    <User size={16} />
                                                    <span>{unit.residentName}</span>
                                                </div>
                                            </div>
                                            <div className="unit-details">
                                                <div className="unit-phone">
                                                    <Phone size={14} />
                                                    <span>{unit.phone}</span>
                                                </div>
                                                <div className="unit-due">
                                                    <Calendar size={14} />
                                                    <span>Jatuh tempo: Tgl {unit.dueDay}</span>
                                                </div>
                                            </div>
                                            <div className="unit-amount">
                                                {formatRupiah(unit.monthlyFee)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowUnpaidModal(false)}
                            >
                                Tutup
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setShowUnpaidModal(false);
                                    navigate('/angsuran/monitoring');
                                }}
                            >
                                Lihat Monitoring
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
