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
    }
})
