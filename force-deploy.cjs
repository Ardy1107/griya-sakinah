/**
 * FTP Force Deploy Script - CLEAN DEPLOY
 * Deletes old folders that interfere with SPA routing, then uploads fresh files
 * 
 * Cara pakai: node force-deploy.cjs
 */

const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

const FTP_PASSWORD = process.env.FTP_PASSWORD || 'Samarinda2026@@@';

const config = {
    host: 'ftp.griyasakinah.org',
    user: 'u254488293.griyasakinah2',
    password: FTP_PASSWORD,
    port: 21,
    secure: false
};

const localDir = './dist';
const remoteDir = '';

// Folders to delete (old route folders that break SPA)
const foldersToDelete = ['angsuran', 'internet', 'musholla', 'komunitas', 'admin', 'warga', 'superadmin'];

async function deleteFolder(client, folderPath) {
    console.log(`🗑️  Deleting folder: ${folderPath}`);
    try {
        await client.removeDir(folderPath);
        console.log(`   ✅ Deleted: ${folderPath}`);
    } catch (err) {
        console.log(`   ⚠️  Could not delete ${folderPath}: ${err.message}`);
    }
}

async function uploadDirectory(client, localPath, remotePath) {
    const items = fs.readdirSync(localPath);

    for (const item of items) {
        const localItemPath = path.join(localPath, item);
        const remoteItemPath = remotePath ? `${remotePath}/${item}` : item;
        const stat = fs.statSync(localItemPath);

        if (stat.isDirectory()) {
            console.log(`📁 Creating directory: ${remoteItemPath}`);
            try {
                await client.ensureDir(remoteItemPath);
                await client.cd('/');
            } catch (e) {
                // Directory might already exist
            }
            await uploadDirectory(client, localItemPath, remoteItemPath);
        } else {
            console.log(`📤 Uploading: ${remoteItemPath}`);
            await client.uploadFrom(localItemPath, remoteItemPath);
        }
    }
}

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = false;

    try {
        console.log('🚀 Force Deploy - Starting CLEAN DEPLOY to Hostinger...');
        console.log('📁 Uploading from ./dist to /');
        console.log('⚠️  Mode: FORCE (delete old route folders first)\n');

        // Connect
        console.log('🔗 Connecting to FTP server...');
        await client.access(config);
        console.log('✅ Connected!\n');

        // Delete old route folders that break SPA routing
        console.log('🗑️  Cleaning old route folders...\n');
        for (const folder of foldersToDelete) {
            await deleteFolder(client, `${remoteDir}/${folder}`);
        }
        console.log('');

        // Delete old assets folder
        console.log('🗑️  Deleting old assets folder...');
        try {
            await client.removeDir(`${remoteDir}/assets`);
            console.log('   ✅ Old assets deleted!\n');
        } catch (e) {
            console.log('   ⚠️  No old assets to delete\n');
        }

        // Delete old index.html
        try {
            await client.remove(`${remoteDir}/index.html`);
            console.log('✅ Deleted old index.html\n');
        } catch (e) {
            console.log('⚠️  No old index.html to delete\n');
        }

        // Upload all files
        console.log('📦 Uploading all files from dist...\n');
        await uploadDirectory(client, localDir, remoteDir);

        console.log('\n✅ Deployment successful!');
        console.log('🌐 Website: https://griyasakinah.org');
        console.log('\n💡 TIP: Do a hard refresh (Ctrl+Shift+R) on the website to see changes!');

    } catch (err) {
        console.error('\n❌ Deployment failed:', err.message);
        process.exit(1);
    } finally {
        client.close();
    }
}

deploy();
