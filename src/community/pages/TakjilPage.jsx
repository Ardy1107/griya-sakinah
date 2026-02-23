/**
 * Jadwal Program Buka Puasa - Musholla As Sakinah
 * Ramadhan 1447 H / 2026 M
 * Data fetched from Supabase (real-time updates)
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer, Loader2, WifiOff } from 'lucide-react';
import { supabaseMusholla as supabase } from '../../lib/supabaseMusholla';
import './TakjilPage.css';

import ttdSekretaris from '../../assets/signatures/Pak Ardy.jpeg';
import ttdBendahara from '../../assets/signatures/Pak Sandri.jpeg';
import ttdKetua from '../../assets/signatures/Pak Ari.jpeg';

const COLS = ['nasi1', 'nasi2', 'takjil', 'minuman'];
const COL_HEADERS = [
    { key: 'nasi1', emoji: '🍱', label: 'Nasi 1', sub: '(Min. 10 Kotak)' },
    { key: 'nasi2', emoji: '🍱', label: 'Nasi 2', sub: '(Min. 10 Kotak)' },
    { key: 'takjil', emoji: '🧁', label: 'Takjil Kue', sub: '(Min. 40 Pcs/60-80rb)' },
    { key: 'minuman', emoji: '🥤', label: 'Minuman/Es', sub: '(Min. 20 Porsi)' },
];

// Fallback hardcoded data in case Supabase is unavailable
const FALLBACK_DATA = [
    { no: 1, tanggal: 'Kamis, 19 Feb', tanggal_date: '2026-02-19', nasi1_nama: 'Pak Hasyid', nasi1_blok: 'B-1', nasi2_nama: 'Pak Arif', nasi2_blok: 'A-9', takjil_nama: 'Ibu Mariani', takjil_blok: 'B-5', minuman_nama: 'Pak Azzemy', minuman_blok: 'A-4' },
    { no: 2, tanggal: 'Jumat, 20 Feb', tanggal_date: '2026-02-20', nasi1_nama: 'Pak Juliansyah', nasi1_blok: 'B-6', nasi2_nama: 'Pak Alvin', nasi2_blok: 'A-3', takjil_nama: 'Pak Denny S.', takjil_blok: 'B-11', minuman_nama: 'Pak Tarmiji', minuman_blok: 'A-5' },
    { no: 3, tanggal: 'Sabtu, 21 Feb', tanggal_date: '2026-02-21', nasi1_nama: 'Pak Narto', nasi1_blok: 'A-2', nasi2_nama: 'Pak Steven H.', nasi2_blok: 'B-16', takjil_nama: 'Pak Sugianto', takjil_blok: 'A-17', minuman_nama: 'Pak Gilang A.', minuman_blok: 'B-12' },
    { no: 4, tanggal: 'Minggu, 22 Feb', tanggal_date: '2026-02-22', nasi1_nama: 'Pak Ardy', nasi1_blok: 'A-18', nasi2_nama: 'Pak Jumberi', nasi2_blok: 'B-10', takjil_nama: 'Pak Indra', takjil_blok: 'A-6', minuman_nama: "Pak M. Rifa'i", minuman_blok: 'B-8' },
    { no: 5, tanggal: 'Senin, 23 Feb', tanggal_date: '2026-02-23', nasi1_nama: 'Pak Galih', nasi1_blok: 'B-2', nasi2_nama: 'Pak Andy S.W.', nasi2_blok: 'A-16', takjil_nama: 'Pak Fadli', takjil_blok: 'A-1', minuman_nama: 'Pak Alpi', minuman_blok: 'B-3' },
    { no: 6, tanggal: 'Selasa, 24 Feb', tanggal_date: '2026-02-24', nasi1_nama: 'Ust Mujennih', nasi1_blok: 'A-11', nasi2_nama: 'Mama Risky', nasi2_blok: 'Kav', takjil_nama: 'Ibu Kamariah', takjil_blok: 'B-4', minuman_nama: 'Pak Ramadhani', minuman_blok: 'B-7' },
    { no: 7, tanggal: 'Rabu, 25 Feb', tanggal_date: '2026-02-25', nasi1_nama: 'Pak Bagus P.', nasi1_blok: 'B-9', nasi2_nama: 'Pak Ahmad E.', nasi2_blok: 'A-13', takjil_nama: 'Pak Steven H.', takjil_blok: 'B-16', minuman_nama: 'Pak Yudi', minuman_blok: 'A-15' },
    { no: 8, tanggal: 'Kamis, 26 Feb', tanggal_date: '2026-02-26', nasi1_nama: 'Pak Sandri', nasi1_blok: 'A-14', nasi2_nama: 'Pak Ari', nasi2_blok: 'B-20', takjil_nama: 'Pak Nur Rahman', takjil_blok: 'B-17', minuman_nama: 'Pak Fitra', minuman_blok: 'A-12' },
    { no: 9, tanggal: 'Jumat, 27 Feb', tanggal_date: '2026-02-27', nasi1_nama: 'Pak Arpan', nasi1_blok: 'B-19', nasi2_nama: 'Ibu Dwi', nasi2_blok: 'Kav', takjil_nama: 'Pak Rani', takjil_blok: 'Kav', minuman_nama: 'Pak Yadin', minuman_blok: 'Kav' },
    { no: 10, tanggal: 'Sabtu, 28 Feb', tanggal_date: '2026-02-28', nasi1_nama: 'Pak Azzemy', nasi1_blok: 'A-4', nasi2_nama: 'Ibu Mariani', nasi2_blok: 'B-5', takjil_nama: 'Pak Hasyid', takjil_blok: 'B-1', minuman_nama: 'Pak Arif', minuman_blok: 'A-9' },
    { no: 11, tanggal: 'Minggu, 01 Mar', tanggal_date: '2026-03-01', nasi1_nama: 'Pak Denny S.', nasi1_blok: 'B-11', nasi2_nama: 'Pak Tarmiji', nasi2_blok: 'A-5', takjil_nama: 'Pak Juliansyah', takjil_blok: 'B-6', minuman_nama: 'Pak Alvin', minuman_blok: 'A-3' },
    { no: 12, tanggal: 'Senin, 02 Mar', tanggal_date: '2026-03-02', nasi1_nama: 'Pak Sugianto', nasi1_blok: 'A-17', nasi2_nama: 'Pak Gilang A.', nasi2_blok: 'B-12', takjil_nama: 'Pak Narto', takjil_blok: 'A-2', minuman_nama: 'Pak Jumberi', minuman_blok: 'B-10' },
    { no: 13, tanggal: 'Selasa, 03 Mar', tanggal_date: '2026-03-03', nasi1_nama: 'Pak Yadin', nasi1_blok: 'Kav', nasi2_nama: "Pak M. Rifa'i", nasi2_blok: 'B-8', takjil_nama: 'Pakde Loso', takjil_blok: 'Kav', minuman_nama: 'Pak Supriono', minuman_blok: 'Kav' },
    { no: 14, tanggal: 'Rabu, 04 Mar', tanggal_date: '2026-03-04', nasi1_nama: 'Pak Fadli', nasi1_blok: 'A-1', nasi2_nama: 'Pak Alpi', nasi2_blok: 'B-3', takjil_nama: 'Pak Galih', takjil_blok: 'B-2', minuman_nama: 'Pak Andy S.W.', minuman_blok: 'A-16' },
    { no: 15, tanggal: 'Kamis, 05 Mar', tanggal_date: '2026-03-05', nasi1_nama: 'Ibu Kamariah', nasi1_blok: 'B-4', nasi2_nama: 'Pak Ramadhani', nasi2_blok: 'B-7', takjil_nama: 'Ust Mujennih', takjil_blok: 'A-11', minuman_nama: 'Pak Ahmad E.', minuman_blok: 'A-13' },
    { no: 16, tanggal: 'Jumat, 06 Mar', tanggal_date: '2026-03-06', nasi1_nama: 'Pak Yudi', nasi1_blok: 'A-15', nasi2_nama: 'Pak Fitra', nasi2_blok: 'A-12', takjil_nama: 'Pak Bagus P.', takjil_blok: 'B-9', minuman_nama: 'Pak Sandri', minuman_blok: 'A-14' },
    { no: 17, tanggal: 'Sabtu, 07 Mar', tanggal_date: '2026-03-07', nasi1_nama: 'Pak Nur Rahman', nasi1_blok: 'B-17', nasi2_nama: 'Pak Supriono', nasi2_blok: 'Kav', takjil_nama: 'Pak Ardy', takjil_blok: 'A-18', minuman_nama: 'Pak Ari', minuman_blok: 'B-20' },
    { no: 18, tanggal: 'Minggu, 08 Mar', tanggal_date: '2026-03-08', nasi1_nama: 'Ibu Ita', nasi1_blok: 'B-18', nasi2_nama: 'Pak Indra', nasi2_blok: 'A-6', takjil_nama: 'Ibu Dwi', takjil_blok: 'Kav', minuman_nama: 'Pak Hamka', minuman_blok: 'Kav' },
    { no: 19, tanggal: 'Senin, 09 Mar', tanggal_date: '2026-03-09', nasi1_nama: 'Pak M. Fauzi', nasi1_blok: 'B-14', nasi2_nama: 'Pak Rani', nasi2_blok: 'Kav', takjil_nama: 'Pak Pujianto', takjil_blok: 'Kav', minuman_nama: 'Mama Risky', minuman_blok: 'Kav' },
    { no: 20, tanggal: 'Selasa, 10 Mar', tanggal_date: '2026-03-10', nasi1_nama: 'Pakde Loso', nasi1_blok: 'Kav', nasi2_nama: 'Pak Jemi', nasi2_blok: 'Kav', takjil_nama: 'Pak Hamka', takjil_blok: 'Kav', minuman_nama: 'Pak Arpan', minuman_blok: 'B-19' },
    { no: 21, tanggal: 'Rabu, 11 Mar', tanggal_date: '2026-03-11', nasi1_nama: 'Pak Eko', nasi1_blok: 'Donatur', nasi1_donatur: true, nasi2_nama: 'Pak Eko', nasi2_blok: 'Donatur', nasi2_donatur: true, takjil_nama: 'Pak Eko', takjil_blok: 'Donatur', takjil_donatur: true, minuman_nama: 'Pak Eko', minuman_blok: 'Donatur', minuman_donatur: true },
    { no: 22, tanggal: 'Kamis, 12 Mar', tanggal_date: '2026-03-12', nasi1_nama: 'Azzam', nasi1_blok: 'Donatur', nasi1_donatur: true, nasi2_donatur: true, takjil_nama: 'Ibu Ita', takjil_blok: 'B-18', minuman_nama: 'Pak Jemi', minuman_blok: 'Kav' },
    { no: 23, tanggal: 'Jumat, 13 Mar', tanggal_date: '2026-03-13', nasi1_nama: "Pak M. Rifa'i", nasi1_blok: 'B-8', nasi2_donatur: true, takjil_nama: 'Pak Pujianto', takjil_blok: 'Kav', minuman_nama: 'Pak M. Fauzi', minuman_blok: 'B-14' },
    { no: 24, tanggal: 'Sabtu, 14 Mar', tanggal_date: '2026-03-14', nasi1_donatur: true, nasi2_donatur: true, takjil_nama: 'Pak Galih', takjil_blok: 'B-2', minuman_nama: 'Pak Galih', minuman_blok: 'B-2' },
    { no: 25, tanggal: 'Minggu, 15 Mar', tanggal_date: '2026-03-15', nasi1_donatur: true, nasi2_donatur: true, takjil_donatur: true, minuman_donatur: true },
];

function getDateStatus(dateStr) {
    if (!dateStr) return 'future';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + 'T00:00:00');
    if (d < today) return 'past';
    if (d.getTime() === today.getTime()) return 'today';
    return 'future';
}

const TakjilPage = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const todayRef = useRef(null);

    useEffect(() => {
        fetchSchedule();
    }, []);

    // Auto-scroll to today's card after data loads
    useEffect(() => {
        if (!loading && todayRef.current) {
            setTimeout(() => {
                todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, [loading]);

    async function fetchSchedule() {
        try {
            const { data, error } = await supabase
                .from('takjil_schedule')
                .select('*')
                .order('no', { ascending: true });

            if (error) throw error;
            if (data && data.length > 0) {
                setSchedule(data);
                setIsOffline(false);
            } else {
                setSchedule(FALLBACK_DATA);
                setIsOffline(true);
            }
        } catch (err) {
            console.warn('Supabase fetch failed, using fallback:', err.message);
            setSchedule(FALLBACK_DATA);
            setIsOffline(true);
        } finally {
            setLoading(false);
        }
    }

    const renderCell = (row, col) => {
        const nama = row[`${col}_nama`];
        const blok = row[`${col}_blok`];
        const isDone = row[`${col}_done`];
        const status = getDateStatus(row.tanggal_date);

        const colHeader = COL_HEADERS.find(h => h.key === col);
        const label = colHeader ? colHeader.label : col;
        const emoji = colHeader ? colHeader.emoji : '';

        if (!nama || nama === '-') return <td className="empty-cell" data-label={label}>-</td>;

        return (
            <td className={isDone ? 'cell-done' : ''} data-label={label}>
                <span className="cell-label-mobile">
                    <span className="cell-emoji">{emoji}</span>
                    <span className="cell-label-text">{label}</span>
                </span>
                <span className="cell-value-mobile">
                    <span className={`donor-name ${status === 'past' ? 'past-name' : ''}`}>{nama}</span>
                    <span className="blok-pill">{blok}</span>
                    {status === 'past' && isDone && <span className="done-icon">✅</span>}
                </span>
            </td>
        );
    };

    if (loading) {
        return (
            <div className="takjil-page loading-page">
                <div className="loading-spinner">
                    <Loader2 size={40} className="spin" />
                    <p>Memuat jadwal...</p>
                </div>
            </div>
        );
    }

    // Insert dividers between weeks
    const withDividers = [];
    schedule.forEach((row, i) => {
        withDividers.push(row);
        if (row.no === 9 || row.no === 20) {
            withDividers.push({ _divider: true, _key: `div-${i}` });
        }
    });

    return (
        <div className="takjil-page">
            {/* Navigation - hidden, page accessed via direct link */}

            {isOffline && (
                <div className="offline-banner no-print">
                    <WifiOff size={16} /> Data offline — menampilkan jadwal lokal
                </div>
            )}

            {/* Content */}
            <div className="schedule-content">
                <header className="schedule-header">
                    <h1>🌙 JADWAL PROGRAM BUKA PUASA 🌙</h1>
                    <p>Musholla As Sakinah - Ramadhan 1447 H / 2026 M</p>
                </header>

                {/* Rules Box */}
                <div className="rules-box">
                    <h3>📋 KETENTUAN KONSUMSI & SISTEM ROLLING:</h3>
                    <div className="rules-grid">
                        <div>🍱 <strong>Nasi 1 & 2:</strong> Min. 10 Kotak <em>(Boleh lebih)</em></div>
                        <div>🧁 <strong>Takjil Kue:</strong> Min. 40 Pcs / Senilai Rp 60rb - 80rb <em>(Boleh lebih)</em></div>
                        <div>🥤 <strong>Minuman/Es:</strong> Min. 20 Porsi <em>(Boleh lebih)</em></div>
                        <div>🔄 <strong>Sistem Rolling:</strong> Tiap KK max 2x giliran secara acak.</div>
                    </div>
                </div>

                {/* Legend */}
                <div className="legend no-print">
                    <span className="legend-past">✅ Sudah lewat</span>
                    <span className="legend-today">📍 Hari ini</span>
                    <span className="legend-future">⏳ Akan datang</span>
                </div>

                {/* Schedule Table */}
                <div className="table-wrapper">
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th style={{ width: '4%' }}>NO</th>
                                <th style={{ width: '14%' }}>TANGGAL</th>
                                {COL_HEADERS.map(h => (
                                    <th key={h.key} style={{ width: '20.5%' }}>
                                        {h.emoji} {h.label}<br /><small>{h.sub}</small>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {withDividers.map((row) => {
                                if (row._divider) {
                                    return <tr key={row._key} className="divider-row"><td colSpan="6"></td></tr>;
                                }
                                const status = getDateStatus(row.tanggal_date);
                                return (
                                    <tr key={row.no} className={`row-${status}`} ref={status === 'today' ? todayRef : null}>
                                        <td className="no-cell" data-label="NO">{row.no}</td>
                                        <td className="date-cell" data-label="TANGGAL">
                                            {row.tanggal}
                                            {status === 'past' && <span className="status-badge past-badge">✅ Sudah lewat</span>}
                                            {status === 'today' && <span className="status-badge today-badge">📍 Hari ini</span>}
                                            {status === 'future' && <span className="status-badge future-badge">⏳ Akan datang</span>}
                                        </td>
                                        {COLS.map(col => renderCell(row, col))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Info Box */}
                <div className="info-box">
                    <h3>📢 INFORMASI</h3>
                    <p>Bagi warga yang belum terdaftar, silahkan hubungi panitia untuk bergabung sebagai donatur buka puasa bersama. Jazakumullahu khairan.</p>
                </div>

                {/* Signatures */}
                <div className="signatures">
                    <div className="sig-item">
                        <p className="sig-title">Sekretaris Panitia</p>
                        <img src={ttdSekretaris} alt="TTD Sekretaris" className="sig-img" />
                        <p className="sig-name">ARDYANTO PRI UTOMO</p>
                    </div>
                    <div className="sig-item">
                        <p className="sig-title">Bendahara Panitia</p>
                        <img src={ttdBendahara} alt="TTD Bendahara" className="sig-img" />
                        <p className="sig-name">SANDRIA KURNIANTO</p>
                    </div>
                    <div className="sig-item">
                        <p className="sig-title">Ketua Panitia</p>
                        <img src={ttdKetua} alt="TTD Ketua" className="sig-img" />
                        <p className="sig-name">DESMON ARI MARHAENI</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakjilPage;
