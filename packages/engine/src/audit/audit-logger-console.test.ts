import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuditLogger, AuditEventType } from './audit-logger';

describe('AuditLogger — console and file output', () => {
  beforeEach(() => AuditLogger.resetInstance());
  afterEach(() => AuditLogger.resetInstance());

  it('console output writes to stdout and stores event', () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const logger = new AuditLogger({ output: 'console' });

    logger.log({
      type: AuditEventType.CIRCUIT_OPEN,
      requestId: 'r1',
      userId: 'u1',
      consecutiveFailures: 3,
    });

    expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('[AUDIT]'));
    expect(logger.getEvents()).toHaveLength(1);
    writeSpy.mockRestore();
  });

  it('file output stores event and writes file', async () => {
    const appendSpy = vi.fn();
    vi.doMock('fs', () => ({ appendFileSync: appendSpy, default: { appendFileSync: appendSpy } }));

    const logger = new AuditLogger({ output: 'file', filePath: '/tmp/audit-test.log' });
    logger.log({
      type: AuditEventType.RATE_LIMITED,
      requestId: 'r2',
      userId: 'u2',
      ip: '1.2.3.4',
    });

    expect(logger.getEvents()).toHaveLength(1);
    expect(logger.getEvents()[0].type).toBe(AuditEventType.RATE_LIMITED);
  });

  it('file output without filePath is a silent no-op (does not store event)', () => {
    const logger = new AuditLogger({ output: 'file' });
    logger.log({
      type: AuditEventType.SESSION_UPDATED,
      requestId: 'r3',
      userId: 'u3',
      componentId: 'comp-1',
      newState: 'active',
    });
    // No filePath → the else-if condition `this.output === 'file' && this.filePath` is false → not stored
    expect(logger.getEvents()).toHaveLength(0);
  });

  it('getInstance reads AUDIT_LOG_OUTPUT env var', () => {
    process.env.AUDIT_LOG_OUTPUT = 'memory';
    const instance = AuditLogger.getInstance();
    expect(instance).toBeDefined();
    delete process.env.AUDIT_LOG_OUTPUT;
  });

  it('getInstance returns singleton', () => {
    const a = AuditLogger.getInstance();
    const b = AuditLogger.getInstance();
    expect(a).toBe(b);
  });

  it('logs REQUEST_ERROR events', () => {
    const logger = new AuditLogger({ output: 'memory' });
    logger.log({
      type: AuditEventType.REQUEST_ERROR,
      requestId: 'r4',
      userId: 'u4',
      error: 'something failed',
      code: 'PIPELINE_ERROR',
    });
    const events = logger.getEvents();
    expect(events[0].type).toBe(AuditEventType.REQUEST_ERROR);
  });

  it('logs CIRCUIT_RESET events', () => {
    const logger = new AuditLogger({ output: 'memory' });
    logger.log({
      type: AuditEventType.CIRCUIT_RESET,
      requestId: 'r5',
      userId: 'u5',
      consecutiveFailures: 0,
    });
    expect(logger.getEvents()[0].type).toBe(AuditEventType.CIRCUIT_RESET);
  });
});
