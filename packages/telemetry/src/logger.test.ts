import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLogger, log, logger, LogLevel } from './logger';
import { logs } from '@opentelemetry/api-logs';

vi.mock('@opentelemetry/api-logs', () => {
  const mockLogger = {
    emit: vi.fn(),
  };
  return {
    logs: {
      getLogger: vi.fn(() => mockLogger),
    },
  };
});

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getLogger should call logs.getLogger with correct arguments', () => {
    getLogger();
    expect(logs.getLogger).toHaveBeenCalledWith('@alloy/telemetry', '0.1.0');
  });

  it('log should emit structured log', () => {
    log(LogLevel.INFO, 'Test message', { userId: '123' });
    const mockLogger = logs.getLogger('test', '1.0');
    expect(mockLogger.emit).toHaveBeenCalledWith(expect.objectContaining({
      severityText: 'INFO',
      body: 'Test message',
      attributes: expect.objectContaining({
        service: 'alloy-engine',
        version: '1.0.0',
        userId: '123',
      })
    }));
  });

  it('logger helpers should call log with correct level', () => {
    logger.debug('debug msg');
    logger.info('info msg');
    logger.warn('warn msg');
    logger.error('error msg');
    logger.fatal('fatal msg');

    const mockLogger = logs.getLogger('test', '1.0');
    expect(mockLogger.emit).toHaveBeenCalledTimes(5);
    expect(mockLogger.emit).toHaveBeenNthCalledWith(1, expect.objectContaining({ severityText: 'DEBUG' }));
    expect(mockLogger.emit).toHaveBeenNthCalledWith(2, expect.objectContaining({ severityText: 'INFO' }));
    expect(mockLogger.emit).toHaveBeenNthCalledWith(3, expect.objectContaining({ severityText: 'WARN' }));
    expect(mockLogger.emit).toHaveBeenNthCalledWith(4, expect.objectContaining({ severityText: 'ERROR' }));
    expect(mockLogger.emit).toHaveBeenNthCalledWith(5, expect.objectContaining({ severityText: 'FATAL' }));
  });
});