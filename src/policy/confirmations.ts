import { randomUUID } from 'node:crypto';

export interface PendingConfirmation {
  id: string;
  summary: string;
  toolName: string;
  expiresAt: number;
  approved: boolean;
}

export class ConfirmationStore {
  private pending = new Map<string, PendingConfirmation>();

  constructor(private ttlMs = 5 * 60 * 1000, private maxEntries = 50) {}

  create(summary: string, toolName: string): PendingConfirmation {
    this.cleanup();
    if (this.pending.size >= this.maxEntries) {
      const oldest = this.pending.keys().next().value;
      if (oldest) {
        this.pending.delete(oldest);
      }
    }

    const id = randomUUID();
    const expiresAt = Date.now() + this.ttlMs;
    const entry: PendingConfirmation = {
      id,
      summary,
      toolName,
      expiresAt,
      approved: false,
    };
    this.pending.set(id, entry);
    return entry;
  }

  approve(id: string): PendingConfirmation | null {
    const entry = this.getValidEntry(id);
    if (!entry) {
      return null;
    }

    entry.approved = true;
    return entry;
  }

  consumeApproved(id: string, toolName: string): PendingConfirmation | null {
    const entry = this.getValidEntry(id);
    if (!entry || !entry.approved || entry.toolName !== toolName) {
      return null;
    }

    this.pending.delete(id);
    return entry;
  }

  deny(id: string): boolean {
    return this.pending.delete(id);
  }

  clear(): void {
    this.pending.clear();
  }

  private getValidEntry(id: string): PendingConfirmation | null {
    const entry = this.pending.get(id);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.pending.delete(id);
      return null;
    }

    return entry;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, entry] of this.pending.entries()) {
      if (entry.expiresAt < now) {
        this.pending.delete(id);
      }
    }
  }
}
