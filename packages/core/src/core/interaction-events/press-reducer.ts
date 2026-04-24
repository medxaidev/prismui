/**
 * Stage-10 · L2 Interaction Events · Pure-function FSM reducer
 *
 * Contract: `@/devdocs/system/interaction-events.md` §4 + §8.2
 *
 * 🔴 IE-CORE-1 purity constraints (enforced by module isolation):
 *   · No DOM read (no `getBoundingClientRect`, `offsetX/Y`, `getComputedStyle`)
 *   · No `performance.now()` / `Date.now()` / `setTimeout`
 *   · No `requestAnimationFrame` / `queueMicrotask`
 *   · No side effects · no console · no external mutable references
 *
 * R-1 Replayability: given an identical `InputStreamEvent[]` sequence, this reducer
 * produces bit-for-bit identical `PressEvent[]` outputs (validated by R-1 test).
 *
 * R-2 DOM independence: reducer reads no DOM state · all geometry comes from
 * caller-provided `input.clientX/Y` + `input.targetRect` (hook layer snaps once
 * per `pointerdown` and threads it through).
 *
 * Inside/outside detection: reducer compares `input.target === state.pressTarget`
 * as an Element reference check (tree-traversal only · no layout flush). Hook
 * layer normalizes `input.target` to the pressTarget when `pressTarget.contains`
 * of the raw DOM target is true.
 */

import type {
  InputStreamEvent,
  PressEvent,
  PressEventType,
  PressReducerOutput,
  PressState,
  PressModifiers,
  PointerType,
} from './types';

const NO_EVENTS: readonly PressEvent[] = Object.freeze([]);
const IDLE_STATE: PressState = Object.freeze({ kind: 'idle' }) as PressState;
const TERMINATED_STATE: PressState = Object.freeze({ kind: 'terminated' }) as PressState;

/** Space / Enter are the only keys that emit press lifecycle (§5.1 L2 host-neutral). */
function isActivationKey(key: string | undefined): boolean {
  return key === ' ' || key === 'Enter';
}

/** Default modifiers when upstream omits the field. */
function normalizeModifiers(mods: PressModifiers | undefined): PressModifiers {
  return mods ?? { ctrl: false, shift: false, alt: false, meta: false };
}

/** Keyboard pointerType is always `'keyboard'`. */
function normalizePointerType(
  pointerType: PointerType | undefined,
  kind: InputStreamEvent['kind'],
): PointerType {
  if (pointerType) return pointerType;
  if (kind === 'keydown' || kind === 'keyup') return 'keyboard';
  return 'mouse';
}

/**
 * Build a `PressEvent` from the current FSM state snapshot + the triggering input.
 *
 * Geometry contract (IE-CORE-2 rule 1-4 · OQ-IE-5):
 *   · `target` = pressTarget (from state · NOT `input.target`)
 *   · `x`/`y` = border-box coords (keyboard → center · pointer → clientX/Y - rect)
 *   · `width`/`height` = pressTarget size snapshotted at pressstart
 *   · `path` / `originalTarget` = pressstart snapshot (replayability stability)
 *   · `timestamp` = forwarded from `input.timestamp` (IE-CORE-1)
 */
function buildPressEvent(
  type: PressEventType,
  active: Extract<PressState, { kind: 'active' } | { kind: 'suspended' }>,
  input: InputStreamEvent,
): PressEvent {
  let x = active.startX;
  let y = active.startY;

  // pointer events use current input coords (when available) · keyboard uses center (rule 3)
  const isKeyboard = input.kind === 'keydown' || input.kind === 'keyup';
  if (!isKeyboard && typeof input.clientX === 'number' && typeof input.clientY === 'number' && input.targetRect) {
    x = input.clientX - input.targetRect.left;
    y = input.clientY - input.targetRect.top;
  } else if (isKeyboard) {
    x = active.startWidth / 2;
    y = active.startHeight / 2;
  }

  return {
    type,
    pointerType: active.pointerType,
    pointerId: active.pointerId,
    target: active.pressTarget,
    originalTarget: active.startOriginalTarget,
    path: active.startPath,
    x,
    y,
    width: active.startWidth,
    height: active.startHeight,
    timestamp: input.timestamp,
    modifiers: active.modifiers,
  };
}

/**
 * Enter the `active` state on `pointerdown` / `keydown (Space/Enter)` arriving at `idle`.
 * Produces one `pressstart` event.
 */
function enterActive(input: InputStreamEvent): PressReducerOutput {
  const pressTarget = input.target;
  if (!pressTarget) {
    // Defensive: hook layer guarantees target · bail out silently if absent.
    return { state: IDLE_STATE, events: [] };
  }

  const rect = input.targetRect ?? { width: 0, height: 0, left: 0, top: 0 };
  const isKeyboard = input.kind === 'keydown';

  const startX = isKeyboard
    ? rect.width / 2
    : typeof input.clientX === 'number'
      ? input.clientX - rect.left
      : 0;
  const startY = isKeyboard
    ? rect.height / 2
    : typeof input.clientY === 'number'
      ? input.clientY - rect.top
      : 0;

  const nextState: PressState = {
    kind: 'active',
    pointerId: input.pointerId ?? -1,
    pointerType: normalizePointerType(input.pointerType, input.kind),
    pressTarget,
    startTimestamp: input.timestamp,
    startX,
    startY,
    startWidth: rect.width,
    startHeight: rect.height,
    startPath: input.path ?? [],
    startOriginalTarget: input.originalTarget ?? pressTarget,
    modifiers: normalizeModifiers(input.modifiers),
  };

  const pressstart = buildPressEvent('pressstart', nextState, input);
  return { state: nextState, events: [pressstart] };
}

/**
 * Pure-function reducer · `(state, input) => { state, events }`.
 *
 * Per-pointerId scope: the hook layer maintains a `Map<pointerId, PressState>` so
 * this reducer only ever sees events relevant to one pointer (C-1 concurrent
 * pointerIds are independent FSMs).
 *
 * Illegal inputs (e.g. second `pointerdown` on an already-active pointer) are
 * ignored here and surface as a DEV warning in the hook layer (C-5 · side-effect
 * kept out of the reducer).
 */
export function pressReducer(
  state: PressState,
  input: InputStreamEvent,
): PressReducerOutput {
  switch (state.kind) {
    case 'idle':
      return reduceIdle(state, input);
    case 'active':
      return reduceActive(state, input);
    case 'suspended':
      return reduceSuspended(state, input);
    case 'terminated':
      // Absorbing state: all inputs are silent no-ops.
      return { state, events: NO_EVENTS as PressEvent[] };
  }
}

function reduceIdle(state: PressState, input: InputStreamEvent): PressReducerOutput {
  if (input.kind === 'pointerdown' && input.target) {
    return enterActive(input);
  }
  if (input.kind === 'keydown' && isActivationKey(input.key) && input.target) {
    return enterActive(input);
  }
  // Any other input in idle stays idle silently.
  return { state, events: NO_EVENTS as PressEvent[] };
}

function reduceActive(
  state: Extract<PressState, { kind: 'active' }>,
  input: InputStreamEvent,
): PressReducerOutput {
  // Highest priority: unmount terminates immediately, no callback events (C-3).
  if (input.kind === 'unmount') {
    return { state: TERMINATED_STATE, events: NO_EVENTS as PressEvent[] };
  }

  // disabled-flip synchronous cancel (C-2).
  if (input.kind === 'disabled-flip') {
    const cancel = buildPressEvent('presscancel', state, input);
    return { state: TERMINATED_STATE, events: [cancel] };
  }

  // blur during active press → failure (OQ-IE-2 · aligns with native browsers).
  if (input.kind === 'blur') {
    const cancel = buildPressEvent('presscancel', state, input);
    return { state: TERMINATED_STATE, events: [cancel] };
  }

  // pointercancel → failure.
  if (input.kind === 'pointercancel') {
    if (input.pointerId !== undefined && input.pointerId !== state.pointerId) {
      return { state, events: NO_EVENTS as PressEvent[] };
    }
    const cancel = buildPressEvent('presscancel', state, input);
    return { state: TERMINATED_STATE, events: [cancel] };
  }

  // pointer lifecycle · must match current pointerId.
  if (input.kind === 'pointerleave') {
    if (input.pointerId !== undefined && input.pointerId !== state.pointerId) {
      return { state, events: NO_EVENTS as PressEvent[] };
    }
    const suspended: PressState = { ...state, kind: 'suspended' };
    return { state: suspended, events: NO_EVENTS as PressEvent[] };
  }

  if (input.kind === 'pointerup') {
    if (input.pointerId !== undefined && input.pointerId !== state.pointerId) {
      return { state, events: NO_EVENTS as PressEvent[] };
    }
    // inside → success · outside → failure (rare · matches native)
    const inside = input.target === state.pressTarget;
    if (inside) {
      const pressup = buildPressEvent('pressup', state, input);
      const pressend = buildPressEvent('pressend', state, input);
      return { state: TERMINATED_STATE, events: [pressup, pressend] };
    }
    const cancel = buildPressEvent('presscancel', state, input);
    return { state: TERMINATED_STATE, events: [cancel] };
  }

  // keyboard up · Space/Enter → success path.
  if (input.kind === 'keyup' && isActivationKey(input.key)) {
    const pressup = buildPressEvent('pressup', state, input);
    const pressend = buildPressEvent('pressend', state, input);
    return { state: TERMINATED_STATE, events: [pressup, pressend] };
  }

  // pointerenter while active is a no-op (re-entry only applies to suspended).
  // Second pointerdown on same pointerId is an illegal input (C-5) · ignored silently.
  return { state, events: NO_EVENTS as PressEvent[] };
}

function reduceSuspended(
  state: Extract<PressState, { kind: 'suspended' }>,
  input: InputStreamEvent,
): PressReducerOutput {
  // Same termination triggers as active.
  if (input.kind === 'unmount') {
    return { state: TERMINATED_STATE, events: NO_EVENTS as PressEvent[] };
  }
  if (input.kind === 'disabled-flip') {
    const cancel = buildPressEvent('presscancel', state, input);
    return { state: TERMINATED_STATE, events: [cancel] };
  }
  if (input.kind === 'blur') {
    const cancel = buildPressEvent('presscancel', state, input);
    return { state: TERMINATED_STATE, events: [cancel] };
  }
  if (input.kind === 'pointercancel') {
    if (input.pointerId !== undefined && input.pointerId !== state.pointerId) {
      return { state, events: NO_EVENTS as PressEvent[] };
    }
    const cancel = buildPressEvent('presscancel', state, input);
    return { state: TERMINATED_STATE, events: [cancel] };
  }

  // re-entry · back to active · no event (IE-CORE-3).
  if (input.kind === 'pointerenter') {
    if (input.pointerId !== undefined && input.pointerId !== state.pointerId) {
      return { state, events: NO_EVENTS as PressEvent[] };
    }
    const active: PressState = { ...state, kind: 'active' };
    return { state: active, events: NO_EVENTS as PressEvent[] };
  }

  // pointerup while suspended is always outside (we left the pressTarget) → failure.
  if (input.kind === 'pointerup') {
    if (input.pointerId !== undefined && input.pointerId !== state.pointerId) {
      return { state, events: NO_EVENTS as PressEvent[] };
    }
    const cancel = buildPressEvent('presscancel', state, input);
    return { state: TERMINATED_STATE, events: [cancel] };
  }

  // keyup while suspended (rare · press started via keyboard then suspended) →
  // we only suspend on pointerleave so suspended + keyup shouldn't happen · but
  // defensive: keyboard press ignores suspended (keyboard doesn't suspend) so
  // we treat keyup Space/Enter as a no-op here (never entered from keydown).
  return { state, events: NO_EVENTS as PressEvent[] };
}

/** Initial state export for hook consumers. */
export const INITIAL_PRESS_STATE: PressState = IDLE_STATE;
