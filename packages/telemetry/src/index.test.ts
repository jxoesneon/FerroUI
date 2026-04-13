import { describe, it, expect } from 'vitest';
import { AlloyLogger } from './logger';

describe('Alloy Telemetry', () => {
  it('should initialize logger', () => {
    const logger = new AlloyLogger({ serviceName: 'test-service' });
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
  });
});
