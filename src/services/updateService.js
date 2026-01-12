/**
 * Update Service untuk Griya Sakinah Android App
 * Cek versi terbaru dari GitHub Releases dan auto-download APK
 */

import { Capacitor } from '@capacitor/core';

// GitHub repo info - sesuaikan dengan repo Anda
const GITHUB_OWNER = 'Ardy1107';  // Ganti dengan username GitHub Anda
const GITHUB_REPO = 'griya-sakinah';  // Ganti dengan nama repo

// Versi app saat ini (dari package.json)
export const APP_VERSION = '1.0.0';

/**
 * Cek apakah ada update tersedia
 * @returns {Promise<{hasUpdate: boolean, latestVersion: string, downloadUrl: string, releaseNotes: string}>}
 */
export async function checkForUpdate() {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`
        );

        if (!response.ok) {
            console.log('No releases found or API error');
            return { hasUpdate: false };
        }

        const release = await response.json();
        const latestVersion = release.tag_name.replace(/^v/, '').split('-')[0]; // Remove 'v' prefix and build number

        // Cari APK asset
        const apkAsset = release.assets.find(asset =>
            asset.name.endsWith('.apk')
        );

        if (!apkAsset) {
            console.log('No APK found in release');
            return { hasUpdate: false };
        }

        const hasUpdate = compareVersions(latestVersion, APP_VERSION) > 0;

        return {
            hasUpdate,
            latestVersion,
            downloadUrl: apkAsset.browser_download_url,
            releaseNotes: release.body || 'Versi terbaru tersedia!',
            releaseName: release.name
        };
    } catch (error) {
        console.error('Error checking for update:', error);
        return { hasUpdate: false };
    }
}

/**
 * Compare two version strings
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const num1 = parts1[i] || 0;
        const num2 = parts2[i] || 0;

        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
    }

    return 0;
}

/**
 * Download dan install APK (untuk native Android)
 * @param {string} downloadUrl - URL APK dari GitHub Releases
 */
export async function downloadAndInstallUpdate(downloadUrl) {
    // Buka link download - Android akan otomatis prompt install setelah download
    window.open(downloadUrl, '_blank');
}

/**
 * Get GitHub Releases URL untuk manual check
 */
export function getReleasesUrl() {
    return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;
}
