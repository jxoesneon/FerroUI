import { describe, it, expect } from 'vitest';
import { getLogger, logger } from './logger';

describe('FerroUI Telemetry', () => {
  it('should initialize logger', () => {
    const logInstance = getLogger();
    expect(logInstance).toBeDefined();
    expect(logger.info).toBeDefined();
  });
});
