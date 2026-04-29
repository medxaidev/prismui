/**
 * Stage-11 · L0 Overlay Foundation · Dismissal · priority dedup (sync)
 *
 * Contract: `@/devdocs/system/dismissal-primitive.md` v0.1.2 §三.二
 *
 * v0.1.1 replaced the original `queueMicrotask(flush)` design with a
 * synchronous ref-based dedup (avoids React 18 batch / `useSyncExternalStore`
 * consistency hazards). v0.1.2 keeps the implementation but renames the
 * filename from `priorityQueue.ts` to `priorityDedup.ts` so the name reflects
 * the actual model (no queue / no async flush).
 *
 * The dedup is strictly per-hook: two `useDismissal` instances do NOT share a
 * dedup window — they each own a `lastDismissRef`.
 */

import type { DismissalReason } from '../types';

/** Lower number = higher priority · §三.二 table. */
export const PRIORITY: Readonly<Record<DismissalReason, number>> = {
  'programmatic-close': 1,
  'escape-key': 2,
  'pointer-outside': 3,
  'focus-outside': 4,
  'scroll-outside': 5,
};

/** Per-hook latch · re-created via `useRef`. */
export interface DismissDedupRef {
  /** Last dispatch timestamp from `performance.now()` · `0` = unset. */
  tick: number;
  /** Priority of the last dispatched reason · `Infinity` = unset. */
  priority: number;
}

/** Initial value used by `useRef`. */
export function createDedupRef(): DismissDedupRef {
  return { tick: 0, priority: Number.POSITIVE_INFINITY };
}

/**
 * Same-tick window in ms. `performance.now()` resolution is typically 0.005-1ms
 * on modern engines · 1ms is a safe upper bound that bridges multi-channel
 * native dispatches in the same synchronous event round.
 *
 * Phase 3 verification item (ADR-003): confirm robustness on low-end devices.
 */
const SAME_TICK_WINDOW_MS = 1;

/**
 * Decide whether the incoming dispatch should proceed under the dedup latch.
 * Pure function over `(latch, reason)` — caller mutates `latch` based on the
 * decision and the actual `onDismiss` return value (cancel resets the latch).
 */
export interface DedupDecision {
  /** When `false`, drop the dispatch silently (lower-or-equal priority). */
  proceed: boolean;
  /** New priority value when `proceed === true`. */
  priority: number;
  /** New tick timestamp when `proceed === true`. */
  tick: number;
}

export function decideDispatch(
  latch: DismissDedupRef,
  reason: DismissalReason,
): DedupDecision {
  const tick = performance.now();
  const priority = PRIORITY[reason];

  if (tick - latch.tick < SAME_TICK_WINDOW_MS) {
    if (priority >= latch.priority) {
      return { proceed: false, priority: latch.priority, tick: latch.tick };
    }
  }
  return { proceed: true, priority, tick };
}

/**
 * Reset the latch — called when consumer cancels via `return false` so a
 * subsequent same-tick event can still trigger.
 */
export function resetDedup(latch: DismissDedupRef): void {
  latch.tick = 0;
  latch.priority = Number.POSITIVE_INFINITY;
}
