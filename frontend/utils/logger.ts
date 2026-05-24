/**
 * TripMate Logger
 * Provides structured logging with levels: info, warn, error, action
 * In development, logs to console with colors. In production, suppresses debug logs.
 */

const isDev = __DEV__;

type LogLevel = 'info' | 'warn' | 'error' | 'action' | 'debug';

interface LogEntry {
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
  timestamp: string;
}

// In-memory recent logs (last 200) for debugging
const recentLogs: LogEntry[] = [];
const MAX_LOG_HISTORY = 200;

function addToHistory(entry: LogEntry) {
  recentLogs.push(entry);
  if (recentLogs.length > MAX_LOG_HISTORY) recentLogs.shift();
}

const EMOJIS: Record<LogLevel, string> = {
  info:   '✅',
  warn:   '⚠️',
  error:  '❌',
  action: '🔵',
  debug:  '🔍',
};

function log(level: LogLevel, tag: string, message: string, data?: any) {
  const entry: LogEntry = {
    level,
    tag,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  addToHistory(entry);

  if (!isDev && level === 'debug') return; // suppress debug in prod

  const prefix = `${EMOJIS[level]} [${tag}]`;
  const msg = `${prefix} ${message}`;

  switch (level) {
    case 'error':
      data !== undefined ? console.error(msg, data) : console.error(msg);
      break;
    case 'warn':
      data !== undefined ? console.warn(msg, data) : console.warn(msg);
      break;
    default:
      data !== undefined ? console.log(msg, data) : console.log(msg);
  }
}

// ─── Action log: user-initiated events ───────────────────────────────────────

export function logAction(tag: string, message: string, data?: any) {
  log('action', tag, message, data);
}

// ─── Validation / flow errors ─────────────────────────────────────────────────

export function logError(tag: string, message: string, err?: any) {
  const errMsg = err instanceof Error
    ? err.message
    : typeof err === 'string' ? err : JSON.stringify(err);
  log('error', tag, `${message}${errMsg ? ` — ${errMsg}` : ''}`, err);
}

export function logWarn(tag: string, message: string, data?: any) {
  log('warn', tag, message, data);
}

export function logInfo(tag: string, message: string, data?: any) {
  log('info', tag, message, data);
}

export function logDebug(tag: string, message: string, data?: any) {
  log('debug', tag, message, data);
}

// ─── Validation helper: logs & returns false if invalid ──────────────────────

export function validateAndLog(
  condition: boolean,
  tag: string,
  errorMessage: string,
  data?: any
): boolean {
  if (!condition) {
    logWarn(tag, `Validation failed: ${errorMessage}`, data);
    return false;
  }
  return true;
}

// ─── Get recent logs (for crash reporting, debug screens, etc.) ──────────────

export function getRecentLogs(): LogEntry[] {
  return [...recentLogs];
}

export function clearLogs() {
  recentLogs.length = 0;
}

const logger = { logAction, logError, logWarn, logInfo, logDebug, validateAndLog, getRecentLogs, clearLogs };
export default logger;
