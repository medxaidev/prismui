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
  /**
   * `true` once a dispatch has opened the current synchronous round. The
   * caller resets it to `false` at the round boundary (via `queueMicrotask`),
   * so the latch tracks "same synchronous event round" WITHOUT relying on a
   * wall-clock window.
   */
  latched: boolean;
  /** Priority of the last dispatched reason · `Infinity` = unset. */
  priority: number;
}

/** Initial value used by `useRef`. */
export function createDedupRef(): DismissDedupRef {
  return { latched: false, priority: Number.POSITIVE_INFINITY };
}

/**
 * Decide whether the incoming dispatch should proceed under the dedup latch.
 *
 * Round model (v0.1.3 · replaces the fragile `performance.now()` 1ms window):
 *   - **First dispatch of a round** (`latched === false`) → proceed and
 *     signal `opensRound` so the caller schedules a microtask reset. This is
 *     load-independent: multiple native listeners firing in the SAME
 *     synchronous event round all observe `latched === true` regardless of
 *     how much wall-clock time the CPU-contended thread burns between them.
 *   - **Same round, strictly higher priority** (lower number) → proceed and
 *     re-latch (mirrors the previous `priority < latch.priority` semantics).
 *   - **Same round, equal-or-lower priority** → drop.
 *
 * The round boundary is a microtask (see caller), which is exactly where a
 * "synchronous event round" ends — a 5ms-gap (post-`await`) dispatch always
 * lands in a fresh round.
 *
 * Pure function over `(latch, reason)` — caller mutates `latch` + schedules
 * the reset based on the decision and the `onDismiss` return value.
 */
export interface DedupDecision {
  /** When `false`, drop the dispatch silently (equal-or-lower priority). */
  proceed: boolean;
  /** New priority value when `proceed === true`. */
  priority: number;
  /** `true` when this dispatch opened a fresh round (caller schedules reset). */
  opensRound: boolean;
}

export function decideDispatch(
  latch: DismissDedupRef,
  reason: DismissalReason,
): DedupDecision {
  const priority = PRIORITY[reason];

  if (!latch.latched) {
    return { proceed: true, priority, opensRound: true };
  }
  if (priority < latch.priority) {
    return { proceed: true, priority, opensRound: false };
  }
  return { proceed: false, priority: latch.priority, opensRound: false };
}

/**
 * Reset the latch — called at the round boundary (microtask) AND when the
 * consumer cancels via `return false` so a subsequent event can still fire.
 */
export function resetDedup(latch: DismissDedupRef): void {
  latch.latched = false;
  latch.priority = Number.POSITIVE_INFINITY;
}
