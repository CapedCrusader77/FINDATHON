import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        watch: {
            ignored: ['**/*.mp4', '**/public/**', '**/.dedupeiq/**']
        },
        proxy: { '/api': 'http://localhost:5000' }
    },
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: { charts: ['recharts'] }
            }
        }
    }
});
