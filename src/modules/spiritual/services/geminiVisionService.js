/**
 * Gemini Vision API Service for Iridology Analysis
 * Uses Google Gemini Flash Latest for iris pattern recognition
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// gemini-flash-latest is confirmed working with this API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Bernard Jensen Iridology Chart mapping
const IRIDOLOGY_PROMPT = `Anda adalah ahli iridologi terlatih dalam sistem Bernard Jensen Iridology Chart.

Analisis foto mata ini dan identifikasi:
1. Ini mata kiri atau kanan berdasarkan posisi refleksi yang terlihat
2. Tanda-tanda yang terlihat: diskolorasi, lacunae (lesi terbuka), crypts, nerve rings, atau pola abnormal di iris
3. Posisi jam (1-12) dimana tanda-tanda ini muncul
4. Berdasarkan Bernard Jensen Chart, organ mana yang sesuai dengan posisi tersebut

REFERENSI Bernard Jensen Chart:
MATA KANAN:
- 12:00 = Otak, Cerebrum
- 1:00-2:00 = Paru Kanan, Bronkus
- 3:00 = Hati, Kandung Empedu
- 4:00-5:00 = Ginjal Kanan, Adrenal
- 6:00 = Organ Reproduksi, Punggung Bawah
- 7:00-8:00 = Usus Besar (Cecum)
- 9:00 = Jantung
- 10:00 = Pankreas, Lambung
- 11:00 = Tiroid, Leher

MATA KIRI:
- 12:00 = Otak, Cerebrum
- 1:00-2:00 = Jantung, Limpa
- 3:00 = Pankreas, Lambung
- 4:00-5:00 = Ginjal Kiri, Adrenal
- 6:00 = Organ Reproduksi, Punggung Bawah
- 7:00-8:00 = Usus Besar (Sigmoid)
- 9:00-10:00 = Paru Kiri
- 11:00 = Tiroid, Leher

PENTING: Selalu identifikasi minimal 2-3 zona yang perlu perhatian. Jika foto jelas, analisis dengan detail.

Balas dalam format JSON SAJA (tanpa markdown):
{
  "eyeSide": "left" atau "right",
  "confidence": 75-90,
  "detectedZones": [
    {
      "clockPosition": "3:00",
      "organ": "Hati",
      "finding": "Terlihat sedikit diskolorasi/lacunae",
      "severity": "ringan/sedang/signifikan"
    }
  ],
  "overallObservation": "Ringkasan singkat dalam Bahasa Indonesia",
  "disclaimer": "Ini adalah analisis alternatif, bukan diagnosa medis"
}`;

/**
 * Convert image file to base64
 */
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data:image/xxx;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
}

/**
 * Analyze iris photo using Gemini Vision API
 * @param {File} imageFile - The eye photo file
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeIrisWithGemini(imageFile) {
    console.log('🔬 Starting Gemini Vision analysis...');
    console.log('📋 API Key available:', !!GEMINI_API_KEY);

    if (!GEMINI_API_KEY) {
        console.error('❌ Gemini API key not configured');
        throw new Error('API key belum dikonfigurasi. Tambahkan VITE_GEMINI_API_KEY di file .env dan restart server.');
    }

    try {
        console.log('📷 Converting image to base64...');
        const base64Image = await fileToBase64(imageFile);
        const mimeType = imageFile.type || 'image/jpeg';
        console.log('✅ Image converted, MIME type:', mimeType);

        const requestBody = {
            contents: [{
                parts: [
                    { text: IRIDOLOGY_PROMPT },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Image
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.4,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        console.log('🌐 Sending request to Gemini API...');
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Gemini API error:', errorData);
            throw new Error(errorData.error?.message || 'Gagal menganalisis gambar');
        }

        const data = await response.json();
        console.log('✅ Received API response');

        // Extract the text response
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('📝 Raw text response:', textResponse?.substring(0, 200) + '...');

        if (!textResponse) {
            throw new Error('Tidak ada respons dari AI');
        }

        // Parse JSON from response (handle markdown code blocks)
        let jsonStr = textResponse.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        console.log('🔍 Parsing JSON...');
        const result = JSON.parse(jsonStr);
        console.log('✅ Parsed result:', result);
        return result;

    } catch (error) {
        console.error('❌ Iridology analysis error:', error);
        throw error;
    }
}

/**
 * Analyze both eyes and combine results
 * @param {File|null} rightEyeFile 
 * @param {File|null} leftEyeFile 
 * @returns {Promise<Object>} Combined analysis
 */
export async function analyzeIridology(rightEyeFile, leftEyeFile) {
    const results = {
        rightEye: null,
        leftEye: null,
        combinedOrgans: [],
        confidence: 0,
        hasError: false,
        errorMessage: null
    };

    try {
        // Analyze right eye if provided
        if (rightEyeFile) {
            try {
                results.rightEye = await analyzeIrisWithGemini(rightEyeFile);
                if (results.rightEye.error) {
                    results.hasError = true;
                    results.errorMessage = results.rightEye.message;
                }
            } catch (err) {
                console.error('Right eye analysis failed:', err);
                results.rightEye = { error: true, message: err.message };
            }
        }

        // Analyze left eye if provided
        if (leftEyeFile) {
            try {
                results.leftEye = await analyzeIrisWithGemini(leftEyeFile);
                if (results.leftEye.error) {
                    results.hasError = true;
                    results.errorMessage = results.leftEye.message;
                }
            } catch (err) {
                console.error('Left eye analysis failed:', err);
                results.leftEye = { error: true, message: err.message };
            }
        }

        // Combine organs from both eyes
        const organsSet = new Set();

        if (results.rightEye?.detectedZones) {
            results.rightEye.detectedZones.forEach(zone => {
                organsSet.add(zone.organ);
            });
        }

        if (results.leftEye?.detectedZones) {
            results.leftEye.detectedZones.forEach(zone => {
                organsSet.add(zone.organ);
            });
        }

        results.combinedOrgans = Array.from(organsSet);

        // Average confidence
        let confCount = 0;
        let confSum = 0;
        if (results.rightEye?.confidence) { confSum += results.rightEye.confidence; confCount++; }
        if (results.leftEye?.confidence) { confSum += results.leftEye.confidence; confCount++; }
        results.confidence = confCount > 0 ? Math.round(confSum / confCount) : 0;

        return results;

    } catch (error) {
        console.error('Combined iridology analysis error:', error);
        throw error;
    }
}

// ================== TONGUE DIAGNOSIS ==================
const TONGUE_PROMPT = `Anda adalah ahli diagnosa lidah TCM (Traditional Chinese Medicine).

Analisis foto lidah ini dan identifikasi:
1. WARNA LIDAH:
   - Pucat = Defisiensi darah/qi, anemia, kelelahan
   - Merah = Panas berlebih, inflamasi, stress
   - Merah tua/ungu = Stagnasi darah, sirkulasi buruk
   - Kebiruan = Sirkulasi sangat buruk, masalah jantung
   
2. LAPISAN (COATING):
   - Tipis putih = Normal
   - Tebal putih = Dingin, pencernaan lemah
   - Kuning = Panas, infeksi
   - Abu-abu/hitam = Kondisi serius
   - Tanpa coating = Defisiensi yin
   
3. BENTUK & TEKSTUR:
   - Bengkak dengan bekas gigi = Defisiensi qi limpa
   - Kurus/tipis = Defisiensi yin
   - Retak = Panas/kekeringan internal
   - Bintik merah = Panas/toxin
   
4. ZONA LIDAH (TCM):
   - Ujung = Jantung, Paru
   - Tengah = Lambung, Limpa
   - Sisi kiri = Hati
   - Sisi kanan = Kandung Empedu
   - Pangkal = Ginjal, Usus, Organ reproduksi

Balas dalam format JSON SAJA:
{
  "confidence": 75-90,
  "tongueColor": "merah/pucat/ungu/normal",
  "coating": "tipis putih/tebal putih/kuning/normal",
  "shape": "normal/bengkak/tipis/retak",
  "detectedOrgans": [
    {
      "organ": "Lambung",
      "zone": "tengah",
      "finding": "Coating kuning di bagian tengah",
      "indication": "Kemungkinan panas lambung"
    }
  ],
  "overallObservation": "Ringkasan kondisi dalam Bahasa Indonesia"
}`;

/**
 * Analyze tongue photo using Gemini Vision API (TCM)
 */
export async function analyzeTongueWithGemini(imageFile) {
    console.log('👅 Starting Tongue analysis...');

    if (!GEMINI_API_KEY) {
        throw new Error('API key belum dikonfigurasi');
    }

    try {
        const base64Image = await fileToBase64(imageFile);
        const mimeType = imageFile.type || 'image/jpeg';

        const requestBody = {
            contents: [{
                parts: [
                    { text: TONGUE_PROMPT },
                    { inline_data: { mime_type: mimeType, data: base64Image } }
                ]
            }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gagal menganalisis lidah');
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) throw new Error('Tidak ada respons dari AI');

        let jsonStr = textResponse.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const result = JSON.parse(jsonStr);
        console.log('✅ Tongue analysis result:', result);
        return result;

    } catch (error) {
        console.error('❌ Tongue analysis error:', error);
        throw error;
    }
}

// ================== NAIL DIAGNOSIS ==================
const NAIL_PROMPT = `Anda adalah ahli diagnosa kuku dan tangan.

Analisis foto kuku/tangan ini dan identifikasi:

1. WARNA KUKU:
   - Pucat = Anemia, sirkulasi buruk
   - Kebiruan = Masalah oksigenasi, jantung, paru
   - Kuning = Hati, jamur, diabetes
   - Putih = Hati, ginjal
   - Merah gelap = Jantung
   
2. LUNULA (Bulan Sabit):
   - Besar & jelas = Sirkulasi baik
   - Kecil/tidak ada = Energi rendah, metabolisme lambat
   - Merah = Masalah kardiovaskular
   
3. TEKSTUR & BENTUK:
   - Garis vertikal = Penuaan, stres, malnutrisi
   - Garis horizontal (Beau's lines) = Penyakit akut sebelumnya
   - Kuku sendok = Anemia defisiensi besi
   - Kuku clubbing = Masalah paru/jantung kronis
   - Kuku rapuh = Tiroid, kekurangan nutrisi
   - Bintik putih = Zinc deficiency
   
4. KONDISI KULIT TANGAN:
   - Telapak merah = Masalah hati
   - Telapak pucat = Anemia
   - Kulit kering = Tiroid, dehidrasi

Balas dalam format JSON SAJA:
{
  "confidence": 70-85,
  "nailColor": "normal/pucat/kuning/kebiruan",
  "lunulaCondition": "baik/kecil/tidak ada",
  "texture": "normal/garis vertikal/rapuh",
  "detectedOrgans": [
    {
      "organ": "Jantung",
      "finding": "Kuku sedikit kebiruan",
      "indication": "Perlu perhatian sirkulasi"
    }
  ],
  "overallObservation": "Ringkasan kondisi dalam Bahasa Indonesia"
}`;

/**
 * Analyze nail/hand photo using Gemini Vision API
 */
export async function analyzeNailWithGemini(imageFile) {
    console.log('✋ Starting Nail analysis...');

    if (!GEMINI_API_KEY) {
        throw new Error('API key belum dikonfigurasi');
    }

    try {
        const base64Image = await fileToBase64(imageFile);
        const mimeType = imageFile.type || 'image/jpeg';

        const requestBody = {
            contents: [{
                parts: [
                    { text: NAIL_PROMPT },
                    { inline_data: { mime_type: mimeType, data: base64Image } }
                ]
            }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gagal menganalisis kuku');
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) throw new Error('Tidak ada respons dari AI');

        let jsonStr = textResponse.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const result = JSON.parse(jsonStr);
        console.log('✅ Nail analysis result:', result);
        return result;

    } catch (error) {
        console.error('❌ Nail analysis error:', error);
        throw error;
    }
}

// ================== FACE MAPPING ==================
const FACE_PROMPT = `Anda adalah ahli diagnosa wajah TCM (Face Mapping).

Analisis foto wajah ini berdasarkan zona TCM:

ZONA WAJAH & ORGAN:
1. DAHI = Usus Kecil, Kandung Kemih
   - Jerawat/berminyak = Masalah pencernaan
   - Garis kerut = Stres, kecemasan

2. ANTARA ALIS = Hati
   - Kerutan vertikal = Stres hati, emosi terpendam
   - Kemerahan = Marah, frustrasi
   
3. BAWAH MATA = Ginjal
   - Kantung mata = Kelelahan ginjal
   - Lingkaran hitam = Kurang tidur, ginjal lemah
   - Bengkak = Retensi cairan
   
4. PIPI = Paru-paru (kiri=kiri, kanan=kanan)
   - Kemerahan = Masalah pernafasan
   - Jerawat = Alergi, pencernaan

5. HIDUNG = Jantung
   - Kemerahan = Tekanan darah
   - Pembuluh darah terlihat = Sirkulasi

6. MULUT & SEKITAR = Lambung, Limpa
   - Bibir pucat = Anemia, pencernaan lemah
   - Bibir kering = Dehidrasi
   
7. DAGU & RAHANG = Organ Reproduksi, Hormon
   - Jerawat = Ketidakseimbangan hormon
   - Kemerahan = Masalah hormonal

Balas dalam format JSON SAJA:
{
  "confidence": 70-85,
  "detectedOrgans": [
    {
      "organ": "Ginjal",
      "zone": "bawah mata",
      "finding": "Terlihat kantung mata dan sedikit bengkak",
      "indication": "Kemungkinan kelelahan atau retensi cairan"
    }
  ],
  "skinCondition": "normal/berminyak/kering/kombinasi",
  "overallObservation": "Ringkasan kondisi dalam Bahasa Indonesia"
}`;

/**
 * Analyze face photo using Gemini Vision API (TCM Face Mapping)
 */
export async function analyzeFaceWithGemini(imageFile) {
    console.log('😊 Starting Face analysis...');

    if (!GEMINI_API_KEY) {
        throw new Error('API key belum dikonfigurasi');
    }

    try {
        const base64Image = await fileToBase64(imageFile);
        const mimeType = imageFile.type || 'image/jpeg';

        const requestBody = {
            contents: [{
                parts: [
                    { text: FACE_PROMPT },
                    { inline_data: { mime_type: mimeType, data: base64Image } }
                ]
            }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gagal menganalisis wajah');
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) throw new Error('Tidak ada respons dari AI');

        let jsonStr = textResponse.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const result = JSON.parse(jsonStr);
        console.log('✅ Face analysis result:', result);
        return result;

    } catch (error) {
        console.error('❌ Face analysis error:', error);
        throw error;
    }
}

// ================== MULTI-MODAL COMBINED ANALYSIS ==================
/**
 * Combine all diagnostic methods with weighted scoring
 * @param {Object} results - Results from all analysis methods
 * @param {Object} questionnaireScore - Score from symptom questionnaire
 * @returns {Object} Combined analysis with weighted confidence
 */
export function combineMultiModalAnalysis(results, questionnaireScore = null) {
    const weights = {
        iris: 0.30,      // 30%
        tongue: 0.25,    // 25%
        nail: 0.15,      // 15%
        face: 0.15,      // 15%
        questionnaire: 0.15  // 15%
    };

    const organScores = {}; // Track per-organ confidence
    let totalWeightedConfidence = 0;
    let activeWeights = 0;

    // Process Iris results
    if (results.iris?.confidence > 0) {
        totalWeightedConfidence += results.iris.confidence * weights.iris;
        activeWeights += weights.iris;

        results.iris.combinedOrgans?.forEach(organ => {
            if (!organScores[organ]) organScores[organ] = { count: 0, sources: [] };
            organScores[organ].count++;
            organScores[organ].sources.push('👁️ Iris');
        });
    }

    // Process Tongue results
    if (results.tongue?.confidence > 0) {
        totalWeightedConfidence += results.tongue.confidence * weights.tongue;
        activeWeights += weights.tongue;

        results.tongue.detectedOrgans?.forEach(item => {
            const organ = item.organ;
            if (!organScores[organ]) organScores[organ] = { count: 0, sources: [] };
            organScores[organ].count++;
            organScores[organ].sources.push('👅 Lidah');
        });
    }

    // Process Nail results
    if (results.nail?.confidence > 0) {
        totalWeightedConfidence += results.nail.confidence * weights.nail;
        activeWeights += weights.nail;

        results.nail.detectedOrgans?.forEach(item => {
            const organ = item.organ;
            if (!organScores[organ]) organScores[organ] = { count: 0, sources: [] };
            organScores[organ].count++;
            organScores[organ].sources.push('✋ Kuku');
        });
    }

    // Process Face results
    if (results.face?.confidence > 0) {
        totalWeightedConfidence += results.face.confidence * weights.face;
        activeWeights += weights.face;

        results.face.detectedOrgans?.forEach(item => {
            const organ = item.organ;
            if (!organScores[organ]) organScores[organ] = { count: 0, sources: [] };
            organScores[organ].count++;
            organScores[organ].sources.push('😊 Wajah');
        });
    }

    // Process Questionnaire results
    if (questionnaireScore?.confidence > 0) {
        totalWeightedConfidence += questionnaireScore.confidence * weights.questionnaire;
        activeWeights += weights.questionnaire;

        questionnaireScore.organs?.forEach(organ => {
            if (!organScores[organ]) organScores[organ] = { count: 0, sources: [] };
            organScores[organ].count++;
            organScores[organ].sources.push('📝 Kuesioner');
        });
    }

    // Calculate final confidence (normalized to active weights)
    const finalConfidence = activeWeights > 0
        ? Math.round(totalWeightedConfidence / activeWeights)
        : 0;

    // Sort organs by detection count (most detected = most concerning)
    const sortedOrgans = Object.entries(organScores)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([organ, data]) => ({
            organ,
            detectionCount: data.count,
            sources: data.sources,
            priority: data.count >= 3 ? 'tinggi' : data.count >= 2 ? 'sedang' : 'rendah'
        }));

    return {
        combinedConfidence: finalConfidence,
        totalMethodsUsed: Object.keys(results).filter(k => results[k]?.confidence > 0).length + (questionnaireScore?.confidence > 0 ? 1 : 0),
        organPriorities: sortedOrgans,
        detailedResults: {
            iris: results.iris || null,
            tongue: results.tongue || null,
            nail: results.nail || null,
            face: results.face || null,
            questionnaire: questionnaireScore || null
        }
    };
}
