import { useState, useEffect } from 'react';
import { getAuditLogsSync as getAuditLogs, getUsersSync as getUsers } from '../../utils/database';
import {
    Search,
    FileText,
    Calendar,
    User,
    LogIn,
    LogOut,
    Plus,
    Edit,
    Trash2,
    Download,
    Filter
} from 'lucide-react';
import './AuditLog.css';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [filterUser, setFilterUser] = useState('all');

    useEffect(() => {
        const logsData = getAuditLogs();
        const usersData = getUsers();

        // Sort by timestamp descending
        const sorted = logsData.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        setLogs(sorted);
        setFilteredLogs(sorted);
        setUsers(usersData);
    }, []);

    useEffect(() => {
        let filtered = [...logs];

        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.details.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterAction !== 'all') {
            filtered = filtered.filter(log => log.action === filterAction);
        }

        if (filterUser !== 'all') {
            filtered = filtered.filter(log => log.userId === filterUser);
        }

        setFilteredLogs(filtered);
    }, [searchTerm, filterAction, filterUser, logs]);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getUserById = (id) => users.find(u => u.id === id);

    const getActionIcon = (action) => {
        switch (action) {
            case 'LOGIN':
                return <LogIn size={16} />;
            case 'LOGOUT':
                return <LogOut size={16} />;
            case 'CREATE_UNIT':
            case 'CREATE_PAYMENT':
                return <Plus size={16} />;
            case 'UPDATE_UNIT':
            case 'UPDATE_PAYMENT':
                return <Edit size={16} />;
            case 'DELETE_UNIT':
                return <Trash2 size={16} />;
            case 'GENERATE_KWITANSI':
                return <Download size={16} />;
            default:
                return <FileText size={16} />;
        }
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'green';
        if (action.includes('UPDATE')) return 'blue';
        if (action.includes('DELETE')) return 'red';
        if (action.includes('LOGIN')) return 'purple';
        if (action.includes('LOGOUT')) return 'gray';
        return 'yellow';
    };

    const uniqueActions = [...new Set(logs.map(l => l.action))];

    return (
        <div className="audit-page">
            <div className="page-header">
                <div>
                    <h1>Audit Log</h1>
                    <p>Pantau semua aktivitas dalam sistem</p>
                </div>
                <div className="log-count">
                    <FileText size={20} />
                    <span>{filteredLogs.length} aktivitas tercatat</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Cari aktivitas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <Filter size={16} />
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        <option value="all">Semua Aksi</option>
                        {uniqueActions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <User size={16} />
                    <select
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                    >
                        <option value="all">Semua User</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Timeline */}
            <div className="audit-timeline">
                {filteredLogs.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={64} />
                        <h3>Tidak ada log ditemukan</h3>
                        <p>Coba ubah filter pencarian Anda</p>
                    </div>
                ) : (
                    filteredLogs.map((log, index) => {
                        const user = getUserById(log.userId);
                        const actionColor = getActionColor(log.action);

                        return (
                            <div key={log.id} className="timeline-item">
                                <div className="timeline-line">
                                    <div className={`timeline-dot ${actionColor}`}>
                                        {getActionIcon(log.action)}
                                    </div>
                                    {index < filteredLogs.length - 1 && (
                                        <div className="timeline-connector"></div>
                                    )}
                                </div>

                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className={`action-badge ${actionColor}`}>
                                            {log.action}
                                        </span>
                                        <span className="timeline-time">
                                            <Calendar size={14} />
                                            {formatDate(log.timestamp)}
                                        </span>
                                    </div>

                                    <p className="timeline-details">{log.details}</p>

                                    <div className="timeline-user">
                                        <div className="user-avatar-small">
                                            <User size={12} />
                                        </div>
                                        <span>{user?.name || 'Unknown'}</span>
                                        <span className="user-role-badge">{user?.role}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AuditLog;
