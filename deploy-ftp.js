import { Client } from "basic-ftp";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deploy() {
    const client = new Client();
    client.ftp.verbose = true;

    try {
        console.log("🔌 Connecting...");
        await client.access({
            host: "145.79.26.43",
            user: "u254488293.griyasakinah",
            password: "Samarinda2026!",
            port: 21,
            secure: false
        });

        console.log("✅ Connected!");

        // List root directory to find the right path
        console.log("\n📋 Root contents:");
        const rootList = await client.list();
        for (const item of rootList) {
            console.log(`  ${item.type === 2 ? '📁' : '📄'} ${item.name}`);
        }

        // Try to find and use public_html or the correct directory
        let targetDir = "/";
        for (const item of rootList) {
            if (item.name === "public_html" && item.type === 2) {
                targetDir = "/public_html";
                break;
            }
        }

        if (targetDir !== "/") {
            await client.cd(targetDir);
            console.log(`\n📁 Changed to ${targetDir}`);
        } else {
            console.log("\n📁 Working in root directory");
        }

        // Clear and upload
        console.log("\n🗑️ Clearing old files...");
        const currentList = await client.list();
        for (const item of currentList) {
            try {
                if (item.type === 2) {
                    await client.removeDir(item.name);
                } else {
                    await client.remove(item.name);
                }
                console.log(`  Deleted: ${item.name}`);
            } catch (e) {
                console.log(`  Skip: ${item.name}`);
            }
        }

        // Upload files
        const localDir = join(__dirname, "dist");
        console.log("\n📤 Uploading from:", localDir);

        const items = readdirSync(localDir);
        for (const item of items) {
            const localPath = join(localDir, item);
            const stat = statSync(localPath);

            if (stat.isDirectory()) {
                console.log(`📁 ${item}`);
                await client.uploadFromDir(localPath, item);
            } else {
                console.log(`📄 ${item}`);
                await client.uploadFrom(localPath, item);
            }
        }

        console.log("\n🎉 Upload complete!");

    } catch (err) {
        console.error("❌ Error:", err.message);
    }

    client.close();
}

deploy();
