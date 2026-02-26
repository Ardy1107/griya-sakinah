import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Plus, ChevronLeft, ChevronRight, MapPin,
    Clock, Users, Filter, List, Grid3X3, ArrowLeft
} from 'lucide-react';
import { fetchEvents, EVENT_TYPES, getEventType, formatDate, formatTime } from '../services/kalenderService';
import '../kalender.css';

export default function KalenderPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [filterType, setFilterType] = useState('');
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });
    const isAdmin = user?.role === 'superadmin' || user?.role === 'super_admin' || user?.role === 'admin';

    useEffect(() => { loadEvents(); }, [currentMonth, currentYear, filterType]);

    async function loadEvents() {
        setLoading(true);
        try {
            const data = await fetchEvents({ month: currentMonth, year: currentYear, type: filterType || undefined });
            setEvents(data);
        } catch (err) {
            console.error('Load events error:', err);
        }
        setLoading(false);
    }

    function prevMonth() {
        if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    }
    function nextMonth() {
        if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    }

    const monthName = new Date(currentYear, currentMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    // Calendar grid
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    function getEventsForDay(day) {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.event_date === dateStr);
    }

    const today = new Date();
    const isToday = (day) => day === today.getDate() && currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear();

    return (
        <div className="kalender-container">
            <header className="kalender-header">
                <button className="btn-back" onClick={() => navigate('/komunitas')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <Calendar size={24} />
                    <h1>Kalender Komunitas</h1>
                </div>
                {isAdmin && (
                    <button className="btn-add-event" onClick={() => navigate('/kalender/buat')}>
                        <Plus size={18} />
                        <span>Buat Event</span>
                    </button>
                )}
            </header>

            {/* Month Navigator */}
            <div className="month-nav">
                <button onClick={prevMonth}><ChevronLeft size={20} /></button>
                <h2>{monthName}</h2>
                <button onClick={nextMonth}><ChevronRight size={20} /></button>
            </div>

            {/* Toolbar */}
            <div className="kalender-toolbar">
                <div className="filter-group">
                    <Filter size={16} />
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">Semua Tipe</option>
                        {EVENT_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                        ))}
                    </select>
                </div>
                <div className="view-toggle">
                    <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
                        <List size={16} />
                    </button>
                    <button className={viewMode === 'calendar' ? 'active' : ''} onClick={() => setViewMode('calendar')}>
                        <Grid3X3 size={16} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Memuat kalender...</p>
                </div>
            ) : viewMode === 'calendar' ? (
                /* Calendar Grid View */
                <div className="calendar-grid">
                    <div className="calendar-header-row">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                            <div key={d} className="calendar-day-header">{d}</div>
                        ))}
                    </div>
                    <div className="calendar-body">
                        {calendarDays.map((day, i) => (
                            <div key={i} className={`calendar-cell ${day ? '' : 'empty'} ${isToday(day) ? 'today' : ''}`}>
                                {day && (
                                    <>
                                        <span className="day-number">{day}</span>
                                        <div className="day-events">
                                            {getEventsForDay(day).map(e => {
                                                const type = getEventType(e.event_type);
                                                return (
                                                    <div
                                                        key={e.id}
                                                        className="day-event-dot"
                                                        style={{ background: type.color }}
                                                        title={`${type.icon} ${e.title}`}
                                                        onClick={() => navigate(`/kalender/${e.id}`)}
                                                    >
                                                        {type.icon}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* List View */
                <div className="events-list">
                    {events.length === 0 ? (
                        <div className="empty-state">
                            <Calendar size={48} />
                            <h3>Belum ada event bulan ini</h3>
                            <p>Event akan muncul di sini ketika ada jadwal kegiatan.</p>
                        </div>
                    ) : events.map(event => {
                        const type = getEventType(event.event_type);
                        return (
                            <div key={event.id} className="event-card" onClick={() => navigate(`/kalender/${event.id}`)}>
                                <div className="event-date-badge" style={{ background: type.color }}>
                                    <span className="event-day">{new Date(event.event_date).getDate()}</span>
                                    <span className="event-month-short">
                                        {new Date(event.event_date).toLocaleDateString('id-ID', { month: 'short' })}
                                    </span>
                                </div>
                                <div className="event-info">
                                    <div className="event-type-badge" style={{ background: `${type.color}20`, color: type.color }}>
                                        {type.icon} {type.label}
                                    </div>
                                    <h3>{event.title}</h3>
                                    {event.start_time && (
                                        <span className="event-meta">
                                            <Clock size={14} /> {formatTime(event.start_time)}
                                            {event.end_time && ` - ${formatTime(event.end_time)}`}
                                        </span>
                                    )}
                                    {event.location && (
                                        <span className="event-meta">
                                            <MapPin size={14} /> {event.location}
                                        </span>
                                    )}
                                </div>
                                <ChevronRight size={20} className="event-arrow" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
