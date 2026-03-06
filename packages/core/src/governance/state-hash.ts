// ---------------------------------------------------------------------------
// State Hash — deterministic hash for RuntimeState verification
// Zero React, zero DOM, zero browser API imports.
// ---------------------------------------------------------------------------

import type { RuntimeState } from '../store';

/**
 * Compute a deterministic hash string for a RuntimeState object.
 *
 * Uses JSON.stringify with sorted keys to ensure deterministic output,
 * then a simple FNV-1a hash for fast comparison.
 *
 * This is NOT cryptographic — it's for replay verification only.
 */
export function computeStateHash(state: RuntimeState): string {
  const json = stableStringify(state);
  return fnv1aHash(json);
}

/**
 * JSON.stringify with sorted keys for deterministic output.
 */
function stableStringify(obj: unknown): string {
  return JSON.stringify(obj, (_, value) => {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(value).sort()) {
        sorted[key] = value[key];
      }
      return sorted;
    }
    return value;
  });
}

/**
 * FNV-1a 32-bit hash.
 * Fast, non-cryptographic hash with good distribution.
 */
function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime, ensure unsigned 32-bit
  }
  return hash.toString(16).padStart(8, '0');
}
