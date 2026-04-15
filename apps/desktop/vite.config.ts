import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@ferroui/engine': path.resolve(__dirname, '../../packages/engine/src'),
      '@ferroui/registry': path.resolve(__dirname, '../../packages/registry/src'),
      '@ferroui/schema': path.resolve(__dirname, '../../packages/schema/src'),
      '@ferroui/tools': path.resolve(__dirname, '../../packages/tools/src'),
      '@ferroui/telemetry': path.resolve(__dirname, '../../packages/telemetry/src'),
      '@ferroui/i18n': path.resolve(__dirname, '../../packages/i18n/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
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
})
