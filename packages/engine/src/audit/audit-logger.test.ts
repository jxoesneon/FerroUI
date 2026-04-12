import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuditLogger, AuditEventType } from './audit-logger';

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    AuditLogger.resetInstance();
    logger = new AuditLogger({ output: 'memory' });
  });

  afterEach(() => {
    AuditLogger.resetInstance();
  });

  it('records tool_call events', () => {
    logger.log({
      type: AuditEventType.TOOL_CALL,
      requestId: 'req-1',
      userId: 'user-1',
      toolName: 'getUserProfile',
      args: { userId: 'u1' },
      success: true,
      durationMs: 42,
    });

    const events = logger.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe(AuditEventType.TOOL_CALL);
    if (events[0].type === AuditEventType.TOOL_CALL) {
      expect(events[0].toolName).toBe('getUserProfile');
    }
  });

  it('records request_complete events', () => {
    logger.log({
      type: AuditEventType.REQUEST_COMPLETE,
      requestId: 'req-2',
      userId: 'user-2',
      success: true,
      durationMs: 1200,
    });

    const events = logger.getEvents();
    expect(events[0].type).toBe(AuditEventType.REQUEST_COMPLETE);
  });

  it('stamps a timestamp on each event', () => {
    logger.log({
      type: AuditEventType.REQUEST_START,
      requestId: 'r',
      userId: 'u',
      promptHash: 'abc123',
      permissions: ['read'],
      locale: 'en-US',
    });

    const events = logger.getEvents();
    expect(events[0].timestamp).toBeDefined();
    expect(typeof events[0].timestamp).toBe('string');
  });

  it('serializes to JSON lines', () => {
    logger.log({
      type: AuditEventType.TOOL_CALL,
      requestId: 'r',
      userId: 'u',
      toolName: 't',
      args: {},
      success: false,
      durationMs: 0,
    });

    const line = logger.toJsonLines()[0];
    const parsed = JSON.parse(line);
    expect(parsed.type).toBe(AuditEventType.TOOL_CALL);
    expect(parsed.timestamp).toBeDefined();
  });

  it('getEvents with limit returns last N', () => {
    for (let i = 0; i < 5; i++) {
      logger.log({
        type: AuditEventType.REQUEST_COMPLETE,
        requestId: `r-${i}`,
        userId: 'u',
        success: true,
        durationMs: i,
      });
    }
    expect(logger.getEvents(3)).toHaveLength(3);
  });

  it('clear empties events', () => {
    logger.log({
      type: AuditEventType.REQUEST_COMPLETE,
      requestId: 'r',
      userId: 'u',
      success: true,
      durationMs: 0,
    });
    logger.clear();
    expect(logger.getEvents()).toHaveLength(0);
  });
});
