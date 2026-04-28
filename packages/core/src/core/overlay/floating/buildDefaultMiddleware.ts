/**
 * Stage-11 · L0 Overlay Foundation · Floating · default middleware chain
 *
 * Contract: `@/devdocs/system/floating-primitive.md` v0.1.2 §2.2 + §四
 *
 * OV-FLOAT-2 hard side · the returned array ALWAYS contains:
 *   · `offset`  (reference ↔ floating spacing)
 *   · `flip`    (boundary fallback)
 *   · `shift`   (visible-axis push-back)
 *
 * OV-FLOAT-2 soft side (NOT a contract guarantee · subject to first-paint
 * validation in Phase 2 · see floating-primitive.md §4.2):
 *   · order = `[offset, flip, shift]`
 *   · default `offset` = 8 px
 *   · default `shift padding` = 4 px
 *   · default `flip enabled` = true
 *
 * Consumers MUST NOT depend on the soft-side specifics for stable contract.
 */

import { offset, flip, shift } from './middleware';
import type { FloatingMiddleware } from './types';

export interface BuildDefaultMiddlewareOptions {
  /** Offset distance in px (default 8 · soft-side). */
  offset?: number;
  /** Shift padding in px (default 4 · soft-side). */
  shiftPadding?: number;
  /** Whether `flip` is enabled (default true · soft-side). */
  flipEnabled?: boolean;
}

const DEFAULT_OFFSET = 8;
const DEFAULT_SHIFT_PADDING = 4;

export function buildDefaultMiddleware(
  options?: BuildDefaultMiddlewareOptions,
): FloatingMiddleware[] {
  const offsetValue = options?.offset ?? DEFAULT_OFFSET;
  const shiftPaddingValue = options?.shiftPadding ?? DEFAULT_SHIFT_PADDING;
  const flipEnabled = options?.flipEnabled ?? true;

  // Always include the three OV-FLOAT-2 hard-required middleware.
  // `flipEnabled: false` still emits a flip middleware — but with a
  // single-placement fallback list so it effectively no-ops. This keeps
  // the hard contract (length === 3 · §10.5) intact regardless of toggle.
  return [
    offset(offsetValue),
    flipEnabled ? flip() : flip({ fallbackPlacements: [] }),
    shift({ padding: shiftPaddingValue }),
  ];
}
