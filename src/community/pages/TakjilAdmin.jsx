/**
 * Takjil Admin Management
 * Manage Ramadan takjil donor schedule
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../contexts/CommunityContext';
import {
    ArrowLeft,
    Calendar,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Users,
    UtensilsCrossed,
    Clock,
    Shield,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import './TakjilAdmin.css';

const ADMIN_PASSWORD = 'takjil2026';

const TakjilAdmin = () => {
    const { takjilSchedule, updateTakjilSchedule, addTakjilDonatur } = useCommunity();

    // Auth
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState('');

    // UI State
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ donatur: '', menu: '', phone: '' });
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026 (Ramadan)

    useEffect(() => {
        const auth = sessionStorage.getItem('takjil_admin_auth');
        if (auth === 'true') setIsAuthenticated(true);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            sessionStorage.setItem('takjil_admin_auth', 'true');
            setAuthError('');
        } else {
            setAuthError('Password salah!');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('takjil_admin_auth');
    };

    const handleOpenModal = (date) => {
        const existing = takjilSchedule.schedule?.find(s => s.date === date);
        setSelectedDate(date);
        setFormData({
            donatur: existing?.donatur || '',
            menu: existing?.menu || '',
            phone: existing?.phone || ''
        });
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.donatur) return;

        const updatedSchedule = takjilSchedule.schedule?.map(item => {
            if (item.date === selectedDate) {
                return {
                    ...item,
                    donatur: formData.donatur,
                    menu: formData.menu,
                    phone: formData.phone,
                    status: 'confirmed'
                };
            }
            return item;
        }) || [];

        // If date doesn't exist, add it
        if (!updatedSchedule.find(s => s.date === selectedDate)) {
            updatedSchedule.push({
                date: selectedDate,
                donatur: formData.donatur,
                menu: formData.menu,
                phone: formData.phone,
                status: 'confirmed'
            });
        }

        updateTakjilSchedule(updatedSchedule);
        setShowModal(false);
        setSelectedDate(null);
    };

    const handleClear = (date) => {
        if (!window.confirm('Yakin ingin menghapus donatur ini?')) return;
        const updatedSchedule = takjilSchedule.schedule?.map(item => {
            if (item.date === date) {
                return { ...item, donatur: '', menu: '', phone: '', status: 'available' };
            }
            return item;
        }) || [];
        updateTakjilSchedule(updatedSchedule);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Add empty slots for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }
        return days;
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getScheduleForDate = (date) => {
        const dateStr = formatDate(date);
        return takjilSchedule.schedule?.find(s => s.date === dateStr);
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const confirmedCount = takjilSchedule.schedule?.filter(s => s.status === 'confirmed').length || 0;
    const availableCount = takjilSchedule.schedule?.filter(s => s.status === 'available').length || 0;

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="takjil-login">
                <div className="login-card">
                    <div className="login-icon">
                        <UtensilsCrossed size={48} />
                    </div>
                    <h1>Admin Takjil</h1>
                    <p>Kelola jadwal donatur takjil Ramadhan</p>

                    <form onSubmit={handleLogin}>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password admin"
                                autoFocus
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {authError && (
                            <div className="auth-error">
                                <AlertCircle size={16} />
                                {authError}
                            </div>
                        )}

                        <button type="submit" className="login-button">
                            <Shield size={18} />
                            Masuk
                        </button>
                    </form>

                    <Link to="/komunitas" className="back-link">
                        <ArrowLeft size={16} />
                        Kembali ke Komunitas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="takjil-admin">
            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <Link to="/komunitas" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1>🌙 Admin Takjil</h1>
                        <p>Jadwal Donatur Ramadhan {currentMonth.getFullYear()}</p>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </header>

            {/* Stats */}
            <div className="admin-stats">
                <div className="stat-card emerald">
                    <CheckCircle size={24} />
                    <div>
                        <span className="value">{confirmedCount}</span>
                        <span className="label">Terkonfirmasi</span>
                    </div>
                </div>
                <div className="stat-card gold">
                    <Clock size={24} />
                    <div>
                        <span className="value">{availableCount}</span>
                        <span className="label">Tersedia</span>
                    </div>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="calendar-nav">
                <button onClick={prevMonth}>
                    <ChevronLeft size={20} />
                </button>
                <h2>
                    {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={nextMonth}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-container">
                <div className="calendar-header">
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                        <div key={day} className="day-header">{day}</div>
                    ))}
                </div>
                <div className="calendar-grid">
                    {getDaysInMonth(currentMonth).map((date, index) => {
                        if (!date) {
                            return <div key={index} className="calendar-cell empty" />;
                        }

                        const schedule = getScheduleForDate(date);
                        const isConfirmed = schedule?.status === 'confirmed';

                        return (
                            <div
                                key={index}
                                className={`calendar-cell ${isConfirmed ? 'confirmed' : 'available'}`}
                                onClick={() => handleOpenModal(formatDate(date))}
                            >
                                <span className="date-number">{date.getDate()}</span>
                                {schedule?.donatur && (
                                    <div className="donatur-info">
                                        <span className="donatur-name">{schedule.donatur}</span>
                                        {schedule.menu && (
                                            <span className="donatur-menu">{schedule.menu}</span>
                                        )}
                                    </div>
                                )}
                                {!schedule?.donatur && (
                                    <span className="available-label">Tersedia</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Schedule List */}
            <div className="schedule-list">
                <h3>Daftar Donatur Bulan Ini</h3>
                {takjilSchedule.schedule?.filter(s => {
                    const scheduleDate = new Date(s.date);
                    return scheduleDate.getMonth() === currentMonth.getMonth() &&
                        scheduleDate.getFullYear() === currentMonth.getFullYear() &&
                        s.status === 'confirmed';
                }).map(item => (
                    <div key={item.date} className="schedule-item">
                        <div className="schedule-date">
                            <Calendar size={16} />
                            {new Date(item.date).toLocaleDateString('id-ID', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                            })}
                        </div>
                        <div className="schedule-info">
                            <span className="schedule-donatur">{item.donatur}</span>
                            <span className="schedule-menu">{item.menu}</span>
                        </div>
                        <div className="schedule-actions">
                            <button
                                className="action-btn edit"
                                onClick={() => handleOpenModal(item.date)}
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                className="action-btn delete"
                                onClick={() => handleClear(item.date)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Donatur</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="date-display">
                            <Calendar size={18} />
                            {new Date(selectedDate).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </div>
                        <form onSubmit={handleSave} className="modal-form">
                            <div className="form-group">
                                <label>Nama Donatur</label>
                                <input
                                    type="text"
                                    value={formData.donatur}
                                    onChange={e => setFormData({ ...formData, donatur: e.target.value })}
                                    placeholder="Contoh: Pak Ahmad (Blok A1)"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Menu Takjil</label>
                                <input
                                    type="text"
                                    value={formData.menu}
                                    onChange={e => setFormData({ ...formData, menu: e.target.value })}
                                    placeholder="Contoh: Kolak & Gorengan"
                                />
                            </div>
                            <div className="form-group">
                                <label>No. HP (Opsional)</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="submit-btn">
                                    <Check size={18} />
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakjilAdmin;
