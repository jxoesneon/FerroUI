import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
})
