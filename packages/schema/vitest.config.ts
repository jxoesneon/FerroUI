import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Explicitly prefer .ts over .js so unextended relative imports route
  // through TypeScript source (needed for coverage; otherwise v8 sees only
  // the committed .js artifacts in src/).
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.mts', '.json'],
  },
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        // JS artifacts tracked in git; coverage tracks TypeScript source
        'src/**/*.js',
        // CLI entrypoint reads from stdin and calls process.exit — exercised
        // via the built binary in integration, not suitable for unit coverage
        'src/validate.ts',
        // index.ts is a pure re-export barrel
        'src/index.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
