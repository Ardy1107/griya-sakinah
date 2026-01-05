// Google Drive API Integration
// Handles OAuth authentication and file uploads to Google Drive

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Discovery doc for Google Drive API
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scope - we only need file upload permission
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Folder name for storing evidence files
const FOLDER_NAME = 'Griya Sakinah - Bukti Pembayaran';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;
let accessToken = null;

// Check if Google Drive is configured
export const isGoogleDriveConfigured = () => {
    return !!CLIENT_ID;
};

// Load the Google API scripts dynamically
export const loadGoogleScripts = () => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.gapi && window.google) {
            resolve();
            return;
        }

        // Load GAPI script
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        gapiScript.defer = true;

        // Load GIS script
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true;
        gisScript.defer = true;

        let gapiLoaded = false;
        let gisLoaded = false;

        const checkBothLoaded = () => {
            if (gapiLoaded && gisLoaded) {
                resolve();
            }
        };

        gapiScript.onload = () => {
            gapiLoaded = true;
            checkBothLoaded();
        };
        gapiScript.onerror = () => reject(new Error('Failed to load Google API'));

        gisScript.onload = () => {
            gisLoaded = true;
            checkBothLoaded();
        };
        gisScript.onerror = () => reject(new Error('Failed to load Google Identity Services'));

        document.head.appendChild(gapiScript);
        document.head.appendChild(gisScript);
    });
};

// Initialize GAPI client
const initializeGapiClient = async () => {
    const initConfig = {
        discoveryDocs: [DISCOVERY_DOC],
    };

    // Only include API key if it exists
    if (API_KEY) {
        initConfig.apiKey = API_KEY;
    }

    await window.gapi.client.init(initConfig);
    gapiInited = true;
};

// Initialize Google APIs
export const initGoogleDrive = async () => {
    if (!isGoogleDriveConfigured()) {
        console.warn('Google Drive not configured. Missing CLIENT_ID or API_KEY.');
        return false;
    }

    try {
        await loadGoogleScripts();

        // Initialize GAPI
        await new Promise((resolve) => {
            window.gapi.load('client', resolve);
        });
        await initializeGapiClient();

        // Initialize GIS token client
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // Will be set later
        });
        gisInited = true;

        // Check for existing token in session
        const storedToken = sessionStorage.getItem('google_access_token');
        if (storedToken) {
            accessToken = storedToken;
            window.gapi.client.setToken({ access_token: accessToken });
        }

        return true;
    } catch (error) {
        console.error('Failed to initialize Google Drive:', error);
        return false;
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!accessToken;
};

// Authenticate with Google
export const authenticate = () => {
    return new Promise((resolve, reject) => {
        if (!gisInited) {
            reject(new Error('Google Identity Services not initialized'));
            return;
        }

        tokenClient.callback = (response) => {
            if (response.error !== undefined) {
                reject(new Error(response.error));
                return;
            }
            accessToken = response.access_token;
            sessionStorage.setItem('google_access_token', accessToken);
            window.gapi.client.setToken({ access_token: accessToken });
            resolve(accessToken);
        };

        if (accessToken === null) {
            // Prompt the user to select an account and consent
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Skip consent if already have token
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
};

// Sign out from Google
export const signOut = () => {
    if (accessToken) {
        window.google.accounts.oauth2.revoke(accessToken);
        accessToken = null;
        sessionStorage.removeItem('google_access_token');
        window.gapi.client.setToken(null);
    }
};

// Get or create the app folder in Google Drive
const getOrCreateFolder = async () => {
    try {
        // Search for existing folder
        const response = await window.gapi.client.drive.files.list({
            q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
        });

        const folders = response.result.files;
        if (folders && folders.length > 0) {
            return folders[0].id;
        }

        // Create new folder
        const createResponse = await window.gapi.client.drive.files.create({
            resource: {
                name: FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id',
        });

        return createResponse.result.id;
    } catch (error) {
        console.error('Error getting/creating folder:', error);
        throw error;
    }
};

// Upload file to Google Drive
export const uploadFile = async (file, customFileName = null) => {
    if (!isAuthenticated()) {
        throw new Error('Not authenticated. Please sign in first.');
    }

    try {
        const folderId = await getOrCreateFolder();

        const fileName = customFileName || file.name;
        const metadata = {
            name: fileName,
            parents: [folderId],
        };

        // Create form data for multipart upload
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink,thumbnailLink', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: form,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Upload failed');
        }

        const result = await response.json();

        // Make the file accessible via link
        await window.gapi.client.drive.permissions.create({
            fileId: result.id,
            resource: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return {
            id: result.id,
            viewLink: result.webViewLink,
            downloadLink: result.webContentLink,
            thumbnailLink: result.thumbnailLink,
            driveLink: `https://drive.google.com/file/d/${result.id}/view`,
        };
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

// Delete file from Google Drive
export const deleteFile = async (fileId) => {
    if (!isAuthenticated()) {
        throw new Error('Not authenticated');
    }

    try {
        await window.gapi.client.drive.files.delete({
            fileId: fileId,
        });
        return true;
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
};

// List files in the app folder
export const listFiles = async () => {
    if (!isAuthenticated()) {
        throw new Error('Not authenticated');
    }

    try {
        const folderId = await getOrCreateFolder();
        const response = await window.gapi.client.drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType, size, createdTime, webViewLink)',
            orderBy: 'createdTime desc',
        });

        return response.result.files || [];
    } catch (error) {
        console.error('List files error:', error);
        throw error;
    }
};

export default {
    isGoogleDriveConfigured,
    initGoogleDrive,
    isAuthenticated,
    authenticate,
    signOut,
    uploadFile,
    deleteFile,
    listFiles,
};
