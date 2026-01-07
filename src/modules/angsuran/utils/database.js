// Database utilities - Supabase with localStorage fallback
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const KEYS = {
    USERS: 'gs_users',
    UNITS: 'gs_units',
    PAYMENTS: 'gs_payments',
    EXPENSES: 'gs_expenses',
    AUDIT_LOGS: 'gs_audit_logs',
    SESSION: 'gs_session'
};

// ============ LOCAL STORAGE HELPERS ============
const getAll = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const setAll = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ============ USERS ============
export const getUsers = async () => {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return data.map(u => ({
            id: u.id,
            username: u.username,
            password: u.password_hash,
            name: u.name,
            role: u.role
        }));
    }
    return getAll(KEYS.USERS);
};

export const getUserByUsername = async (username) => {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;
        return {
            id: data.id,
            username: data.username,
            password: data.password_hash,
            name: data.name,
            role: data.role
        };
    }
    const users = getAll(KEYS.USERS);
    return users.find(u => u.username === username);
};

// Sync versions for compatibility
export const getUsersSync = () => getAll(KEYS.USERS);
export const getUserByUsernameSync = (username) => {
    const users = getAll(KEYS.USERS);
    return users.find(u => u.username === username);
};

// ============ SESSION ============
export const getSession = () => {
    const session = localStorage.getItem(KEYS.SESSION);
    return session ? JSON.parse(session) : null;
};

export const setSession = (user) => {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
};

export const clearSession = () => {
    localStorage.removeItem(KEYS.SESSION);
};

// ============ UNITS ============
export const getUnits = async () => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('units')
                .select('*')
                .order('block_number');
            if (error) throw error;
            return data.map(u => ({
                id: u.id,
                blockNumber: u.block_number,
                residentName: u.resident_name,
                phone: u.phone,
                dueDay: u.due_day,
                hasAddon: u.has_addon,
                totalAddonCost: u.total_addon_cost,
                status: u.status || 'aktif',
                createdAt: u.created_at
            }));
        } catch (err) {
            console.error('Supabase error, falling back to localStorage:', err);
            return getAll(KEYS.UNITS);
        }
    }
    return getAll(KEYS.UNITS);
};

export const getUnitsSync = () => getAll(KEYS.UNITS);

export const getUnitByIdSync = (id) => {
    const units = getAll(KEYS.UNITS);
    return units.find(u => u.id === id);
};

export const getUnitById = async (id) => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('units')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return {
                id: data.id,
                blockNumber: data.block_number,
                residentName: data.resident_name,
                phone: data.phone,
                dueDay: data.due_day,
                hasAddon: data.has_addon,
                totalAddonCost: data.total_addon_cost,
                status: data.status || 'aktif',
                createdAt: data.created_at
            };
        } catch (err) {
            console.error('Supabase error:', err);
        }
    }
    // Fallback to localStorage
    const units = getAll(KEYS.UNITS);
    return units.find(u => u.id === id);
};

export const createUnit = async (unitData) => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('units')
                .insert({
                    block_number: unitData.blockNumber,
                    resident_name: unitData.residentName,
                    phone: unitData.phone,
                    due_day: unitData.dueDay,
                    has_addon: unitData.hasAddon,
                    total_addon_cost: unitData.totalAddonCost,
                    status: unitData.status || 'aktif'
                })
                .select()
                .single();
            if (error) throw error;
            return {
                id: data.id,
                blockNumber: data.block_number,
                residentName: data.resident_name,
                phone: data.phone,
                dueDay: data.due_day,
                hasAddon: data.has_addon,
                totalAddonCost: data.total_addon_cost,
                status: data.status,
                createdAt: data.created_at
            };
        } catch (err) {
            console.error('Supabase error, falling back to localStorage:', err);
        }
    }
    // Fallback to localStorage
    return create(KEYS.UNITS, unitData);
};

export const updateUnit = async (id, unitData) => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('units')
                .update({
                    block_number: unitData.blockNumber,
                    resident_name: unitData.residentName,
                    phone: unitData.phone,
                    due_day: unitData.dueDay,
                    has_addon: unitData.hasAddon,
                    total_addon_cost: unitData.totalAddonCost,
                    status: unitData.status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Supabase error, falling back to localStorage:', err);
        }
    }
    // Fallback to localStorage
    return update(KEYS.UNITS, id, unitData);
};

export const deleteUnit = async (id) => {
    if (isSupabaseConfigured()) {
        try {
            const { error } = await supabase.from('units').delete().eq('id', id);
            if (error) throw error;
            return;
        } catch (err) {
            console.error('Supabase error, falling back to localStorage:', err);
        }
    }
    // Fallback to localStorage
    remove(KEYS.UNITS, id);
};

// ============ PAYMENTS ============
export const getPayments = async () => {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(p => ({
            id: p.id,
            unitId: p.unit_id,
            category: p.category,
            amount: p.amount,
            installmentNo: p.installment_no,
            paymentMonthKey: p.payment_month_key,
            paymentMonthDisplay: p.payment_month_display,
            status: p.status,
            evidenceLink: p.evidence_url,
            notes: p.notes,
            createdBy: p.created_by,
            createdAt: p.created_at
        }));
    }
    return getAll(KEYS.PAYMENTS);
};

export const getPaymentsSync = () => getAll(KEYS.PAYMENTS);

export const getPaymentsByUnit = async (unitId) => {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('unit_id', unitId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(p => ({
            id: p.id,
            unitId: p.unit_id,
            category: p.category,
            amount: p.amount,
            installmentNo: p.installment_no,
            paymentMonthKey: p.payment_month_key,
            paymentMonthDisplay: p.payment_month_display,
            status: p.status,
            evidenceLink: p.evidence_url,
            notes: p.notes,
            createdBy: p.created_by,
            createdAt: p.created_at
        }));
    }
    const payments = getAll(KEYS.PAYMENTS);
    return payments.filter(p => p.unitId === unitId);
};

export const getPaymentsByUnitSync = (unitId) => {
    const payments = getAll(KEYS.PAYMENTS);
    return payments.filter(p => p.unitId === unitId);
};

export const createPayment = async (paymentData) => {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('payments')
            .insert({
                unit_id: paymentData.unitId,
                category: paymentData.category,
                amount: paymentData.amount,
                installment_no: paymentData.installmentNo,
                payment_date: paymentData.paymentMonthKey,
                payment_month_key: paymentData.paymentMonthKey,
                payment_month_display: paymentData.paymentMonthDisplay,
                status: paymentData.status,
                evidence_url: paymentData.evidenceLink,
                notes: paymentData.notes,
                created_by: paymentData.createdBy
            })
            .select()
            .single();
        if (error) throw error;
        return {
            id: data.id,
            unitId: data.unit_id,
            category: data.category,
            amount: data.amount,
            installmentNo: data.installment_no,
            paymentMonthKey: data.payment_month_key,
            paymentMonthDisplay: data.payment_month_display,
            status: data.status,
            evidenceLink: data.evidence_url,
            notes: data.notes,
            createdBy: data.created_by,
            createdAt: data.created_at
        };
    }
    const payments = getAll(KEYS.PAYMENTS);
    const newPayment = {
        id: generateId(),
        ...paymentData,
        createdAt: new Date().toISOString()
    };
    payments.push(newPayment);
    setAll(KEYS.PAYMENTS, payments);
    return newPayment;
};

export const updatePayment = async (id, paymentData) => {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('payments')
            .update(paymentData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
    const payments = getAll(KEYS.PAYMENTS);
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
        payments[index] = { ...payments[index], ...paymentData };
        setAll(KEYS.PAYMENTS, payments);
        return payments[index];
    }
    return null;
};

// ============ AUDIT LOGS ============
export const getAuditLogs = async () => {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*, users(name)')
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) throw error;
        return data.map(log => ({
            id: log.id,
            userId: log.user_id,
            userName: log.users?.name,
            action: log.action,
            details: log.details,
            timestamp: log.created_at
        }));
    }
    return getAll(KEYS.AUDIT_LOGS);
};

export const getAuditLogsSync = () => getAll(KEYS.AUDIT_LOGS);

export const createAuditLog = async (userId, action, details = '') => {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase
            .from('audit_logs')
            .insert({
                user_id: userId,
                action,
                details
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
    const logs = getAll(KEYS.AUDIT_LOGS);
    const newLog = {
        id: generateId(),
        userId,
        action,
        details,
        timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    setAll(KEYS.AUDIT_LOGS, logs);
    return newLog;
};

// ============ STATISTICS ============
export const getPaymentStats = async () => {
    if (isSupabaseConfigured()) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Get this month's income
        const { data: monthPayments } = await supabase
            .from('payments')
            .select('amount')
            .gte('created_at', startOfMonth);

        const totalThisMonth = (monthPayments || []).reduce((sum, p) => sum + p.amount, 0);

        // Get total units
        const { count: totalUnits } = await supabase
            .from('units')
            .select('*', { count: 'exact', head: true });

        // For overdue, we'll calculate from all data
        const { data: units } = await supabase.from('units').select('id');
        const { data: payments } = await supabase.from('payments').select('unit_id, created_at');

        let overdueUnits = 0;
        (units || []).forEach(unit => {
            const unitPayments = (payments || []).filter(p => p.unit_id === unit.id);
            if (unitPayments.length === 0) {
                overdueUnits++;
                return;
            }
            const lastPayment = unitPayments.sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            )[0];
            const daysSince = Math.floor((now - new Date(lastPayment.created_at)) / (24 * 60 * 60 * 1000));
            if (daysSince > 30) overdueUnits++;
        });

        return { totalThisMonth, totalUnits: totalUnits || 0, overdueUnits };
    }

    // localStorage version
    const payments = getAll(KEYS.PAYMENTS);
    const units = getAll(KEYS.UNITS);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthPayments = payments.filter(p => {
        const payDate = new Date(p.createdAt);
        return payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear;
    });

    const totalThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    const unitsWithOverdue = units.filter(unit => {
        const unitPayments = payments.filter(p => p.unitId === unit.id);
        if (unitPayments.length === 0) return true;
        const lastPayment = unitPayments.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        const lastPaymentDate = new Date(lastPayment.createdAt);
        const daysSincePayment = Math.floor((now - lastPaymentDate) / (24 * 60 * 60 * 1000));
        return daysSincePayment > 30;
    });

    return {
        totalThisMonth,
        totalUnits: units.length,
        overdueUnits: unitsWithOverdue.length
    };
};

export const getPaymentStatsSync = () => {
    const payments = getAll(KEYS.PAYMENTS);
    const units = getAll(KEYS.UNITS);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthPayments = payments.filter(p => {
        const payDate = new Date(p.createdAt);
        return payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear;
    });

    const totalThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    const unitsWithOverdue = units.filter(unit => {
        const unitPayments = payments.filter(p => p.unitId === unit.id);
        if (unitPayments.length === 0) return true;
        const lastPayment = unitPayments.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        const lastPaymentDate = new Date(lastPayment.createdAt);
        const daysSincePayment = Math.floor((now - lastPaymentDate) / (24 * 60 * 60 * 1000));
        return daysSincePayment > 30;
    });

    return {
        totalThisMonth,
        totalUnits: units.length,
        overdueUnits: unitsWithOverdue.length
    };
};

export const getAgingReceivable = async () => {
    const payments = isSupabaseConfigured() ? await getPayments() : getAll(KEYS.PAYMENTS);
    const units = isSupabaseConfigured() ? await getUnits() : getAll(KEYS.UNITS);
    const now = new Date();

    return units.map(unit => {
        const unitPayments = payments.filter(p => p.unitId === unit.id);
        const lastPayment = unitPayments.length > 0
            ? unitPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
            : null;

        const lastPaymentDate = lastPayment ? new Date(lastPayment.createdAt) : null;
        const daysSincePayment = lastPaymentDate
            ? Math.floor((now - lastPaymentDate) / (24 * 60 * 60 * 1000))
            : 999;

        const totalPaid = unitPayments.reduce((sum, p) => sum + p.amount, 0);

        return {
            ...unit,
            lastPaymentDate,
            daysSincePayment,
            totalPaid,
            isOverdue: daysSincePayment > 30
        };
    }).filter(u => u.isOverdue).sort((a, b) => b.daysSincePayment - a.daysSincePayment);
};

export const getAgingReceivableSync = () => {
    const payments = getAll(KEYS.PAYMENTS);
    const units = getAll(KEYS.UNITS);
    const now = new Date();

    return units.map(unit => {
        const unitPayments = payments.filter(p => p.unitId === unit.id);
        const lastPayment = unitPayments.length > 0
            ? unitPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
            : null;

        const lastPaymentDate = lastPayment ? new Date(lastPayment.createdAt) : null;
        const daysSincePayment = lastPaymentDate
            ? Math.floor((now - lastPaymentDate) / (24 * 60 * 60 * 1000))
            : 999;

        const totalPaid = unitPayments.reduce((sum, p) => sum + p.amount, 0);

        return {
            ...unit,
            lastPaymentDate,
            daysSincePayment,
            totalPaid,
            isOverdue: daysSincePayment > 30
        };
    }).filter(u => u.isOverdue).sort((a, b) => b.daysSincePayment - a.daysSincePayment);
};

export const getMonthlyIncome = async () => {
    const payments = isSupabaseConfigured() ? await getPayments() : getAll(KEYS.PAYMENTS);
    const result = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('id-ID', { month: 'short' });

        const monthPayments = payments.filter(p => {
            const payDate = new Date(p.createdAt);
            return payDate.getMonth() === month.getMonth() &&
                payDate.getFullYear() === month.getFullYear();
        });

        const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);

        result.push({ month: monthName, total });
    }

    return result;
};

export const getMonthlyIncomeSync = () => {
    const payments = getAll(KEYS.PAYMENTS);
    const result = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = month.toLocaleDateString('id-ID', { month: 'short' });

        const monthPayments = payments.filter(p => {
            const payDate = new Date(p.createdAt);
            return payDate.getMonth() === month.getMonth() &&
                payDate.getFullYear() === month.getFullYear();
        });

        const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);

        result.push({ month: monthName, total });
    }

    return result;
};

// ============ INITIALIZATION ============
export const initializeData = () => {
    // Initialize users if empty
    if (getAll(KEYS.USERS).length === 0) {
        const defaultUsers = [
            { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
            { id: '2', username: 'devi', password: 'devi123', role: 'developer', name: 'Developer' }
        ];
        setAll(KEYS.USERS, defaultUsers);
    }

    // Initialize sample units if empty
    if (getAll(KEYS.UNITS).length === 0) {
        const sampleUnits = [
            { id: 'u1', blockNumber: 'A-01', residentName: 'Budi Santoso', phone: '081234567890', dueDay: 10, hasAddon: false, totalAddonCost: 0, createdAt: new Date().toISOString() },
            { id: 'u2', blockNumber: 'A-02', residentName: 'Siti Rahayu', phone: '081234567891', dueDay: 15, hasAddon: true, totalAddonCost: 25000000, createdAt: new Date().toISOString() },
            { id: 'u3', blockNumber: 'B-01', residentName: 'Ahmad Hidayat', phone: '081234567892', dueDay: 5, hasAddon: false, totalAddonCost: 0, createdAt: new Date().toISOString() },
            { id: 'u4', blockNumber: 'B-02', residentName: 'Dewi Lestari', phone: '081234567893', dueDay: 20, hasAddon: true, totalAddonCost: 15000000, createdAt: new Date().toISOString() },
            { id: 'u5', blockNumber: 'C-01', residentName: 'Rudi Hermawan', phone: '081234567894', dueDay: 25, hasAddon: false, totalAddonCost: 0, createdAt: new Date().toISOString() },
        ];
        setAll(KEYS.UNITS, sampleUnits);
    }

    // Initialize sample payments if empty
    if (getAll(KEYS.PAYMENTS).length === 0) {
        const now = new Date();
        const samplePayments = [
            { id: 'p1', unitId: 'u1', category: 'pokok', amount: 2500000, installmentNo: 12, status: 'lunas', evidenceBase64: '', notes: 'Pembayaran tepat waktu', createdAt: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(), createdBy: '1' },
            { id: 'p2', unitId: 'u2', category: 'pokok', amount: 2500000, installmentNo: 11, status: 'lunas', evidenceBase64: '', notes: '', createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 20).toISOString(), createdBy: '1' },
            { id: 'p3', unitId: 'u2', category: 'tambahan', amount: 1000000, installmentNo: 5, status: 'lunas', evidenceBase64: '', notes: 'Cicilan bangunan tambahan', createdAt: new Date(now.getFullYear(), now.getMonth(), 10).toISOString(), createdBy: '1' },
        ];
        setAll(KEYS.PAYMENTS, samplePayments);
    }
};

// ============ EXPENSES (Pengeluaran) ============
export const getExpenses = async () => {
    return getAll(KEYS.EXPENSES);
};

export const getExpensesSync = () => getAll(KEYS.EXPENSES);

export const createExpense = async (expenseData) => {
    const expenses = getAll(KEYS.EXPENSES);
    const newExpense = {
        id: generateId(),
        ...expenseData,
        createdAt: new Date().toISOString()
    };
    expenses.push(newExpense);
    setAll(KEYS.EXPENSES, expenses);
    return newExpense;
};

export const updateExpense = async (id, expenseData) => {
    const expenses = getAll(KEYS.EXPENSES);
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
        expenses[index] = { ...expenses[index], ...expenseData };
        setAll(KEYS.EXPENSES, expenses);
        return expenses[index];
    }
    return null;
};

export const deleteExpense = async (id) => {
    const expenses = getAll(KEYS.EXPENSES);
    const filtered = expenses.filter(e => e.id !== id);
    setAll(KEYS.EXPENSES, filtered);
};

// Get monthly balance: Income - Expenses
export const getMonthlyBalanceSync = (month, year) => {
    const payments = getAll(KEYS.PAYMENTS);
    const expenses = getAll(KEYS.EXPENSES);

    // Filter payments for the month
    const monthPayments = payments.filter(p => {
        const date = new Date(p.createdAt);
        return date.getMonth() === month && date.getFullYear() === year;
    });

    // Filter expenses for the month
    const monthExpenses = expenses.filter(e => {
        const date = new Date(e.createdAt);
        return date.getMonth() === month && date.getFullYear() === year;
    });

    const totalIncome = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netBalance = totalIncome - totalExpenses;

    return {
        totalIncome,
        totalExpenses,
        netBalance,
        paymentCount: monthPayments.length,
        expenseCount: monthExpenses.length
    };
};

export default {
    getUsers,
    getUserByUsername,
    getUsersSync,
    getUserByUsernameSync,
    getSession,
    setSession,
    clearSession,
    getUnits,
    getUnitsSync,
    getUnitById,
    getUnitByIdSync,
    createUnit,
    updateUnit,
    deleteUnit,
    getPayments,
    getPaymentsSync,
    getPaymentsByUnit,
    getPaymentsByUnitSync,
    createPayment,
    updatePayment,
    getExpenses,
    getExpensesSync,
    createExpense,
    updateExpense,
    deleteExpense,
    getMonthlyBalanceSync,
    getAuditLogs,
    getAuditLogsSync,
    createAuditLog,
    getPaymentStats,
    getPaymentStatsSync,
    getAgingReceivable,
    getAgingReceivableSync,
    getMonthlyIncome,
    getMonthlyIncomeSync,
    initializeData
};

