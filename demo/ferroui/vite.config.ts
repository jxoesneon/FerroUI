import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
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
})
