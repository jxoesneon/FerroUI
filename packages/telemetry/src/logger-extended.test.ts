import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logs } from '@opentelemetry/api-logs';
import { getLogger, log, logger, LogLevel } from './logger';

describe('getLogger', () => {
  it('returns a Logger instance from the OTel API', () => {
    const l = getLogger();
    expect(l).toBeDefined();
    expect(typeof l.emit).toBe('function');
  });
});

describe('log()', () => {
  let emitSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    emitSpy = vi.fn();
    vi.spyOn(logs, 'getLogger').mockReturnValue({ emit: emitSpy } as never);
  });

  it('emits a structured log record with correct severity', () => {
    log(LogLevel.INFO, 'test message', { requestId: 'req-1' });
    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        severityText: 'INFO',
        body: 'test message',
        attributes: expect.objectContaining({ requestId: 'req-1', service: 'ferroui-engine' }),
      }),
    );
  });

  it('emits ERROR severity', () => {
    log(LogLevel.ERROR, 'boom', {});
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ severityText: 'ERROR' }));
  });

  it('emits WARN severity', () => {
    log(LogLevel.WARN, 'careful', {});
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ severityText: 'WARN' }));
  });

  it('emits DEBUG severity', () => {
    log(LogLevel.DEBUG, 'debug info');
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ severityText: 'DEBUG' }));
  });

  it('emits FATAL severity', () => {
    log(LogLevel.FATAL, 'fatal error');
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ severityText: 'FATAL' }));
  });

  it('includes timestamp in record', () => {
    log(LogLevel.INFO, 'ts check');
    const call = emitSpy.mock.calls[0][0];
    expect(call.timestamp).toBeInstanceOf(Date);
  });
});

describe('logger helpers', () => {
  let emitSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    emitSpy = vi.fn();
    vi.spyOn(logs, 'getLogger').mockReturnValue({ emit: emitSpy } as never);
  });

  it('logger.debug calls with DEBUG level', () => {
    logger.debug('debug msg');
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ severityText: 'DEBUG' }));
  });

  it('logger.info calls with INFO level', () => {
    logger.info('info msg');
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ severityText: 'INFO' }));
  });

  it('logger.warn calls with WARN level', () => {
    logger.warn('warn msg');
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ severityText: 'WARN' }));
  });

  it('logger.error calls with ERROR level', () => {
    logger.error('err msg');
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ severityText: 'ERROR' }));
  });

  it('logger.fatal calls with FATAL level', () => {
    logger.fatal('fatal msg');
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ severityText: 'FATAL' }));
  });
});
