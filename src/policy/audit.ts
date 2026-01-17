import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import type { AuditEvent, PolicyConfig, SelectorLogMode } from './types.js';

export class AuditLogger {
  constructor(private config: PolicyConfig) {}

  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const serialized: AuditEvent = {
      id,
      timestamp,
      ...event,
      url: event.url ? redactUrl(event.url) : undefined,
      selector: event.selector ? redactSelector(event.selector, this.config.selectorLogMode) : undefined,
    };

    await ensureDirectory(this.config.auditLogPath);
    await appendFile(this.config.auditLogPath, `${JSON.stringify(serialized)}\n`, 'utf8');

    return id;
  }
}

function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function redactSelector(selector: string, mode: SelectorLogMode): string {
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

async function ensureDirectory(filePath: string): Promise<void> {
  const directory = dirname(filePath);
  await mkdir(directory, { recursive: true });
}
