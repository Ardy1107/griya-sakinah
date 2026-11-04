import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Baca .env secara manual tanpa dependensi eksternal
function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env')
    if (!fs.existsSync(envPath)) {
        return {}
    }
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const env = {}
    envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
            const eqIndex = trimmed.indexOf('=')
            if (eqIndex > 0) {
                const key = trimmed.slice(0, eqIndex).trim()
                let value = trimmed.slice(eqIndex + 1).trim()
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1)
                }
                env[key] = value
            }
        }
    })
    return env
}

const env = loadEnv()

const targets = [
    {
        name: 'Supabase Internet & Musholla',
        url: env.VITE_SUPABASE_URL_INTERNET,
        key: env.VITE_SUPABASE_ANON_KEY_INTERNET,
        endpoint: '/rest/v1/residents?select=id&limit=1'
    },
    {
        name: 'Supabase Angsuran',
        url: env.VITE_SUPABASE_URL_ANGSURAN,
        key: env.VITE_SUPABASE_ANON_KEY_ANGSURAN,
        endpoint: '/rest/v1/units?select=id&limit=1'
    }
]

async function pingSupabase(target) {
    if (!target.url || !target.key) {
        console.warn(`⚠️ [SKIP] URL atau Anon Key untuk ${target.name} tidak ditemukan di .env`)
        return
    }

    const fullUrl = `${target.url}${target.endpoint}`
    console.log(`📡 Pinging ${target.name}...`)

    try {
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                apikey: target.key,
                Authorization: `Bearer ${target.key}`
            }
        })

        if (response.ok) {
            console.log(`✅ ${target.name} AKTIF (Status: ${response.status})`)
        } else {
            console.error(`❌ ${target.name} GAGAL (Status: ${response.status} ${response.statusText})`)
        }
    } catch (error) {
        console.error(`❌ Error saat ping ${target.name}:`, error.message)
    }
}

async function run() {
    console.log('--- Memulai Supabase Keep-Alive Ping ---')
    for (const target of targets) {
        await pingSupabase(target)
    }
    console.log('--- Selesai ---')
}

run()

