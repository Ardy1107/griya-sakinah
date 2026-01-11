import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Save } from 'lucide-react';

export default function MuhasabahJournal() {
    const [journal, setJournal] = useState({
        dosa_hari_ini: '',
        orang_yang_disakiti: '',
        kebaikan_dilakukan: '',
        perbaikan_besok: '',
        catatan_bebas: ''
    });
    const [saved, setSaved] = useState(false);

    const handleChange = (field, value) => {
        setJournal(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        // Save to database
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const questions = [
        {
            field: 'dosa_hari_ini',
            label: 'Apa dosa yang saya lakukan hari ini?',
            placeholder: 'Refleksikan kesalahan hari ini...'
        },
        {
            field: 'orang_yang_disakiti',
            label: 'Siapa yang saya sakiti hari ini?',
            placeholder: 'Nama orang dan bagaimana...'
        },
        {
            field: 'kebaikan_dilakukan',
            label: 'Apa kebaikan yang sudah saya lakukan?',
            placeholder: 'Tuliskan kebaikan hari ini...'
        },
        {
            field: 'perbaikan_besok',
            label: 'Apa yang bisa saya perbaiki besok?',
            placeholder: 'Komitmen perbaikan diri...'
        },
        {
            field: 'catatan_bebas',
            label: 'Catatan Bebas',
            placeholder: 'Tulisan bebas lainnya...'
        },
    ];

    return (
        <div className="spiritual-container">
            <Link to="/spiritual" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali ke Dashboard
            </Link>

            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <div>
                    <h1>
                        <Search size={28} />
                        Muhasabah
                    </h1>
                    <p className="subtitle">Refleksi Diri & Jurnal Malam</p>
                </div>
            </div>

            <div className="spiritual-card" style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--spiritual-text-muted)', fontStyle: 'italic' }}>
                    "Hisablah dirimu sebelum engkau dihisab, dan timbanglah amalmu sebelum ia ditimbang." - Umar bin Khattab
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questions.map(q => (
                    <div key={q.field} className="spiritual-card">
                        <label className="spiritual-label" style={{ marginBottom: '12px', display: 'block' }}>
                            {q.label}
                        </label>
                        <textarea
                            className="spiritual-textarea"
                            placeholder={q.placeholder}
                            value={journal[q.field]}
                            onChange={(e) => handleChange(q.field, e.target.value)}
                            rows={3}
                        />
                    </div>
                ))}
            </div>

            <button
                className="spiritual-btn spiritual-btn-primary"
                style={{ width: '100%', marginTop: '24px' }}
                onClick={handleSave}
            >
                <Save size={18} />
                {saved ? 'Tersimpan! ✓' : 'Simpan Muhasabah'}
            </button>
        </div>
    );
}
