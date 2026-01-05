import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Heart, Download, Share2, CheckCircle, User, Phone, Home, Search, Users } from 'lucide-react';
import { Button, LoadingSpinner, RankBadge } from '../../components/ui';
import { PremiumMonthPicker, PremiumSearchBox, PremiumModal, PremiumInput, PremiumButton } from '../../components/PremiumComponents';
import { formatRupiah, formatDate, generateReferenceNumber, formatWhatsAppNumber, generateWhatsAppLink, parseCurrency } from '../../lib/utils';
import { getDonations, getDonors, createDonor, createDonation, getNextDonationSequence, searchDonors } from '../../lib/supabase';
import { generateReceiptPDF } from '../../lib/pdf';

export default function DonationsPage() {
    const context = useOutletContext() || {};
    const darkMode = context.darkMode ?? true;
    const colors = context.colors || {
        text: darkMode ? '#ffffff' : '#1f2937',
        textSecondary: darkMode ? 'rgba(255,255,255,0.8)' : '#374151',
        textMuted: darkMode ? 'rgba(255,255,255,0.5)' : '#6b7280',
        cardBg: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)',
        cardBorder: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        greenText: darkMode ? '#34D399' : '#059669',
        roseText: darkMode ? '#FB7185' : '#E11D48'
    };

    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(-1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1); // 1=select donor, 2=input donation, 3=success

    // Donor selection
    const [donorSearch, setDonorSearch] = useState('');
    const [donorResults, setDonorResults] = useState([]);
    const [searchingDonors, setSearchingDonors] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [isNewDonor, setIsNewDonor] = useState(false);

    // Form
    const [form, setForm] = useState({
        nama: '',
        blok_rumah: '',
        no_hp: '',
        nominal: '',
        metode: 'Transfer',
        keterangan: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Success data
    const [successData, setSuccessData] = useState(null);

    useEffect(() => {
        loadDonations();
    }, [selectedMonth, selectedYear]);

    async function loadDonations() {
        setLoading(true);
        try {
            const { data } = await getDonations();
            setDonations(data || []);
        } catch (error) {
            console.error('Error loading donations:', error);
        } finally {
            setLoading(false);
        }
    }

    // Filter donations
    const filteredDonations = donations.filter(d => {
        // Month/Year filter
        if (selectedMonth !== -1) {
            const date = new Date(d.tanggal_bayar);
            if (date.getMonth() !== selectedMonth || date.getFullYear() !== selectedYear) {
                return false;
            }
        } else if (selectedYear) {
            const date = new Date(d.tanggal_bayar);
            if (date.getFullYear() !== selectedYear) {
                return false;
            }
        }

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchNama = d.mush_donors?.nama?.toLowerCase().includes(q);
            const matchRef = d.nomor_referensi?.toLowerCase().includes(q);
            if (!matchNama && !matchRef) return false;
        }

        return true;
    });

    // Donor search with debounce
    useEffect(() => {
        if (!donorSearch.trim()) {
            setDonorResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearchingDonors(true);
            try {
                const { data } = await searchDonors(donorSearch);
                setDonorResults(data || []);
            } catch (error) {
                console.error('Error searching donors:', error);
            } finally {
                setSearchingDonors(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [donorSearch]);

    function selectDonor(donor) {
        setSelectedDonor(donor);
        setIsNewDonor(false);
        setForm(prev => ({
            ...prev,
            nama: donor.nama,
            blok_rumah: donor.blok_rumah || '',
            no_hp: donor.no_hp || ''
        }));
        setModalStep(2);
    }

    function startNewDonor() {
        setSelectedDonor(null);
        setIsNewDonor(true);
        setForm({
            nama: donorSearch,
            blok_rumah: '',
            no_hp: '',
            nominal: '',
            metode: 'Transfer',
            keterangan: ''
        });
        setModalStep(2);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const nominal = parseCurrency(form.nominal);
        if (!nominal || nominal <= 0) {
            alert('Masukkan nominal yang valid');
            return;
        }

        if (!form.nama.trim()) {
            alert('Nama donatur wajib diisi');
            return;
        }

        setSubmitting(true);

        try {
            let donorId = selectedDonor?.id;

            // Create new donor if needed
            if (isNewDonor) {
                const { data: newDonor, error: donorError } = await createDonor({
                    nama: form.nama.trim(),
                    blok_rumah: form.blok_rumah.trim() || null,
                    no_hp: form.no_hp.trim() || null
                });

                if (donorError) throw donorError;
                donorId = newDonor.id;
            }

            // Get sequence and generate reference
            const sequence = await getNextDonationSequence();
            const nomorReferensi = generateReferenceNumber(sequence);

            // Create donation
            const { data: donation, error } = await createDonation({
                donor_id: donorId,
                nominal: nominal,
                tanggal_bayar: new Date().toISOString(),
                metode_bayar: form.metode,
                nomor_referensi: nomorReferensi,
                keterangan: form.keterangan.trim() || null
            });

            if (error) throw error;

            // Set success data
            setSuccessData({
                ...donation,
                mush_donors: {
                    nama: form.nama,
                    blok_rumah: form.blok_rumah,
                    no_hp: form.no_hp
                }
            });

            setModalStep(3);
            loadDonations();

        } catch (error) {
            console.error('Error creating donation:', error);
            alert('Gagal menyimpan: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    }

    function closeModal() {
        setShowModal(false);
        setModalStep(1);
        setDonorSearch('');
        setDonorResults([]);
        setSelectedDonor(null);
        setIsNewDonor(false);
        setSuccessData(null);
        setForm({
            nama: '',
            blok_rumah: '',
            no_hp: '',
            nominal: '',
            metode: 'Transfer',
            keterangan: ''
        });
    }

    async function handleDownloadReceipt() {
        if (!successData) return;
        try {
            const doc = generateReceiptPDF(
                {
                    nomor_referensi: successData.nomor_referensi,
                    tanggal_bayar: successData.tanggal_bayar,
                    nominal: successData.nominal,
                    metode_bayar: successData.metode_bayar,
                    kategori_pembayaran: 'tunai'
                },
                {
                    nama: successData.mush_donors?.nama,
                    blok_rumah: successData.mush_donors?.blok_rumah,
                    no_telp: successData.mush_donors?.no_hp
                }
            );
            doc.save(`Kwitansi-${successData.nomor_referensi}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Gagal generate PDF');
        }
    }

    function handleWhatsApp() {
        if (!successData) return;
        const phone = formatWhatsAppNumber(successData.mush_donors?.no_hp);
        if (!phone) {
            alert('Nomor HP tidak tersedia');
            return;
        }
        const message = `Assalamu'alaikum ${successData.mush_donors?.nama},\n\nTerima kasih atas donasinya untuk pembangunan Musholla As-Sakinah.\n\n📋 No. Kwitansi: ${successData.nomor_referensi}\n💰 Nominal: ${formatRupiah(successData.nominal)}\n📅 Tanggal: ${formatDate(successData.tanggal_bayar)}\n\nJazakumullahu khairan katsira 🤲`;
        window.open(generateWhatsAppLink(phone, message), '_blank');
    }

    // Card style helper
    const cardStyle = {
        background: colors.cardBg,
        borderRadius: '20px',
        border: `1px solid ${colors.cardBorder}`,
        padding: '24px',
        boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(10px)'
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 900,
                        color: colors.text,
                        marginBottom: '4px'
                    }}>
                        Manajemen Donasi
                    </h1>
                    <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                        Kelola data donasi masuk
                    </p>
                </div>
                <PremiumButton onClick={() => setShowModal(true)} darkMode={darkMode}>
                    <Plus size={20} />
                    Input Donasi Baru
                </PremiumButton>
            </div>

            {/* Filters Card */}
            <div style={{ ...cardStyle, marginBottom: '24px', padding: '16px' }}>
                <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
                    <PremiumSearchBox
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Cari nama donatur atau nomor referensi..."
                        darkMode={darkMode}
                    />
                </div>
            </div>

            {/* Month Picker */}
            <div style={{ marginBottom: '24px' }}>
                <PremiumMonthPicker
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={setSelectedMonth}
                    onYearChange={setSelectedYear}
                    darkMode={darkMode}
                    minYear={2025}
                />
            </div>

            {/* Donations Table */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="flex justify-center items-center" style={{ padding: '60px' }}>
                        <LoadingSpinner size={40} />
                    </div>
                ) : filteredDonations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <Heart size={48} style={{ color: colors.textMuted, marginBottom: '16px' }} />
                        <h3 style={{ fontWeight: 700, color: colors.text, marginBottom: '8px' }}>
                            Belum ada donasi
                        </h3>
                        <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                            {searchQuery ? 'Tidak ada hasil untuk pencarian ini' : 'Klik "Input Donasi Baru" untuk menambah'}
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)' }}>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: colors.textMuted }}>Donatur</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: colors.textMuted }}>No. Referensi</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: colors.textMuted }}>Tanggal</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: colors.textMuted }}>Metode</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: colors.textMuted }}>Nominal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDonations.map(d => (
                                    <tr key={d.id} style={{ borderBottom: `1px solid ${colors.cardBorder}` }}>
                                        <td style={{ padding: '18px 20px' }}>
                                            <p style={{ fontWeight: 600, color: colors.text }}>{d.mush_donors?.nama || 'Anonim'}</p>
                                            <p style={{ fontSize: '12px', color: colors.textMuted }}>{d.mush_donors?.blok_rumah || '-'}</p>
                                        </td>
                                        <td style={{ padding: '18px 20px' }}>
                                            <code style={{ fontSize: '13px', color: colors.greenText, fontWeight: 600 }}>{d.nomor_referensi}</code>
                                        </td>
                                        <td style={{ padding: '18px 20px', color: colors.textSecondary }}>
                                            {formatDate(d.tanggal_bayar)}
                                        </td>
                                        <td style={{ padding: '18px 20px' }}>
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                background: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                                                color: colors.greenText
                                            }}>
                                                {d.metode_bayar}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                                            <span style={{ fontWeight: 800, fontSize: '15px', color: colors.greenText }}>
                                                +{formatRupiah(d.nominal)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            <PremiumModal
                isOpen={showModal}
                onClose={closeModal}
                title={modalStep === 3 ? '✅ Donasi Berhasil!' : modalStep === 2 ? '📝 Input Donasi' : 'Pilih Donatur'}
                subtitle={modalStep === 1 ? 'Cari donatur atau tambah baru' : modalStep === 2 ? `Donatur: ${form.nama}` : null}
                size="md"
                darkMode={darkMode}
            >
                {/* Step 1: Select Donor */}
                {modalStep === 1 && (
                    <div>
                        <PremiumInput
                            label="Cari Donatur"
                            value={donorSearch}
                            onChange={setDonorSearch}
                            placeholder="Ketik nama donatur..."
                            darkMode={darkMode}
                        />

                        {searchingDonors && (
                            <div className="flex justify-center" style={{ padding: '20px' }}>
                                <LoadingSpinner size={24} />
                            </div>
                        )}

                        {donorResults.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px', textTransform: 'uppercase', fontWeight: 600 }}>
                                    Hasil Pencarian
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {donorResults.map(donor => (
                                        <button
                                            key={donor.id}
                                            onClick={() => selectDonor(donor)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '14px 16px',
                                                borderRadius: '14px',
                                                border: `1px solid ${colors.cardBorder}`,
                                                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 12,
                                                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <User size={18} style={{ color: colors.textMuted }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 600, color: colors.text }}>{donor.nama}</p>
                                                <p style={{ fontSize: '13px', color: colors.textMuted }}>{donor.blok_rumah || 'Umum'}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {donorSearch.trim() && !searchingDonors && (
                            <PremiumButton
                                onClick={startNewDonor}
                                variant="outline"
                                fullWidth
                                darkMode={darkMode}
                            >
                                <Plus size={18} />
                                Tambah Donatur Baru "{donorSearch}"
                            </PremiumButton>
                        )}

                        {!donorSearch.trim() && (
                            <div style={{ textAlign: 'center', padding: '32px', color: colors.textMuted }}>
                                <Users size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p>Ketik nama untuk mencari donatur</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Input Form */}
                {modalStep === 2 && (
                    <form onSubmit={handleSubmit}>
                        {/* Donor Info Display */}
                        <div style={{
                            padding: '16px',
                            borderRadius: '14px',
                            background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                            border: `1px solid ${colors.greenText}30`,
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: 'linear-gradient(135deg, #059669, #10B981)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <User size={20} color="white" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: colors.text }}>{form.nama}</p>
                                <p style={{ fontSize: '13px', color: colors.textMuted }}>
                                    {isNewDonor ? '(Donatur Baru)' : (selectedDonor?.blok_rumah || 'Umum')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalStep(1)}
                                style={{
                                    marginLeft: 'auto',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                    color: colors.text,
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Ganti
                            </button>
                        </div>

                        {/* New Donor Fields */}
                        {isNewDonor && (
                            <>
                                <PremiumInput
                                    label="Nama Lengkap"
                                    value={form.nama}
                                    onChange={v => setForm(p => ({ ...p, nama: v }))}
                                    placeholder="Nama donatur"
                                    required
                                    darkMode={darkMode}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <PremiumInput
                                        label="Blok Rumah"
                                        value={form.blok_rumah}
                                        onChange={v => setForm(p => ({ ...p, blok_rumah: v }))}
                                        placeholder="A1, B2, dll"
                                        darkMode={darkMode}
                                    />
                                    <PremiumInput
                                        label="No. HP"
                                        value={form.no_hp}
                                        onChange={v => setForm(p => ({ ...p, no_hp: v }))}
                                        placeholder="08xxxxxxxxxx"
                                        darkMode={darkMode}
                                    />
                                </div>
                            </>
                        )}

                        {/* Donation Fields */}
                        <PremiumInput
                            label="Nominal Donasi"
                            value={form.nominal}
                            onChange={v => {
                                // Format as currency
                                const num = v.replace(/\D/g, '');
                                setForm(p => ({ ...p, nominal: num ? parseInt(num).toLocaleString('id-ID') : '' }));
                            }}
                            placeholder="100.000"
                            prefix="Rp"
                            required
                            darkMode={darkMode}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: darkMode ? 'rgba(255,255,255,0.7)' : '#374151',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Metode Bayar
                                </label>
                                <select
                                    value={form.metode}
                                    onChange={e => setForm(p => ({ ...p, metode: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        borderRadius: '14px',
                                        border: `2px solid ${darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                                        background: darkMode ? 'rgba(0,0,0,0.3)' : '#ffffff',
                                        color: colors.text,
                                        fontSize: '15px',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="Transfer">Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="QRIS">QRIS</option>
                                </select>
                            </div>
                        </div>

                        <PremiumInput
                            label="Keterangan (Opsional)"
                            value={form.keterangan}
                            onChange={v => setForm(p => ({ ...p, keterangan: v }))}
                            placeholder="Catatan tambahan..."
                            darkMode={darkMode}
                        />

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <PremiumButton
                                type="button"
                                variant="secondary"
                                onClick={() => setModalStep(1)}
                                darkMode={darkMode}
                            >
                                Kembali
                            </PremiumButton>
                            <PremiumButton
                                type="submit"
                                loading={submitting}
                                disabled={!form.nominal || !form.nama.trim()}
                                fullWidth
                                darkMode={darkMode}
                            >
                                <CheckCircle size={18} />
                                Simpan Donasi
                            </PremiumButton>
                        </div>
                    </form>
                )}

                {/* Step 3: Success */}
                {modalStep === 3 && successData && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: 24,
                            background: 'linear-gradient(135deg, #059669, #10B981)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
                        }}>
                            <CheckCircle size={40} color="white" />
                        </div>

                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: colors.text, marginBottom: '8px' }}>
                            Donasi Tersimpan!
                        </h3>
                        <p style={{ color: colors.textMuted, marginBottom: '24px' }}>
                            Jazakumullahu khairan katsira 🤲
                        </p>

                        {/* Receipt Info */}
                        <div style={{
                            padding: '20px',
                            borderRadius: '16px',
                            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            marginBottom: '24px',
                            textAlign: 'left'
                        }}>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div className="flex justify-between">
                                    <span style={{ color: colors.textMuted }}>No. Referensi</span>
                                    <code style={{ fontWeight: 700, color: colors.greenText }}>{successData.nomor_referensi}</code>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: colors.textMuted }}>Donatur</span>
                                    <span style={{ fontWeight: 600, color: colors.text }}>{successData.mush_donors?.nama}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: colors.textMuted }}>Nominal</span>
                                    <span style={{ fontWeight: 800, fontSize: '18px', color: colors.greenText }}>
                                        {formatRupiah(successData.nominal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <PremiumButton
                                onClick={handleDownloadReceipt}
                                variant="outline"
                                fullWidth
                                darkMode={darkMode}
                            >
                                <Download size={18} />
                                Download PDF
                            </PremiumButton>
                            <button
                                onClick={handleWhatsApp}
                                style={{
                                    flex: 1,
                                    padding: '14px 24px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)'
                                }}
                            >
                                <Share2 size={18} />
                                WhatsApp
                            </button>
                        </div>

                        <button
                            onClick={closeModal}
                            style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: 'none',
                                border: 'none',
                                color: colors.textMuted,
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 500
                            }}
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </PremiumModal>
        </div>
    );
}
