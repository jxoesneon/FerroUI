import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@alloy/engine': resolve(__dirname, '../../packages/engine/src'),
      '@alloy/registry': resolve(__dirname, '../../packages/registry/src'),
      '@alloy/schema': resolve(__dirname, '../../packages/schema/src'),
      '@alloy/tools': resolve(__dirname, '../../packages/tools/src'),
      '@alloy/telemetry': resolve(__dirname, '../../packages/telemetry/src'),
      '@alloy/i18n': resolve(__dirname, '../../packages/i18n/src'),
      'zod': resolve(__dirname, '../../node_modules/zod'),
    },
  },
  test: {
    name: 'web',
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, 'src/setupTests.ts')],
    globals: true,
    include: [`${__dirname}/src/**/*.test.{ts,tsx}`],
  },
});
