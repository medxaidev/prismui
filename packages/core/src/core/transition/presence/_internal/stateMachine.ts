/**
 * Stage-12 · Presence · 4-state machine reducer (TR-PRES-1 / TR-PRES-4)
 *
 * Pure function — no side effects. Encodes the 6 legal transitions documented
 * in `@/devdocs/system/presence-primitive.md` §3.1.
 *
 *   closed   → entering   (event: 'open')
 *   entering → open       (event: 'end')
 *   open     → exiting    (event: 'close')
 *   exiting  → closed     (event: 'end')
 *   entering → exiting    (event: 'close' · reverse · TR-PRES-4)
 *   exiting  → entering   (event: 'open'  · reverse · TR-PRES-4)
 *
 * Any other (state, event) tuple is a no-op — the reducer returns the same
 * state object so `useReducer` skips the re-render.
 */

import type { PresenceState } from '../types';

/** Internal events driving the reducer. Not part of the public API. */
export type PresenceEvent = 'open' | 'close' | 'end';

export function presenceReducer(
  state: PresenceState,
  event: PresenceEvent,
): PresenceState {
  switch (state) {
    case 'closed':
      if (event === 'open') return 'entering';
      return state;

    case 'entering':
      if (event === 'end') return 'open';
      if (event === 'close') return 'exiting';
      return state;

    case 'open':
      if (event === 'close') return 'exiting';
      return state;

    case 'exiting':
      if (event === 'end') return 'closed';
      if (event === 'open') return 'entering';
      return state;

    default: {
      // Exhaustiveness guard — TS will catch unhandled state additions.
      const _never: never = state;
      return _never;
    }
  }
}

/**
 * Derived render flag — TR-PRES-2.
 * `closed` ⇒ children unmount unless `forceMount`.
 */
export function shouldRenderForState(
  state: PresenceState,
  forceMount: boolean,
): boolean {
  if (forceMount) return true;
  return state !== 'closed';
}
