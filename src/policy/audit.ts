import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AuditEvent, PolicyConfig } from './types.js';
import { redactAuditEvent } from './redaction.js';

export class AuditLogger {
  constructor(private config: PolicyConfig) {}

  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const sanitized = redactAuditEvent(event, this.config.selectorLogMode);
    const serialized: AuditEvent = {
      id,
      timestamp,
      ...sanitized,
    };

    await ensureDirectory(this.config.auditLogPath);
    await appendFile(this.config.auditLogPath, `${JSON.stringify(serialized)}\n`, 'utf8');

    return id;
  }
}

async function ensureDirectory(filePath: string): Promise<void> {
  const directory = dirname(filePath);
  await mkdir(directory, { recursive: true });
}
