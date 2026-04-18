// Stryker Mutation Testing Configuration (B.3)
// @see https://stryker-mutator.io/docs/stryker-js/configurati
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  // Use Vitest test runner
  testRunner: 'vitest',
  
  // Target packages for mutation testing
  mutate: [
    'packages/engine/src/**/*.ts',
    '!packages/engine/src/**/*.test.ts',
    'packages/schema/src/**/*.ts',
    '!packages/schema/src/**/*.test.ts',
  ],
  
  // Thresholds (B.3.3)
  thresholds: {
    high: 85,      // Schema target
    low: 70,       // Engine minimum
    break: 60,     // CI failure threshold
  },
  
  // Reporters
  reporters: ['html', 'clear-text', 'progress', 'json'],
  
  // Coverage analysis for performance
  coverageAnalysis: 'perTest',
  
  // Enable all mutators
  mutators: {
    // Disable some mutators that are too aggressive for this codebase
    optionalChaining: true,
    arrowFunction: true,
    blockStatement: true,
    equality: true,
    boolean: true,
    conditional: true,
    logical: true,
    unary: true,
    update: true,
  },
  
  // Vitest-specific configuration
  vitest: {
    configFile: 'vitest.config.ts',
  },
  
  // Performance tuning
  maxConcurrentTestRunners: 4,
  
  // Clear temp dir on run
  cleanTempDir: true,
  
  // Dashboard configuration (optional - for hosted reports)
  dashboard: {
    project: 'github.com/ferroui/ferroui',
    version: 'main',
    module: 'engine',
  },
};

export default config;
