/**
 * Stage-11 · L0 Overlay Foundation · Dismissal primitive · public barrel
 *
 * Contract: `@/devdocs/system/dismissal-primitive.md` v0.1.2 §二
 *
 * Public surface:
 *   · `useDismissal` (hook)
 *   · `DismissalStack` (read-only stack controller)
 *   · `__resetDismissalStack` (test-only · same convention as
 *      `__resetFloatingZIndexWarn` / `__resetPressInvariantWarnings`)
 *   · 5 types
 *
 * Internal-only modules under `_internal/` are NOT re-exported.
 */

export { useDismissal } from './useDismissal';
export { DismissalStack, __resetDismissalStack } from './DismissalStack';

export type {
  UseDismissalOptions,
  UseDismissalResult,
  DismissalReason,
  PointerOutsideOptions,
  DismissalStackEntry,
} from './types';
