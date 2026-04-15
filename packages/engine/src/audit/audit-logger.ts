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
}

export interface RequestStartEvent extends BaseAuditEvent {
  type: AuditEventType.REQUEST_START;
  promptHash: string;
  permissions: string[];
  locale: string;
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
  output?: 'console' | 'memory' | 'file';
  filePath?: string;
}

export class AuditLogger {
  private output: 'console' | 'memory' | 'file';
  private filePath?: string;
  private events: AuditEvent[] = [];
  private static instance?: AuditLogger;

  constructor(options: AuditLoggerOptions = {}) {
    this.output = options.output ?? 'console';
    this.filePath = options.filePath;
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger({
        output: (process.env.AUDIT_LOG_OUTPUT as AuditLoggerOptions['output']) ?? 'console',
        filePath: process.env.AUDIT_LOG_FILE,
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

    if (this.output === 'console') {
      process.stdout.write(`[AUDIT] ${line}\n`);
      this.events.push(stamped);
    } else if (this.output === 'file' && this.filePath) {
      const fp = this.filePath;
      import('fs').then(fs => {
        fs.appendFileSync(fp, line + '\n', 'utf-8');
      }).catch(() => {
        process.stdout.write(`[AUDIT] ${line}\n`);
      });
      this.events.push(stamped);
    }
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
