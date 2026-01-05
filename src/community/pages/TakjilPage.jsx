/**
 * Takjil Page - Public View
 * Displays Ramadan takjil donor schedule
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../contexts/CommunityContext';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Gift, User, Phone } from 'lucide-react';
import './TakjilPage.css';

const TakjilPage = () => {
    const { takjilSchedule } = useCommunity();
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026 (Ramadan)

    const getDaysInMonth = () => {
        const days = [];
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        // Add empty cells for days before first day
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add actual days
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
        }

        return days;
    };

    const getScheduleFor = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return takjilSchedule.schedule.find(s => s.date === dateStr);
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const confirmedCount = takjilSchedule.schedule.filter(s => s.status === 'confirmed').length;
    const days = getDaysInMonth();

    return (
        <div className="takjil-page">
            <header className="page-header">
                <div className="header-left">
                    <Link to="/komunitas" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1>🌙 Jadwal Donatur Takjil</h1>
                        <p>Ramadhan {currentMonth.getFullYear()}</p>
                    </div>
                </div>
            </header>

            <div className="takjil-stats">
                <div className="stat-card">
                    <Gift size={24} />
                    <div>
                        <span className="value">{confirmedCount}</span>
                        <span className="label">Terkonfirmasi</span>
                    </div>
                </div>
                <div className="stat-card available">
                    <Calendar size={24} />
                    <div>
                        <span className="value">{30 - confirmedCount}</span>
                        <span className="label">Slot Tersedia</span>
                    </div>
                </div>
            </div>

            <div className="calendar-section">
                <div className="calendar-nav">
                    <button onClick={prevMonth}><ChevronLeft size={20} /></button>
                    <h3>{currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={nextMonth}><ChevronRight size={20} /></button>
                </div>

                <div className="calendar-header">
                    {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                        <div key={d} className="day-name">{d}</div>
                    ))}
                </div>

                <div className="calendar-grid">
                    {days.map((date, i) => {
                        if (!date) return <div key={i} className="day-cell empty" />;
                        const schedule = getScheduleFor(date);

                        return (
                            <div
                                key={i}
                                className={`day-cell ${schedule ? 'filled' : 'available'}`}
                            >
                                <span className="date-num">{date.getDate()}</span>
                                {schedule ? (
                                    <div className="donor-info">
                                        <span className="donor-name">{schedule.donatur}</span>
                                        {schedule.menu && (
                                            <span className="donor-menu">{schedule.menu}</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="slot-available">Tersedia</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="legend">
                <div className="legend-item">
                    <span className="dot filled"></span>
                    <span>Sudah ada donatur</span>
                </div>
                <div className="legend-item">
                    <span className="dot available"></span>
                    <span>Slot tersedia</span>
                </div>
            </div>

            <div className="cta-section">
                <p>Ingin menjadi donatur takjil?</p>
                <p className="contact">Hubungi pengurus RT/RW untuk mendaftar</p>
            </div>
        </div>
    );
};

export default TakjilPage;
