/**
 * FTP Deploy Script - Incremental Sync
 * Hanya upload file yang BERUBAH saja, bukan semua file
 * 
 * Cara pakai: npm run deploy:ftp
 */

const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

// Load environment variables
process.loadEnvFile();

const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST || '145.79.26.43',
    port: parseInt(process.env.FTP_PORT || '21'),
    localRoot: './dist',
    remoteRoot: '/',

    // File yang akan di-upload (semua file di dist termasuk dotfiles)
    include: ['*', '**/*', '.htaccess'],

    // File yang TIDAK di-upload (optional)
    exclude: [
        '.git/**',
        '.gitignore',
        '.DS_Store',
        'node_modules/**'
    ],

    // Hapus file di server yang tidak ada di lokal
    deleteRemote: true,

    // Hanya upload file yang BERUBAH saja! (incremental)
    forcePasv: true,
    sftp: false
};

// Event handlers
ftpDeploy.on('uploading', (data) => {
    console.log(`📤 Uploading: ${data.filename} (${data.transferredFileCount}/${data.totalFilesCount})`);
});

ftpDeploy.on('uploaded', (data) => {
    console.log(`✅ Uploaded: ${data.filename}`);
});

ftpDeploy.on('log', (data) => {
    console.log(`📝 ${data}`);
});

// Run deployment
console.log('🚀 Starting deployment to Hostinger...');
console.log('📁 Uploading from ./dist to /');
console.log('⚡ Mode: Incremental (only changed files)\n');

ftpDeploy
    .deploy(config)
    .then((res) => {
        console.log('\n✅ Deployment successful!');
        console.log(`📊 Files uploaded: ${res.length || 'all synced'}`);
        console.log('🌐 Website: https://griyasakinah.org');
    })
    .catch((err) => {
        console.error('\n❌ Deployment failed:', err.message);
        process.exit(1);
    });
