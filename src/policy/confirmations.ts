import { randomUUID } from 'node:crypto';

export interface PendingConfirmation<T> {
  token: string;
  summary: string;
  expiresAt: number;
  execute: () => Promise<T>;
}

export class ConfirmationStore<T> {
  private pending = new Map<string, PendingConfirmation<T>>();

  constructor(private ttlMs = 5 * 60 * 1000, private maxEntries = 50) {}

  create(summary: string, execute: () => Promise<T>): PendingConfirmation<T> {
    this.cleanup();
    if (this.pending.size >= this.maxEntries) {
      const oldest = this.pending.keys().next().value;
      if (oldest) {
        this.pending.delete(oldest);
      }
    }

    const token = randomUUID();
    const expiresAt = Date.now() + this.ttlMs;
    const entry: PendingConfirmation<T> = { token, summary, expiresAt, execute };
    this.pending.set(token, entry);
    return entry;
  }

  consume(token: string): PendingConfirmation<T> | null {
    const entry = this.pending.get(token);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.pending.delete(token);
      return null;
    }

    this.pending.delete(token);
    return entry;
  }

  clear(): void {
    this.pending.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [token, entry] of this.pending.entries()) {
      if (entry.expiresAt < now) {
        this.pending.delete(token);
      }
    }
  }
}
