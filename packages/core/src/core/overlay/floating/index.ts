/**
 * Stage-11 · L0 Overlay Foundation · Floating primitive · public barrel
 *
 * Contract: `@/devdocs/system/floating-primitive.md` v0.1.2 §二
 *
 * Public surface (1 hook + 1 default-chain util + 4 middleware factories +
 * types). `types.ts` and `middleware.ts` internal helpers are NOT
 * re-exported beyond the symbols listed here.
 */

export { useFloatingPosition, __resetFloatingZIndexWarn } from './useFloatingPosition';
export type {
  UseFloatingPositionOptions,
  UseFloatingPositionResult,
  UseFloatingPositionRefs,
  FloatingZIndexLevel,
} from './useFloatingPosition';

export { buildDefaultMiddleware } from './buildDefaultMiddleware';
export type { BuildDefaultMiddlewareOptions } from './buildDefaultMiddleware';

export { offset, flip, shift, arrow } from './middleware';

export type {
  FloatingPlacement,
  FloatingStrategy,
  FloatingMiddleware,
  FloatingReference,
  VirtualReferenceElement,
  OffsetOptions,
  FlipOptions,
  ShiftOptions,
  ArrowOptions,
} from './types';
