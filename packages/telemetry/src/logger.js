"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
exports.getLogger = getLogger;
exports.log = log;
const api_logs_1 = require("@opentelemetry/api-logs");
const INSTRUMENTATION_NAME = '@alloy/telemetry';
const INSTRUMENTATION_VERSION = '0.1.0';
/**
 * Returns the Alloy UI logger
 */
function getLogger() {
    return api_logs_1.logs.getLogger(INSTRUMENTATION_NAME, INSTRUMENTATION_VERSION);
}
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Emits a structured log
 */
function log(level, message, attributes = {}) {
    const logger = getLogger();
    const logRecord = {
        severityText: level.toUpperCase(),
        body: message,
        attributes: {
            service: 'alloy-engine',
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
exports.logger = {
    debug: (msg, attr) => log(LogLevel.DEBUG, msg, attr),
    info: (msg, attr) => log(LogLevel.INFO, msg, attr),
    warn: (msg, attr) => log(LogLevel.WARN, msg, attr),
    error: (msg, attr) => log(LogLevel.ERROR, msg, attr),
    fatal: (msg, attr) => log(LogLevel.FATAL, msg, attr),
};
