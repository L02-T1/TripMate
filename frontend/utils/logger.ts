/**
 * TripMate Logger
 * Structured logging with levels: action, info, warn, error, debug
 */

type LogLevel = 'info' | 'warn' | 'error' | 'action' | 'debug';

interface LogEntry {
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
  timestamp: string;
}

const recentLogs: LogEntry[] = [];
const MAX_LOG_HISTORY = 200;

function addToHistory(entry: LogEntry) {
  recentLogs.push(entry);
  if (recentLogs.length > MAX_LOG_HISTORY) recentLogs.shift();
}

const EMOJIS: Record<LogLevel, string> = {
  info:   '✅',
  warn:   '⚠️ ',
  error:  '❌',
  action: '🔵',
  debug:  '🔍',
};

function log(level: LogLevel, tag: string, message: string, data?: any) {
  const entry: LogEntry = {
    level, tag, message, data,
    timestamp: new Date().toISOString(),
  };
  addToHistory(entry);

  const msg = `${EMOJIS[level]} [${tag}] ${message}`;
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

export function logAction(tag: string, message: string, data?: any): void {
  log('action', tag, message, data);
}

export function logError(tag: string, message: string, err?: any): void {
  const errMsg =
    err instanceof Error ? err.message :
    typeof err === 'string' ? err :
    err ? JSON.stringify(err) : '';
  log('error', tag, `${message}${errMsg ? ` — ${errMsg}` : ''}`, err);
}

export function logWarn(tag: string, message: string, data?: any): void {
  log('warn', tag, message, data);
}

export function logInfo(tag: string, message: string, data?: any): void {
  log('info', tag, message, data);
}

export function logDebug(tag: string, message: string, data?: any): void {
  log('debug', tag, message, data);
}

export function validateAndLog(
  condition: boolean,
  tag: string,
  errorMessage: string,
  data?: any,
): boolean {
  if (!condition) {
    logWarn(tag, `Validation failed: ${errorMessage}`, data);
    return false;
  }
  return true;
}

export function getRecentLogs(): LogEntry[] {
  return [...recentLogs];
}

export function clearLogs(): void {
  recentLogs.length = 0;
}

export default {
  logAction,
  logError,
  logWarn,
  logInfo,
  logDebug,
  validateAndLog,
  getRecentLogs,
  clearLogs,
};