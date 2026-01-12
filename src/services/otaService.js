/**
 * OTA (Over-The-Air) Update Service
 * Self-hosted updates using Supabase Storage (Internet Sakinah project)
 */

import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../modules/internet/config/supabase';

// Current app version (should match package.json)
export const APP_VERSION = '1.0.0';
const STORAGE_KEY = 'griya-ota-version';

/**
 * Initialize OTA updater
 * Call this once on app startup
 */
export async function initOTA() {
    if (!Capacitor.isNativePlatform()) {
        console.log('[OTA] Running on web, skipping OTA init');
        return;
    }

    try {
        // Notify plugin that app is ready
        await CapacitorUpdater.notifyAppReady();
        console.log('[OTA] App ready notified');
    } catch (error) {
        console.error('[OTA] Init error:', error);
    }
}

/**
 * Check if there's a new version available
 * @returns {Promise<{hasUpdate: boolean, version?: string, bundleUrl?: string, releaseNotes?: string}>}
 */
export async function checkForOTAUpdate() {
    if (!Capacitor.isNativePlatform()) {
        return { hasUpdate: false };
    }

    try {
        // Get latest version from Supabase
        const { data, error } = await supabase
            .from('app_versions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            console.log('[OTA] No version info found');
            return { hasUpdate: false };
        }

        const currentVersion = getCurrentVersion();
        const hasUpdate = compareVersions(data.version, currentVersion) > 0;

        console.log(`[OTA] Current: ${currentVersion}, Latest: ${data.version}, Update: ${hasUpdate}`);

        return {
            hasUpdate,
            version: data.version,
            bundleUrl: data.bundle_url,
            releaseNotes: data.release_notes,
            isMandatory: data.is_mandatory
        };
    } catch (error) {
        console.error('[OTA] Check error:', error);
        return { hasUpdate: false };
    }
}

/**
 * Download and apply OTA update
 * @param {string} bundleUrl - URL to the bundle zip file
 * @param {string} version - Version string
 * @param {function} onProgress - Progress callback (0-100)
 */
export async function downloadAndApplyUpdate(bundleUrl, version, onProgress) {
    if (!Capacitor.isNativePlatform()) {
        console.log('[OTA] Not on native platform');
        return false;
    }

    try {
        console.log(`[OTA] Downloading version ${version} from ${bundleUrl}`);

        // Download the bundle
        const bundle = await CapacitorUpdater.download({
            url: bundleUrl,
            version: version
        });

        console.log('[OTA] Download complete, bundle ID:', bundle.id);

        // Save new version to localStorage
        saveCurrentVersion(version);

        // Set the new bundle (will apply on next app restart)
        await CapacitorUpdater.set(bundle);

        console.log('[OTA] Bundle set, restarting app...');

        // Reload the app to apply update
        await CapacitorUpdater.reload();

        return true;
    } catch (error) {
        console.error('[OTA] Update error:', error);
        return false;
    }
}

/**
 * Get current version from localStorage or default
 */
export function getCurrentVersion() {
    if (typeof window === 'undefined') return APP_VERSION;
    return localStorage.getItem(STORAGE_KEY) || APP_VERSION;
}

/**
 * Save current version to localStorage
 */
function saveCurrentVersion(version) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, version);
    }
}

/**
 * Compare two semantic version strings
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1, v2) {
    const parts1 = v1.replace(/^v/, '').split('.').map(Number);
    const parts2 = v2.replace(/^v/, '').split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    return 0;
}

/**
 * Reset to built-in bundle (rollback)
 */
export async function rollbackUpdate() {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await CapacitorUpdater.reset();
        localStorage.removeItem(STORAGE_KEY);
        console.log('[OTA] Rolled back to built-in bundle');
    } catch (error) {
        console.error('[OTA] Rollback error:', error);
    }
}
