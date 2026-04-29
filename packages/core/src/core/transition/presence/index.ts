/**
 * Stage-12 · L0 Transition Foundation · Presence primitive · public barrel
 *
 * Contract: `@/devdocs/system/presence-primitive.md` v0.3 §二（6 exports · public surface aligned byte-level）
 *
 * Public surface:
 *   · `Presence` (component · asChild slot · OQ-PR-1a Decision B)
 *   · `usePresence` (hook · core state machine driver)
 *   · `PresenceContext` (optional Provider · OQ-PR-1b A escape route)
 *   · 3 types
 *
 * Internal-only modules under `_internal/` are NOT re-exported.
 */

export { Presence } from './Presence';
export { usePresence } from './usePresence';
export { PresenceContext } from './presence-context';

export type {
  PresenceState,
  PresenceProps,
  UsePresenceOptions,
  UsePresenceResult,
} from './types';
