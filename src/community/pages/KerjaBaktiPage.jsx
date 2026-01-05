/**
 * Kerja Bakti Page
 * Displays gotong royong schedule
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../contexts/CommunityContext';
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';
import './KerjaBaktiPage.css';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const KerjaBaktiPage = () => {
    const { kerjaBakti } = useCommunity();

    const upcoming = kerjaBakti.filter(kb => kb.status === 'upcoming');
    const completed = kerjaBakti.filter(kb => kb.status === 'completed');

    return (
        <div className="kerjabakti-page">
            <header className="page-header">
                <div className="header-left">
                    <Link to="/komunitas" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1>🔧 Info Kerja Bakti</h1>
                        <p>Jadwal gotong royong warga</p>
                    </div>
                </div>
            </header>

            <div className="kb-stats">
                <div className="stat-card upcoming">
                    <AlertCircle size={24} />
                    <div>
                        <span className="value">{upcoming.length}</span>
                        <span className="label">Jadwal Aktif</span>
                    </div>
                </div>
                <div className="stat-card completed">
                    <CheckCircle size={24} />
                    <div>
                        <span className="value">{completed.length}</span>
                        <span className="label">Selesai</span>
                    </div>
                </div>
            </div>

            {upcoming.length > 0 && (
                <section className="kb-section">
                    <h2>📅 Jadwal Mendatang</h2>
                    <div className="kb-list">
                        {upcoming.map(kb => (
                            <article key={kb.id} className="kb-card">
                                <div className="kb-date-box">
                                    <span className="day">{new Date(kb.date).getDate()}</span>
                                    <span className="month">{new Date(kb.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                </div>
                                <div className="kb-info">
                                    <h3>{kb.title}</h3>
                                    <p>{kb.description}</p>
                                    <div className="kb-meta">
                                        <span><Clock size={14} /> {kb.time}</span>
                                        <span><MapPin size={14} /> {kb.location}</span>
                                        <span><Users size={14} /> {kb.participants.length} peserta</span>
                                    </div>
                                </div>
                                <div className="kb-status upcoming">Akan Datang</div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {completed.length > 0 && (
                <section className="kb-section">
                    <h2>✅ Selesai</h2>
                    <div className="kb-list">
                        {completed.map(kb => (
                            <article key={kb.id} className="kb-card completed">
                                <div className="kb-date-box">
                                    <span className="day">{new Date(kb.date).getDate()}</span>
                                    <span className="month">{new Date(kb.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                </div>
                                <div className="kb-info">
                                    <h3>{kb.title}</h3>
                                    <div className="kb-meta">
                                        <span><MapPin size={14} /> {kb.location}</span>
                                        <span><Users size={14} /> {kb.participants.length} peserta</span>
                                    </div>
                                </div>
                                <div className="kb-status completed">Selesai</div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {kerjaBakti.length === 0 && (
                <div className="empty-state">
                    <Calendar size={48} />
                    <p>Belum ada jadwal kerja bakti</p>
                </div>
            )}
        </div>
    );
};

export default KerjaBaktiPage;
