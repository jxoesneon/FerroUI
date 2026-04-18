export enum AuditEventType {
  TOOL_CALL = 'tool_call',
  REQUEST_START = 'request_start',
  REQUEST_COMPLETE = 'request_complete',
  REQUEST_ERROR = 'request_error',
  CIRCUIT_OPEN = 'circuit_open',
  CIRCUIT_RESET = 'circuit_reset',
  RATE_LIMITED = 'rate_limited',
  SESSION_UPDATED = 'session_updated',
}

interface BaseAuditEvent {
  type: AuditEventType;
  requestId: string;
  userId: string;
  timestamp?: string;
}

export interface ToolCallEvent extends BaseAuditEvent {
  type: AuditEventType.TOOL_CALL;
  toolName: string;
  args: Record<string, unknown>;
  success: boolean;
  durationMs: number;
  error?: string;
}

export interface RequestCompleteEvent extends BaseAuditEvent {
  type: AuditEventType.REQUEST_COMPLETE;
  success: boolean;
  durationMs: number;
  repairAttempts?: number;
  cacheHit?: boolean;
  hasSensitiveData?: boolean;
  isSuspicious?: boolean;
  tenantId?: string;
}

export interface RequestStartEvent extends BaseAuditEvent {
  type: AuditEventType.REQUEST_START;
  promptHash: string;
  permissions: string[];
  locale: string;
  tenantId?: string;
  isSuspicious?: boolean;
}

export interface RequestErrorEvent extends BaseAuditEvent {
  type: AuditEventType.REQUEST_ERROR;
  error: string;
  code: string;
}

export interface CircuitEvent extends BaseAuditEvent {
  type: AuditEventType.CIRCUIT_OPEN | AuditEventType.CIRCUIT_RESET;
  consecutiveFailures: number;
}

export interface RateLimitedEvent extends BaseAuditEvent {
  type: AuditEventType.RATE_LIMITED;
  ip: string;
}

export interface SessionUpdatedEvent extends BaseAuditEvent {
  type: AuditEventType.SESSION_UPDATED;
  componentId: string;
  newState: string;
}

export type AuditEvent =
  | ToolCallEvent
  | RequestCompleteEvent
  | RequestStartEvent
  | RequestErrorEvent
  | CircuitEvent
  | RateLimitedEvent
  | SessionUpdatedEvent;

export interface AuditLoggerOptions {
  output?: 'console' | 'memory' | 'file' | 'sqlite';
  filePath?: string;
  sqlitePath?: string;
  hmacSecret?: string;
}

interface SqliteLogRow {
  id: number;
  timestamp: string;
  event_type: string;
  event_json: string;
  prev_hash: string | null;
  entry_hash: string;
}

export class AuditLogger {
  private output: 'console' | 'memory' | 'file' | 'sqlite';
  private filePath?: string;
  private sqlitePath?: string;
  private hmacSecret?: string;
  private events: AuditEvent[] = [];
  private static instance?: AuditLogger;
  private db?: any; // better-sqlite3 Database
  private lastHash: string | null = null;
  private writeCount = 0;
  private readonly ROTATE_AFTER_LINES = 10_000;

  constructor(options: AuditLoggerOptions = {}) {
    this.output = options.output ?? 'console';
    this.filePath = options.filePath;
    this.sqlitePath = options.sqlitePath;
    this.hmacSecret = options.hmacSecret;

    if (this.output === 'sqlite' && this.sqlitePath) {
      this.initSqlite();
    }
  }

  private initSqlite(): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require('better-sqlite3');
      this.db = new Database(this.sqlitePath);
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          event_type TEXT NOT NULL,
          event_json TEXT NOT NULL,
          prev_hash TEXT,
          entry_hash TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
        CREATE INDEX IF NOT EXISTS idx_audit_request ON audit_log(event_type, timestamp);
      `);
      // Load last hash for chain continuity
      const row = this.db.prepare('SELECT entry_hash FROM audit_log ORDER BY id DESC LIMIT 1').get() as SqliteLogRow | undefined;
      this.lastHash = row?.entry_hash ?? null;
    } catch {
      // Fallback to console if SQLite unavailable
      this.output = 'console';
    }
  }

  private computeHmac(data: string): string {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    if (!this.hmacSecret) {
      // Generate ephemeral secret if not provided (production should always provide one)
      this.hmacSecret = process.env.AUDIT_HMAC_SECRET || crypto.randomUUID();
    }
    return crypto.createHmac('sha256', this.hmacSecret).update(data).digest('hex');
  }

  private rotateFileIfNeeded(): void {
    if (!this.filePath) return;
    this.writeCount++;
    if (this.writeCount >= this.ROTATE_AFTER_LINES) {
      const fs = require('fs');
      const path = require('path');
      const ext = path.extname(this.filePath);
      const base = this.filePath.slice(0, -ext.length) || this.filePath;
      const rotated = `${base}.${new Date().toISOString().replace(/[:.]/g, '-')}${ext || '.log'}`;
      try {
        fs.renameSync(this.filePath, rotated);
        this.writeCount = 0;
        this.lastHash = null; // Break chain across rotation (by design)
      } catch {
        // If rotation fails, continue writing to current file
      }
    }
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      const isProd = process.env.NODE_ENV === 'production';
      AuditLogger.instance = new AuditLogger({
        output: (process.env.AUDIT_LOG_OUTPUT as AuditLoggerOptions['output']) ?? (isProd ? 'file' : 'console'),
        filePath: process.env.AUDIT_LOG_FILE || (isProd ? '/var/log/ferroui/audit.log' : undefined),
        sqlitePath: process.env.AUDIT_SQLITE_PATH,
        hmacSecret: process.env.AUDIT_HMAC_SECRET,
      });
    }
    return AuditLogger.instance;
  }

  public static resetInstance(): void {
    AuditLogger.instance = undefined;
  }

  public log(event: AuditEvent): void {
    const stamped: AuditEvent = { ...event, timestamp: new Date().toISOString() };

    if (this.output === 'memory') {
      this.events.push(stamped);
      return;
    }

    const line = JSON.stringify(stamped);
    const prevHash = this.lastHash;
    const entryHash = this.computeHmac(`${prevHash ?? ''}:${line}`);
    this.lastHash = entryHash;

    if (this.output === 'console') {
      process.stdout.write(`[AUDIT] ${line}\n`);
      this.events.push(stamped);
    } else if (this.output === 'file' && this.filePath) {
      this.rotateFileIfNeeded();
      const fs = require('fs');
      const chainLine = JSON.stringify({ ...stamped, _chain: { prev: prevHash, hash: entryHash } });
      try {
        fs.appendFileSync(this.filePath, chainLine + '\n', 'utf-8');
      } catch {
        process.stdout.write(`[AUDIT] ${line}\n`);
      }
      this.events.push(stamped);
    } else if (this.output === 'sqlite' && this.db) {
      try {
        this.db.prepare(
          'INSERT INTO audit_log (timestamp, event_type, event_json, prev_hash, entry_hash) VALUES (?, ?, ?, ?, ?)'
        ).run(stamped.timestamp, stamped.type, line, prevHash, entryHash);
      } catch {
        process.stdout.write(`[AUDIT] ${line}\n`);
      }
      this.events.push(stamped);
    }
  }

  public verifyChain(): { valid: boolean; tamperedAt?: number; reason?: string } {
    if (this.output === 'sqlite' && this.db) {
      const rows = this.db.prepare('SELECT * FROM audit_log ORDER BY id ASC').all() as SqliteLogRow[];
      let prevHash: string | null = null;
      for (const row of rows) {
        const computed = this.computeHmac(`${prevHash ?? ''}:${row.event_json}`);
        if (computed !== row.entry_hash) {
          return { valid: false, tamperedAt: row.id, reason: 'Hash mismatch' };
        }
        if (row.prev_hash !== prevHash) {
          return { valid: false, tamperedAt: row.id, reason: 'Chain link broken' };
        }
        prevHash = row.entry_hash;
      }
      return { valid: true };
    }
    return { valid: false, reason: 'Chain verification only supported for SQLite backend' };
  }

  public getEvents(limit?: number): AuditEvent[] {
    const all = [...this.events];
    return limit ? all.slice(-limit) : all;
  }

  public toJsonLines(): string[] {
    return this.events.map(e => JSON.stringify(e));
  }

  public clear(): void {
    this.events = [];
  }
}

export const auditLogger = AuditLogger.getInstance();
