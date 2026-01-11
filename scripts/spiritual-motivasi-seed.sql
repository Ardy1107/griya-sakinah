-- Seed Data: 100 Motivasi Islami untuk Spiritual Abundance
-- Jalankan di Supabase SQL Editor

-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.spiritual_motivasi (
    id SERIAL PRIMARY KEY,
    quote TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'umum',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.spiritual_motivasi ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY IF NOT EXISTS "Allow public read" ON public.spiritual_motivasi
    FOR SELECT USING (true);

-- Clear existing data
DELETE FROM public.spiritual_motivasi;

-- Insert 100 Motivasi Islami
INSERT INTO public.spiritual_motivasi (quote, source, category) VALUES
-- Al-Quran (30 ayat)
('Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.', 'QS. Al-Baqarah 2:286', 'quran'),
('Sesungguhnya sesudah kesulitan itu ada kemudahan.', 'QS. Asy-Syarh 94:6', 'quran'),
('Barangsiapa bertakwa kepada Allah, niscaya Allah akan memberikannya jalan keluar.', 'QS. At-Talaq 65:2-3', 'quran'),
('Dan Tuhanmu berfirman: "Berdoalah kepada-Ku, niscaya akan Kuperkenankan bagimu."', 'QS. Al-Mumin 40:60', 'quran'),
('Sesungguhnya Allah bersama orang-orang yang sabar.', 'QS. Al-Baqarah 2:153', 'quran'),
('Dan janganlah kamu berputus asa dari rahmat Allah.', 'QS. Yusuf 12:87', 'quran'),
('Ingatlah, hanya dengan mengingat Allah hati menjadi tentram.', 'QS. Ar-Rad 13:28', 'quran'),
('Allah tidak mengubah keadaan suatu kaum sehingga mereka mengubah keadaan yang ada pada diri mereka sendiri.', 'QS. Ar-Rad 13:11', 'quran'),
('Dan bersabarlah, sesungguhnya Allah beserta orang-orang yang sabar.', 'QS. Al-Anfal 8:46', 'quran'),
('Sesungguhnya bersama kesulitan ada kemudahan.', 'QS. Asy-Syarh 94:5', 'quran'),
('Dan mohonlah pertolongan (kepada Allah) dengan sabar dan shalat.', 'QS. Al-Baqarah 2:45', 'quran'),
('Apabila hamba-hamba-Ku bertanya kepadamu tentang Aku, maka sesungguhnya Aku dekat.', 'QS. Al-Baqarah 2:186', 'quran'),
('Hai orang-orang yang beriman, jadikanlah sabar dan shalat sebagai penolongmu.', 'QS. Al-Baqarah 2:153', 'quran'),
('Allah mencintai orang-orang yang bertawakkal.', 'QS. Ali Imran 3:159', 'quran'),
('Dan Allah bersama orang-orang yang berbuat kebaikan.', 'QS. Al-Ankabut 29:69', 'quran'),
('Maka nikmat Tuhanmu yang manakah yang kamu dustakan?', 'QS. Ar-Rahman 55:13', 'quran'),
('Sesungguhnya Allah tidak akan mengubah nasib suatu kaum hingga mereka mengubah diri mereka sendiri.', 'QS. Ar-Rad 13:11', 'quran'),
('Katakanlah: "Wahai hamba-hamba-Ku yang melampaui batas terhadap diri mereka sendiri, janganlah kamu berputus asa dari rahmat Allah."', 'QS. Az-Zumar 39:53', 'quran'),
('Cukuplah Allah menjadi Pelindung bagi kami dan Allah adalah sebaik-baik Pelindung.', 'QS. Ali Imran 3:173', 'quran'),
('Sesungguhnya jika kamu bersyukur, pasti Kami akan menambah (nikmat) kepadamu.', 'QS. Ibrahim 14:7', 'quran'),
('Dan Kami telah menjadikan sebagian kamu cobaan bagi sebagian yang lain. Maukah kamu bersabar?', 'QS. Al-Furqan 25:20', 'quran'),
('Sesungguhnya orang-orang yang beriman dan mengerjakan amal saleh, kelak Allah akan menanamkan dalam hati mereka rasa kasih sayang.', 'QS. Maryam 19:96', 'quran'),
('Barangsiapa yang mengerjakan kebaikan seberat dzarrah pun, niscaya dia akan melihat (balasan)nya.', 'QS. Az-Zalzalah 99:7', 'quran'),
('Dan Allah bersama orang-orang yang bertakwa.', 'QS. At-Taubah 9:36', 'quran'),
('Sungguh, bersama kesukaran ada kemudahan.', 'QS. Asy-Syarh 94:5', 'quran'),
('Dan bertawakkallah kepada Allah dan cukuplah Allah sebagai Pelindung.', 'QS. Al-Ahzab 33:3', 'quran'),
('Sesungguhnya Allah menyukai orang-orang yang bertobat dan menyukai orang-orang yang menyucikan diri.', 'QS. Al-Baqarah 2:222', 'quran'),
('Dan Dia mendapatimu sebagai seorang yang bingung, lalu Dia memberikan petunjuk.', 'QS. Ad-Duha 93:7', 'quran'),
('Dan kelak Tuhanmu pasti memberikan karunia-Nya kepadamu, sehingga engkau menjadi puas.', 'QS. Ad-Duha 93:5', 'quran'),
('Maka bersabarlah kamu dengan sabar yang baik.', 'QS. Al-Maarij 70:5', 'quran'),

-- Hadits Nabi (40 hadits)
('Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.', 'HR. Bukhari', 'hadits'),
('Janganlah kamu meremehkan suatu kebaikan apapun, walaupun hanya bermuka manis ketika bertemu saudaramu.', 'HR. Muslim', 'hadits'),
('Barangsiapa menempuh jalan untuk mencari ilmu, maka Allah mudahkan baginya jalan menuju surga.', 'HR. Muslim', 'hadits'),
('Tidaklah seorang muslim tertimpa suatu kelelahan, penyakit, kekhawatiran, kesedihan, gangguan, atau kesusahan, bahkan duri yang menusuknya, kecuali Allah menghapus kesalahan-kesalahannya.', 'HR. Bukhari & Muslim', 'hadits'),
('Sungguh menakjubkan urusan seorang mukmin. Sesungguhnya semua urusannya baik baginya.', 'HR. Muslim', 'hadits'),
('Jadilah di dunia seakan-akan engkau orang asing atau pengembara.', 'HR. Bukhari', 'hadits'),
('Barangsiapa beriman kepada Allah dan hari akhir, maka hendaklah ia berkata baik atau diam.', 'HR. Bukhari & Muslim', 'hadits'),
('Ridha Allah terletak pada ridha orang tua, dan murka Allah terletak pada murka orang tua.', 'HR. Tirmidzi', 'hadits'),
('Doa adalah senjata orang mukmin.', 'HR. Al-Hakim', 'hadits'),
('Barangsiapa tidak mensyukuri yang sedikit, maka ia tidak akan bersyukur pada yang banyak.', 'HR. Ahmad', 'hadits'),
('Mukmin yang kuat lebih baik dan lebih dicintai Allah daripada mukmin yang lemah.', 'HR. Muslim', 'hadits'),
('Jagalah Allah, niscaya Dia akan menjagamu.', 'HR. Tirmidzi', 'hadits'),
('Jika kamu meminta, mintalah kepada Allah. Jika kamu minta pertolongan, mintalah pertolongan kepada Allah.', 'HR. Tirmidzi', 'hadits'),
('Tidaklah kesabaran itu kecuali pada kejutan pertama.', 'HR. Bukhari', 'hadits'),
('Barangsiapa menunjukkan kepada kebaikan, maka baginya pahala seperti pahala orang yang mengerjakannya.', 'HR. Muslim', 'hadits'),
('Senyummu di hadapan saudaramu adalah sedekah.', 'HR. Tirmidzi', 'hadits'),
('Setiap kalian adalah pemimpin dan setiap pemimpin akan dimintai pertanggungjawaban atas yang dipimpinnya.', 'HR. Bukhari & Muslim', 'hadits'),
('Barangsiapa yang bersabar, Allah akan menjadikannya sabar.', 'HR. Bukhari', 'hadits'),
('Dunia adalah penjara bagi orang mukmin dan surga bagi orang kafir.', 'HR. Muslim', 'hadits'),
('Bertakwalah kepada Allah di mana pun kamu berada, dan ikutilah keburukan dengan kebaikan, niscaya ia akan menghapusnya.', 'HR. Tirmidzi', 'hadits'),
('Jangan pernah meremehkan kebaikan sekecil apapun.', 'HR. Muslim', 'hadits'),
('Tidaklah Allah membebani jiwa melainkan dengan kadar kemampuannya.', 'HR. Bukhari', 'hadits'),
('Kunci surga adalah shalat, dan kunci shalat adalah bersuci.', 'HR. Ahmad', 'hadits'),
('Jauhilah prasangka buruk, karena prasangka buruk adalah perkataan yang paling dusta.', 'HR. Bukhari & Muslim', 'hadits'),
('Tangan di atas lebih baik dari tangan di bawah.', 'HR. Bukhari & Muslim', 'hadits'),
('Tidak beriman salah seorang dari kalian hingga ia mencintai saudaranya seperti ia mencintai dirinya sendiri.', 'HR. Bukhari & Muslim', 'hadits'),
('Seseorang akan bersama dengan orang yang dicintainya.', 'HR. Bukhari & Muslim', 'hadits'),
('Sebaik-baik kamu adalah yang paling baik akhlaknya.', 'HR. Bukhari', 'hadits'),
('Sesungguhnya Allah tidak melihat kepada tubuh dan rupamu, tetapi Dia melihat kepada hati dan amalmu.', 'HR. Muslim', 'hadits'),
('Barangsiapa memudahkan kesulitan orang lain, Allah akan memudahkan kesulitannya di dunia dan akhirat.', 'HR. Muslim', 'hadits'),
('Saling memberi hadiahlah, niscaya kalian akan saling mencintai.', 'HR. Bukhari', 'hadits'),
('Malu adalah cabang dari iman.', 'HR. Bukhari & Muslim', 'hadits'),
('Harta tidak akan berkurang karena sedekah.', 'HR. Muslim', 'hadits'),
('Sebaik-baik sedekah adalah sedekah yang ditunaikan saat dalam keadaan sehat, pelit, berharap kaya, dan takut miskin.', 'HR. Bukhari & Muslim', 'hadits'),
('Allah tidak menerima shalat tanpa bersuci.', 'HR. Muslim', 'hadits'),
('Barangsiapa yang bangun di malam hari lalu membangunkan istrinya, kemudian keduanya shalat dua rakaat, maka keduanya dicatat sebagai orang yang banyak berdzikir.', 'HR. Abu Dawud', 'hadits'),
('Orang yang paling dicintai Allah adalah yang paling bermanfaat bagi manusia.', 'HR. Thabrani', 'hadits'),
('Surga di bawah telapak kaki ibu.', 'HR. Nasa''i', 'hadits'),
('Barangsiapa menutupi aib seorang muslim, Allah akan menutupi aibnya di dunia dan akhirat.', 'HR. Muslim', 'hadits'),
('Istiqamah (konsisten dalam kebaikan) lebih baik dari seribu karamah (keajaiban).', 'Imam Syafii', 'hadits'),

-- Wisdom & Inspirasi (30 quotes)
('Mulailah hari dengan bismillah, akhiri dengan alhamdulillah.', 'Wisdom Islami', 'wisdom'),
('Jangan bersedih, Allah bersamamu.', 'Wisdom Islami', 'wisdom'),
('Setiap kesulitan adalah ujian, dan setiap ujian adalah peluang untuk naik derajat.', 'Wisdom Islami', 'wisdom'),
('Bersyukurlah atas apa yang kamu miliki, agar Allah tambahkan lebih.', 'Wisdom Islami', 'wisdom'),
('Doa adalah senjata yang tak pernah gagal.', 'Wisdom Islami', 'wisdom'),
('Ketika dunia terasa berat, ingatlah Allah selalu bersamamu.', 'Wisdom Islami', 'wisdom'),
('Hidup ini singkat, isi dengan ibadah dan kebaikan.', 'Wisdom Islami', 'wisdom'),
('Rezeki sudah diatur, tugasmu hanya berusaha dan berdoa.', 'Wisdom Islami', 'wisdom'),
('Jangan ukur keberuntunganmu dengan harta, ukurlah dengan ketenangan hati.', 'Wisdom Islami', 'wisdom'),
('Setiap pagi adalah kesempatan baru untuk memperbaiki diri.', 'Wisdom Islami', 'wisdom'),
('Kebahagiaan sejati adalah ketika hati dekat dengan Allah.', 'Wisdom Islami', 'wisdom'),
('Jangan mengeluh tentang apa yang tidak kamu miliki, bersyukurlah atas apa yang sudah ada.', 'Wisdom Islami', 'wisdom'),
('Sabar bukan berarti lemah, sabar adalah kekuatan luar biasa.', 'Wisdom Islami', 'wisdom'),
('Setiap detik adalah kesempatan untuk beristighfar.', 'Wisdom Islami', 'wisdom'),
('Yakinlah bahwa pertolongan Allah akan datang tepat waktu.', 'Wisdom Islami', 'wisdom'),
('Ketika kamu merasa sendirian, ingatlah Allah tidak pernah tidur.', 'Wisdom Islami', 'wisdom'),
('Tahajud adalah waktu terbaik untuk curhat kepada Sang Pencipta.', 'Wisdom Islami', 'wisdom'),
('Jangan pernah putus asa dari rahmat Allah.', 'Wisdom Islami', 'wisdom'),
('Hati yang bersih adalah pintu masuk hidayah.', 'Wisdom Islami', 'wisdom'),
('Keikhlasan adalah kunci diterimanya segala amal.', 'Wisdom Islami', 'wisdom'),
('Jadikan Al-Quran sebagai teman hidupmu.', 'Wisdom Islami', 'wisdom'),
('Setiap cobaan adalah cara Allah untuk mendekatkanmu kepada-Nya.', 'Wisdom Islami', 'wisdom'),
('Jangan bandingkan hidupmu dengan orang lain, setiap orang punya jalannya masing-masing.', 'Wisdom Islami', 'wisdom'),
('Kebaikan yang kamu tanam hari ini akan kamu panen di masa depan.', 'Wisdom Islami', 'wisdom'),
('Ridha Allah adalah tujuan utama setiap amal.', 'Wisdom Islami', 'wisdom'),
('Ketika bingung, shalat istikharah adalah jawabannya.', 'Wisdom Islami', 'wisdom'),
('Jangan takut gagal, takutlah tidak pernah mencoba dengan bismillah.', 'Wisdom Islami', 'wisdom'),
('Setiap langkahmu dalam kebaikan adalah investasi untuk akhirat.', 'Wisdom Islami', 'wisdom'),
('Berdamailah dengan masa lalumu agar bisa menyambut masa depan dengan tenang.', 'Wisdom Islami', 'wisdom'),
('Orang sukses adalah orang yang terus bangkit setelah terjatuh.', 'Wisdom Islami', 'wisdom');

-- Verify data
SELECT category, COUNT(*) as total FROM public.spiritual_motivasi GROUP BY category;
