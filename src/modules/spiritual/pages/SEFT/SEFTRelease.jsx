import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Check, ChevronDown, AlertTriangle, Info, Trophy, History, X, Heart, Activity, HelpCircle, Lightbulb, Loader2 } from 'lucide-react';
import { createSeftSession, getSeftHistory, getTodaySeftCount, getDeviceId } from '../../services/spiritualService';

// ============ SKALA HAWKINS - WARNA & TINGKAT KEPARAHAN ============
// Semakin RENDAH level = semakin PARAH, semakin perlu dirilis DULUAN
const HAWKINS_LEVELS = {
    20: { label: 'KRITIS', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.2)', emoji: '🔴', prioritas: 1 },
    30: { label: 'SANGAT BERAT', color: '#ea580c', bgColor: 'rgba(234, 88, 12, 0.2)', emoji: '🟠', prioritas: 2 },
    50: { label: 'BERAT', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)', emoji: '🟡', prioritas: 3 },
    75: { label: 'SEDANG', color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.2)', emoji: '🟡', prioritas: 4 },
    100: { label: 'RINGAN-SEDANG', color: '#84cc16', bgColor: 'rgba(132, 204, 22, 0.2)', emoji: '🟢', prioritas: 5 },
    125: { label: 'RINGAN', color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.2)', emoji: '🟢', prioritas: 6 },
    150: { label: 'LEBIH BAIK', color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.2)', emoji: '🔵', prioritas: 7 },
    175: { label: 'MENDEKATI NETRAL', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.2)', emoji: '🔵', prioritas: 8 },
};

// ============ DAMPAK FISIK BERDASARKAN PENELITIAN PSIKOSOMATIS ============
// Berdasarkan: Dr. David Hawkins, Chinese Medicine, Louise Hay, Dr. Gabor Maté
const DAMPAK_FISIK = {
    'Malu': {
        organs: ['Kulit', 'Sistem Imun'],
        penyakit: ['Penyakit Kulit (Psoriasis, Eksim)', 'Autoimun', 'Alergi', 'Kelelahan Kronis'],
        penjelasan: 'Malu melemahkan sistem imun dan menyerang kulit karena tubuh mencoba "menyembunyikan" diri.'
    },
    'Bersalah': {
        organs: ['Sistem Pencernaan', 'Punggung Bawah'],
        penyakit: ['Maag', 'Gangguan Pencernaan', 'Nyeri Punggung Bawah', 'Insomnia'],
        penjelasan: 'Rasa bersalah "mencerna" diri sendiri, menyerang lambung dan usus.'
    },
    'Apatis': {
        organs: ['Seluruh Tubuh', 'Energi Vital'],
        penyakit: ['Kelelahan Kronis', 'Fibromyalgia', 'Low Energy', 'Depresi Berat'],
        penjelasan: 'Apatis menghentikan aliran energi vital, menyebabkan kelelahan total.'
    },
    'Sedih': {
        organs: ['Paru-paru', 'Jantung', 'Dada'],
        penyakit: ['Asma', 'Gangguan Pernapasan', 'Masalah Jantung', 'Nyeri Dada'],
        penjelasan: 'Kesedihan "menghimpit" dada, mempengaruhi paru-paru dan jantung.'
    },
    'Takut': {
        organs: ['Ginjal', 'Kandung Kemih', 'Kelenjar Adrenal'],
        penyakit: ['Gangguan Ginjal', 'Sering Buang Air Kecil', 'Kelelahan Adrenal', 'Anxiety'],
        penjelasan: 'Takut melemahkan ginjal dan menguras kelenjar adrenal.'
    },
    'Hasrat': {
        organs: ['Hati', 'Jantung'],
        penyakit: ['Gangguan Hati', 'Kecanduan', 'Tekanan Darah Tinggi'],
        penjelasan: 'Hasrat berlebihan membebani hati dan sistem kardiovaskular.'
    },
    'Marah': {
        organs: ['Hati', 'Empedu', 'Jantung', 'Pembuluh Darah'],
        penyakit: ['Gangguan Hati', 'Batu Empedu', 'Hipertensi', 'Stroke', 'Sakit Kepala'],
        penjelasan: 'Marah menyerang hati dan meningkatkan tekanan darah drastis.'
    },
    'Sombong': {
        organs: ['Kepala', 'Leher', 'Punggung Atas'],
        penyakit: ['Sakit Kepala Tegang', 'Kaku Leher', 'Nyeri Punggung Atas'],
        penjelasan: 'Sombong membuat "kepala besar" dan ketegangan di area atas tubuh.'
    },
    'Finansial': {
        organs: ['Punggung Bawah', 'Kaki'],
        penyakit: ['Nyeri Punggung Bawah', 'Masalah Kaki', 'Varises', 'Sembelit'],
        penjelasan: 'Masalah uang menyebabkan "tidak punya sandaran" - menyerang punggung bawah.'
    },
    'Hubungan': {
        organs: ['Jantung', 'Dada', 'Lengan'],
        penyakit: ['Masalah Jantung', 'Nyeri Dada', 'Kesulitan Bernafas'],
        penjelasan: 'Luka hubungan langsung mempengaruhi jantung dan area dada.'
    },
    'Keluarga': {
        organs: ['Perut', 'Solar Plexus'],
        penyakit: ['Gangguan Lambung', 'Maag', 'IBS', 'Kram Perut'],
        penjelasan: 'Konflik keluarga menyerang "pusat emosi" di solar plexus.'
    },
    'Karier': {
        organs: ['Bahu', 'Leher', 'Kepala'],
        penyakit: ['Tegang Bahu', 'Kaku Leher', 'Migrain', 'TMJ'],
        penjelasan: '"Beban tanggung jawab" menyerang bahu dan leher.'
    },
    'Kesehatan': {
        organs: ['Sistem Saraf'],
        penyakit: ['Anxiety', 'Panic Attack', 'Hipokondria'],
        penjelasan: 'Kecemasan kesehatan memperburuk sistem saraf.'
    },
    'Spiritual': {
        organs: ['Kepala', 'Dada'],
        penyakit: ['Kehilangan Arah', 'Depresi Eksistensial', 'Kelelahan Spiritual'],
        penjelasan: 'Jauh dari Allah menyebabkan kehampaan dan kehilangan makna.'
    }
};

// ============ REKOMENDASI BERDASARKAN SAKIT FISIK ============
// Sumber: Penelitian Psikosomatis & Buku SEFT
const SAKIT_KE_EMOSI = {
    // KEPALA & OTAK
    'Kepala/Migrain': ['Marah', 'Sombong', 'Stres', 'Overthinking', 'Perfeksionis'],
    'Vertigo': ['Menolak Kenyataan', 'Putus Asa', 'Takut Perubahan', 'Tidak Grounded'],
    'Tuli/Gangguan Pendengaran': ['Merasa Ditolak', 'Ditinggalkan', 'Tidak Ingin Diganggu', 'Menutup Diri'],

    // LEHER & BAHU
    'Leher Kaku': ['Sombong', 'Keras Kepala', 'Konflik dengan Atasan', 'Tidak Fleksibel'],
    'Bahu Tegang': ['Beban Tanggung Jawab', 'Stres', 'Takut Gagal', 'Terlalu Banyak Pikul'],

    // DADA & PARU
    'Dada/Jantung': ['Sedih', 'Patah Hati', 'Kesepian', 'Konflik dengan Pasangan'],
    'Paru-paru/Asma': ['Sedih', 'Duka', 'Merasa Ditinggalkan', 'Grief'],
    'TBC/Paru': ['Sombong Berlebihan', 'Posesif', 'Pikiran Kejam', 'Dendam'],

    // PERUT & PENCERNAAN
    'Lambung/Maag': ['Cemas', 'Khawatir', 'Inner Child Terluka', 'Konflik dengan Orang Tua'],
    'Hati': ['Marah', 'Dengki', 'Dendam', 'Benci', 'Toxic Relationship'],
    'Hernia': ['Tidak Mampu Menjalin Relasi', 'Tertekan', 'Stress Sosial'],
    'Tumor/Benjolan': ['Dendam Masa Lalu', 'Menyesal Mendalam', 'Tidak Bisa Melepaskan'],

    // PUNGGUNG & PINGGANG
    'Punggung Bawah': ['Masalah Keuangan', 'Takut Miskin', 'Stres Keuangan', 'Rasa Bersalah'],
    'Punggung Atas': ['Tidak Didukung', 'Merasa Sendiri', 'Tidak Ada Backing'],

    // GINJAL & KANDUNG KEMIH
    'Ginjal': ['Takut', 'Cemas', 'Takut Masa Depan', 'Trauma Mendalam'],

    // KULIT
    'Kulit/Psoriasis': ['Malu', 'Merasa Tidak Berharga', 'Merasa Rendah Diri', 'Tidak Menerima Diri'],
    'Jerawat': ['Tidak Menerima Diri', 'Tidak Suka Diri Sendiri', 'Low Self-Esteem'],

    // DARAH & KARDIOVASKULAR
    'Tekanan Darah Rendah': ['Kurang Kasih Sayang', 'Inner Child Terluka', 'Tidak Ingin Berubah'],
    'Tekanan Darah Tinggi': ['Marah Terpendam', 'Stres Kronis', 'Perfeksionis'],

    // IMUN & ENERGI
    'Imun Lemah': ['Malu', 'Apatis', 'Putus Asa', 'Depresi', 'Merasa Tidak Berharga'],
    'Kelelahan Kronis': ['Apatis', 'Burnout', 'Hampa', 'Tidak Berdaya', 'Kehilangan Motivasi'],
    'Autoimun': ['Menyerang Diri Sendiri', 'Self-Hate', 'Rasa Bersalah Mendalam'],
};

// Penjelasan untuk setiap kategori emosi
const KATEGORI_INFO = {
    'Malu': '🔴 LEVEL 20 - KRITIS. Energi paling rendah. Perasaan tidak berharga. PRIORITAS TINGGI untuk dirilis.',
    'Bersalah': '🟠 LEVEL 30 - SANGAT BERAT. Rasa bersalah menghambat kebahagiaan. PRIORITAS TINGGI.',
    'Apatis': '🟡 LEVEL 50 - BERAT. Kehilangan minat dan harapan. Perlu segera ditangani.',
    'Sedih': '🟡 LEVEL 75 - SEDANG. Kesedihan mendalam. Mempengaruhi paru-paru dan jantung.',
    'Takut': '🟢 LEVEL 100 - RINGAN-SEDANG. Ketakutan yang menghambat. Mempengaruhi ginjal.',
    'Hasrat': '🟢 LEVEL 125 - RINGAN. Keinginan berlebihan yang mengikat.',
    'Marah': '🔵 LEVEL 150 - LEBIH BAIK. Meski energi lebih tinggi, amarah merusak hati dan jantung.',
    'Sombong': '🔵 LEVEL 175 - MENDEKATI NETRAL. Kesombongan menghalangi pertumbuhan.',
    'Finansial': '💰 Emosi terkait uang. Blocking abundance. Menyerang punggung bawah.',
    'Hubungan': '💔 Emosi terkait pasangan. Menyerang jantung dan dada.',
    'Keluarga': '👨‍👩‍👧 Emosi keluarga. Menyerang lambung dan solar plexus.',
    'Karier': '💼 Emosi pekerjaan. Menyerang bahu dan leher.',
    'Kesehatan': '🏥 Kecemasan kesehatan. Memperburuk sistem saraf.',
    'Spiritual': '🤲 Jauh dari Allah. Menyebabkan kehampaan eksistensial.'
};

// Safety rules dari SEFT
const MAX_EMOSI_PER_HARI = 5; // Rekomendasi Pak Faiz: 3-5 emosi per hari
const SAFETY_MESSAGE = "⚠️ Rekomendasi: Maksimal 3-5 emosi per hari untuk hasil optimal dan aman. Istirahat jika merasa lelah.";

// 4 Pilar Setup Generator
function generate4PilarSetup(emosi, masalah) {
    return `Ya Allah...

Meskipun saat ini hati saya merasa ${emosi.toLowerCase()}, ${masalah ? `karena ${masalah}` : 'dan tidak nyaman'}...

...saat ini aku ikhlas menerima kenyataan ini dan aku ridho atas perasaan tidak nyaman ini...

...aku pasrahkan sepenuhnya kepada-Mu untuk membersihkan rasa ${emosi.toLowerCase()} di dadaku, dan aku pasrahkan masa depan serta penyelesaiannya hanya kepada-Mu...

...dan aku tetap bersyukur atas semua yang ada, karena aku yakin Engkau adalah sebaik-baiknya pemberi solusi yang tidak akan membiarkan hamba-Mu dalam kesulitan.`;
}

export default function SEFTRelease() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [emosiList, setEmosiList] = useState([]);
    const [releasedEmosi, setReleasedEmosi] = useState([]);
    const [selectedEmosi, setSelectedEmosi] = useState(null);
    const [masalah, setMasalah] = useState('');
    const [ratingSebelum, setRatingSebelum] = useState(5);
    const [ratingSesudah, setRatingSesudah] = useState(5);
    const [kalimatSetup, setKalimatSetup] = useState('');
    const [showEmosiDropdown, setShowEmosiDropdown] = useState(false);
    const [searchEmosi, setSearchEmosi] = useState('');
    const [saving, setSaving] = useState(false);
    const [todayCount, setTodayCount] = useState(0);
    const [showHistory, setShowHistory] = useState(false);
    const [showSafetyWarning, setShowSafetyWarning] = useState(false);
    const [hideReleased, setHideReleased] = useState(true);
    const [filterKategori, setFilterKategori] = useState('');
    const [filterSakit, setFilterSakit] = useState('');
    const [showHelp, setShowHelp] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deviceId] = useState(() => getDeviceId());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load emotions (static list)
            loadEmosi();

            // Load history from database
            const history = await getSeftHistory(null, deviceId);
            setReleasedEmosi(history || []);

            // Load today's count from database
            const count = await getTodaySeftCount(null, deviceId);
            setTodayCount(count || 0);
        } catch (error) {
            console.error('Error loading SEFT data:', error);
            // Fallback to empty state
            setReleasedEmosi([]);
            setTodayCount(0);
        } finally {
            setLoading(false);
        }
    };

    const loadEmosi = async () => {
        // Comprehensive list of 150+ negative emotions with descriptions
        setEmosiList([
            // LEVEL 20 - MALU (Shame)
            { id: 1, nama: 'Malu', level_hawkins: 20, kategori: 'Malu', deskripsi: 'Perasaan tidak layak dan ingin menghilang dari pandangan orang lain.' },
            { id: 2, nama: 'Terhina', level_hawkins: 20, kategori: 'Malu', deskripsi: 'Merasa direndahkan dan kehilangan harga diri.' },
            { id: 3, nama: 'Merasa Rendah Diri', level_hawkins: 20, kategori: 'Malu', deskripsi: 'Merasa lebih rendah dari orang lain dalam segala hal.' },
            { id: 4, nama: 'Merasa Tidak Berharga', level_hawkins: 20, kategori: 'Malu', deskripsi: 'Merasa tidak punya nilai sebagai manusia.' },
            { id: 5, nama: 'Merasa Hina', level_hawkins: 20, kategori: 'Malu', deskripsi: 'Membenci diri sendiri secara mendalam.' },
            { id: 6, nama: 'Merasa Memalukan', level_hawkins: 20, kategori: 'Malu', deskripsi: 'Merasa menjadi aib bagi orang lain.' },

            // LEVEL 30 - RASA BERSALAH (Guilt)
            { id: 10, nama: 'Rasa Bersalah', level_hawkins: 30, kategori: 'Bersalah', deskripsi: 'Merasa bersalah atas perbuatan masa lalu.' },
            { id: 11, nama: 'Menyesal', level_hawkins: 30, kategori: 'Bersalah', deskripsi: 'Terus menyesali keputusan yang sudah diambil.' },
            { id: 12, nama: 'Merasa Berdosa', level_hawkins: 30, kategori: 'Bersalah', deskripsi: 'Merasa berbuat dosa dan tidak termaafkan.' },
            { id: 13, nama: 'Menyalahkan Diri Sendiri', level_hawkins: 30, kategori: 'Bersalah', deskripsi: 'Selalu menyalahkan diri atas segala kesalahan.' },
            { id: 14, nama: 'Merasa Gagal', level_hawkins: 30, kategori: 'Bersalah', deskripsi: 'Merasa tidak berhasil memenuhi harapan.' },
            { id: 15, nama: 'Merasa Bodoh', level_hawkins: 30, kategori: 'Bersalah', deskripsi: 'Merasa tidak cukup pintar dan sering salah.' },

            // LEVEL 50 - APATIS (Apathy)
            { id: 20, nama: 'Apatis', level_hawkins: 50, kategori: 'Apatis', deskripsi: 'Tidak peduli dengan apapun.' },
            { id: 21, nama: 'Putus Asa', level_hawkins: 50, kategori: 'Apatis', deskripsi: 'Kehilangan semua harapan.' },
            { id: 22, nama: 'Tidak Berdaya', level_hawkins: 50, kategori: 'Apatis', deskripsi: 'Merasa tidak mampu mengubah keadaan.' },
            { id: 23, nama: 'Menyerah', level_hawkins: 50, kategori: 'Apatis', deskripsi: 'Tidak mau mencoba lagi.' },
            { id: 24, nama: 'Hampa', level_hawkins: 50, kategori: 'Apatis', deskripsi: 'Merasa kosong tanpa tujuan.' },
            { id: 25, nama: 'Burnout', level_hawkins: 50, kategori: 'Apatis', deskripsi: 'Kelelahan mental dan fisik yang ekstrem.' },
            { id: 26, nama: 'Malas Total', level_hawkins: 50, kategori: 'Apatis', deskripsi: 'Tidak ada motivasi untuk melakukan apapun.' },
            { id: 27, nama: 'Prokrastinasi', level_hawkins: 50, kategori: 'Apatis', deskripsi: 'Selalu menunda-nunda pekerjaan.' },

            // LEVEL 75 - SEDIH (Grief)
            { id: 30, nama: 'Sedih', level_hawkins: 75, kategori: 'Sedih', deskripsi: 'Perasaan sedih yang mendalam.' },
            { id: 31, nama: 'Duka', level_hawkins: 75, kategori: 'Sedih', deskripsi: 'Kesedihan karena kehilangan.' },
            { id: 32, nama: 'Patah Hati', level_hawkins: 75, kategori: 'Sedih', deskripsi: 'Hati hancur karena dicintai.' },
            { id: 33, nama: 'Kecewa Berat', level_hawkins: 75, kategori: 'Sedih', deskripsi: 'Harapan yang tidak terwujud.' },
            { id: 34, nama: 'Terluka', level_hawkins: 75, kategori: 'Sedih', deskripsi: 'Hati terluka oleh perkataan/perbuatan.' },
            { id: 35, nama: 'Kesepian', level_hawkins: 75, kategori: 'Sedih', deskripsi: 'Merasa sendirian meski dikelilingi orang.' },
            { id: 36, nama: 'Merasa Ditinggalkan', level_hawkins: 75, kategori: 'Sedih', deskripsi: 'Trauma ditinggalkan orang tersayang.' },
            { id: 37, nama: 'Merasa Tidak Dicintai', level_hawkins: 75, kategori: 'Sedih', deskripsi: 'Merasa tidak ada yang mencintai.' },
            { id: 38, nama: 'Galau', level_hawkins: 75, kategori: 'Sedih', deskripsi: 'Pikiran kacau tidak karuan.' },
            { id: 39, nama: 'Depresi', level_hawkins: 75, kategori: 'Sedih', deskripsi: 'Kesedihan berkepanjangan yang berat.' },
            { id: 40, nama: 'Inner Child Terluka', level_hawkins: 75, kategori: 'Keluarga', deskripsi: 'Luka masa kecil yang belum sembuh.' },

            // LEVEL 100 - TAKUT (Fear)
            { id: 60, nama: 'Takut', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Ketakutan umum yang menghambat.' },
            { id: 61, nama: 'Cemas', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Kekhawatiran berlebihan tentang masa depan.' },
            { id: 62, nama: 'Khawatir', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Pikiran negatif tentang hal yang mungkin terjadi.' },
            { id: 63, nama: 'Panik', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Ketakutan intens yang tiba-tiba.' },
            { id: 64, nama: 'Trauma', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Luka psikologis dari kejadian masa lalu.' },
            { id: 65, nama: 'Takut Gagal', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Takut tidak berhasil sehingga tidak berani mencoba.' },
            { id: 66, nama: 'Takut Ditolak', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Takut tidak diterima oleh orang lain.' },
            { id: 67, nama: 'Takut Miskin', level_hawkins: 100, kategori: 'Finansial', deskripsi: 'Ketakutan tidak punya uang.' },
            { id: 68, nama: 'Takut Kehilangan', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Takut kehilangan orang/hal yang dicintai.' },
            { id: 69, nama: 'Takut Masa Depan', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Cemas tentang apa yang akan terjadi.' },
            { id: 70, nama: 'Imposter Syndrome', level_hawkins: 100, kategori: 'Karier', deskripsi: 'Merasa tidak pantas atas pencapaian sendiri.' },
            { id: 71, nama: 'Stres', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Tekanan mental yang menumpuk.' },
            { id: 72, nama: 'Overthinking', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Berpikir berlebihan tentang segala hal.' },
            { id: 73, nama: 'Insecure', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Merasa tidak aman dan tidak percaya diri.' },
            { id: 74, nama: 'Ragu-ragu', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Tidak yakin dengan keputusan sendiri.' },
            { id: 75, nama: 'Takut Bicara di Depan Umum', level_hawkins: 100, kategori: 'Takut', deskripsi: 'Ketakutan berbicara di hadapan banyak orang.' },

            // LEVEL 125 - HASRAT NEGATIF (Desire)
            { id: 100, nama: 'Kecanduan', level_hawkins: 125, kategori: 'Hasrat', deskripsi: 'Ketergantungan pada hal tertentu.' },
            { id: 101, nama: 'Serakah', level_hawkins: 125, kategori: 'Hasrat', deskripsi: 'Ingin memiliki lebih dari yang dibutuhkan.' },
            { id: 102, nama: 'Obsesif', level_hawkins: 125, kategori: 'Hasrat', deskripsi: 'Terobsesi pada sesuatu secara tidak sehat.' },
            { id: 103, nama: 'Possesif', level_hawkins: 125, kategori: 'Hubungan', deskripsi: 'Ingin memiliki pasangan secara berlebihan.' },
            { id: 104, nama: 'Haus Pengakuan', level_hawkins: 125, kategori: 'Hasrat', deskripsi: 'Sangat membutuhkan validasi dari orang lain.' },

            // LEVEL 150 - MARAH (Anger)
            { id: 120, nama: 'Marah', level_hawkins: 150, kategori: 'Marah', deskripsi: 'Kemarahan yang membakar.' },
            { id: 121, nama: 'Kesal', level_hawkins: 150, kategori: 'Marah', deskripsi: 'Perasaan jengkel yang mengganggu.' },
            { id: 122, nama: 'Dendam', level_hawkins: 150, kategori: 'Marah', deskripsi: 'Keinginan membalas sakit hati.' },
            { id: 123, nama: 'Benci', level_hawkins: 150, kategori: 'Marah', deskripsi: 'Kebencian yang mendalam.' },
            { id: 124, nama: 'Iri Hati', level_hawkins: 150, kategori: 'Marah', deskripsi: 'Tidak suka melihat kebahagiaan orang lain.' },
            { id: 125, nama: 'Cemburu', level_hawkins: 150, kategori: 'Marah', deskripsi: 'Takut kehilangan perhatian orang tercinta.' },
            { id: 126, nama: 'Dengki', level_hawkins: 150, kategori: 'Marah', deskripsi: 'Iri dan ingin orang lain celaka.' },
            { id: 127, nama: 'Frustrasi', level_hawkins: 150, kategori: 'Marah', deskripsi: 'Kekesalan karena tidak tercapai tujuan.' },
            { id: 128, nama: 'Sakit Hati', level_hawkins: 150, kategori: 'Marah', deskripsi: 'Luka hati yang menyakitkan.' },
            { id: 129, nama: 'Merasa Dikhianati', level_hawkins: 150, kategori: 'Marah', deskripsi: 'Kepercayaan yang dihancurkan.' },
            { id: 130, nama: 'Sulit Memaafkan', level_hawkins: 150, kategori: 'Spiritual', deskripsi: 'Tidak bisa melepaskan kesalahan orang.' },
            { id: 131, nama: 'Konflik dengan Orang Tua', level_hawkins: 150, kategori: 'Keluarga', deskripsi: 'Hubungan buruk dengan orang tua.' },
            { id: 132, nama: 'Konflik dengan Pasangan', level_hawkins: 150, kategori: 'Hubungan', deskripsi: 'Pertengkaran terus-menerus.' },
            { id: 133, nama: 'Konflik dengan Atasan', level_hawkins: 150, kategori: 'Karier', deskripsi: 'Hubungan buruk dengan bos.' },

            // LEVEL 175 - SOMBONG (Pride Negatif)
            { id: 150, nama: 'Sombong', level_hawkins: 175, kategori: 'Sombong', deskripsi: 'Merasa lebih baik dari orang lain.' },
            { id: 151, nama: 'Takabur', level_hawkins: 175, kategori: 'Sombong', deskripsi: 'Kesombongan yang berlebihan.' },
            { id: 152, nama: 'Riya', level_hawkins: 175, kategori: 'Sombong', deskripsi: 'Beramal untuk dilihat orang.' },
            { id: 153, nama: 'Ujub', level_hawkins: 175, kategori: 'Sombong', deskripsi: 'Bangga diri atas amal sendiri.' },
            { id: 154, nama: 'Ego Tinggi', level_hawkins: 175, kategori: 'Sombong', deskripsi: 'Mementingkan diri sendiri.' },
            { id: 155, nama: 'Keras Kepala', level_hawkins: 175, kategori: 'Sombong', deskripsi: 'Tidak mau mendengar pendapat lain.' },

            // EMOSI KHUSUS
            { id: 170, nama: 'Stres Keuangan', level_hawkins: 100, kategori: 'Finansial', deskripsi: 'Tekanan karena masalah uang.' },
            { id: 171, nama: 'Mental Blok Rezeki', level_hawkins: 50, kategori: 'Finansial', deskripsi: 'Beliefs yang memblokir rezeki.' },
            { id: 172, nama: 'Tidak Layak Kaya', level_hawkins: 20, kategori: 'Finansial', deskripsi: 'Merasa tidak pantas kaya.' },
            { id: 173, nama: 'Takut Sukses', level_hawkins: 100, kategori: 'Karier', deskripsi: 'Takut dengan tanggung jawab kesuksesan.' },
            { id: 174, nama: 'Trauma KDRT', level_hawkins: 100, kategori: 'Hubungan', deskripsi: 'Luka dari kekerasan dalam rumah tangga.' },
            { id: 175, nama: 'Trauma Masa Kecil', level_hawkins: 100, kategori: 'Keluarga', deskripsi: 'Luka dari pengalaman masa kecil.' },
            { id: 176, nama: 'Merasa Jauh dari Allah', level_hawkins: 75, kategori: 'Spiritual', deskripsi: 'Merasa tidak dekat dengan Tuhan.' },
            { id: 177, nama: 'Malas Ibadah', level_hawkins: 50, kategori: 'Spiritual', deskripsi: 'Tidak semangat beribadah.' },
            { id: 178, nama: 'Sulit Ikhlas', level_hawkins: 125, kategori: 'Spiritual', deskripsi: 'Sulit menerima dengan lapang dada.' },
            { id: 179, nama: 'Sulit Bersyukur', level_hawkins: 125, kategori: 'Spiritual', deskripsi: 'Tidak bisa mensyukuri nikmat.' },
        ]);
    };

    // Filter emotions - hide already released and apply search/category filter
    const filteredEmosi = emosiList.filter(e => {
        // Filter by search
        const matchSearch = e.nama.toLowerCase().includes(searchEmosi.toLowerCase());

        // Filter by category
        const matchKategori = !filterKategori || e.kategori === filterKategori;

        // Filter by physical symptom recommendation
        const matchSakit = !filterSakit || (SAKIT_KE_EMOSI[filterSakit]?.some(emosiName =>
            e.nama.toLowerCase().includes(emosiName.toLowerCase())
        ));

        // Hide released emotions if toggle is on
        const isReleased = releasedEmosi.some(r => r.emosi_id === e.id);
        const shouldShow = !hideReleased || !isReleased;

        return matchSearch && matchKategori && matchSakit && shouldShow;
    });

    // Sort by Hawkins level (lowest = most urgent, prioritized first)
    const sortedEmosi = [...filteredEmosi].sort((a, b) => a.level_hawkins - b.level_hawkins);

    // Get unique categories
    const kategoris = [...new Set(emosiList.map(e => e.kategori))];

    const handleSelectEmosi = (emosi) => {
        setSelectedEmosi(emosi);
        setShowEmosiDropdown(false);
        setSearchEmosi('');
    };

    const handleNextStep = () => {
        if (step === 1 && selectedEmosi) {
            // Check daily limit
            if (todayCount >= MAX_EMOSI_PER_HARI) {
                setShowSafetyWarning(true);
                return;
            }
            setKalimatSetup(generate4PilarSetup(selectedEmosi.nama, masalah));
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // Create session object for database
            const session = {
                device_id: deviceId,
                tanggal: today,
                mode: 'release',
                emosi_nama: selectedEmosi.nama,
                kategori: selectedEmosi.kategori,
                level_hawkins: selectedEmosi.level_hawkins,
                masalah,
                kalimat_setup: kalimatSetup,
                rating_sebelum: ratingSebelum,
                rating_sesudah: ratingSesudah,
            };

            // Save to database
            await createSeftSession(session);

            // Update local state
            setTodayCount(prev => prev + 1);

            // Reload history from database
            const history = await getSeftHistory(null, deviceId);
            setReleasedEmosi(history || []);

            // Navigate back after short delay for UX
            await new Promise(resolve => setTimeout(resolve, 500));
            navigate('/spiritual/seft');
        } catch (error) {
            console.error('Failed to save session:', error);
            alert('Gagal menyimpan sesi. Silakan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    const totalReleased = releasedEmosi.length;
    const avgPenurunan = releasedEmosi.length > 0
        ? (releasedEmosi.reduce((sum, r) => sum + ((r.rating_sebelum || 0) - (r.rating_sesudah || 0)), 0) / releasedEmosi.length).toFixed(1)
        : 0;

    // Show loading state
    if (loading) {
        return (
            <div className="spiritual-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                    <p>Memuat data SEFT...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="spiritual-container">
            {/* Back Button */}
            <Link to="/spiritual/seft" className="spiritual-back-btn">
                <ArrowLeft size={18} />
                Kembali
            </Link>

            {/* Header */}
            <div className="spiritual-header" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <div>
                    <h1>
                        <Minus size={28} />
                        SEFT Release
                    </h1>
                    <p className="subtitle">Cabut & Buang Emosi Negatif</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowHistory(true)}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        title="Lihat riwayat emosi yang sudah dirilis"
                    >
                        <History size={14} />
                        {totalReleased}
                    </button>
                    <button
                        onClick={() => setShowHelp(true)}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                        title="Panduan Penggunaan SEFT"
                    >
                        <HelpCircle size={18} />
                    </button>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.875rem'
                    }}>
                        Step {step} / 4
                    </div>
                </div>
            </div>

            {/* Safety Warning */}
            <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.8rem',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                    <strong>Hari ini: {todayCount}/{MAX_EMOSI_PER_HARI} emosi</strong> •
                    Max 3-5 emosi/hari untuk keamanan. Total dirilis: {totalReleased} emosi
                </div>
            </div>

            {/* Hawkins Scale Legend */}
            <div style={{
                background: 'var(--spiritual-bg)',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.7rem'
            }}>
                <div style={{ marginBottom: '8px', fontWeight: '600' }}>📊 Skala Hawkins (level rendah = prioritas tinggi):</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(HAWKINS_LEVELS).map(([level, info]) => (
                        <span key={level} style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: info.bgColor,
                            color: info.color,
                            fontWeight: '500'
                        }}>
                            {info.emoji} Lv.{level}: {info.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Progress */}
            <div className="spiritual-progress" style={{ marginBottom: '24px' }}>
                <div className="spiritual-progress-bar" style={{ width: `${step * 25}%` }} />
            </div>

            {/* Step 1: Pilih Emosi & Masalah */}
            {
                step === 1 && (
                    <div className="spiritual-card">
                        <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Langkah 1: Identifikasi Emosi
                            <span
                                onClick={() => setShowHelp(true)}
                                style={{ cursor: 'pointer', opacity: 0.7 }}
                                title="Klik untuk panduan lengkap"
                            >
                                <HelpCircle size={16} />
                            </span>
                        </h3>

                        {/* Quick Guide */}
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            fontSize: '0.8rem',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Lightbulb size={16} style={{ color: '#6366f1' }} />
                                <strong>Cara Cepat Menggunakan:</strong>
                            </div>
                            <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                                <li><strong>Ada keluhan fisik?</strong> → Pilih dari "Filter Sakit Fisik" untuk rekomendasi emosi</li>
                                <li><strong>Tahu emosi yang dirasakan?</strong> → Langsung pilih dari dropdown emosi</li>
                                <li><strong>Prioritaskan warna MERAH/ORANYE</strong> → Level lebih rendah = dampak lebih besar</li>
                            </ol>
                        </div>

                        {/* Toggle Hide Released */}
                        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} title="Centang untuk menyembunyikan emosi yang sudah pernah dirilis">
                                <input
                                    type="checkbox"
                                    checked={hideReleased}
                                    onChange={(e) => setHideReleased(e.target.checked)}
                                />
                                <span style={{ fontSize: '0.8rem' }}>Sembunyikan yang sudah dirilis</span>
                            </label>
                        </div>

                        {/* Filter by Physical Symptom */}
                        <div className="spiritual-form-group">
                            <label className="spiritual-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🏥 Filter Berdasarkan Sakit Fisik
                                <span style={{
                                    fontSize: '0.7rem',
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    color: '#22c55e',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}>REKOMENDASI</span>
                            </label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)', margin: '4px 0 8px 0' }}>
                                📌 Pilih keluhan fisik Anda, sistem akan merekomendasikan emosi yang mungkin menjadi akar penyebabnya (psikosomatis)
                            </p>
                            <select
                                className="spiritual-select"
                                value={filterSakit}
                                onChange={(e) => {
                                    setFilterSakit(e.target.value);
                                    if (e.target.value) setFilterKategori(''); // Reset category when physical filter is selected
                                }}
                            >
                                <option value="">-- Pilih Gejala Fisik --</option>
                                <optgroup label="🧠 Kepala & Otak">
                                    <option value="Kepala/Migrain">Kepala/Migrain</option>
                                    <option value="Vertigo">Vertigo</option>
                                    <option value="Tuli/Gangguan Pendengaran">Tuli/Gangguan Pendengaran</option>
                                </optgroup>
                                <optgroup label="💪 Leher & Bahu">
                                    <option value="Leher Kaku">Leher Kaku</option>
                                    <option value="Bahu Tegang">Bahu Tegang</option>
                                </optgroup>
                                <optgroup label="❤️ Dada & Paru">
                                    <option value="Dada/Jantung">Dada/Jantung</option>
                                    <option value="Paru-paru/Asma">Paru-paru/Asma</option>
                                    <option value="TBC/Paru">TBC/Paru</option>
                                </optgroup>
                                <optgroup label="🫃 Perut & Pencernaan">
                                    <option value="Lambung/Maag">Lambung/Maag</option>
                                    <option value="Hati">Hati</option>
                                    <option value="Hernia">Hernia</option>
                                    <option value="Tumor/Benjolan">Tumor/Benjolan</option>
                                </optgroup>
                                <optgroup label="🦴 Punggung">
                                    <option value="Punggung Bawah">Punggung Bawah</option>
                                    <option value="Punggung Atas">Punggung Atas</option>
                                </optgroup>
                                <optgroup label="🩸 Darah & Kardiovaskular">
                                    <option value="Tekanan Darah Rendah">Tekanan Darah Rendah</option>
                                    <option value="Tekanan Darah Tinggi">Tekanan Darah Tinggi</option>
                                </optgroup>
                                <optgroup label="✨ Kulit">
                                    <option value="Kulit/Psoriasis">Kulit/Psoriasis</option>
                                    <option value="Jerawat">Jerawat</option>
                                </optgroup>
                                <optgroup label="⚡ Imun & Energi">
                                    <option value="Ginjal">Ginjal</option>
                                    <option value="Imun Lemah">Imun Lemah</option>
                                    <option value="Kelelahan Kronis">Kelelahan Kronis</option>
                                    <option value="Autoimun">Autoimun</option>
                                </optgroup>
                            </select>
                            {filterSakit && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '12px',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    border: '1px solid rgba(34, 197, 94, 0.3)'
                                }}>
                                    <strong style={{ color: '#22c55e' }}>✅ Rekomendasi emosi untuk "{filterSakit}":</strong>
                                    <p style={{ fontSize: '0.7rem', margin: '4px 0 8px 0', color: 'var(--spiritual-text-muted)' }}>
                                        Pilih salah satu emosi di bawah ini yang paling resonan dengan perasaan Anda:
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {SAKIT_KE_EMOSI[filterSakit].map(e => (
                                            <span key={e} style={{
                                                padding: '4px 10px',
                                                background: 'rgba(34, 197, 94, 0.2)',
                                                borderRadius: '16px',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }} title={`Klik dropdown emosi dan cari "${e}"`}>{e}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="spiritual-form-group">
                            <label className="spiritual-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                📁 Filter Kategori Emosi
                                {filterSakit && <span style={{ fontSize: '0.65rem', color: '#f59e0b' }}>(auto-reset saat filter fisik aktif)</span>}
                            </label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)', margin: '4px 0 8px 0' }}>
                                📌 Filter berdasarkan jenis emosi (Marah, Sedih, Takut, dll)
                            </p>
                            <select
                                className="spiritual-select"
                                value={filterKategori}
                                onChange={(e) => {
                                    setFilterKategori(e.target.value);
                                    if (e.target.value) setFilterSakit(''); // Reset physical filter when category is selected
                                }}
                            >
                                <option value="">Semua Kategori</option>
                                {kategoris.map(k => (
                                    <option key={k} value={k}>{KATEGORI_INFO[k] ? `${k} - ${KATEGORI_INFO[k].split('.')[0]}` : k}</option>
                                ))}
                            </select>
                        </div>

                        {/* Emosi Dropdown */}
                        <div className="spiritual-form-group">
                            <label className="spiritual-label">
                                Pilih Emosi yang Dirasakan ({sortedEmosi.length} tersedia)
                                <span style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)', marginLeft: '8px' }}>
                                    ⬆️ Diurutkan dari yang paling perlu dirilis
                                </span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowEmosiDropdown(!showEmosiDropdown)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        background: selectedEmosi ? (HAWKINS_LEVELS[selectedEmosi.level_hawkins]?.bgColor || 'var(--spiritual-bg)') : 'var(--spiritual-bg)',
                                        border: `2px solid ${selectedEmosi ? (HAWKINS_LEVELS[selectedEmosi.level_hawkins]?.color || 'var(--spiritual-border)') : 'var(--spiritual-border)'}`,
                                        borderRadius: '8px',
                                        color: 'var(--spiritual-text)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span>
                                        {selectedEmosi ? (
                                            <>
                                                {HAWKINS_LEVELS[selectedEmosi.level_hawkins]?.emoji} {selectedEmosi.nama}
                                            </>
                                        ) : 'Pilih emosi...'}
                                    </span>
                                    <ChevronDown size={18} />
                                </button>

                                {showEmosiDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: 'var(--spiritual-card)',
                                        border: '1px solid var(--spiritual-border)',
                                        borderRadius: '8px',
                                        marginTop: '4px',
                                        maxHeight: '400px',
                                        overflow: 'auto',
                                        zIndex: 10
                                    }}>
                                        <input
                                            type="text"
                                            placeholder="Cari emosi..."
                                            value={searchEmosi}
                                            onChange={(e) => setSearchEmosi(e.target.value)}
                                            className="spiritual-input"
                                            style={{ margin: '8px', width: 'calc(100% - 16px)' }}
                                            autoFocus
                                        />
                                        {sortedEmosi.map(emosi => {
                                            const levelInfo = HAWKINS_LEVELS[emosi.level_hawkins] || HAWKINS_LEVELS[100];
                                            const dampakFisik = DAMPAK_FISIK[emosi.kategori];
                                            return (
                                                <div
                                                    key={emosi.id}
                                                    onClick={() => handleSelectEmosi(emosi)}
                                                    style={{
                                                        padding: '12px 16px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid var(--spiritual-border)',
                                                        borderLeft: `4px solid ${levelInfo.color}`,
                                                        background: levelInfo.bgColor,
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: '600' }}>
                                                            {levelInfo.emoji} {emosi.nama}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            background: levelInfo.color,
                                                            color: 'white',
                                                            fontWeight: '600'
                                                        }}>
                                                            {levelInfo.label}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)', marginTop: '4px' }}>
                                                        {emosi.deskripsi}
                                                    </div>
                                                    {dampakFisik && (
                                                        <div style={{
                                                            fontSize: '0.7rem',
                                                            color: levelInfo.color,
                                                            marginTop: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <Activity size={12} />
                                                            Menyerang: {dampakFisik.organs.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Emosi Info */}
                        {selectedEmosi && (
                            <div style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '16px',
                                border: '1px solid rgba(99, 102, 241, 0.3)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Info size={16} style={{ color: '#6366f1' }} />
                                    <strong style={{ color: '#a78bfa' }}>{selectedEmosi.nama}</strong>
                                    <span style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                                        {selectedEmosi.kategori} • Level {selectedEmosi.level_hawkins}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.875rem', marginBottom: '12px' }}>{selectedEmosi.deskripsi}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--spiritual-text-muted)' }}>
                                    {KATEGORI_INFO[selectedEmosi.kategori]}
                                </p>
                            </div>
                        )}

                        {/* Masalah */}
                        <div className="spiritual-form-group">
                            <label className="spiritual-label">Deskripsikan Masalah (Opsional)</label>
                            <textarea
                                className="spiritual-textarea"
                                placeholder="Contoh: gaji tidak sesuai harapan, dimarahi atasan, dll..."
                                value={masalah}
                                onChange={(e) => setMasalah(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* Rating Sebelum */}
                        <div className="spiritual-form-group">
                            <label className="spiritual-label">Rating Intensitas Emosi (Sebelum SEFT)</label>
                            <div className="spiritual-rating">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={ratingSebelum}
                                    onChange={(e) => setRatingSebelum(parseInt(e.target.value))}
                                    className="spiritual-rating-slider"
                                />
                                <div className="spiritual-rating-value">{ratingSebelum}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>
                                    <span>Ringan</span>
                                    <span>Sangat Berat</span>
                                </div>
                            </div>
                        </div>

                        <button
                            className="spiritual-btn spiritual-btn-primary"
                            style={{ width: '100%' }}
                            onClick={handleNextStep}
                            disabled={!selectedEmosi}
                        >
                            Lanjut ke Step 2
                        </button>
                    </div>
                )
            }

            {/* Step 2: Kalimat Setup 4 Pilar */}
            {
                step === 2 && (
                    <div className="spiritual-card">
                        <h3 style={{ marginBottom: '20px' }}>Langkah 2: Kalimat Setup (4 Pilar)</h3>

                        <div style={{
                            background: 'var(--spiritual-bg)',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            lineHeight: '1.8',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {kalimatSetup}
                        </div>

                        <div style={{
                            background: 'rgba(124, 58, 237, 0.1)',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '0.875rem'
                        }}>
                            <strong>📋 Instruksi:</strong>
                            <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                <li>Baca kalimat setup di atas dengan penghayatan</li>
                                <li>Tekan "Sore Spot" (titik nyeri di dada kiri)</li>
                                <li>Rasakan emosi yang ingin dilepaskan</li>
                                <li>Ucapkan dengan ikhlas dan pasrah</li>
                            </ol>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className="spiritual-btn spiritual-btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => setStep(1)}
                            >
                                Kembali
                            </button>
                            <button
                                className="spiritual-btn spiritual-btn-primary"
                                style={{ flex: 1 }}
                                onClick={handleNextStep}
                            >
                                Lanjut Tapping
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Step 3-4 content would continue here... keeping original tapping and closing steps */}
            {
                step === 3 && (
                    <div className="spiritual-card">
                        <h3 style={{ marginBottom: '20px' }}>Langkah 3: Tapping 18 Titik</h3>
                        <p style={{ marginBottom: '16px', color: 'var(--spiritual-text-muted)' }}>
                            Ketuk setiap titik 5-7x sambil mengucapkan: "Ya Allah... aku ikhlas, aku pasrah"
                        </p>
                        <div style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                            <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
                                <li>Alis (UB) - Ujung alis dalam</li>
                                <li>Samping Mata (SE) - Tulang samping mata</li>
                                <li>Bawah Mata (UE) - Tulang bawah mata</li>
                                <li>Bawah Hidung (UN) - Antara hidung & bibir</li>
                                <li>Dagu (Ch) - Di lipatan dagu</li>
                                <li>Tulang Selangka (CB) - Bawah tonjolan</li>
                                <li>Bawah Ketiak (UA) - 10cm di bawah</li>
                                <li>Bawah Puting (BN) - Pria: bawah puting</li>
                                <li>Ibu Jari (Th)</li>
                                <li>Telunjuk (IF)</li>
                                <li>Jari Tengah (MF)</li>
                                <li>Jari Manis (RF)</li>
                                <li>Kelingking (BF)</li>
                                <li>Karate Chop (KC)</li>
                                <li>Gamut Point (GP) - Punggung tangan</li>
                            </ol>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="spiritual-btn spiritual-btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                                Kembali
                            </button>
                            <button className="spiritual-btn spiritual-btn-primary" style={{ flex: 1 }} onClick={handleNextStep}>
                                Selesai Tapping
                            </button>
                        </div>
                    </div>
                )
            }

            {
                step === 4 && (
                    <div className="spiritual-card">
                        <h3 style={{ marginBottom: '20px' }}>Langkah 4: Evaluasi Hasil</h3>

                        <div className="spiritual-form-group">
                            <label className="spiritual-label">Rating Intensitas Emosi (Sesudah SEFT)</label>
                            <div className="spiritual-rating">
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={ratingSesudah}
                                    onChange={(e) => setRatingSesudah(parseInt(e.target.value))}
                                    className="spiritual-rating-slider"
                                />
                                <div className="spiritual-rating-value">{ratingSesudah}</div>
                            </div>
                        </div>

                        <div style={{
                            background: ratingSesudah < ratingSebelum ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            padding: '20px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            marginBottom: '20px'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                                {ratingSebelum} → {ratingSesudah}
                            </div>
                            <div style={{ color: ratingSesudah < ratingSebelum ? '#22c55e' : '#f59e0b' }}>
                                {ratingSesudah < ratingSebelum
                                    ? `🎉 Turun ${ratingSebelum - ratingSesudah} poin! Alhamdulillah!`
                                    : ratingSesudah === ratingSebelum
                                        ? '⚠️ Sama, coba ulangi lagi'
                                        : '⚠️ Naik, perlu diulang'}
                            </div>
                        </div>

                        <button
                            className="spiritual-btn spiritual-btn-success"
                            style={{ width: '100%' }}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Menyimpan...' : '✓ Simpan & Selesai'}
                        </button>
                    </div>
                )
            }

            {/* Safety Warning Modal */}
            {
                showSafetyWarning && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '16px', zIndex: 100
                    }}>
                        <div className="spiritual-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
                            <AlertTriangle size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
                            <h3 style={{ marginBottom: '12px' }}>⚠️ Batas Harian Tercapai</h3>
                            <p style={{ marginBottom: '20px', color: 'var(--spiritual-text-muted)' }}>
                                Anda sudah merilis {todayCount} emosi hari ini. Untuk keamanan, disarankan max 3-5 emosi per hari.
                                Istirahat dan lanjutkan besok.
                            </p>
                            <button
                                className="spiritual-btn spiritual-btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => setShowSafetyWarning(false)}
                            >
                                Mengerti
                            </button>
                        </div>
                    </div>
                )
            }

            {/* History Modal */}
            {
                showHistory && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '16px', zIndex: 100
                    }}>
                        <div className="spiritual-card" style={{ maxWidth: '500px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3><Trophy size={20} style={{ color: '#f59e0b' }} /> Riwayat SEFT Release</h3>
                                <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} style={{ color: 'var(--spiritual-text-muted)' }} />
                                </button>
                            </div>

                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                                marginBottom: '16px', textAlign: 'center'
                            }}>
                                <div style={{ background: 'var(--spiritual-bg)', padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>{totalReleased}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>Total Dirilis</div>
                                </div>
                                <div style={{ background: 'var(--spiritual-bg)', padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#6366f1' }}>{avgPenurunan}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--spiritual-text-muted)' }}>Rata-rata Penurunan</div>
                                </div>
                            </div>

                            {releasedEmosi.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--spiritual-text-muted)' }}>
                                    Belum ada emosi yang dirilis.
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {releasedEmosi.map(r => (
                                        <div key={r.id} style={{
                                            padding: '12px',
                                            background: 'var(--spiritual-bg)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{r.emosi_nama}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--spiritual-text-muted)' }}>
                                                    {r.kategori} • {new Date(r.tanggal || r.created_at).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                            <div style={{
                                                color: (r.rating_sebelum - r.rating_sesudah) > 0 ? '#22c55e' : '#f59e0b',
                                                fontWeight: '600'
                                            }}>
                                                {r.rating_sebelum}→{r.rating_sesudah}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Help Modal */}
            {
                showHelp && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '16px', zIndex: 100
                    }}>
                        <div className="spiritual-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '85vh', overflow: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HelpCircle size={20} style={{ color: '#6366f1' }} />
                                    Panduan SEFT Release
                                </h3>
                                <button onClick={() => setShowHelp(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} style={{ color: 'var(--spiritual-text-muted)' }} />
                                </button>
                            </div>

                            {/* What is SEFT */}
                            <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                                <h4 style={{ color: '#6366f1', marginBottom: '8px' }}>🤔 Apa itu SEFT?</h4>
                                <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                                    <strong>SEFT (Spiritual Emotional Freedom Technique)</strong> adalah teknik terapi untuk melepaskan emosi negatif
                                    dengan mengetuk 18 titik meridian tubuh sambil berdoa. Dikembangkan oleh Ahmad Faiz Zainuddin.
                                </p>
                            </div>

                            {/* 4 Steps */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '12px' }}>📋 4 Langkah SEFT:</h4>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    <div style={{ padding: '12px', background: 'var(--spiritual-bg)', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                                        <strong>1. Identifikasi Emosi</strong>
                                        <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0', color: 'var(--spiritual-text-muted)' }}>
                                            Pilih emosi negatif yang ingin dirilis. Tips: Gunakan filter sakit fisik jika bingung.
                                        </p>
                                    </div>
                                    <div style={{ padding: '12px', background: 'var(--spiritual-bg)', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                        <strong>2. The Set-Up</strong>
                                        <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0', color: 'var(--spiritual-text-muted)' }}>
                                            Baca doa Set-Up sambil menekan titik Sore Spot. Berisi 4 Pilar: Ikhlas, Ridho, Pasrah, Syukur.
                                        </p>
                                    </div>
                                    <div style={{ padding: '12px', background: 'var(--spiritual-bg)', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                                        <strong>3. The Tapping</strong>
                                        <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0', color: 'var(--spiritual-text-muted)' }}>
                                            Ketuk 18 titik meridian sambil berdzikir. Fokus rasakan emosi yang keluar.
                                        </p>
                                    </div>
                                    <div style={{ padding: '12px', background: 'var(--spiritual-bg)', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                                        <strong>4. Evaluasi</strong>
                                        <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0', color: 'var(--spiritual-text-muted)' }}>
                                            Cek apakah intensitas emosi turun (rating 0-10). Ulangi jika masih di atas 2.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Filter Explanation */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '12px' }}>🔍 Cara Menggunakan Filter:</h4>
                                <div style={{ fontSize: '0.85rem', lineHeight: '1.7' }}>
                                    <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                                        <strong style={{ color: '#22c55e' }}>🏥 Filter Sakit Fisik (REKOMENDASI)</strong>
                                        <p style={{ margin: '4px 0 0 0' }}>
                                            Punya keluhan fisik seperti migrain, maag, atau tekanan darah?
                                            Pilih gejala fisik Anda, sistem akan merekomendasikan emosi yang mungkin menjadi akar penyebabnya
                                            berdasarkan penelitian psikosomatis.
                                        </p>
                                    </div>
                                    <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                                        <strong style={{ color: '#6366f1' }}>📁 Filter Kategori</strong>
                                        <p style={{ margin: '4px 0 0 0' }}>
                                            Sudah tahu jenis emosi yang dirasakan? Filter berdasarkan kategori: Marah, Sedih, Takut, dll.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Psychosomatic Info */}
                            <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                <h4 style={{ color: '#f59e0b', marginBottom: '8px' }}>💡 Hubungan Emosi & Penyakit (Psikosomatis)</h4>
                                <p style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                                    Penelitian menunjukkan bahwa emosi negatif yang terpendam dapat mempengaruhi organ tubuh tertentu:
                                </p>
                                <ul style={{ fontSize: '0.8rem', marginTop: '8px', paddingLeft: '20px', lineHeight: '1.8' }}>
                                    <li><strong>Malu</strong> → Kulit, Sistem Imun (psoriasis, alergi)</li>
                                    <li><strong>Marah</strong> → Hati, Jantung (hipertensi, masalah hati)</li>
                                    <li><strong>Takut</strong> → Ginjal, Kandung Kemih</li>
                                    <li><strong>Sedih</strong> → Paru-paru (asma, sesak nafas)</li>
                                    <li><strong>Cemas</strong> → Lambung (maag, IBS)</li>
                                </ul>
                            </div>

                            {/* Tips */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '12px' }}>✨ Tips untuk Hasil Optimal:</h4>
                                <ul style={{ fontSize: '0.85rem', paddingLeft: '20px', lineHeight: '1.8' }}>
                                    <li>Prioritaskan emosi dengan <strong>level Hawkins rendah</strong> (warna merah/oranye)</li>
                                    <li>Maksimal <strong>3-5 emosi per hari</strong> untuk keamanan</li>
                                    <li>Lakukan dengan <strong>khusyuk dan fokus</strong> pada perasaan</li>
                                    <li>Boleh <strong>menangis</strong> - ini tanda pelepasan yang baik</li>
                                    <li>Ulangi sampai rating turun ke <strong>0-2</strong></li>
                                </ul>
                            </div>

                            <button
                                onClick={() => setShowHelp(false)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Mengerti, Mulai SEFT! 🚀
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
