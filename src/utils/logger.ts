export type LogLevel = 'info' | 'warn' | 'error';

export interface BackendLogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  meta?: Record<string, unknown>;
}

const MAX_LOG_MESSAGE_LENGTH = 1000;

export function sanitizeLogText(input: string): string {
  const redacted = String(input ?? '')
    .replace(/AIza[0-9A-Za-z_-]{16,}/g, '[REDACTED_KEY]')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/(GEMINI_API_KEY\s*[:=]\s*)([^\s,;]+)/gi, '$1[REDACTED_KEY]')
    .replace(/[\r\n]+/g, ' ')
    .trim();

  if (redacted.length <= MAX_LOG_MESSAGE_LENGTH) {
    return redacted;
  }
  return `${redacted.slice(0, MAX_LOG_MESSAGE_LENGTH)}…`;
}

export function sanitizeLogMeta(
  meta?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const entries = Object.entries(meta);
  if (entries.length === 0) return undefined;

  const clean: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    if (typeof value === 'string') {
      clean[key] = sanitizeLogText(value);
    } else if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      clean[key] = value;
    } else if (Array.isArray(value)) {
      clean[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeLogText(item) : item
      );
    } else if (value instanceof Error) {
      clean[key] = sanitizeLogText(value.message);
    } else if (value !== undefined) {
      clean[key] = sanitizeLogText(JSON.stringify(value));
    }
  }
  return Object.keys(clean).length > 0 ? clean : undefined;
}

export function formatLogLine(entry: BackendLogEntry): string {
  const levelTag = entry.level.toUpperCase();
  const categoryTag = sanitizeLogText(entry.category || 'APP');
  const message = sanitizeLogText(entry.message);
  const meta = sanitizeLogMeta(entry.meta);
  const metaSuffix = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${entry.timestamp}] [${levelTag}] [${categoryTag}] ${message}${metaSuffix}`;
}

export function trimLogLines(content: string, maxLines = 1000): string {
  const lines = content.split('\n').filter((line) => line.length > 0);
  if (lines.length <= maxLines) {
    return lines.length > 0 ? `${lines.join('\n')}\n` : '';
  }
  return `${lines.slice(-maxLines).join('\n')}\n`;
}

export function shouldIgnoreClientError(message: string): boolean {
  const text = String(message ?? '');
  return (
    text.includes('WebSocket closed without opened') ||
    text.includes('reduced-motion-disabled') ||
    text.includes('Reduced Motion enabled on your device') ||
    text.includes('ResizeObserver loop')
  );
}
