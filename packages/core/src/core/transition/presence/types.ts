/**
 * Stage-12 · L0 Transition Foundation · Presence · public types
 *
 * Contract: `@/devdocs/system/presence-primitive.md` v0.1 §2.1
 *
 * Public surface (3 types):
 *   · PresenceState
 *   · UsePresenceOptions / UsePresenceResult
 *   · PresenceProps
 */

import type { ReactElement, RefObject } from 'react';

/**
 * Four-state machine (TR-PRES-1) — industry-aligned 4-state model where
 * `closed` subsumes the historical 5th `unmounted` state.
 *
 * Legal transitions (6) — see presence-primitive.md §3.1:
 *   closed   → entering  (open prop: false→true)
 *   entering → open      (animation end signal)
 *   open     → exiting   (open prop: true→false)
 *   exiting  → closed    (animation end signal)
 *   entering → exiting   (reverse · open flips false during entering)
 *   exiting  → entering  (reverse · open flips true during exiting)
 */
export type PresenceState = 'closed' | 'entering' | 'open' | 'exiting';

export interface UsePresenceOptions {
  /**
   * Controlled `open` prop driving the state machine.
   *  - true  → drive into `entering` then `open`
   *  - false → drive into `exiting` then `closed`
   */
  open: boolean;

  /**
   * Animated root element ref. Presence reads `getComputedStyle` on this node
   * (TR-PRES-3 layer 1) and attaches `transitionend` / `animationend`
   * listeners (TR-PRES-3 layer 2).
   *
   * P1: when `current` is null (pre-mount / test boundary) the safe default
   * treats duration as 0 and skips to terminal state — matching useDismissal's
   * conservative default.
   */
  nodeRef: RefObject<Element | null>;

  /**
   * Force-mount escape hatch (OQ-PR-4 Decision 7 · Phase 1 startup leftover #1
   * locked to the Radix-aligned name `forceMount` per user pre-Phase-1 sign-off).
   *
   *  - false (default) — `closed` state returns null; SSR closed-only
   *  - true            — children rendered in every state including SSR
   */
  forceMount?: boolean;
}

export interface UsePresenceResult {
  /** Current state — re-rendered on every transition (TR-PROTO-1). */
  state: PresenceState;

  /**
   * Final render decision (TR-PRES-2):
   *   shouldRender = state !== 'closed' || forceMount === true
   *
   * Consumers should branch their JSX on this flag.
   */
  shouldRender: boolean;
}

export interface PresenceProps {
  /** Drives the state machine — see `UsePresenceOptions.open`. */
  open: boolean;

  /** Force-mount escape hatch — see `UsePresenceOptions.forceMount`. */
  forceMount?: boolean;

  /**
   * Single ReactElement child (OQ-PR-1a Decision B · asChild slot mode).
   *
   * `<Presence>` does NOT render an extra wrapper. Internally it uses a tiny
   * Slot (see `_internal/Slot.tsx`) to merge `data-state` + a forwarded ref
   * into the child's root element.
   *
   * Forbidden in v1 (will warn in DEV):
   *   · function children (OQ-PR-1b Decision A — no render-prop escape hatch)
   *   · array / fragment children (multi-child not supported)
   *   · null / text / boolean children (must be a ReactElement)
   */
  children: ReactElement;
}
