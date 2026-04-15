import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ferroui/engine': resolve(__dirname, '../../packages/engine/src'),
      '@ferroui/registry': resolve(__dirname, '../../packages/registry/src'),
      '@ferroui/schema': resolve(__dirname, '../../packages/schema/src'),
      '@ferroui/tools': resolve(__dirname, '../../packages/tools/src'),
      '@ferroui/telemetry': resolve(__dirname, '../../packages/telemetry/src'),
      '@ferroui/i18n': resolve(__dirname, '../../packages/i18n/src'),
      'zod': resolve(__dirname, '../../node_modules/zod'),
    },
  },
  test: {
    name: 'web',
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
