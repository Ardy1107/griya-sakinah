import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Vote, Save, Plus, X, Calendar, Type, FileText, Shield
} from 'lucide-react';
import { createPoll } from '../services/votingService';
import '../voting.css';

export default function VotingForm() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [user] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('portal_user')); } catch { return null; }
    });

    const [form, setForm] = useState({
        title: '',
        description: '',
        poll_type: 'single',
        ends_at: '',
        require_verification: true,
        is_anonymous: false,
    });
    const [options, setOptions] = useState(['', '']);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }

    function addOption() { setOptions(o => [...o, '']); }
    function removeOption(i) {
        if (options.length <= 2) return;
        setOptions(o => o.filter((_, idx) => idx !== i));
    }
    function updateOption(i, val) {
        setOptions(o => o.map((v, idx) => idx === i ? val : v));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const validOptions = options.filter(o => o.trim());
        if (!form.title) { alert('Judul wajib diisi'); return; }
        if (!form.ends_at) { alert('Batas waktu wajib diisi'); return; }
        if (validOptions.length < 2) { alert('Minimal 2 opsi'); return; }

        setSaving(true);
        try {
            await createPoll(
                { ...form, created_by: user?.id, ends_at: new Date(form.ends_at).toISOString() },
                validOptions
            );
            navigate('/voting');
        } catch (err) {
            alert('Gagal membuat polling: ' + err.message);
        }
        setSaving(false);
    }

    return (
        <div className="voting-container">
            <header className="voting-header">
                <button className="btn-back" onClick={() => navigate('/voting')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-title">
                    <Vote size={24} />
                    <h1>Buat Polling Baru</h1>
                </div>
            </header>

            <form className="voting-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label><Type size={16} /> Judul Voting *</label>
                    <input
                        type="text" name="title" value={form.title} onChange={handleChange}
                        placeholder='Contoh: "Setuju perbaikan jalan blok A?"'
                        required
                    />
                </div>

                <div className="form-group">
                    <label><FileText size={16} /> Deskripsi</label>
                    <textarea
                        name="description" value={form.description} onChange={handleChange}
                        placeholder="Penjelasan detail tentang voting ini..."
                        rows={3}
                    />
                </div>

                <div className="form-group">
                    <label><Calendar size={16} /> Batas Waktu Voting *</label>
                    <input
                        type="datetime-local" name="ends_at" value={form.ends_at} onChange={handleChange}
                        required
                    />
                </div>

                {/* Options */}
                <div className="form-group">
                    <label>🗳️ Opsi Jawaban *</label>
                    <div className="options-editor">
                        {options.map((opt, i) => (
                            <div key={i} className="option-row">
                                <span className="option-number">{i + 1}</span>
                                <input
                                    type="text" value={opt}
                                    onChange={e => updateOption(i, e.target.value)}
                                    placeholder={`Opsi ${i + 1}...`}
                                />
                                {options.length > 2 && (
                                    <button type="button" className="btn-remove-option" onClick={() => removeOption(i)}>
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="btn-add-option" onClick={addOption}>
                            <Plus size={16} /> Tambah Opsi
                        </button>
                    </div>
                </div>

                {/* Settings */}
                <div className="form-group">
                    <label>⚙️ Pengaturan</label>
                    <div className="settings-toggles">
                        <label className="toggle-row">
                            <input
                                type="checkbox" name="require_verification"
                                checked={form.require_verification} onChange={handleChange}
                            />
                            <Shield size={16} />
                            <div>
                                <span>Verifikasi NIK/KK</span>
                                <small>Wajib input NIK untuk memastikan 1 KK = 1 suara</small>
                            </div>
                        </label>
                        <label className="toggle-row">
                            <input
                                type="checkbox" name="is_anonymous"
                                checked={form.is_anonymous} onChange={handleChange}
                            />
                            <span>🙈</span>
                            <div>
                                <span>Anonim</span>
                                <small>Nama pemilih tidak ditampilkan</small>
                            </div>
                        </label>
                    </div>
                </div>

                <button type="submit" className="btn-submit-poll" disabled={saving}>
                    <Save size={18} />
                    {saving ? 'Membuat...' : 'Buat Polling'}
                </button>
            </form>
        </div>
    );
}
