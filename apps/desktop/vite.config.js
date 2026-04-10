import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Tauri expects a fixed port for HMR
    server: {
        port: 5173,
        strictPort: true,
    },
    // Env variables starting with TAURI_ are passed to the frontend
    envPrefix: ['VITE_', 'TAURI_'],
    build: {
        // Tauri supports only modern browsers
        target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
        // don't minify for debug builds
        minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
        // produce sourcemaps for debug builds
        sourcemap: !!process.env.TAURI_DEBUG,
        outDir: 'dist',
    },
});
