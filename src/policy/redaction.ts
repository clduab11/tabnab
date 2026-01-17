import { createHash } from 'node:crypto';
import type { AuditEvent, SelectorLogMode } from './types.js';

const SENSITIVE_QUERY_PARAMS = ['token', 'code', 'session', 'auth', 'key'];
const REDACTED = '[REDACTED]';

const SENSITIVE_KEYS = [
  'value',
  'cookie',
  'cookies',
  'authorization',
  'auth',
  'localstorage',
  'sessionstorage',
  'token',
  'code',
  'session',
  'key',
  'password',
];

export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const redactedParams = new URLSearchParams(parsed.search);
    for (const key of redactedParams.keys()) {
      if (isSensitiveKey(key)) {
        redactedParams.set(key, REDACTED);
      }
    }
    const search = redactedParams.toString();
    return `${parsed.origin}${parsed.pathname}${search ? `?${search}` : ''}`;
  } catch {
    return url;
  }
}

export function redactSelector(selector: string, mode: SelectorLogMode): string {
  if (mode === 'plaintext') {
    return selector;
  }

  if (mode === 'hash') {
    return createHash('sha256').update(selector).digest('hex');
  }

  const maxLength = 120;
  if (selector.length <= maxLength) {
    return selector;
  }
  return `${selector.slice(0, maxLength)}…`;
}

export function redactAuditEvent(
  event: Omit<AuditEvent, 'id' | 'timestamp'>,
  selectorLogMode: SelectorLogMode
): Omit<AuditEvent, 'id' | 'timestamp'> {
  return {
    toolName: event.toolName,
    actionType: event.actionType,
    outcome: event.outcome,
    reasonCodes: event.reasonCodes,
    url: event.url ? redactUrl(event.url) : undefined,
    selector: event.selector ? redactSelector(event.selector, selectorLogMode) : undefined,
  };
}

export function redactMetadata(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactMetadata(item));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        result[key] = REDACTED;
      } else if (key.toLowerCase() === 'url' && typeof entry === 'string') {
        result[key] = redactUrl(entry);
      } else {
        result[key] = redactMetadata(entry);
      }
    }
    return result;
  }

  return value;
}

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_QUERY_PARAMS.some((param) => lower.includes(param)) ||
    SENSITIVE_KEYS.some((param) => lower.includes(param));
}
