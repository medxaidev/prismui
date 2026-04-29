/**
 * Stage-11 · L0 Overlay Foundation · Dismissal · public types
 *
 * Contract: `@/devdocs/system/dismissal-primitive.md` v0.1.2 §2.1
 *
 * Public surface (5 types):
 *   · UseDismissalOptions
 *   · UseDismissalResult
 *   · DismissalReason
 *   · PointerOutsideOptions
 *   · DismissalStackEntry
 */

import type { RefObject } from 'react';

/** Five L0 channels — see §三 of the contract. */
export type DismissalReason =
  | 'pointer-outside'
  | 'escape-key'
  | 'focus-outside'
  | 'scroll-outside'
  | 'programmatic-close';

/** PointerType filter values that align with native PointerEvent.pointerType. */
export type DismissalPointerType = 'mouse' | 'touch' | 'pen';

export interface PointerOutsideOptions {
  /**
   * Pointer event trigger phase.
   * - `'pointerdown'` (default · matches Radix `useDismissibleLayer`)
   * - `'click'` (some components prefer the full click cycle)
   */
  trigger?: 'pointerdown' | 'click';

  /**
   * Allow-list of `pointerType` values. `undefined` or empty array = all allowed.
   * Common usage: `['mouse', 'pen']` to filter touch gestures.
   */
  pointerTypes?: ReadonlyArray<DismissalPointerType>;
}

export interface UseDismissalOptions {
  /**
   * Master switch. When `false` the hook is a noop · no DismissalStack
   * registration · no global listeners installed. Default `true`.
   */
  enabled?: boolean;

  /**
   * Overlay root ref — boundary used by pointer-outside / focus-outside.
   *
   * P1-1 conservative default: when `current` is `null` (e.g. before the
   * overlay element is committed), every event is treated as "inside" so the
   * hook does NOT dismiss. Boundary checks activate once the ref is populated.
   */
  overlayRef: RefObject<Element | null>;

  /**
   * Trigger ref · OV-DISMISS-3 self-reflexive exclusion. When provided, events
   * whose target lies within `triggerRef.current` are ignored by both
   * pointer-outside and focus-outside channels.
   */
  triggerRef?: RefObject<Element | null>;

  /**
   * pointer-outside channel opt-in.
   *  - `false` (default) · channel disabled
   *  - `true` · enabled with defaults (`trigger: 'pointerdown'`, all pointerTypes)
   *  - `PointerOutsideOptions` · fine-grained config
   */
  pointerOutside?: boolean | PointerOutsideOptions;

  /** escape-key channel opt-in (default `false`). */
  escapeKey?: boolean;

  /** focus-outside channel opt-in (default `false`). */
  focusOutside?: boolean;

  /** scroll-outside channel opt-in (default `false`). */
  scrollOutside?: boolean;

  /**
   * Dismiss callback · invoked synchronously inside the native listener stack
   * (no microtask / rAF deferral · v0.1.2 §3.1.x).
   *
   * Return `false` to cancel the dismissal (P0-2). Returning `true` / `void` /
   * `undefined` allows the dismissal to proceed.
   *
   * `event` is `null` when the dismissal originates from `close()`
   * (programmatic-close channel).
   */
  onDismiss: (reason: DismissalReason, event: Event | null) => boolean | void;
}

export interface UseDismissalResult {
  /**
   * Programmatic close trigger · always-on channel (OV-DISMISS-1).
   *
   * P0-1: when `enabled: false` this is a no-op. Consumers needing to close
   * after disabling must guard themselves.
   *
   * The reference is stable across renders.
   */
  close: () => void;

  /**
   * Reactive flag — `true` only when this entry is the top of `DismissalStack`.
   * Always `false` when the hook is disabled or has not registered (i.e. when
   * neither `escapeKey` nor `pointerOutside` is enabled).
   */
  isTopOfStack: boolean;
}

/** Public read-only shape of stack entries (for `DismissalStack.top()` etc.). */
export interface DismissalStackEntry {
  /** Unique id per hook instance · stable across renders. */
  readonly id: string;
  /** Snapshot of channels that caused this entry to register. */
  readonly channels: ReadonlyArray<DismissalReason>;
}
