/**
 * Stage-11 · L0 Overlay Foundation · Dismissal · DismissalStack
 *
 * Contract: `@/devdocs/system/dismissal-primitive.md` v0.1.2 §四
 *
 * Module-level singleton that tracks every `useDismissal` instance which has
 * opted into either `escapeKey` or `pointerOutside`. Stack ordering
 * = registration ordering (later = top). Implements OV-DISMISS-2: only the
 * top entry receives escape-key / pointer-outside events.
 *
 * P1-2 React 18 Strict Mode dedup: `register` rejects duplicate ids,
 * `unregister` is idempotent. Both guard against the double-invoke effect
 * pattern (`register → register → unregister → unregister`).
 */

import type { DismissalStackEntry } from './types';
import { __resetDismissalListeners } from './_internal/installListeners';

let stack: DismissalStackEntry[] = [];
const subscribers = new Set<() => void>();

function notify(): void {
  // Snapshot to be safe against subscriber re-entry.
  const snapshot = Array.from(subscribers);
  for (const fn of snapshot) fn();
}

/**
 * Register an entry. Idempotent — a second call with the same `id` is a noop
 * (Strict Mode safety).
 *
 * Internal API · used by `useDismissal`. Not part of the public surface.
 */
export function registerDismissalEntry(entry: DismissalStackEntry): void {
  if (stack.some((e) => e.id === entry.id)) return;
  stack = [...stack, entry];
  notify();
}

/**
 * Unregister an entry. No-op when the id is not present (Strict Mode + double
 * cleanup safety).
 */
export function unregisterDismissalEntry(entry: DismissalStackEntry): void {
  const next = stack.filter((e) => e.id !== entry.id);
  if (next.length === stack.length) return;
  stack = next;
  notify();
}

/** Public read-only controller (subset of internals). */
export const DismissalStack = {
  size(): number {
    return stack.length;
  },
  top(): DismissalStackEntry | null {
    return stack.length > 0 ? stack[stack.length - 1] : null;
  },
  indexOf(entry: DismissalStackEntry): number {
    return stack.findIndex((e) => e.id === entry.id);
  },
  subscribe(listener: () => void): () => void {
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
    };
  },
};

/**
 * Test-only reset · clears the stack, drops all subscribers, and tears down
 * every global listener installed via `subscribeChannel`. Mirrors the
 * conventions of `__resetFloatingZIndexWarn` /
 * `__resetPressInvariantWarnings` (test-only export, not part of the public
 * stability guarantee).
 */
export function __resetDismissalStack(): void {
  stack = [];
  subscribers.clear();
  __resetDismissalListeners();
}
