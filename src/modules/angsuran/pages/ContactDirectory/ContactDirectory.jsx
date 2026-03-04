import { useState, useEffect } from 'react';
import { getUnitsSync as getUnits } from '../../utils/database';
import { formatPhone, formatWhatsAppUrl } from '../../utils/format';
import { Search, Phone, MessageCircle, MapPin, User, Users } from 'lucide-react';
import './ContactDirectory.css';

const ContactDirectory = () => {
    const [units, setUnits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBlock, setFilterBlock] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getUnits();
                setUnits(data || []);
            } catch (err) {
                if (import.meta.env.DEV) console.error('Error loading contacts:', err);
                setUnits([]);
            }
        };
        load();
    }, []);

    const filtered = units.filter(u => {
        const matchSearch = u.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.blockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.phone?.includes(searchTerm);
        const matchBlock = filterBlock === 'all' || u.blockNumber.startsWith(filterBlock);
        return matchSearch && matchBlock;
    });

    const blocks = [...new Set(units.map(u => u.blockNumber.charAt(0)))].sort();

    return (
        <div className="contact-directory-page">
            <div className="page-header">
                <div>
                    <h1>📞 Kontak Warga</h1>
                    <p>Direktori kontak semua penghuni Griya Sakinah</p>
                </div>
                <div className="total-badge"><Users size={18} /> {units.length} warga</div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="search-box"><Search size={20} />
                    <input type="text" placeholder="Cari nama, blok, atau nomor HP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="block-filters">
                    <button className={`block-chip ${filterBlock === 'all' ? 'active' : ''}`} onClick={() => setFilterBlock('all')}>Semua</button>
                    {blocks.map(b => (
                        <button key={b} className={`block-chip ${filterBlock === b ? 'active' : ''}`} onClick={() => setFilterBlock(b)}>
                            Blok {b}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contact Cards */}
            <div className="contacts-grid">
                {filtered.map(unit => (
                    <div key={unit.id} className="contact-card">
                        <div className="contact-avatar">
                            <User size={24} />
                        </div>
                        <div className="contact-info">
                            <h4>{unit.residentName}</h4>
                            <div className="contact-meta">
                                <span><MapPin size={14} /> {unit.blockNumber}</span>
                                <span><Phone size={14} /> {unit.phone || '-'}</span>
                            </div>
                        </div>
                        <div className="contact-actions">
                            {unit.phone && (
                                <>
                                    <a href={`tel:${unit.phone}`} className="contact-btn call" title="Telepon"><Phone size={16} /></a>
                                    <a href={formatWhatsAppUrl(unit.phone, `Halo ${unit.residentName} (Blok ${unit.blockNumber}),`)}
                                        target="_blank" rel="noopener noreferrer"
                                        className="contact-btn wa" title="WhatsApp">
                                        <MessageCircle size={16} />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="empty-state"><Users size={64} /><h3>Tidak ada kontak ditemukan</h3><p>Coba ubah kata kunci pencarian</p></div>
            )}
        </div>
    );
};

export default ContactDirectory;
