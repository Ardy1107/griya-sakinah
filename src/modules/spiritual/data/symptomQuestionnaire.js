/**
 * Symptom Questionnaire Data
 * 25 questions to assess health conditions and map to organs
 */

export const QUESTIONNAIRE_SECTIONS = [
    {
        id: 'digestion',
        title: 'Pencernaan',
        icon: '🍽️',
        questions: [
            {
                id: 'q1',
                text: 'Apakah Anda sering mengalami kembung atau begah setelah makan?',
                type: 'frequency',
                organs: ['Lambung', 'Limpa'],
            },
            {
                id: 'q2',
                text: 'Apakah Anda mengalami sembelit atau susah BAB?',
                type: 'frequency',
                organs: ['Usus Besar', 'Hati'],
            },
            {
                id: 'q3',
                text: 'Apakah Anda sering mengalami mual atau muntah?',
                type: 'frequency',
                organs: ['Lambung', 'Hati'],
            },
            {
                id: 'q4',
                text: 'Apakah Anda mengalami nyeri ulu hati atau maag?',
                type: 'frequency',
                organs: ['Lambung'],
            },
        ]
    },
    {
        id: 'energy',
        title: 'Energi & Tidur',
        icon: '⚡',
        questions: [
            {
                id: 'q5',
                text: 'Apakah Anda sering merasa lelah meski sudah cukup tidur?',
                type: 'frequency',
                organs: ['Ginjal', 'Limpa', 'Adrenal'],
            },
            {
                id: 'q6',
                text: 'Apakah Anda mengalami kesulitan tidur atau insomnia?',
                type: 'frequency',
                organs: ['Jantung', 'Hati'],
            },
            {
                id: 'q7',
                text: 'Apakah Anda sering terbangun di tengah malam (jam 1-3)?',
                type: 'frequency',
                organs: ['Hati'],
            },
            {
                id: 'q8',
                text: 'Apakah energi Anda menurun drastis di sore hari?',
                type: 'frequency',
                organs: ['Limpa', 'Pankreas'],
            },
        ]
    },
    {
        id: 'respiratory',
        title: 'Pernafasan',
        icon: '🌬️',
        questions: [
            {
                id: 'q9',
                text: 'Apakah Anda sering batuk atau pilek?',
                type: 'frequency',
                organs: ['Paru', 'Paru Kanan', 'Paru Kiri'],
            },
            {
                id: 'q10',
                text: 'Apakah Anda mudah sesak nafas saat beraktivitas?',
                type: 'frequency',
                organs: ['Paru', 'Jantung'],
            },
            {
                id: 'q11',
                text: 'Apakah Anda memiliki alergi (debu, makanan, cuaca)?',
                type: 'yesno',
                organs: ['Paru', 'Limpa'],
            },
        ]
    },
    {
        id: 'circulation',
        title: 'Sirkulasi & Jantung',
        icon: '❤️',
        questions: [
            {
                id: 'q12',
                text: 'Apakah tangan atau kaki Anda sering dingin?',
                type: 'frequency',
                organs: ['Jantung', 'Ginjal'],
            },
            {
                id: 'q13',
                text: 'Apakah Anda mengalami jantung berdebar tanpa sebab?',
                type: 'frequency',
                organs: ['Jantung'],
            },
            {
                id: 'q14',
                text: 'Apakah Anda mudah pusing atau kepala terasa berat?',
                type: 'frequency',
                organs: ['Otak', 'Hati', 'Jantung'],
            },
        ]
    },
    {
        id: 'urinary',
        title: 'Ginjal & Kandung Kemih',
        icon: '💧',
        questions: [
            {
                id: 'q15',
                text: 'Apakah Anda sering buang air kecil di malam hari?',
                type: 'frequency',
                organs: ['Ginjal', 'Kandung Kemih'],
            },
            {
                id: 'q16',
                text: 'Apakah Anda mengalami nyeri pinggang?',
                type: 'frequency',
                organs: ['Ginjal', 'Ginjal Kanan', 'Ginjal Kiri'],
            },
            {
                id: 'q17',
                text: 'Apakah Anda sering merasa haus berlebihan?',
                type: 'frequency',
                organs: ['Ginjal', 'Pankreas'],
            },
        ]
    },
    {
        id: 'emotional',
        title: 'Emosi & Mental',
        icon: '💭',
        questions: [
            {
                id: 'q18',
                text: 'Apakah Anda mudah marah atau tersinggung?',
                type: 'frequency',
                organs: ['Hati'],
            },
            {
                id: 'q19',
                text: 'Apakah Anda sering merasa cemas atau khawatir berlebihan?',
                type: 'frequency',
                organs: ['Limpa', 'Ginjal'],
            },
            {
                id: 'q20',
                text: 'Apakah Anda sering merasa sedih tanpa alasan jelas?',
                type: 'frequency',
                organs: ['Paru', 'Jantung'],
            },
            {
                id: 'q21',
                text: 'Apakah Anda mengalami stres berkepanjangan?',
                type: 'frequency',
                organs: ['Hati', 'Adrenal', 'Otak'],
            },
        ]
    },
    {
        id: 'skin',
        title: 'Kulit & Penampilan',
        icon: '✨',
        questions: [
            {
                id: 'q22',
                text: 'Apakah kulit Anda kering atau mudah pecah-pecah?',
                type: 'frequency',
                organs: ['Paru', 'Ginjal'],
            },
            {
                id: 'q23',
                text: 'Apakah Anda sering berjerawat?',
                type: 'frequency',
                organs: ['Hati', 'Lambung', 'Organ Reproduksi'],
            },
            {
                id: 'q24',
                text: 'Apakah rambut Anda mudah rontok?',
                type: 'frequency',
                organs: ['Ginjal', 'Hati'],
            },
        ]
    },
    {
        id: 'general',
        title: 'Kondisi Umum',
        icon: '🏥',
        questions: [
            {
                id: 'q25',
                text: 'Secara keseluruhan, bagaimana Anda menilai kesehatan Anda?',
                type: 'scale',
                organs: [],
            },
        ]
    }
];

// Answer options
export const FREQUENCY_OPTIONS = [
    { value: 0, label: 'Tidak Pernah', score: 0 },
    { value: 1, label: 'Jarang (1-2x/bulan)', score: 25 },
    { value: 2, label: 'Kadang (1-2x/minggu)', score: 50 },
    { value: 3, label: 'Sering (3-4x/minggu)', score: 75 },
    { value: 4, label: 'Selalu (setiap hari)', score: 100 },
];

export const YESNO_OPTIONS = [
    { value: 0, label: 'Tidak', score: 0 },
    { value: 1, label: 'Ya', score: 100 },
];

export const SCALE_OPTIONS = [
    { value: 1, label: '1 - Sangat Buruk', score: 90 },
    { value: 2, label: '2 - Buruk', score: 70 },
    { value: 3, label: '3 - Kurang Baik', score: 50 },
    { value: 4, label: '4 - Cukup', score: 30 },
    { value: 5, label: '5 - Baik', score: 10 },
    { value: 6, label: '6 - Sangat Baik', score: 0 },
];

/**
 * Calculate questionnaire score and affected organs
 * @param {Object} answers - { questionId: answerValue }
 * @returns {Object} { confidence, organs, sectionScores }
 */
export function calculateQuestionnaireScore(answers) {
    const organScores = {};
    const sectionScores = {};
    let totalScore = 0;
    let totalQuestions = 0;

    QUESTIONNAIRE_SECTIONS.forEach(section => {
        let sectionTotal = 0;
        let sectionCount = 0;

        section.questions.forEach(question => {
            const answer = answers[question.id];
            if (answer !== undefined) {
                let score = 0;

                // Get score based on question type
                if (question.type === 'frequency') {
                    const opt = FREQUENCY_OPTIONS.find(o => o.value === answer);
                    score = opt?.score || 0;
                } else if (question.type === 'yesno') {
                    const opt = YESNO_OPTIONS.find(o => o.value === answer);
                    score = opt?.score || 0;
                } else if (question.type === 'scale') {
                    const opt = SCALE_OPTIONS.find(o => o.value === answer);
                    score = opt?.score || 0;
                }

                // Add to section score
                sectionTotal += score;
                sectionCount++;
                totalScore += score;
                totalQuestions++;

                // If score is significant (>= 50), add organs
                if (score >= 50 && question.organs.length > 0) {
                    question.organs.forEach(organ => {
                        if (!organScores[organ]) organScores[organ] = 0;
                        organScores[organ] += score;
                    });
                }
            }
        });

        if (sectionCount > 0) {
            sectionScores[section.id] = Math.round(sectionTotal / sectionCount);
        }
    });

    // Get top organs (sorted by score)
    const topOrgans = Object.entries(organScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([organ]) => organ);

    // Calculate confidence (inverse of average - higher problems = higher concern)
    const avgScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;
    const confidence = Math.min(90, Math.max(60, Math.round(60 + (avgScore / 3))));

    return {
        confidence,
        organs: topOrgans,
        sectionScores,
        averageScore: Math.round(avgScore)
    };
}
