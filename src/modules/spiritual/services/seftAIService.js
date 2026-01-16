/**
 * SEFT AI Service
 * AI-powered emotion analysis using Google Gemini
 */

// Use dedicated SEFT API key (or fallback to general Gemini key)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_SEFT_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// List of known wounds from SEFT system
const KNOWN_WOUNDS = [
    // Penyakit Hati Besar
    'Syirik', 'Riya', 'Kufur Nikmat', 'Sombong', 'Kibr', 'Hasad', 'Dengki',
    // Emosi Negatif
    'Marah', 'Ghadab', 'Khauf', 'Cemas', 'Takut', 'Takut Gagal', 'Sedih',
    'Kesepian', 'Malu', 'Bersalah', 'Menyesal', 'Kecewa', 'Frustasi',
    'Stres', 'Overthinking', 'Apatis', 'Putus Asa', 'Trauma',
    'Inner Child Terluka', 'Insecure', 'Perfeksionis', 'Dendam', 'Benci',
    // Konflik
    'Konflik dengan Orang Tua', 'Konflik dengan Pasangan',
    'Masalah Finansial', 'Stres Pekerjaan', 'Grief', 'Patah Hati'
];

// Category mappings
const CATEGORY_MAP = {
    'Syirik': 'Syirik', 'Riya': 'Riya',
    'Sombong': 'Sombong', 'Kibr': 'Sombong',
    'Hasad': 'Hasad', 'Dengki': 'Hasad',
    'Marah': 'Marah', 'Ghadab': 'Marah', 'Dendam': 'Marah', 'Benci': 'Marah',
    'Khauf': 'Takut', 'Cemas': 'Takut', 'Takut': 'Takut', 'Takut Gagal': 'Takut',
    'Overthinking': 'Takut', 'Insecure': 'Takut',
    'Sedih': 'Sedih', 'Kesepian': 'Sedih', 'Grief': 'Sedih', 'Patah Hati': 'Sedih',
    'Malu': 'Malu',
    'Bersalah': 'Bersalah', 'Menyesal': 'Bersalah',
    'Kecewa': 'Kecewa', 'Frustasi': 'Kecewa',
    'Stres': 'Stres', 'Stres Pekerjaan': 'Stres', 'Perfeksionis': 'Stres',
    'Apatis': 'Apatis', 'Putus Asa': 'Apatis',
    'Trauma': 'Trauma', 'Inner Child Terluka': 'Trauma',
    'Konflik dengan Orang Tua': 'Keluarga', 'Konflik dengan Pasangan': 'Hubungan',
    'Masalah Finansial': 'Finansial', 'Kufur Nikmat': 'Spiritual'
};

// AI Prompt for emotion analysis with 4-pillar SEFT setup
const EMOTION_ANALYSIS_PROMPT = `Anda adalah konselor SEFT (Spiritual Emotional Freedom Technique) yang ahli dalam menganalisis emosi.

Berdasarkan curahan hati user berikut, identifikasi:
1. Emosi/luka apa yang sedang dirasakan
2. Akar masalahnya
3. Luka mana yang perlu di-SEFT
4. Berikan kalimat setup SEFT dengan 4 PILAR:

FORMAT 4 PILAR SEFT:
- PILAR 1 (IKHLAS): "Meskipun saya [emosi/masalah], saya ikhlas menerima kondisi ini..."
- PILAR 2 (PASRAH): "...saya pasrah kepada Allah..."
- PILAR 3 (SYUKUR): "...saya bersyukur atas semua nikmat-Nya..."
- PILAR 4 (SABAR): "...dan saya sabar menghadapi ujian ini."

BERIKAN 2 VERSI:
1. setupPendek: Kalimat ringkas 1-2 kalimat
2. setupPanjang: Kalimat lengkap dengan detail situasi dan 4 pilar

DAFTAR LUKA YANG DIKENALI:
${KNOWN_WOUNDS.join(', ')}

Balas dalam format JSON SAJA (tanpa markdown):
{
  "detectedEmotions": ["Marah", "Takut Gagal"],
  "primaryEmotion": "Marah",
  "rootCause": "Deskripsi singkat akar masalah yang terdeteksi",
  "suggestedWounds": [
    {"name": "Marah", "category": "Marah", "priority": 1, "reason": "Mengapa luka ini perlu di-release"},
    {"name": "Takut Gagal", "category": "Takut", "priority": 2, "reason": "Alasan kedua"}
  ],
  "setupPendek": "Meskipun saya marah pada bos, saya ikhlas, pasrah, syukur, dan sabar.",
  "setupPanjang": "Meskipun saya merasa sangat marah karena bos selalu memarahi saya tanpa alasan, saya ikhlas menerima kondisi ini. Saya pasrah kepada Allah atas ujian ini. Saya bersyukur masih diberi pekerjaan dan kesehatan. Dan saya sabar menghadapi ujian ini sambil terus memperbaiki diri.",
  "insights": "Insight atau pola yang terdeteksi dari curhat user dengan saran penyembuhan mendalam",
  "affirmation": "Kalimat afirmasi positif islami untuk user"
}`;

/**
 * Analyze emotion from user's text using Gemini AI
 * @param {string} userText - User's text describing their feelings
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeEmotionFromText(userText) {
    console.log('🧠 Starting AI emotion analysis...');

    if (!GEMINI_API_KEY) {
        console.warn('⚠️ Gemini API key not configured, using fallback analysis');
        return fallbackAnalysis(userText);
    }

    if (!userText || userText.trim().length < 10) {
        throw new Error('Mohon ceritakan lebih detail perasaan Anda (minimal 10 karakter)');
    }

    try {
        const fullPrompt = `${EMOTION_ANALYSIS_PROMPT}

CURAHAN HATI USER:
"${userText}"

Analisis dan berikan respons dalam format JSON:`;

        const requestBody = {
            contents: [{
                parts: [{ text: fullPrompt }]
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Gemini API error:', errorData);
            return fallbackAnalysis(userText);
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            console.warn('⚠️ No response from AI, using fallback');
            return fallbackAnalysis(userText);
        }

        // Parse JSON from response
        let jsonStr = textResponse.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const result = JSON.parse(jsonStr);
        console.log('✅ AI analysis result:', result);

        // Ensure categories are correct
        if (result.suggestedWounds) {
            result.suggestedWounds = result.suggestedWounds.map(w => ({
                ...w,
                category: CATEGORY_MAP[w.name] || w.category || 'Lainnya'
            }));
        }

        return result;

    } catch (error) {
        console.error('❌ AI emotion analysis error:', error);
        return fallbackAnalysis(userText);
    }
}

/**
 * Fallback analysis when AI is unavailable
 */
function fallbackAnalysis(userText) {
    const text = userText.toLowerCase();
    const detectedEmotions = [];

    // Simple keyword matching
    const emotionKeywords = {
        'Marah': ['marah', 'kesal', 'jengkel', 'emosi', 'benci', 'geram'],
        'Takut': ['takut', 'khawatir', 'cemas', 'gelisah', 'was-was'],
        'Sedih': ['sedih', 'duka', 'kesepian', 'lonely', 'sendiri', 'hampa'],
        'Kecewa': ['kecewa', 'dikhianati', 'patah hati', 'frustasi'],
        'Stres': ['stres', 'stress', 'tertekan', 'overwhelmed', 'beban'],
        'Bersalah': ['bersalah', 'menyesal', 'salah', 'dosa'],
        'Malu': ['malu', 'rendah diri', 'tidak percaya diri'],
        'Takut Gagal': ['gagal', 'tidak mampu', 'tidak bisa'],
        'Overthinking': ['mikir', 'thinking', 'pikiran', 'terus menerus'],
        'Trauma': ['trauma', 'luka lama', 'masa lalu', 'flashback']
    };

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
            detectedEmotions.push(emotion);
        }
    }

    if (detectedEmotions.length === 0) {
        detectedEmotions.push('Stres'); // Default
    }

    const primaryEmotion = detectedEmotions[0];
    const suggestedWounds = detectedEmotions.slice(0, 3).map((emotion, idx) => ({
        name: emotion,
        category: CATEGORY_MAP[emotion] || 'Lainnya',
        priority: idx + 1,
        reason: `Terdeteksi dari kata kunci dalam curhat Anda`
    }));

    // Generate 4-pillar setup for fallback
    const setupPendek = `Meskipun saya merasa ${primaryEmotion.toLowerCase()}, saya ikhlas, pasrah, syukur, dan sabar.`;
    const setupPanjang = `Meskipun saya merasa ${primaryEmotion.toLowerCase()} dengan situasi yang saya alami, saya ikhlas menerima kondisi ini. Saya pasrah kepada Allah atas segala ujian ini. Saya bersyukur atas semua nikmat yang telah Allah berikan. Dan saya sabar menghadapi ujian ini karena Allah bersama orang-orang yang sabar.`;

    return {
        detectedEmotions,
        primaryEmotion,
        rootCause: 'Berdasarkan kata kunci yang terdeteksi dari curhat Anda',
        suggestedWounds,
        setupPendek,
        setupPanjang,
        insights: 'Emosi yang terdeteksi menunjukkan ada hal yang perlu dilepaskan. Lakukan SEFT secara rutin untuk penyembuhan yang lebih mendalam.',
        affirmation: 'Saya layak untuk bahagia dan damai. Allah selalu bersama saya.',
        isAIAnalysis: false
    };
}

/**
 * Get wound suggestions based on physical symptoms
 */
export function getWoundFromSymptom(symptom) {
    const symptomMap = {
        'sakit kepala': ['Marah', 'Sombong', 'Stres', 'Overthinking'],
        'migrain': ['Marah', 'Stres', 'Perfeksionis'],
        'sakit lambung': ['Cemas', 'Khawatir', 'Konflik dengan Orang Tua'],
        'maag': ['Cemas', 'Inner Child Terluka'],
        'sesak napas': ['Cemas', 'Takut', 'Panik'],
        'jantung berdebar': ['Cemas', 'Takut', 'Stres'],
        'insomnia': ['Cemas', 'Overthinking', 'Takut'],
        'kelelahan': ['Apatis', 'Stres', 'Burnout'],
        'nyeri punggung': ['Masalah Finansial', 'Stres', 'Beban'],
        'nyeri dada': ['Sedih', 'Patah Hati', 'Kesepian']
    };

    const lowerSymptom = symptom.toLowerCase();
    for (const [key, wounds] of Object.entries(symptomMap)) {
        if (lowerSymptom.includes(key)) {
            return wounds;
        }
    }

    return ['Stres']; // Default
}

/**
 * Get category color
 */
export function getCategoryColor(category) {
    const colors = {
        'Syirik': '#dc2626',
        'Riya': '#dc2626',
        'Sombong': '#ea580c',
        'Hasad': '#f59e0b',
        'Marah': '#ef4444',
        'Takut': '#8b5cf6',
        'Sedih': '#3b82f6',
        'Malu': '#ec4899',
        'Bersalah': '#6b7280',
        'Kecewa': '#f97316',
        'Stres': '#eab308',
        'Apatis': '#64748b',
        'Trauma': '#7c3aed',
        'Keluarga': '#10b981',
        'Hubungan': '#f472b6',
        'Finansial': '#22c55e',
        'Spiritual': '#06b6d4'
    };

    return colors[category] || '#6b7280';
}
