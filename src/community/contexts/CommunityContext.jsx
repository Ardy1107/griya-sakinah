import { createContext, useContext, useState, useEffect } from 'react';

const CommunityContext = createContext(null);

// LocalStorage keys
const STORAGE_KEYS = {
    ANNOUNCEMENTS: 'griya_announcements',
    TAKJIL_SCHEDULE: 'griya_takjil_schedule',
    KERJA_BAKTI: 'griya_kerja_bakti',
    ARISAN: 'griya_arisan',
    PEDULI: 'griya_peduli'
};

// Default data
const DEFAULT_ANNOUNCEMENTS = [
    {
        id: 'ann-001',
        title: 'Selamat Tahun Baru 2026!',
        content: 'Pengurus RT/RW Griya Sakinah mengucapkan Selamat Tahun Baru 2026. Semoga tahun ini membawa keberkahan untuk kita semua.',
        type: 'info',
        priority: 'normal',
        createdAt: '2026-01-01T00:00:00',
        createdBy: 'Super Admin',
        pinned: true
    },
    {
        id: 'ann-002',
        title: 'Jadwal Iuran Internet Januari 2026',
        content: 'Pengingat untuk warga yang berlangganan Internet Sakinah, iuran bulan Januari sudah bisa dibayarkan. Terima kasih.',
        type: 'reminder',
        priority: 'high',
        createdAt: '2026-01-02T08:00:00',
        createdBy: 'Admin Internet',
        pinned: false
    }
];

const DEFAULT_TAKJIL = {
    year: 2026,
    schedule: [
        { date: '2026-03-01', donatur: 'Pak Ahmad (Blok A1)', menu: 'Kolak & Gorengan', status: 'confirmed' },
        { date: '2026-03-02', donatur: 'Bu Siti (Blok A2)', menu: 'Es Buah & Kurma', status: 'confirmed' },
        { date: '2026-03-03', donatur: 'Pak Budi (Blok B1)', menu: 'Bubur Sumsum', status: 'pending' },
        { date: '2026-03-04', donatur: '', menu: '', status: 'available' },
        { date: '2026-03-05', donatur: '', menu: '', status: 'available' },
    ]
};

const DEFAULT_KERJA_BAKTI = [
    {
        id: 'kb-001',
        title: 'Kerja Bakti Bulanan',
        description: 'Bersih-bersih lingkungan dan saluran air',
        date: '2026-01-05',
        time: '07:00 - 10:00',
        location: 'Seluruh area Griya Sakinah',
        coordinator: 'Pak RT',
        status: 'upcoming',
        participants: []
    },
    {
        id: 'kb-002',
        title: 'Pengecatan Musholla',
        description: 'Pengecatan ulang bagian luar musholla',
        date: '2026-01-12',
        time: '08:00 - 12:00',
        location: 'Musholla As-Sakinah',
        coordinator: 'Pak Haji',
        status: 'upcoming',
        participants: []
    }
];

const DEFAULT_ARISAN = {
    name: 'Arisan Warga Griya Sakinah',
    amount: 100000,
    period: 'monthly',
    nextDraw: '2026-01-15',
    members: [
        { id: 'm1', name: 'Pak Ahmad', blok: 'A1', status: 'active', hasWon: false },
        { id: 'm2', name: 'Bu Siti', blok: 'A2', status: 'active', hasWon: false },
        { id: 'm3', name: 'Pak Budi', blok: 'B1', status: 'active', hasWon: true, wonDate: '2025-12-15' },
        { id: 'm4', name: 'Bu Ani', blok: 'B2', status: 'active', hasWon: false },
        { id: 'm5', name: 'Pak Joko', blok: 'C1', status: 'active', hasWon: false },
        { id: 'm6', name: 'Bu Dewi', blok: 'C2', status: 'active', hasWon: false },
        { id: 'm7', name: 'Pak Eko', blok: 'D1', status: 'active', hasWon: true, wonDate: '2025-11-15' },
        { id: 'm8', name: 'Bu Ratna', blok: 'D2', status: 'active', hasWon: false },
    ],
    history: [
        { date: '2025-12-15', winner: 'Pak Budi', blok: 'B1' },
        { date: '2025-11-15', winner: 'Pak Eko', blok: 'D1' },
    ]
};

const DEFAULT_PEDULI = {
    cases: [
        {
            id: 'case-001',
            title: 'Bantuan Biaya Operasi Pak Hasan',
            description: 'Pak Hasan (Blok C3) membutuhkan bantuan biaya operasi usus buntu.',
            beneficiary: 'Pak Hasan',
            blok: 'C3',
            targetAmount: 5000000,
            collectedAmount: 3500000,
            status: 'active',
            createdAt: '2025-12-20T10:00:00',
            createdBy: 'Pak RT',
            donations: [
                { id: 'd1', donor: 'Pak Ahmad', amount: 500000, date: '2025-12-21', anonymous: false },
                { id: 'd2', donor: 'Hamba Allah', amount: 1000000, date: '2025-12-22', anonymous: true },
                { id: 'd3', donor: 'Bu Siti', amount: 500000, date: '2025-12-23', anonymous: false },
                { id: 'd4', donor: 'Pak Budi', amount: 1500000, date: '2025-12-24', anonymous: false },
            ]
        }
    ],
    totalDonations: 3500000,
    totalCases: 1,
    completedCases: 0
};

// Helper functions
const getData = (key, defaultValue) => {
    const data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    }
    return JSON.parse(data);
};

const setData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const useCommunity = () => {
    const context = useContext(CommunityContext);
    if (!context) {
        throw new Error('useCommunity must be used within CommunityProvider');
    }
    return context;
};

export const CommunityProvider = ({ children }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [takjilSchedule, setTakjilSchedule] = useState({ year: 2026, schedule: [] });
    const [kerjaBakti, setKerjaBakti] = useState([]);
    const [arisan, setArisan] = useState({ members: [], history: [] });
    const [peduli, setPeduli] = useState({ cases: [], totalDonations: 0 });

    useEffect(() => {
        setAnnouncements(getData(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS));
        setTakjilSchedule(getData(STORAGE_KEYS.TAKJIL_SCHEDULE, DEFAULT_TAKJIL));
        setKerjaBakti(getData(STORAGE_KEYS.KERJA_BAKTI, DEFAULT_KERJA_BAKTI));
        setArisan(getData(STORAGE_KEYS.ARISAN, DEFAULT_ARISAN));
        setPeduli(getData(STORAGE_KEYS.PEDULI, DEFAULT_PEDULI));
    }, []);

    // Announcement CRUD
    const addAnnouncement = (data) => {
        const newAnn = {
            id: `ann-${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString()
        };
        const updated = [newAnn, ...announcements];
        setData(STORAGE_KEYS.ANNOUNCEMENTS, updated);
        setAnnouncements(updated);
        return newAnn;
    };

    const updateAnnouncement = (id, data) => {
        const updated = announcements.map(a => a.id === id ? { ...a, ...data } : a);
        setData(STORAGE_KEYS.ANNOUNCEMENTS, updated);
        setAnnouncements(updated);
    };

    const deleteAnnouncement = (id) => {
        const updated = announcements.filter(a => a.id !== id);
        setData(STORAGE_KEYS.ANNOUNCEMENTS, updated);
        setAnnouncements(updated);
    };

    // Takjil Schedule CRUD
    const updateTakjilSchedule = (schedule) => {
        const updated = { ...takjilSchedule, schedule };
        setData(STORAGE_KEYS.TAKJIL_SCHEDULE, updated);
        setTakjilSchedule(updated);
    };

    const addTakjilDonatur = (date, donatur, menu) => {
        const updated = takjilSchedule.schedule.map(item =>
            item.date === date
                ? { ...item, donatur, menu, status: 'confirmed' }
                : item
        );
        updateTakjilSchedule(updated);
    };

    // Kerja Bakti CRUD
    const addKerjaBakti = (data) => {
        const newKb = {
            id: `kb-${Date.now()}`,
            ...data,
            status: 'upcoming',
            participants: []
        };
        const updated = [...kerjaBakti, newKb];
        setData(STORAGE_KEYS.KERJA_BAKTI, updated);
        setKerjaBakti(updated);
        return newKb;
    };

    const updateKerjaBakti = (id, data) => {
        const updated = kerjaBakti.map(kb => kb.id === id ? { ...kb, ...data } : kb);
        setData(STORAGE_KEYS.KERJA_BAKTI, updated);
        setKerjaBakti(updated);
    };

    const joinKerjaBakti = (id, participant) => {
        const updated = kerjaBakti.map(kb => {
            if (kb.id === id && !kb.participants.includes(participant)) {
                return { ...kb, participants: [...kb.participants, participant] };
            }
            return kb;
        });
        setData(STORAGE_KEYS.KERJA_BAKTI, updated);
        setKerjaBakti(updated);
    };

    // Arisan functions
    const spinArisan = () => {
        const eligibleMembers = arisan.members.filter(m => m.status === 'active' && !m.hasWon);
        if (eligibleMembers.length === 0) return null;

        const winner = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
        const today = new Date().toISOString().split('T')[0];

        const updatedMembers = arisan.members.map(m =>
            m.id === winner.id ? { ...m, hasWon: true, wonDate: today } : m
        );
        const updatedHistory = [
            { date: today, winner: winner.name, blok: winner.blok, amount: arisan.amount * arisan.members.length },
            ...arisan.history
        ];

        const updated = { ...arisan, members: updatedMembers, history: updatedHistory };
        setData(STORAGE_KEYS.ARISAN, updated);
        setArisan(updated);

        return winner;
    };

    const addArisanMember = (member) => {
        const newMember = {
            id: `m${Date.now()}`,
            ...member,
            status: 'active',
            hasWon: false,
            payments: [],
            joinedAt: new Date().toISOString()
        };
        const updated = { ...arisan, members: [...arisan.members, newMember] };
        setData(STORAGE_KEYS.ARISAN, updated);
        setArisan(updated);
        return newMember;
    };

    const updateArisanMember = (id, data) => {
        const updatedMembers = arisan.members.map(m =>
            m.id === id ? { ...m, ...data } : m
        );
        const updated = { ...arisan, members: updatedMembers };
        setData(STORAGE_KEYS.ARISAN, updated);
        setArisan(updated);
    };

    const removeArisanMember = (id) => {
        const updatedMembers = arisan.members.filter(m => m.id !== id);
        const updated = { ...arisan, members: updatedMembers };
        setData(STORAGE_KEYS.ARISAN, updated);
        setArisan(updated);
    };

    const recordArisanPayment = (memberId, period, amount) => {
        const payment = {
            id: `pay${Date.now()}`,
            period,
            amount,
            paidAt: new Date().toISOString()
        };
        const updatedMembers = arisan.members.map(m => {
            if (m.id === memberId) {
                const payments = m.payments || [];
                return { ...m, payments: [...payments, payment] };
            }
            return m;
        });
        const updated = { ...arisan, members: updatedMembers };
        setData(STORAGE_KEYS.ARISAN, updated);
        setArisan(updated);
        return payment;
    };

    const updateArisanSettings = (settings) => {
        const updated = { ...arisan, ...settings };
        setData(STORAGE_KEYS.ARISAN, updated);
        setArisan(updated);
    };

    const resetArisan = () => {
        const resetMembers = arisan.members.map(m => ({ ...m, hasWon: false, wonDate: null }));
        const updated = { ...arisan, members: resetMembers, history: [] };
        setData(STORAGE_KEYS.ARISAN, updated);
        setArisan(updated);
    };

    // Peduli (Solidarity Fund) functions
    const addPeduliCase = (data) => {
        const newCase = {
            id: `case-${Date.now()}`,
            ...data,
            collectedAmount: 0,
            status: 'active',
            createdAt: new Date().toISOString(),
            donations: []
        };
        const updated = {
            ...peduli,
            cases: [newCase, ...peduli.cases],
            totalCases: peduli.totalCases + 1
        };
        setData(STORAGE_KEYS.PEDULI, updated);
        setPeduli(updated);
        return newCase;
    };

    const donateToPeduli = (caseId, donation) => {
        const newDonation = {
            id: `d${Date.now()}`,
            ...donation,
            date: new Date().toISOString().split('T')[0]
        };

        const updatedCases = peduli.cases.map(c => {
            if (c.id === caseId) {
                const newCollected = c.collectedAmount + donation.amount;
                return {
                    ...c,
                    collectedAmount: newCollected,
                    donations: [...c.donations, newDonation],
                    status: newCollected >= c.targetAmount ? 'completed' : 'active'
                };
            }
            return c;
        });

        const completedCount = updatedCases.filter(c => c.status === 'completed').length;
        const updated = {
            ...peduli,
            cases: updatedCases,
            totalDonations: peduli.totalDonations + donation.amount,
            completedCases: completedCount
        };
        setData(STORAGE_KEYS.PEDULI, updated);
        setPeduli(updated);
    };

    const closePeduliCase = (caseId) => {
        const updated = {
            ...peduli,
            cases: peduli.cases.map(c =>
                c.id === caseId ? { ...c, status: 'closed' } : c
            )
        };
        setData(STORAGE_KEYS.PEDULI, updated);
        setPeduli(updated);
    };

    const value = {
        // Announcements
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,

        // Takjil
        takjilSchedule,
        updateTakjilSchedule,
        addTakjilDonatur,

        // Kerja Bakti
        kerjaBakti,
        addKerjaBakti,
        updateKerjaBakti,
        joinKerjaBakti,

        // Arisan
        arisan,
        spinArisan,
        addArisanMember,
        updateArisanMember,
        removeArisanMember,
        recordArisanPayment,
        updateArisanSettings,
        resetArisan,

        // Peduli
        peduli,
        addPeduliCase,
        donateToPeduli,
        closePeduliCase
    };

    return (
        <CommunityContext.Provider value={value}>
            {children}
        </CommunityContext.Provider>
    );
};

export default CommunityContext;
