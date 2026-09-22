import { Client } from "basic-ftp";

// Load environment variables
process.loadEnvFile();

async function cleanup() {
    const client = new Client();

    try {
        console.log("🔌 Connecting...");
        await client.access({
            host: process.env.FTP_HOST || "145.79.26.43",
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            port: parseInt(process.env.FTP_PORT || '21'),
            secure: false
        });

        console.log("✅ Connected!");
        await client.cd("/public_html");

        // Delete default.php
        try {
            await client.remove("default.php");
            console.log("🗑️ Deleted default.php");
        } catch (e) {
            console.log("default.php already gone or error:", e.message);
        }

        // List final contents
        console.log("\n📋 Final contents:");
        const list = await client.list();
        for (const item of list) {
            console.log(`  ${item.type === 2 ? '📁' : '📄'} ${item.name}`);
        }

        console.log("\n✅ Cleanup complete!");

    } catch (err) {
        console.error("❌ Error:", err.message);
    }

    client.close();
}

cleanup();
