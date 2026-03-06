// ---------------------------------------------------------------------------
// AuditTrail — Immutable event log with prevState/nextState snapshots
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { AuditEntry, AuditFilter } from './types';

/**
 * Immutable audit log for tracking event processing.
 */
export interface AuditTrail {
  /** Record an audit entry. id and timestamp are auto-generated. */
  record(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void;

  /** Get entries matching optional filter criteria. */
  getEntries(filter?: AuditFilter): readonly AuditEntry[];

  /** Get a specific entry by id. */
  getEntry(id: string): AuditEntry | undefined;

  /** Get the N most recent entries. */
  getLatest(count: number): readonly AuditEntry[];

  /** Remove all entries. */
  clear(): void;

  /** Serialize all entries to JSON string. */
  export(): string;

  /** Get current entry count. */
  size(): number;
}

export interface AuditTrailOptions {
  /** Maximum number of entries to retain (ring buffer). Default: 1000. */
  maxEntries?: number;
}

let idCounter = 0;

function generateId(): string {
  return `audit-${++idCounter}-${Date.now()}`;
}

/**
 * Create an AuditTrail instance.
 *
 * - Entries are immutable once recorded.
 * - Uses ring buffer with configurable maxEntries.
 * - export() produces JSON array of all entries.
 */
export function createAuditTrail(options?: AuditTrailOptions): AuditTrail {
  const maxEntries = options?.maxEntries ?? 1000;
  const entries: AuditEntry[] = [];

  const trail: AuditTrail = {
    record(partial) {
      const entry: AuditEntry = {
        id: generateId(),
        timestamp: Date.now(),
        event: partial.event,
        prevState: partial.prevState,
        nextState: partial.nextState,
        ...(partial.error !== undefined ? { error: partial.error } : {}),
        ...(partial.policyResult !== undefined ? { policyResult: partial.policyResult } : {}),
      };

      // Freeze entry to enforce immutability
      Object.freeze(entry);

      entries.push(entry);

      // Ring buffer: remove oldest when exceeding max
      while (entries.length > maxEntries) {
        entries.shift();
      }
    },

    getEntries(filter?: AuditFilter): readonly AuditEntry[] {
      if (!filter) return [...entries];

      return entries.filter((entry) => {
        if (filter.eventType && entry.event.type !== filter.eventType) return false;
        if (filter.since !== undefined && entry.timestamp < filter.since) return false;
        if (filter.until !== undefined && entry.timestamp > filter.until) return false;
        return true;
      });
    },

    getEntry(id: string): AuditEntry | undefined {
      return entries.find((e) => e.id === id);
    },

    getLatest(count: number): readonly AuditEntry[] {
      return entries.slice(-count);
    },

    clear(): void {
      entries.length = 0;
    },

    export(): string {
      return JSON.stringify(entries);
    },

    size(): number {
      return entries.length;
    },
  };

  return trail;
}
