const FtpDeploy = require('ftp-deploy');

async function testLogin(user, password) {
    const ftpDeploy = new FtpDeploy();
    const config = {
        user,
        password,
        host: '45.130.228.117',
        port: 21,
        localRoot: './dist',
        remoteRoot: '/',
        include: ['index.html']
    };

    console.log(`Testing user: ${user} | pass: ${password}`);
    try {
        await ftpDeploy.deploy(config);
        console.log(`✅ SUCCESS with user: ${user} | pass: ${password}`);
        return true;
    } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        return false;
    }
}

async function run() {
    const passwords = [
        'Samarinda2026...',
        'Samarinda2026',
        'Samarinda2026!!!',
        'Samarinda2026!@#'
    ];
    
    const users = [
        'u254488293.griyasakinah2026',
        'griyasakinah2026',
        'u254488293.griyasakinah.org',
        'u254488293'
    ];

    for (const p of passwords) {
        for (const u of users) {
            const success = await testLogin(u, p);
            if (success) {
                console.log(`FOUND IT! User: ${u}, Pass: ${p}`);
                return;
            }
        }
    }
}

run();
