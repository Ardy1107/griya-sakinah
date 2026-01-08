import { Client } from "basic-ftp";
import { fileURLToPath } from 'url';
import { dirname, join, relative } from 'path';
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const HASH_FILE = join(__dirname, '.deploy-hashes.json');

// Calculate file hash
function getFileHash(filePath) {
    const content = readFileSync(filePath);
    return createHash('md5').update(content).digest('hex');
}

// Get all files recursively with their hashes
function getAllFiles(dir, baseDir = dir) {
    const files = {};
    const items = readdirSync(dir);

    for (const item of items) {
        const fullPath = join(dir, item);
        const relativePath = relative(baseDir, fullPath).replace(/\\/g, '/');
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            Object.assign(files, getAllFiles(fullPath, baseDir));
        } else {
            files[relativePath] = getFileHash(fullPath);
        }
    }
    return files;
}

// Load previous hashes
function loadPreviousHashes() {
    if (existsSync(HASH_FILE)) {
        try {
            return JSON.parse(readFileSync(HASH_FILE, 'utf-8'));
        } catch (e) {
            return {};
        }
    }
    return {};
}

// Save current hashes
function saveHashes(hashes) {
    writeFileSync(HASH_FILE, JSON.stringify(hashes, null, 2));
}

async function deploy() {
    const client = new Client();
    client.ftp.verbose = false; // Less verbose for speed

    try {
        const localDir = join(__dirname, "dist");

        // Get current and previous file hashes
        console.log("🔍 Scanning for changes...");
        const currentHashes = getAllFiles(localDir);
        const previousHashes = loadPreviousHashes();

        // Find changed and new files
        const changedFiles = [];
        const newFiles = [];
        const deletedFiles = [];

        for (const [file, hash] of Object.entries(currentHashes)) {
            if (!previousHashes[file]) {
                newFiles.push(file);
            } else if (previousHashes[file] !== hash) {
                changedFiles.push(file);
            }
        }

        for (const file of Object.keys(previousHashes)) {
            if (!currentHashes[file]) {
                deletedFiles.push(file);
            }
        }

        const filesToUpload = [...newFiles, ...changedFiles];

        if (filesToUpload.length === 0 && deletedFiles.length === 0) {
            console.log("✅ No changes detected. Nothing to upload!");
            return;
        }

        console.log(`\n📊 Changes detected:`);
        console.log(`   New files: ${newFiles.length}`);
        console.log(`   Modified: ${changedFiles.length}`);
        console.log(`   Deleted: ${deletedFiles.length}`);
        console.log(`   Total to upload: ${filesToUpload.length}\n`);

        // Connect to FTP
        console.log("🔌 Connecting to FTP...");
        await client.access({
            host: "145.79.26.43",
            user: "u254488293.griyasakinah",
            password: "Samarinda2026???",
            port: 21,
            secure: false
        });

        console.log("✅ Connected!\n");

        // Upload changed files
        for (const file of filesToUpload) {
            const localPath = join(localDir, file);
            const remotePath = file;

            // Ensure remote directory exists
            const remoteDir = remotePath.split('/').slice(0, -1).join('/');
            if (remoteDir) {
                try {
                    await client.ensureDir(remoteDir);
                    await client.cd('/'); // Go back to root
                } catch (e) { }
            }

            console.log(`📤 ${file}`);
            await client.uploadFrom(localPath, remotePath);
        }

        // Delete removed files
        for (const file of deletedFiles) {
            try {
                console.log(`🗑️ Deleting: ${file}`);
                await client.remove(file);
            } catch (e) { }
        }

        // Save new hashes
        saveHashes(currentHashes);

        console.log(`\n🎉 Deploy complete! Uploaded ${filesToUpload.length} files.`);

    } catch (err) {
        console.error("❌ Error:", err.message);
    }

    client.close();
}

// Force full upload if --full flag
if (process.argv.includes('--full')) {
    if (existsSync(HASH_FILE)) {
        writeFileSync(HASH_FILE, '{}');
    }
    console.log("🔄 Force full upload mode\n");
}

deploy();
