/**
 * Shared Security Utilities — Griya Sakinah
 * Password hashing & SSO session signing
 */

/**
 * SHA-256 hash for password security
 * Used across Portal, Admin, and Angsuran auth
 */
export const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Create a signed SSO session to prevent tampering
 * Uses HMAC-SHA256 with a static key derived from Supabase URL
 */
const getSigningKey = () => {
    const raw = import.meta.env.VITE_SUPABASE_URL_ANGSURAN || 'griya-sakinah-default-key';
    return raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
};

const hmacSign = async (data, key) => {
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const hmacVerify = async (data, signature, key) => {
    const expected = await hmacSign(data, key);
    return expected === signature;
};

/**
 * Store SSO session with HMAC signature
 */
export const setSignedSSOSession = async (userData) => {
    const payload = JSON.stringify({
        user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: 'superadmin'
        },
        expiry: Date.now() + (24 * 60 * 60 * 1000)
    });
    const key = getSigningKey();
    const signature = await hmacSign(payload, key);
    localStorage.setItem('superadmin_session', JSON.stringify({ payload, signature }));
};

/**
 * Read and verify SSO session
 * Returns user data if valid, null if tampered or expired
 */
export const getVerifiedSSOSession = async () => {
    try {
        const stored = localStorage.getItem('superadmin_session');
        if (!stored) return null;

        const { payload, signature } = JSON.parse(stored);
        if (!payload || !signature) return null;

        const key = getSigningKey();
        const isValid = await hmacVerify(payload, signature, key);
        if (!isValid) {
            localStorage.removeItem('superadmin_session');
            return null;
        }

        const parsed = JSON.parse(payload);
        if (parsed.expiry < Date.now()) {
            localStorage.removeItem('superadmin_session');
            return null;
        }

        return parsed.user;
    } catch {
        localStorage.removeItem('superadmin_session');
        return null;
    }
};

/**
 * Clear SSO session
 */
export const clearSSOSession = () => {
    localStorage.removeItem('superadmin_session');
};
