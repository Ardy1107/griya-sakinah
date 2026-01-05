/**
 * Pengumuman Warga Page
 * Displays community announcements
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../contexts/CommunityContext';
import { ArrowLeft, Pin, Calendar, Megaphone, AlertTriangle, Info, Bell } from 'lucide-react';
import './PengumumanPage.css';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const PengumumanPage = () => {
    const { announcements } = useCommunity();
    const [filter, setFilter] = useState('all');

    const typeIcons = {
        info: Info,
        penting: AlertTriangle,
        umum: Megaphone
    };

    const typeColors = {
        info: '#3B82F6',
        penting: '#EF4444',
        umum: '#10B981'
    };

    const filteredAnnouncements = filter === 'all'
        ? announcements
        : announcements.filter(a => a.type === filter);

    const pinnedFirst = [...filteredAnnouncements].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return (
        <div className="pengumuman-page">
            <header className="page-header">
                <div className="header-left">
                    <Link to="/komunitas" className="back-btn">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1>📢 Pengumuman Warga</h1>
                        <p>Informasi terkini dari pengurus RT/RW</p>
                    </div>
                </div>
            </header>

            <div className="filter-tabs">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Semua ({announcements.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'penting' ? 'active' : ''}`}
                    onClick={() => setFilter('penting')}
                >
                    <AlertTriangle size={14} /> Penting
                </button>
                <button
                    className={`filter-btn ${filter === 'info' ? 'active' : ''}`}
                    onClick={() => setFilter('info')}
                >
                    <Info size={14} /> Info
                </button>
                <button
                    className={`filter-btn ${filter === 'umum' ? 'active' : ''}`}
                    onClick={() => setFilter('umum')}
                >
                    <Megaphone size={14} /> Umum
                </button>
            </div>

            <div className="announcements-list">
                {pinnedFirst.map(ann => {
                    const Icon = typeIcons[ann.type] || Megaphone;
                    return (
                        <article key={ann.id} className={`announcement-card ${ann.pinned ? 'pinned' : ''}`}>
                            {ann.pinned && (
                                <div className="pinned-badge">
                                    <Pin size={12} /> Disematkan
                                </div>
                            )}
                            <div className="ann-header">
                                <span
                                    className="ann-type"
                                    style={{ background: `${typeColors[ann.type]}20`, color: typeColors[ann.type] }}
                                >
                                    <Icon size={12} />
                                    {ann.type}
                                </span>
                                <span className="ann-date">
                                    <Calendar size={12} />
                                    {formatDate(ann.createdAt)}
                                </span>
                            </div>
                            <h3>{ann.title}</h3>
                            <p>{ann.content}</p>
                            {ann.author && (
                                <div className="ann-author">— {ann.author}</div>
                            )}
                        </article>
                    );
                })}

                {filteredAnnouncements.length === 0 && (
                    <div className="empty-state">
                        <Bell size={48} />
                        <p>Tidak ada pengumuman</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PengumumanPage;
