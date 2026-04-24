/**
 * Stage-10 · L2 Interaction Events · Type Contracts
 *
 * Source of truth: `@/devdocs/system/interaction-events.md` v0.2
 *   · §2.3 InputStreamEvent
 *   · §3.1 PressEvent
 *   · §4 FSM four states
 *   · §8.1 UsePressOptions / UsePressResult
 *   · §8.2 PressState reducer state
 *
 * Invariant anchors:
 *   · IE-CORE-1 · Pure-function reducer (no DOM read, no performance.now, no RAF)
 *   · IE-CORE-2 · Geometry contract (border-box, transform-agnostic)
 *   · IE-CORE-3 · pressup XOR presscancel + pressup precedes pressend
 *   · IE-CORE-4 · FSM four states (idle/active/suspended/terminated)
 */

import type { PointerEventHandler, KeyboardEventHandler, FocusEventHandler } from 'react';

// ─────────────────────────────────────────────────────────────────────
// Pointer / modifier primitives
// ─────────────────────────────────────────────────────────────────────

/** v0.8 Round 1: `'virtual'` covers screen-reader / assistive-tool clicks (`element.click()`). */
export type PointerType = 'mouse' | 'touch' | 'pen' | 'keyboard' | 'virtual';

export interface PressModifiers {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

// ─────────────────────────────────────────────────────────────────────
// L1 → L2 normalized input (interaction-events.md §2.3)
// ─────────────────────────────────────────────────────────────────────

/**
 * 5-6 core kinds (IE-CORE-1 v0.7 downgrade) + 4 boundary kinds for failure paths.
 *
 *   core:     pointerdown / pointerup / pointerenter / pointerleave / keydown / keyup
 *   boundary: pointercancel / blur / disabled-flip (semantic) / unmount (lifecycle)
 */
export type InputStreamEventKind =
  | 'pointerdown'
  | 'pointerup'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointercancel'
  | 'keydown'
  | 'keyup'
  | 'blur'
  | 'disabled-flip'
  | 'unmount';

export interface InputStreamEvent {
  kind: InputStreamEventKind;

  /** pointer events only */
  pointerId?: number;

  /** pointer / keyboard / virtual */
  pointerType?: PointerType;

  /** keydown/keyup only (e.g. `'Enter'` / `' '`) */
  key?: string;

  /**
   * Reducer-consumable timestamp · **must** come from caller (usually `performance.now()`).
   * The reducer NEVER calls `performance.now()` itself (IE-CORE-1 purity).
   */
  timestamp: number;

  /** pressTarget (normalized · IE-CORE-2 rule 1) */
  target?: Element;

  /** raw pointer coordinates (viewport space) · reducer normalizes to border-box */
  clientX?: number;
  clientY?: number;

  /** for original-target / composedPath reconstruction */
  originalTarget?: Element;
  path?: readonly Element[];

  /** pressTarget border-box rect (reducer-provided via upstream DOM read · IE-CORE-2) */
  targetRect?: { width: number; height: number; left: number; top: number };

  modifiers?: PressModifiers;
}

// ─────────────────────────────────────────────────────────────────────
// L2 → L3/L4 output event (interaction-events.md §3.1)
// ─────────────────────────────────────────────────────────────────────

export type PressEventType = 'pressstart' | 'pressup' | 'pressend' | 'presscancel';

export interface PressEvent {
  type: PressEventType;
  pointerType: PointerType;
  pointerId: number;

  /** pressTarget (IE-CORE-2 rule 1 · stable host · NOT event.target) */
  target: Element;

  /** raw `event.target` (delegation / portal / shadow-DOM debug · v0.2 field) */
  originalTarget: Element;

  /** `event.composedPath()` snapshot (closed shadow root auto-truncated · OQ-IE-3) */
  path: readonly Element[];

  /** border-box coordinates (IE-CORE-2 rule 2-4 · OQ-IE-5 transform-agnostic) */
  x: number;
  y: number;

  /** pressTarget border-box size (L4 ripple radius / visual params) */
  width: number;
  height: number;

  /**
   * `performance.now()` from the source InputStreamEvent.
   * IE-CORE-1 purity: reducer forwards, never generates.
   */
  timestamp: number;

  modifiers: PressModifiers;
}

// ─────────────────────────────────────────────────────────────────────
// FSM state (interaction-events.md §8.2)
// ─────────────────────────────────────────────────────────────────────

interface ActivePressData {
  pointerId: number;
  pointerType: PointerType;
  pressTarget: Element;
  startTimestamp: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startPath: readonly Element[];
  startOriginalTarget: Element;
  modifiers: PressModifiers;
}

export type PressState =
  | { kind: 'idle' }
  | ({ kind: 'active' } & ActivePressData)
  | ({ kind: 'suspended' } & ActivePressData)
  | { kind: 'terminated' };

export interface PressReducerOutput {
  state: PressState;
  events: PressEvent[];
}

// ─────────────────────────────────────────────────────────────────────
// Public hook API (interaction-events.md §8.1)
// ─────────────────────────────────────────────────────────────────────

export interface UsePressOptions {
  /** Emitted on `pressstart` (entering `active` from `idle`). */
  onPressStart?: (event: PressEvent) => void;

  /** Emitted on `pressup` (success path only). Precedes `pressend` (IE-CORE-3). */
  onPressUp?: (event: PressEvent) => void;

  /** Emitted on `pressend` (success path only · L4 ripple release anchor). */
  onPressEnd?: (event: PressEvent) => void;

  /** Emitted on `presscancel` (failure path only · L4 ripple cancel anchor). */
  onPressCancel?: (event: PressEvent) => void;

  /**
   * Pre-resolved gating boolean · R-1 contract.
   *
   * 🔴 **Single source of truth** (v0.8 API honest-ification):
   * ```ts
   * const isInteractiveDisabled = resolveInteractive(
   *   { disabled, loading, readOnly? },
   *   'action' | 'control' | 'disabled',
   * );
   * ```
   * See `@/packages/core/src/core/state/state-data-attrs.ts:38`.
   *
   * `usePress` does NOT re-derive gating semantics · pass the pre-resolved boolean.
   *
   * - `undefined` → DEV `console.warn` · treated as `false`
   * - `true` → `pointerdown` / `keydown` ignored (no `pressstart`)
   * - Flip `false → true` while active → synchronous `presscancel` (C-2)
   */
  isInteractiveDisabled?: boolean;

  // ─── ADR-002 escalation slots (locked in v0.8 · reserved comments only) ──
  //
  // /** OQ-IE-1 · suspended timeout · default undefined (no timeout) */
  // suspendedTimeout?: number;
  //
  // /** OQ-IE-2 · blur-while-Space-held · default 'failure' */
  // blurDuringSpaceHeld?: 'success' | 'failure';
  //
  // /** OQ-IE-5 · transform-aware inverse · default false (border-box) */
  // transformAware?: boolean;
}

export interface UsePressPropsBinding {
  onPointerDown?: PointerEventHandler;
  onPointerUp?: PointerEventHandler;
  onPointerEnter?: PointerEventHandler;
  onPointerLeave?: PointerEventHandler;
  onPointerCancel?: PointerEventHandler;
  onKeyDown?: KeyboardEventHandler;
  onKeyUp?: KeyboardEventHandler;
  onBlur?: FocusEventHandler;
}

export interface UsePressResult {
  /** Spread onto the pressTarget element. */
  pressProps: UsePressPropsBinding;

  /** `true` whenever any pointerId is in `active` state (for `data-pressed` / visual cues). */
  isPressed: boolean;
}
