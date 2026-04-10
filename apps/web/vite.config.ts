import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@alloy/engine': path.resolve(__dirname, '../../packages/engine/dist'),
      '@alloy/registry': path.resolve(__dirname, '../../packages/registry/dist'),
      '@alloy/schema': path.resolve(__dirname, '../../packages/schema/dist'),
      '@alloy/tools': path.resolve(__dirname, '../../packages/tools/dist'),
      '@alloy/telemetry': path.resolve(__dirname, '../../packages/telemetry/dist'),
      '@alloy/i18n': path.resolve(__dirname, '../../packages/i18n/dist'),
      'zod': path.resolve(__dirname, '../../node_modules/zod'),
    },
  },
})
