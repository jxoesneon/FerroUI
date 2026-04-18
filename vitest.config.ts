import { defineConfig } from 'vitest/config';

/**
 * Root-level vitest config — only for tests/ directory (integration tests).
 * Package-level unit tests have their own vitest.config.ts under each package.
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    exclude: ['packages/**', 'apps/**', 'node_modules/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
