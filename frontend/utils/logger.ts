/**
 * TripMate Logger — chi tiết lỗi đầy đủ, persist trong app
 */

type LogLevel = 'info' | 'warn' | 'error' | 'action' | 'debug';

export interface LogEntry {
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
  timestamp: string;
  // Extra fields for errors
  stack?: string;
  statusCode?: number;
  url?: string;
}

const recentLogs: LogEntry[] = [];
const MAX_LOG_HISTORY = 500;

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

/**
 * Trích xuất thông tin chi tiết từ bất kỳ loại error nào
 */
export function extractError(err: any): {
  message: string;
  stack?: string;
  statusCode?: number;
  url?: string;
  detail?: string;
} {
  if (!err) return { message: 'Unknown error' };

  // Network error (fetch failed)
  if (err instanceof TypeError && err.message === 'Network request failed') {
    return { message: 'Không có kết nối mạng — kiểm tra WiFi/4G' };
  }
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return { message: 'Không thể kết nối server — kiểm tra kết nối mạng' };
  }

  // API error (from api.ts: err.status + err.data)
  if (err.status && err.data) {
    const apiMsg = err.data?.error || err.data?.message || err.message || `HTTP ${err.status}`;
    const detail = err.data?.details
      ? (Array.isArray(err.data.details)
          ? err.data.details.map((d: any) => d.msg || d.message || d).join(', ')
          : String(err.data.details))
      : undefined;
    return {
      message: apiMsg,
      statusCode: err.status,
      url: err.url,
      detail,
      stack: err.stack,
    };
  }

  // Standard Error
  if (err instanceof Error) {
    return {
      message: err.message || err.name || 'Lỗi không xác định',
      stack: err.stack,
    };
  }

  // String error
  if (typeof err === 'string') return { message: err };

  // Object with message
  if (err.message) return { message: err.message, stack: err.stack };

  return { message: JSON.stringify(err) };
}

/**
 * Format error thành chuỗi thân thiện để hiện Alert
 */
export function formatErrorForAlert(err: any, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string {
  const { message, statusCode, detail } = extractError(err);
  if (!message || message === 'Unknown error') return fallback;

  let msg = message;
  if (detail) msg += `\n\nChi tiết: ${detail}`;
  if (statusCode) msg += `\n(Mã lỗi: ${statusCode})`;
  return msg;
}

function log(level: LogLevel, tag: string, message: string, err?: any) {
  const extracted = err !== undefined ? extractError(err) : null;

  const entry: LogEntry = {
    level,
    tag,
    message: extracted ? `${message} — ${extracted.message}` : message,
    data: err,
    timestamp: new Date().toISOString(),
    stack: extracted?.stack,
    statusCode: extracted?.statusCode,
    url: extracted?.url,
  };
  addToHistory(entry);

  const prefix = `${EMOJIS[level]} [${tag}] ${message}`;
  switch (level) {
    case 'error':
      if (extracted) {
        console.error(prefix);
        console.error('  message :', extracted.message);
        if (extracted.statusCode) console.error('  status  :', extracted.statusCode);
        if (extracted.url)        console.error('  url     :', extracted.url);
        if (extracted.detail)     console.error('  detail  :', extracted.detail);
        if (extracted.stack)      console.error('  stack   :', extracted.stack);
      } else {
        console.error(prefix);
      }
      break;
    case 'warn':
      err !== undefined ? console.warn(prefix, err) : console.warn(prefix);
      break;
    default:
      err !== undefined ? console.log(prefix, err) : console.log(prefix);
  }
}

export function logAction(tag: string, message: string, data?: any): void {
  const entry: LogEntry = { level: 'action', tag, message, data, timestamp: new Date().toISOString() };
  addToHistory(entry);
  data !== undefined ? console.log(`🔵 [${tag}] ${message}`, data) : console.log(`🔵 [${tag}] ${message}`);
}

export function logError(tag: string, message: string, err?: any): void {
  log('error', tag, message, err);
}

export function logWarn(tag: string, message: string, data?: any): void {
  const entry: LogEntry = { level: 'warn', tag, message, data, timestamp: new Date().toISOString() };
  addToHistory(entry);
  data !== undefined ? console.warn(`⚠️  [${tag}] ${message}`, data) : console.warn(`⚠️  [${tag}] ${message}`);
}

export function logInfo(tag: string, message: string, data?: any): void {
  const entry: LogEntry = { level: 'info', tag, message, data, timestamp: new Date().toISOString() };
  addToHistory(entry);
  data !== undefined ? console.log(`✅ [${tag}] ${message}`, data) : console.log(`✅ [${tag}] ${message}`);
}

export function logDebug(tag: string, message: string, data?: any): void {
  if (__DEV__) {
    const entry: LogEntry = { level: 'debug', tag, message, data, timestamp: new Date().toISOString() };
    addToHistory(entry);
    data !== undefined ? console.log(`🔍 [${tag}] ${message}`, data) : console.log(`🔍 [${tag}] ${message}`);
  }
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

export function getRecentLogs(): LogEntry[] { return [...recentLogs]; }
export function getErrorLogs(): LogEntry[] { return recentLogs.filter(l => l.level === 'error'); }
export function clearLogs(): void { recentLogs.length = 0; }

export default {
  logAction, logError, logWarn, logInfo, logDebug,
  validateAndLog, extractError, formatErrorForAlert,
  getRecentLogs, getErrorLogs, clearLogs,
};