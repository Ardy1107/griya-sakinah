import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, MapPin, Type, FileText } from 'lucide-react';
import { createEvent, updateEvent, fetchEventById, EVENT_TYPES } from '../services/kalenderService';
import '../kalender.css';

export default function EventForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [saving, setSaving] = useState(false);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    const [form, setForm] = useState({
        title: '',
        description: '',
        event_type: 'pengajian',
        event_date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '10:00',
        location: '',
        max_participants: '',
    });

    useEffect(() => {
        if (isEdit) loadEvent();
    }, [id]);

    async function loadEvent() {
        try {
            const data = await fetchEventById(id);
            setForm({
                title: data.title || '',
                description: data.description || '',
                event_type: data.event_type || 'pengajian',
                event_date: data.event_date || '',
                start_time: data.start_time?.slice(0, 5) || '',
                end_time: data.end_time?.slice(0, 5) || '',
                location: data.location || '',
                max_participants: data.max_participants || '',
            });
        } catch (err) {
            alert('Gagal memuat event');
            navigate('/kalender');
        }
    }

    function handleChange(e) {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.title || !form.event_date) {
            alert('Judul dan tanggal wajib diisi');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                max_participants: form.max_participants ? parseInt(form.max_participants) : null,
                created_by: user?.id,
            };
            if (isEdit) {
                await updateEvent(id, payload);
            } else {
                await createEvent(payload);
            }
            navigate('/kalender');
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message);
        }
        setSaving(false);
    }

    return (
        <div className="kalender-container">
            <header className="kalender-header">
                <button className="btn-back" onClick={() => navigate('/kalender')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <Calendar size={24} />
                    <h1>{isEdit ? 'Edit Event' : 'Buat Event Baru'}</h1>
                </div>
            </header>

            <form className="event-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label><Type size={16} /> Judul Event *</label>
                    <input
                        type="text" name="title" value={form.title} onChange={handleChange}
                        placeholder="Contoh: Pengajian Rutin Bulanan"
                        required
                    />
                </div>

                <div className="form-group">
                    <label><FileText size={16} /> Deskripsi</label>
                    <textarea
                        name="description" value={form.description} onChange={handleChange}
                        placeholder="Deskripsi detail tentang event ini..."
                        rows={3}
                    />
                </div>

                <div className="form-group">
                    <label>🏷️ Tipe Event</label>
                    <div className="event-type-picker">
                        {EVENT_TYPES.map(t => (
                            <button
                                key={t.value}
                                type="button"
                                className={`type-option ${form.event_type === t.value ? 'active' : ''}`}
                                style={form.event_type === t.value ? { background: `${t.color}20`, borderColor: t.color, color: t.color } : {}}
                                onClick={() => setForm(f => ({ ...f, event_type: t.value }))}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label><Calendar size={16} /> Tanggal *</label>
                        <input type="date" name="event_date" value={form.event_date} onChange={handleChange} required />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label><Clock size={16} /> Mulai</label>
                        <input type="time" name="start_time" value={form.start_time} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label><Clock size={16} /> Selesai</label>
                        <input type="time" name="end_time" value={form.end_time} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label><MapPin size={16} /> Lokasi</label>
                    <input
                        type="text" name="location" value={form.location} onChange={handleChange}
                        placeholder="Contoh: Musholla Al-Ikhlas"
                    />
                </div>

                <div className="form-group">
                    <label><Users size={16} /> Maks Peserta</label>
                    <input
                        type="number" name="max_participants" value={form.max_participants} onChange={handleChange}
                        placeholder="Kosongkan jika tidak terbatas"
                        min="1"
                    />
                </div>

                <button type="submit" className="btn-save" disabled={saving}>
                    <Save size={18} />
                    {saving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Buat Event')}
                </button>
            </form>
        </div>
    );
}
