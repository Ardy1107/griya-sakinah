import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/',
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src',
            '@shared': '/src/shared',
            '@modules': '/src/modules',
            '@admin': '/src/admin'
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-charts': ['recharts'],
                    'vendor-icons': ['lucide-react'],
                    'vendor-export': ['jspdf', 'jspdf-autotable', 'xlsx', 'file-saver'],
                    'vendor-supabase': ['@supabase/supabase-js'],
                }
            }
        },
        chunkSizeWarningLimit: 600,
    }
})
