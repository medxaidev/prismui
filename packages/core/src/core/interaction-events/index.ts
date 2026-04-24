/**
 * Stage-10 · L2 Interaction Events · public barrel
 *
 * See `@/devdocs/system/interaction-events.md` for contract details.
 */

export { usePress } from './usePress';
export { pressReducer, INITIAL_PRESS_STATE } from './press-reducer';
export type {
  // Event & pointer primitives
  PressEvent,
  PressEventType,
  PointerType,
  PressModifiers,

  // L1 → L2 normalized input
  InputStreamEvent,
  InputStreamEventKind,

  // FSM state (public for advanced consumers · most users only need the hook)
  PressState,
  PressReducerOutput,

  // Public hook API
  UsePressOptions,
  UsePressResult,
  UsePressPropsBinding,
} from './types';
