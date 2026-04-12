import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@alloy/engine': path.resolve(__dirname, '../../packages/engine/src'),
      '@alloy/registry': path.resolve(__dirname, '../../packages/registry/src'),
      '@alloy/schema': path.resolve(__dirname, '../../packages/schema/src'),
      '@alloy/tools': path.resolve(__dirname, '../../packages/tools/src'),
      '@alloy/telemetry': path.resolve(__dirname, '../../packages/telemetry/src'),
      '@alloy/i18n': path.resolve(__dirname, '../../packages/i18n/src'),
      'zod': path.resolve(__dirname, '../../node_modules/zod'),
    },
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
