-- =====================================================
-- SPIRITUAL ABUNDANCE - SEED DATA
-- Initial data for emosi, doa, zikir, and amalan
-- =====================================================

-- =====================================================
-- SEED: EMOSI NEGATIF (Level Hawkins 20-175) - RELEASE
-- =====================================================

INSERT INTO spiritual_emosi (nama, kategori, level_hawkins, deskripsi, urutan) VALUES
-- Level 20 (Malu)
('Malu', 'negatif', 20, 'Merasa rendah diri, tidak layak', 1),
('Merasa Tak Berharga', 'negatif', 20, 'Merasa tidak ada nilainya', 2),
('Merasa Hina', 'negatif', 20, 'Merasa sangat rendah', 3),
('Terhina', 'negatif', 20, 'Merasa dipermalukan', 4),
('Memalukan', 'negatif', 20, 'Malu dengan diri sendiri', 5),

-- Level 30 (Bersalah)
('Bersalah', 'negatif', 30, 'Merasa melakukan kesalahan', 6),
('Menyalahkan Diri', 'negatif', 30, 'Self-blame', 7),
('Menyesal', 'negatif', 30, 'Penyesalan mendalam', 8),
('Merasa Dosa', 'negatif', 30, 'Rasa bersalah spiritual', 9),

-- Level 50 (Apatis)
('Apatis', 'negatif', 50, 'Tidak peduli, mati rasa', 10),
('Putus Asa', 'negatif', 50, 'Hopeless', 11),
('Menyerah', 'negatif', 50, 'Tidak ada harapan', 12),
('Pasrah Negatif', 'negatif', 50, 'Menyerah pada keadaan buruk', 13),
('Tidak Peduli', 'negatif', 50, 'Apatis total', 14),

-- Level 75 (Kesedihan)
('Sedih', 'negatif', 75, 'Kesedihan umum', 15),
('Murung', 'negatif', 75, 'Gloomy, melankolis', 16),
('Gundah', 'negatif', 75, 'Troubled, galau', 17),
('Gelisah', 'negatif', 75, 'Anxious, tidak tenang', 18),
('Pilu', 'negatif', 75, 'Duka mendalam', 19),
('Nelangsa', 'negatif', 75, 'Kesedihan ekstrem', 20),
('Kecewa', 'negatif', 75, 'Disappointed', 21),
('Patah Hati', 'negatif', 75, 'Heartbroken', 22),
('Kehilangan', 'negatif', 75, 'Loss, grief', 23),
('Hampa', 'negatif', 75, 'Kekosongan', 24),
('Tertekan', 'negatif', 75, 'Depressed', 25),

-- Level 100 (Takut)
('Takut', 'negatif', 100, 'Fear umum', 26),
('Cemas', 'negatif', 100, 'Anxiety', 27),
('Khawatir', 'negatif', 100, 'Worry', 28),
('Was-was', 'negatif', 100, 'Uncertainty fear', 29),
('Parno', 'negatif', 100, 'Paranoid', 30),
('Panik', 'negatif', 100, 'Panic', 31),
('Trauma', 'negatif', 100, 'Traumatic fear', 32),
('Fobia', 'negatif', 100, 'Phobia', 33),
('Takut Gagal', 'negatif', 100, 'Fear of failure', 34),
('Takut Ditolak', 'negatif', 100, 'Fear of rejection', 35),
('Takut Miskin', 'negatif', 100, 'Fear of poverty', 36),
('Takut Sendirian', 'negatif', 100, 'Fear of loneliness', 37),
('Ragu', 'negatif', 100, 'Doubt', 38),
('Tidak Aman', 'negatif', 100, 'Insecurity', 39),

-- Level 125 (Keinginan/Hasrat)
('Hasrat Berlebihan', 'negatif', 125, 'Excessive desire', 40),
('Kemelekatan', 'negatif', 125, 'Attachment', 41),
('Keserakahan', 'negatif', 125, 'Greed', 42),
('Nafsu', 'negatif', 125, 'Lust', 43),
('Kecanduan', 'negatif', 125, 'Addiction', 44),
('Obsesi', 'negatif', 125, 'Obsession', 45),

-- Level 150 (Marah)
('Marah', 'negatif', 150, 'Anger', 46),
('Kesal', 'negatif', 150, 'Annoyed', 47),
('Jengkel', 'negatif', 150, 'Irritated', 48),
('Benci', 'negatif', 150, 'Hate', 49),
('Dendam', 'negatif', 150, 'Grudge, revenge', 50),
('Sakit Hati', 'negatif', 150, 'Hurt feelings', 51),
('Frustrasi', 'negatif', 150, 'Frustrated', 52),
('Geram', 'negatif', 150, 'Furious', 53),
('Dongkol', 'negatif', 150, 'Resentful', 54),
('Sewot', 'negatif', 150, 'Pissed off', 55),
('Gondok', 'negatif', 150, 'Annoyed deeply', 56),
('Ketus', 'negatif', 150, 'Curt, snappy', 57),
('Jutek', 'negatif', 150, 'Grumpy', 58),
('Cemberut', 'negatif', 150, 'Pouting', 59),
('Muka Suntuk', 'negatif', 150, 'Dull face', 60),

-- Level 175 (Bangga/Sombong)
('Sombong', 'negatif', 175, 'Arrogant', 61),
('Congkak', 'negatif', 175, 'Conceited', 62),
('Arogan', 'negatif', 175, 'Arrogance', 63),
('Merendahkan', 'negatif', 175, 'Looking down on others', 64),
('Menghina', 'negatif', 175, 'Demeaning', 65),

-- 18 Emosi Tambahan (dari user)
('Ngeluh', 'negatif', 150, 'Complaining', 66),
('Mancing Jengkel', 'negatif', 150, 'Provoking irritation', 67),
('Kepancing Jengkel', 'negatif', 150, 'Getting provoked', 68),
('Bawel', 'negatif', 150, 'Nagging', 69),
('Cerewet', 'negatif', 150, 'Fussy', 70),
('Mikir Negatif', 'negatif', 100, 'Negative thinking', 71),
('Komen Negatif', 'negatif', 150, 'Negative commenting', 72),
('Cemburu', 'negatif', 150, 'Jealous', 73),
('Iri', 'negatif', 150, 'Envious', 74),
('Dengki', 'negatif', 150, 'Spite', 75),
('Nyinyir', 'negatif', 150, 'Sarcastic, cynical', 76),

-- Top 10 Abundance Blocks
('Doubt & Fear', 'negatif', 100, 'Abundance Block #1 - Keraguan dan ketakutan', 77),
('Fear of Rejection', 'negatif', 100, 'Abundance Block #2 - Takut ditolak', 78),
('Financial Mess', 'negatif', 75, 'Abundance Block #3 - Kekacauan keuangan', 79),
('Indecision', 'negatif', 100, 'Abundance Block #4 - Tidak bisa memutuskan', 80),
('Clutter', 'negatif', 75, 'Abundance Block #5 - Berantakan', 81),
('Feeling Stuck', 'negatif', 75, 'Abundance Block #6 - Merasa mandek', 82),
('Block to Abundance', 'negatif', 100, 'Abundance Block #7 - Menolak keberlimpahan', 83),
('Unclear Future', 'negatif', 100, 'Abundance Block #8 - Tidak jelas masa depan', 84),
('Blocks to Profits', 'negatif', 100, 'Abundance Block #9 - Hambatan profit', 85),
('Family Blocks', 'negatif', 100, 'Abundance Block #10 - Hambatan keluarga', 86),

-- Additional negative emotions
('Stres', 'negatif', 75, 'Stress', 87),
('Overthinking', 'negatif', 100, 'Terlalu banyak mikir', 88),
('Overwhelmed', 'negatif', 75, 'Kewalahan', 89),
('Burnout', 'negatif', 50, 'Kelelahan mental', 90),
('Insecure', 'negatif', 100, 'Tidak percaya diri', 91),
('Minder', 'negatif', 20, 'Rendah diri', 92),
('Victim Mentality', 'negatif', 50, 'Merasa korban', 93),
('Inner Child Luka', 'negatif', 75, 'Wounded inner child', 94),
('Scarcity Mindset', 'negatif', 100, 'Pola pikir kekurangan', 95);

-- =====================================================
-- SEED: EMOSI POSITIF (Level Hawkins 200-1000) - AMPLIFY
-- =====================================================

INSERT INTO spiritual_emosi (nama, kategori, level_hawkins, deskripsi, urutan) VALUES
-- Level 200 (Berani)
('Berani', 'positif', 200, 'Courage, keberanian', 1),
('Percaya Diri', 'positif', 200, 'Self-confidence', 2),
('Tegas', 'positif', 200, 'Assertive', 3),
('Afirmasi Diri', 'positif', 200, 'Self-affirmation', 4),

-- Level 250 (Netral)
('Netral', 'positif', 250, 'Neutral, balanced', 5),
('Tenang', 'positif', 250, 'Calm', 6),
('Percaya', 'positif', 250, 'Trust', 7),
('Yakin', 'positif', 250, 'Certain', 8),
('Terbebas', 'positif', 250, 'Free', 9),

-- Level 310 (Kemauan)
('Optimis', 'positif', 310, 'Optimistic', 10),
('Semangat', 'positif', 310, 'Enthusiastic', 11),
('Bertujuan', 'positif', 310, 'Purposeful', 12),
('Termotivasi', 'positif', 310, 'Motivated', 13),

-- Level 350 (Penerimaan)
('Ikhlas', 'positif', 350, 'Sincere, accepting', 14),
('Memaafkan', 'positif', 350, 'Forgiving', 15),
('Menerima', 'positif', 350, 'Accepting', 16),
('Ridho', 'positif', 350, 'Pleased, content', 17),
('Sabar', 'positif', 350, 'Patient', 18),

-- Level 400 (Berfikir)
('Bijaksana', 'positif', 400, 'Wise', 19),
('Memahami', 'positif', 400, 'Understanding', 20),
('Clarity', 'positif', 400, 'Mental clarity', 21),
('Fokus', 'positif', 400, 'Focused', 22),
('Kontemplasi', 'positif', 400, 'Contemplative', 23),

-- Level 500 (Cinta)
('Cinta', 'positif', 500, 'Love', 24),
('Kasih Sayang', 'positif', 500, 'Compassion', 25),
('Welas Asih', 'positif', 500, 'Mercy, kindness', 26),
('Hormat Mendalam', 'positif', 500, 'Deep respect', 27),
('Empati', 'positif', 500, 'Empathy', 28),
('Kelembutan', 'positif', 500, 'Gentleness', 29),

-- Level 540 (Suka Cita)
('Bahagia', 'positif', 540, 'Happy, joyful', 30),
('Suka Cita', 'positif', 540, 'Joy', 31),
('Tenang Hening', 'positif', 540, 'Serene', 32),
('Gembira', 'positif', 540, 'Cheerful', 33),

-- Level 600 (Kedamaian)
('Damai', 'positif', 600, 'Peace', 34),
('Tenteram', 'positif', 600, 'Tranquil', 35),
('Kebahagiaan Luar Biasa', 'positif', 600, 'Bliss', 36),

-- Level 700-1000 (Pencerahan)
('Syukur Mendalam', 'positif', 700, 'Deep gratitude', 37),
('Cinta pada Allah', 'positif', 700, 'Divine love', 38),
('Pencerahan', 'positif', 1000, 'Enlightenment', 39),

-- 7 Identitas Pengundang Abundance
('Discipline of Bliss', 'positif', 540, 'Makin hari makin bahagia dan damai', 40),
('Win-Win Relationship', 'positif', 500, 'Dikelilingi orang baik dan hebat', 41),
('Immune to Overwhelmed', 'positif', 400, 'Bisa membereskan banyak hal lebih cepat', 42),
('Inspiration on Demand', 'positif', 400, 'Dapat inspirasi saat dibutuhkan', 43),
('Good at Making Money', 'positif', 350, 'Hebat dalam menghasilkan uang', 44),
('God Always Have My Back', 'positif', 600, 'Allah selalu mendukung', 45),
('Dreams Come with Ease', 'positif', 540, 'Impian terwujud mudah dan cepat', 46);

-- =====================================================
-- SEED: DOA-DOA
-- =====================================================

INSERT INTO spiritual_doa (nama, kategori, teks_arab, teks_latin, arti, dalil, keutamaan, urutan) VALUES
-- Doa Para Nabi
('Doa Nabi Adam AS', 'para_nabi', 
'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
'Rabbana dzalamna anfusana wa in lam taghfir lana wa tarhamna lanakunanna minal khasirin',
'Ya Tuhan kami, kami telah menzalimi diri kami sendiri. Jika Engkau tidak mengampuni kami dan memberi rahmat kepada kami, niscaya kami termasuk orang-orang yang rugi.',
'QS. Al-A''raf 7:23', 'Doa pengakuan kesalahan dan permohonan ampunan', 1),

('Doa Nabi Yunus AS', 'para_nabi',
'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
'La ilaha illa anta subhanaka inni kuntu minadz dzalimin',
'Tidak ada Tuhan selain Engkau, Mahasuci Engkau. Sungguh, aku termasuk orang-orang yang zalim.',
'QS. Al-Anbiya 21:87', 'Doa pembebas dari kesulitan', 2),

('Doa Nabi Musa AS (Ampunan)', 'para_nabi',
'رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي',
'Rabbi inni dzalamtu nafsi faghfir li',
'Ya Tuhanku, sesungguhnya aku telah menzalimi diriku sendiri, maka ampunilah aku.',
'QS. Al-Qashash 28:16', 'Doa pengakuan dosa dan ampunan', 3),

('Doa Nabi Musa AS (Rezeki)', 'para_nabi',
'رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
'Rabbi inni lima anzalta ilayya min khairin faqir',
'Ya Tuhanku, sungguh aku sangat membutuhkan setiap kebaikan yang Engkau turunkan kepadaku.',
'QS. Al-Qashash 28:24', 'Doa penarik rezeki', 4),

('Doa Nabi Ayub AS', 'para_nabi',
'رَبِّ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ',
'Rabbi anni massaniyad dhurru wa anta arhamur rahimin',
'Ya Tuhanku, sungguh aku telah ditimpa penyakit, padahal Engkau Tuhan Yang Maha Penyayang dari semua yang penyayang.',
'QS. Al-Anbiya 21:83', 'Doa kesembuhan dan pertolongan', 5),

('Doa Ashabul Kahfi', 'para_nabi',
'رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
'Rabbana atina min ladunka rahmatan wa hayyi lana min amrina rasyada',
'Ya Tuhan kami, berikanlah rahmat kepada kami dari sisi-Mu dan sempurnakanlah petunjuk yang lurus bagi kami dalam urusan kami.',
'QS. Al-Kahf 18:10', 'Doa meminta petunjuk dan rahmat', 6),

-- Doa Sulaiman
('Doa Sulaiman (Kerajaan)', 'sulaiman',
'رَبِّ اغْفِرْ لِي وَهَبْ لِي مُلْكًا لَا يَنْبَغِي لِأَحَدٍ مِنْ بَعْدِي إِنَّكَ أَنْتَ الْوَهَّابُ',
'Rabbighfir li wahab li mulkan la yanbaghi li ahadin min ba''di innaka antal wahhab',
'Ya Tuhanku, ampunilah aku dan anugerahkanlah kepadaku kerajaan yang tidak dimiliki oleh siapapun setelahku. Sungguh Engkau Maha Pemberi.',
'QS. Shad 38:35', 'Doa manifestasi dan keberlimpahan', 7),

('Doa Sulaiman (Syukur)', 'sulaiman',
'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ',
'Rabbi awzi''ni an asykura ni''matakal lati an''amta alayya wa ala walidayya',
'Ya Tuhanku, anugerahkanlah aku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau berikan kepadaku dan kepada kedua orang tuaku.',
'QS. An-Naml 27:19', 'Doa memohon syukur', 8),

-- Doa Logos
('Doa Logos', 'logos',
NULL,
'Yaa Allah, hamba mohon agar mulai saat ini, apapun yang hamba lakukan, apapun pekerjaan hamba, apapun yang Kau karuniakan pada hamba: Kau tolong hamba untuk lebih dekat dengan-Mu, lebih Kau cintai, dan lebih mencintai-Mu. Lebih ridho pada-Mu dan Kau ridhoi. Membawa manfaat sebesar-besarnya pada sebanyak mungkin makhluk-Mu. Jadikan hamba rohmatan lil alamin. Dan setiap hari bertambah baik dan bertambah baik, hingga saatnya aku kembali pada-Mu dalam kondisi yang terbaik, husnul khotimah dalam pelukan cinta-Mu.',
'Doa niat utama - menjadi orang yang mencintai Allah, bermanfaat, dan versi terbaik diri',
'Ahmad Faiz Zainudin', 'Doa mencapai cinta Allah', 9),

-- Doa Pelunas Hutang
('Doa Pelunas Hutang', 'pelunas_hutang',
'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
'Allahummakfini bihalalika an haramik wa aghnini bifadhlika amman siwak',
'Ya Allah, cukupkanlah aku dengan rezeki halal-Mu dari yang haram, dan kayakan aku dengan karunia-Mu dari selain-Mu.',
'HR. Tirmidzi', 'Doa agar terbebas dari hutang dan kecukupan', 10),

-- Doa Cahaya & Ampunan
('Doa Cahaya dan Ampunan', 'harian',
'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
'Rabbana atmim lana nurana waghfir lana innaka ala kulli syai''in qadir',
'Ya Tuhan kami, sempurnakanlah cahaya untuk kami dan ampunilah kami. Sesungguhnya Engkau Maha Kuasa atas segala sesuatu.',
'QS. At-Tahrim 66:8', 'Doa meminta cahaya dan ampunan', 11),

-- Doa Petunjuk
('Doa Tetap di Hidayah', 'harian',
'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ',
'Rabbana la tuzigh qulubana ba''da idz hadaitana wahab lana min ladunka rahmatan innaka antal wahhab',
'Ya Tuhan kami, janganlah Engkau condongkan hati kami setelah Engkau beri petunjuk kepada kami, dan anugerahkanlah kepada kami rahmat dari sisi-Mu. Sesungguhnya Engkau Maha Pemberi.',
'QS. Ali Imran 3:8', 'Doa agar tetap dijaga dalam hidayah', 12),

-- Doa Dunia Akhirat
('Doa Kebaikan Dunia Akhirat', 'harian',
'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
'Rabbana atina fid dunya hasanatan wa fil akhirati hasanatan wa qina adzaban nar',
'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.',
'QS. Al-Baqarah 2:201', 'Doa meminta kebaikan dunia dan akhirat', 13);

-- =====================================================
-- SEED: ZIKIR PAGI & PETANG
-- =====================================================

INSERT INTO spiritual_zikir (nama, waktu, teks_arab, teks_latin, arti, jumlah_baca, dalil, urutan) VALUES
('Istighfar', 'harian', 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ', 'Astaghfirullahal ''adzim', 'Aku memohon ampun kepada Allah Yang Maha Agung', 100, 'HR. Abu Dawud', 1),
('Tasbih', 'harian', 'سُبْحَانَ اللهِ', 'Subhanallah', 'Maha Suci Allah', 33, 'HR. Muslim', 2),
('Tahmid', 'harian', 'الْحَمْدُ لِلَّهِ', 'Alhamdulillah', 'Segala puji bagi Allah', 33, 'HR. Muslim', 3),
('Takbir', 'harian', 'اللهُ أَكْبَرُ', 'Allahu Akbar', 'Allah Maha Besar', 33, 'HR. Muslim', 4),
('Tahlil', 'harian', 'لَا إِلَهَ إِلَّا اللهُ', 'La ilaha illallah', 'Tidak ada Tuhan selain Allah', 100, 'HR. Bukhari', 5),
('Shalawat', 'harian', 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ', 'Allahumma shalli ala Muhammad wa ala ali Muhammad', 'Ya Allah, berikanlah shalawat kepada Nabi Muhammad dan keluarganya', 100, 'HR. Bukhari', 6),
('Hauqalah', 'harian', 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', 'La haula wa la quwwata illa billah', 'Tidak ada daya dan kekuatan kecuali dengan Allah', 10, 'HR. Bukhari', 7),
('Ayat Kursi', 'pagi', NULL, 'Allahu la ilaha illa huwal hayyul qayyum...', 'Ayat Kursi lengkap', 1, 'HR. Nasai', 8),
('Al-Ikhlas', 'pagi', NULL, 'Qul huwallahu ahad...', 'Surat Al-Ikhlas', 3, 'HR. Abu Dawud', 9),
('Al-Falaq', 'pagi', NULL, 'Qul a''udzu birabbil falaq...', 'Surat Al-Falaq', 3, 'HR. Abu Dawud', 10),
('An-Nas', 'pagi', NULL, 'Qul a''udzu birabbin nas...', 'Surat An-Nas', 3, 'HR. Abu Dawud', 11),
('Sayyidul Istighfar', 'pagi', 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ', 'Allahumma anta rabbi la ilaha illa anta...', 'Penghulu istighfar', 1, 'HR. Bukhari', 12);

-- =====================================================
-- SEED: AMALAN HARIAN
-- =====================================================

INSERT INTO spiritual_amalan (nama, kategori, target_harian, keutamaan, dalil, urutan) VALUES
-- Shalat Wajib
('Shalat Subuh', 'shalat_wajib', 1, 'Dijaga malaikat hingga sore', 'HR. Muslim', 1),
('Shalat Dzuhur', 'shalat_wajib', 1, 'Waktu mustajab doa', 'HR. Bukhari', 2),
('Shalat Ashar', 'shalat_wajib', 1, 'Shalat wustha', 'QS. Al-Baqarah 238', 3),
('Shalat Maghrib', 'shalat_wajib', 1, 'Waktu ijabah', 'HR. Tirmidzi', 4),
('Shalat Isya', 'shalat_wajib', 1, 'Seperti qiyamul lail setengah malam', 'HR. Muslim', 5),

-- Shalat Sunnah
('Shalat Tahajud', 'shalat_sunnah', 1, 'Waktu paling mustajab', 'HR. Muslim', 6),
('Shalat Dhuha', 'shalat_sunnah', 1, 'Sedekah untuk 360 sendi', 'HR. Muslim', 7),
('Shalat Rawatib', 'shalat_sunnah', 1, 'Rumah di surga', 'HR. Muslim', 8),
('Shalat Witir', 'shalat_sunnah', 1, 'Penutup shalat malam', 'HR. Tirmidzi', 9),

-- Zikir
('Istighfar 100x', 'zikir', 100, 'Penghapus dosa + penarik rezeki', 'HR. Abu Dawud', 10),
('Tasbih 33x', 'zikir', 33, 'Tasbih', 'HR. Muslim', 11),
('Tahmid 33x', 'zikir', 33, 'Tahmid', 'HR. Muslim', 12),
('Takbir 33x', 'zikir', 33, 'Takbir', 'HR. Muslim', 13),
('Shalawat 100x', 'zikir', 100, '10 shalawat dari Allah', 'HR. Muslim', 14),

-- Quran
('Baca Al-Waqi''ah', 'quran', 1, 'Penangkal kemiskinan', 'HR. Baihaqi', 15),
('Baca Al-Mulk', 'quran', 1, 'Pelindung di kubur', 'HR. Tirmidzi', 16),
('Baca Ayat Kursi', 'quran', 1, 'Penjaga dari setan', 'HR. Bukhari', 17),
('Muraja''ah/Tilawah', 'quran', 1, '1 huruf = 10 kebaikan', 'HR. Tirmidzi', 18),

-- Sedekah
('Sedekah Harian', 'sedekah', 1, 'Penolak bala', 'HR. Tirmidzi', 19),

-- Penghapus Dosa
('Wudhu Sempurna', 'penghapus_dosa', 5, 'Dosa rontok', 'HR. Muslim', 20),
('Shalat Berjamaah', 'penghapus_dosa', 1, 'Dosa diampuni', 'HR. Bukhari', 21),
('Puasa Senin/Kamis', 'penghapus_dosa', 1, 'Amalan diangkat', 'HR. Tirmidzi', 22);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- Total seeded:
-- - 95+ emosi negatif
-- - 46 emosi positif
-- - 13 doa
-- - 12 zikir
-- - 22 amalan harian
