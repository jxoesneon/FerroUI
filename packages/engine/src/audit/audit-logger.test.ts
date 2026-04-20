import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuditLogger, AuditEventType } from './audit-logger.js';

vi.mock('better-sqlite3', () => {
  return {
    default: class MockDatabase {
      rows: any[] = [];
      id = 1;
      
      constructor(path: string) {
        if (path.includes('invalid')) throw new Error('Cannot open database');
      }

      prepare(sql: string) {
        return {
          run: (...args: any[]) => {
            if (sql.includes('INSERT INTO audit_log')) {
              this.rows.push({
                id: this.id++,
                timestamp: args[0],
                event_type: args[1],
                event_json: args[2],
                prev_hash: args[3],
                entry_hash: args[4],
              });
            } else if (sql.includes('UPDATE')) {
               if (sql.includes('event_json')) this.rows[0].event_json = 'tampered';
               if (sql.includes('prev_hash')) this.rows[1].prev_hash = 'tampered';
            }
          },
          all: () => this.rows,
          get: () => this.rows[this.rows.length - 1],
        };
      }
      
      exec() {}
      close() {
        this.prepare = () => { throw new Error('DB closed'); };
      }
    }
  };
});

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('sqlite output logs to database and verifyChain works', () => {
    const dbPath = ':memory:';
    const sqliteLogger = new AuditLogger({ output: 'sqlite', sqlitePath: dbPath, hmacSecret: 'test-secret' });
    
    sqliteLogger.log({
      type: AuditEventType.REQUEST_START,
      requestId: 'r1',
      userId: 'u1',
      promptHash: 'abc',
      permissions: [],
      locale: 'en',
    });

    sqliteLogger.log({
      type: AuditEventType.REQUEST_COMPLETE,
      requestId: 'r1',
      userId: 'u1',
      success: true,
      durationMs: 100,
    });

    const verification = sqliteLogger.verifyChain();
    if (!verification.valid) console.log('Verification failed:', verification);
    expect(verification.valid).toBe(true);
  });

  it('sqlite verifyChain detects tampering', () => {
    const dbPath = ':memory:';
    const sqliteLogger = new AuditLogger({ output: 'sqlite', sqlitePath: dbPath, hmacSecret: 'test-secret' });
    
    sqliteLogger.log({
      type: AuditEventType.REQUEST_START,
      requestId: 'r1',
      userId: 'u1',
      promptHash: 'abc',
      permissions: [],
      locale: 'en',
    });

    sqliteLogger.log({
      type: AuditEventType.REQUEST_COMPLETE,
      requestId: 'r1',
      userId: 'u1',
      success: true,
      durationMs: 100,
    });

    // Tamper with the database
    // @ts-expect-error accessing private db
    sqliteLogger.db.prepare("UPDATE audit_log SET event_json = 'tampered' WHERE id = 1").run();

    const verification = sqliteLogger.verifyChain();
    expect(verification.valid).toBe(false);
    expect(verification.reason).toBe('Hash mismatch');
  });

  it('sqlite verifyChain detects broken chain', () => {
    const dbPath = ':memory:';
    const sqliteLogger = new AuditLogger({ output: 'sqlite', sqlitePath: dbPath, hmacSecret: 'test-secret' });
    
    sqliteLogger.log({
      type: AuditEventType.REQUEST_START,
      requestId: 'r1',
      userId: 'u1',
      promptHash: 'abc',
      permissions: [],
      locale: 'en',
    });

    sqliteLogger.log({
      type: AuditEventType.REQUEST_COMPLETE,
      requestId: 'r1',
      userId: 'u1',
      success: true,
      durationMs: 100,
    });

    // Tamper with the chain link
    // @ts-expect-error accessing private db
    sqliteLogger.db.prepare("UPDATE audit_log SET prev_hash = 'tampered' WHERE id = 2").run();

    const verification = sqliteLogger.verifyChain();
    expect(verification.valid).toBe(false);
    expect(verification.reason).toBe('Chain link broken');
  });

  it('sqlite initialization fails gracefully', () => {
    // A bad path that sqlite cannot open
    const sqliteLogger = new AuditLogger({ output: 'sqlite', sqlitePath: '/invalid/path/that/does/not/exist/db.sqlite' });
    // Should fallback to console
    // @ts-expect-error private field
    expect(sqliteLogger.output).toBe('console');
  });

  it('sqlite log fails gracefully if db throws', () => {
    const sqliteLogger = new AuditLogger({ output: 'sqlite', sqlitePath: ':memory:', hmacSecret: 'test-secret' });
    
    // Break the db
    // @ts-expect-error private field
    sqliteLogger.db.close();

    // Should not throw, should fallback to printing to console
    sqliteLogger.log({
      type: AuditEventType.REQUEST_START,
      requestId: 'r1',
      userId: 'u1',
      promptHash: 'abc',
      permissions: [],
      locale: 'en',
    });
  });

  it('verifyChain returns false if not sqlite', () => {
    const memoryLogger = new AuditLogger({ output: 'memory' });
    expect(memoryLogger.verifyChain().valid).toBe(false);
  });
});
