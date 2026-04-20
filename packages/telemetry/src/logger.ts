import { logs, Logger, LogRecord } from '@opentelemetry/api-logs';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FerroUIAttributes } from './types.js';

const INSTRUMENTATION_NAME = '@ferroui/telemetry';
const INSTRUMENTATION_VERSION = '0.1.0';

/**
 * Returns the FerroUI logger
 */
export function getLogger(): Logger {
  return logs.getLogger(INSTRUMENTATION_NAME, INSTRUMENTATION_VERSION);
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogEventAttributes {
  requestId?: string;
  userId?: string;
  promptHash?: string;
  schemaVersion?: string;
  providerId?: string;
  providerModel?: string;
  latencyMs?: number;
  repairAttempts?: number;
  cacheHit?: boolean;
  componentCount?: number;
  tokenInput?: number;
  tokenOutput?: number;
  [key: string]: any;
}

/**
 * Emits a structured log
 */
export function log(
  level: LogLevel,
  message: string,
  attributes: LogEventAttributes = {}
) {
  const logger = getLogger();
  
  const logRecord: LogRecord = {
    severityText: level.toUpperCase(),
    body: message,
    attributes: {
      service: 'ferroui-engine',
      version: '1.0.0',
      ...attributes
    },
    timestamp: new Date(),
  };

  logger.emit(logRecord);
}

/**
 * Specialized log helpers
 */
export const logger = {
  debug: (msg: string, attr?: LogEventAttributes) => log(LogLevel.DEBUG, msg, attr),
  info: (msg: string, attr?: LogEventAttributes) => log(LogLevel.INFO, msg, attr),
  warn: (msg: string, attr?: LogEventAttributes) => log(LogLevel.WARN, msg, attr),
  error: (msg: string, attr?: LogEventAttributes) => log(LogLevel.ERROR, msg, attr),
  fatal: (msg: string, attr?: LogEventAttributes) => log(LogLevel.FATAL, msg, attr),
};
