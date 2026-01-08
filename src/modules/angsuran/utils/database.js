// Database utilities - 100% Supabase (NO localStorage)
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Check if Supabase is ready
const ensureSupabase = () => {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase belum dikonfigurasi. Pastikan environment variables sudah diset.');
    }
    return supabase;
};

// ============ UNITS ============
export const getUnits = async () => {
    const sb = ensureSupabase();
    const { data, error } = await sb
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
        monthlyPayment: u.monthly_payment || 0,
        startingInstallment: u.starting_installment || 0,
        status: u.status || 'aktif',
        createdAt: u.created_at
    }));
};

export const getUnitsSync = async () => {
    return await getUnits();
};

export const getUnitById = async (id) => {
    const sb = ensureSupabase();
    const { data, error } = await sb
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
};

export const getUnitByIdSync = async (id) => {
    return await getUnitById(id);
};

export const createUnit = async (unitData) => {
    const sb = ensureSupabase();
    const { data, error } = await sb
        .from('units')
        .insert({
            block_number: unitData.blockNumber,
            resident_name: unitData.residentName,
            phone: unitData.phone,
            due_day: unitData.dueDay,
            has_addon: unitData.hasAddon,
            total_addon_cost: unitData.totalAddonCost,
            monthly_payment: unitData.monthlyPayment || 0,
            starting_installment: unitData.startingInstallment || 0,
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
        monthlyPayment: data.monthly_payment || 0,
        startingInstallment: data.starting_installment || 0,
        status: data.status,
        createdAt: data.created_at
    };
};

export const updateUnit = async (id, unitData) => {
    const sb = ensureSupabase();
    const { data, error } = await sb
        .from('units')
        .update({
            block_number: unitData.blockNumber,
            resident_name: unitData.residentName,
            phone: unitData.phone,
            due_day: unitData.dueDay,
            has_addon: unitData.hasAddon,
            total_addon_cost: unitData.totalAddonCost,
            monthly_payment: unitData.monthlyPayment || 0,
            starting_installment: unitData.startingInstallment || 0,
            status: unitData.status,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteUnit = async (id) => {
    const sb = ensureSupabase();
    const { error } = await sb.from('units').delete().eq('id', id);
    if (error) throw error;
};

// ============ PAYMENTS ============
export const getPayments = async () => {
    const sb = ensureSupabase();
    const { data, error } = await sb
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
};

export const getPaymentsSync = async () => {
    return await getPayments();
};

export const getPaymentsByUnit = async (unitId) => {
    const sb = ensureSupabase();
    const { data, error } = await sb
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
};

export const getPaymentsByUnitSync = async (unitId) => {
    return await getPaymentsByUnit(unitId);
};

export const createPayment = async (paymentData) => {
    const sb = ensureSupabase();
    const { data, error } = await sb
        .from('payments')
        .insert({
            unit_id: paymentData.unitId,
            category: paymentData.category,
            amount: paymentData.amount,
            installment_no: paymentData.installmentNo,
            payment_month_key: paymentData.paymentMonthKey,
            payment_month_display: paymentData.paymentMonthDisplay,
            status: paymentData.status || 'completed',
            evidence_url: paymentData.evidenceLink,
            notes: paymentData.notes,
            created_by: paymentData.createdBy,
            rapel_batch_id: paymentData.rapelBatchId || null
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
        rapelBatchId: data.rapel_batch_id,
        createdAt: data.created_at
    };
};

export const updatePayment = async (id, paymentData) => {
    const sb = ensureSupabase();
    const { data, error } = await sb
        .from('payments')
        .update({
            category: paymentData.category,
            amount: paymentData.amount,
            status: paymentData.status,
            evidence_url: paymentData.evidenceLink,
            notes: paymentData.notes,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deletePayment = async (id) => {
    const sb = ensureSupabase();
    const { error } = await sb.from('payments').delete().eq('id', id);
    if (error) throw error;
};

// ============ EXPENSES ============
export const getExpenses = async () => {
    const sb = ensureSupabase();
    const { data, error } = await sb
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const getExpensesSync = async () => {
    return await getExpenses();
};

export const createExpense = async (expenseData) => {
    const sb = ensureSupabase();
    const { data, error } = await sb
        .from('expenses')
        .insert({
            category: expenseData.category,
            amount: expenseData.amount,
            description: expenseData.description,
            date: expenseData.date,
            created_by: expenseData.createdBy
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const updateExpense = async (id, expenseData) => {
    const sb = ensureSupabase();
    const { data, error } = await sb
        .from('expenses')
        .update({
            category: expenseData.category,
            amount: expenseData.amount,
            description: expenseData.description,
            date: expenseData.date,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteExpense = async (id) => {
    const sb = ensureSupabase();
    const { error } = await sb.from('expenses').delete().eq('id', id);
    if (error) throw error;
};

// ============ AUDIT LOGS ============
export const createAuditLog = async (logData) => {
    const sb = ensureSupabase();
    const { data, error } = await sb
        .from('audit_logs')
        .insert({
            user_id: logData.userId,
            action: logData.action,
            entity_type: logData.entityType,
            entity_id: logData.entityId,
            details: logData.details,
            ip_address: logData.ipAddress
        })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const getAuditLogs = async (filters = {}) => {
    const sb = ensureSupabase();
    let query = sb.from('audit_logs').select('*').order('created_at', { ascending: false });

    if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
    }
    if (filters.entityId) {
        query = query.eq('entity_id', filters.entityId);
    }
    if (filters.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
};

export const getAuditLogsSync = async (filters = {}) => {
    return await getAuditLogs(filters);
};

// Users (for compatibility with AuditLog page)
export const getUsers = async () => {
    // Return empty array for now - users are managed in Admin portal
    return [];
};

export const getUsersSync = async () => {
    return await getUsers();
};

// ============ STATS & REPORTS ============
export const getPaymentStats = async () => {
    const sb = ensureSupabase();
    const { data: payments, error } = await sb
        .from('payments')
        .select('*');
    if (error) throw error;

    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const completedPayments = payments.filter(p => p.status === 'completed');
    const pendingPayments = payments.filter(p => p.status === 'pending');

    return {
        totalPayments,
        totalAmount: totalPayments,
        completedCount: completedPayments.length,
        pendingCount: pendingPayments.length,
        completedAmount: completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    };
};

export const getPaymentStatsSync = async () => {
    return await getPaymentStats();
};

export const getAgingReceivable = async () => {
    const sb = ensureSupabase();
    const { data: units, error: unitsError } = await sb.from('units').select('*');
    if (unitsError) throw unitsError;

    const { data: payments, error: paymentsError } = await sb.from('payments').select('*');
    if (paymentsError) throw paymentsError;

    // Calculate aging based on payment status
    const aging = {
        current: [],
        days30: [],
        days60: [],
        days90: [],
        over90: []
    };

    const now = new Date();
    units.forEach(unit => {
        const unitPayments = payments.filter(p => p.unit_id === unit.id);
        const lastPayment = unitPayments.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        )[0];

        if (!lastPayment) {
            aging.over90.push({ unit, daysPastDue: 999 });
        } else {
            const lastPaymentDate = new Date(lastPayment.created_at);
            const daysSincePayment = Math.floor((now - lastPaymentDate) / (1000 * 60 * 60 * 24));

            if (daysSincePayment <= 30) {
                aging.current.push({ unit, daysPastDue: 0 });
            } else if (daysSincePayment <= 60) {
                aging.days30.push({ unit, daysPastDue: daysSincePayment - 30 });
            } else if (daysSincePayment <= 90) {
                aging.days60.push({ unit, daysPastDue: daysSincePayment - 30 });
            } else if (daysSincePayment <= 120) {
                aging.days90.push({ unit, daysPastDue: daysSincePayment - 30 });
            } else {
                aging.over90.push({ unit, daysPastDue: daysSincePayment - 30 });
            }
        }
    });

    return aging;
};

export const getAgingReceivableSync = async () => {
    return await getAgingReceivable();
};

export const getMonthlyIncome = async (year = new Date().getFullYear()) => {
    const sb = ensureSupabase();
    const { data: payments, error } = await sb
        .from('payments')
        .select('*')
        .gte('created_at', `${year}-01-01`)
        .lte('created_at', `${year}-12-31`);
    if (error) throw error;

    const monthlyData = Array(12).fill(0);
    payments.forEach(p => {
        const month = new Date(p.created_at).getMonth();
        monthlyData[month] += Number(p.amount || 0);
    });

    return monthlyData;
};

export const getMonthlyIncomeSync = async (year) => {
    return await getMonthlyIncome(year);
};

export const getMonthlyBalance = async (year = new Date().getFullYear()) => {
    const income = await getMonthlyIncome(year);
    // For now, return income as balance (no expenses in angsuran module)
    return income.map((amount, index) => ({
        month: index + 1,
        income: amount,
        expense: 0,
        balance: amount
    }));
};

export const getMonthlyBalanceSync = async (year) => {
    return await getMonthlyBalance(year);
};

// ============ SESSION (still uses localStorage for auth state) ============
const SESSION_KEY = 'angsuran_session';

export const getSession = () => {
    const session = sessionStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
};

export const setSession = (user) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
};

// ============ DEFAULT EXPORT ============
export default {
    // Units
    getUnits,
    getUnitsSync,
    getUnitById,
    getUnitByIdSync,
    createUnit,
    updateUnit,
    deleteUnit,
    // Payments
    getPayments,
    getPaymentsSync,
    getPaymentsByUnit,
    getPaymentsByUnitSync,
    createPayment,
    updatePayment,
    deletePayment,
    // Expenses
    getExpenses,
    getExpensesSync,
    createExpense,
    updateExpense,
    deleteExpense,
    // Audit
    createAuditLog,
    getAuditLogs,
    getAuditLogsSync,
    // Users
    getUsers,
    getUsersSync,
    // Stats
    getPaymentStats,
    getPaymentStatsSync,
    getAgingReceivable,
    getAgingReceivableSync,
    getMonthlyIncome,
    getMonthlyIncomeSync,
    getMonthlyBalance,
    getMonthlyBalanceSync,
    // Session
    getSession,
    setSession,
    clearSession
};
