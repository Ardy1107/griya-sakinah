import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../contexts/CommunityContext';
import {
    Megaphone, Calendar, Shovel, Gift, Heart, ChevronRight,
    Pin, Clock, Users, ArrowLeft, Moon, Sun, Shield
} from 'lucide-react';
import './CommunityHub.css';

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatRupiah = (value) => {
    return `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
};

const CommunityHub = () => {
    const { announcements, takjilSchedule, kerjaBakti, arisan, peduli } = useCommunity();
    const [theme, setTheme] = useState('dark');

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const pinnedAnnouncements = announcements.filter(a => a.pinned).slice(0, 2);
    const upcomingKerjaBakti = kerjaBakti.filter(kb => kb.status === 'upcoming').slice(0, 2);
    const activePeduliCases = peduli.cases.filter(c => c.status === 'active');
    const eligibleArisan = arisan.members.filter(m => !m.hasWon).length;

    const featureCards = [
        {
            id: 'pengumuman',
            title: 'Pengumuman Warga',
            description: 'Info terkini dari pengurus RT/RW',
            icon: Megaphone,
            color: 'blue',
            link: '/komunitas/pengumuman',
            stat: `${announcements.length} pengumuman`
        },
        {
            id: 'takjil',
            title: 'Jadwal Donatur Takjil',
            description: 'Jadwal donasi takjil Ramadhan',
            icon: Calendar,
            color: 'purple',
            link: '/komunitas/takjil',
            stat: `${takjilSchedule.schedule.filter(s => s.status === 'confirmed').length} terkonfirmasi`
        },
        {
            id: 'takjil-admin',
            title: 'Admin Takjil',
            description: 'Kelola & tracker donasi takjil',
            icon: Shield,
            color: 'teal',
            link: '/komunitas/takjil/admin',
            stat: 'Edit & Tracking'
        },
        {
            id: 'kerja-bakti',
            title: 'Info Kerja Bakti',
            description: 'Jadwal gotong royong warga',
            icon: Shovel,
            color: 'amber',
            link: '/komunitas/kerja-bakti',
            stat: `${upcomingKerjaBakti.length} jadwal aktif`
        },
        {
            id: 'arisan',
            title: 'Arisan Warga',
            description: 'Arisan bulanan dengan sistem spin',
            icon: Gift,
            color: 'emerald',
            link: '/komunitas/arisan',
            stat: `${eligibleArisan} peserta eligible`
        },
        {
            id: 'peduli',
            title: 'Griya Sakinah Peduli',
            description: 'Dana kepedulian untuk warga',
            icon: Heart,
            color: 'rose',
            link: '/komunitas/peduli',
            stat: `${activePeduliCases.length} kasus aktif`
        }
    ];

    return (
        <div className="community-hub">
            {/* Header */}
            <header className="hub-header">
                <div className="header-left">
                    <Link to="/" className="portal-return-btn">
                        ← Kembali ke Portal Griya Sakinah
                    </Link>
                </div>
                <div className="header-center">
                    <h1>Komunitas Griya Sakinah</h1>
                    <p>Pusat informasi dan kegiatan warga</p>
                </div>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            {/* Quick Stats */}
            <div className="quick-stats">
                <div className="stat-item">
                    <span className="stat-value">{arisan.members.length}</span>
                    <span className="stat-label">Anggota Arisan</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{formatRupiah(peduli.totalDonations)}</span>
                    <span className="stat-label">Total Donasi Peduli</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{kerjaBakti.length}</span>
                    <span className="stat-label">Kerja Bakti</span>
                </div>
            </div>

            {/* Feature Cards */}
            <section className="feature-section">
                <h2>Menu Komunitas</h2>
                <div className="feature-cards">
                    {featureCards.map(card => (
                        <Link key={card.id} to={card.link} className={`feature-card ${card.color}`}>
                            <div className="card-icon">
                                <card.icon size={28} />
                            </div>
                            <div className="card-content">
                                <h3>{card.title}</h3>
                                <p>{card.description}</p>
                                <span className="card-stat">{card.stat}</span>
                            </div>
                            <ChevronRight size={20} className="card-arrow" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* Pinned Announcements */}
            {pinnedAnnouncements.length > 0 && (
                <section className="announcements-section">
                    <h2><Pin size={18} /> Pengumuman Terbaru</h2>
                    <div className="announcement-cards">
                        {pinnedAnnouncements.map(ann => (
                            <div key={ann.id} className="announcement-card">
                                <div className="ann-header">
                                    <span className={`ann-type ${ann.type}`}>{ann.type}</span>
                                    <span className="ann-date">{formatDate(ann.createdAt)}</span>
                                </div>
                                <h3>{ann.title}</h3>
                                <p>{ann.content}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Active Peduli Cases */}
            {activePeduliCases.length > 0 && (
                <section className="peduli-section">
                    <h2><Heart size={18} /> Butuh Bantuan</h2>
                    <div className="peduli-cards">
                        {activePeduliCases.slice(0, 2).map(c => (
                            <Link key={c.id} to={`/komunitas/peduli/${c.id}`} className="peduli-card">
                                <h3>{c.title}</h3>
                                <p>{c.description}</p>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${Math.min((c.collectedAmount / c.targetAmount) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="peduli-stats">
                                    <span>{formatRupiah(c.collectedAmount)} / {formatRupiah(c.targetAmount)}</span>
                                    <span>{c.donations.length} donatur</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Events */}
            {upcomingKerjaBakti.length > 0 && (
                <section className="events-section">
                    <h2><Clock size={18} /> Agenda Mendatang</h2>
                    <div className="event-cards">
                        {upcomingKerjaBakti.map(kb => (
                            <div key={kb.id} className="event-card">
                                <div className="event-date">
                                    <span className="day">{new Date(kb.date).getDate()}</span>
                                    <span className="month">{new Date(kb.date).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                </div>
                                <div className="event-info">
                                    <h3>{kb.title}</h3>
                                    <p>{kb.time} • {kb.location}</p>
                                    <span className="participants">
                                        <Users size={14} /> {kb.participants.length} peserta
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default CommunityHub;
