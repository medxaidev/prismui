/**
 * Stage-11 · L0 Overlay Foundation · Floating · middleware factory wraps
 *
 * Contract: `@/devdocs/system/floating-primitive.md` v0.1.2 §3.1 + §4.3
 *
 * One of the 3 vendor-touch files (§3.1):
 *   · useFloatingPosition.ts
 *   · buildDefaultMiddleware.ts
 *   · middleware.ts  ← this file
 *
 * Phase 2 minimal surface: `offset` / `flip` / `shift` / `arrow` (covers
 * Popover / Tooltip / Menu / Dropdown). Future phases may add `autoPlacement` /
 * `size` / `inline` / `hide` — each MUST follow the same wrap pattern (no
 * vendor type leak).
 */

import {
  offset as vendorOffset,
  flip as vendorFlip,
  shift as vendorShift,
  arrow as vendorArrow,
} from '@floating-ui/react';

import type {
  FloatingMiddleware,
  OffsetOptions,
  FlipOptions,
  ShiftOptions,
  ArrowOptions,
} from './types';

/**
 * Cast helper · vendor `Middleware` → PrismUI opaque `FloatingMiddleware`.
 * Centralised to keep the cast site count = 1 per vendor entry point.
 */
function brand(m: unknown): FloatingMiddleware {
  return m as unknown as FloatingMiddleware;
}

/** PrismUI `offset` factory · wraps vendor `offset`. */
export function offset(opts?: OffsetOptions): FloatingMiddleware {
  return brand(vendorOffset(opts as never));
}

/** PrismUI `flip` factory · wraps vendor `flip`. */
export function flip(opts?: FlipOptions): FloatingMiddleware {
  return brand(vendorFlip(opts as never));
}

/** PrismUI `shift` factory · wraps vendor `shift`. */
export function shift(opts?: ShiftOptions): FloatingMiddleware {
  return brand(vendorShift(opts as never));
}

/** PrismUI `arrow` factory · wraps vendor `arrow`. */
export function arrow(opts: ArrowOptions): FloatingMiddleware {
  return brand(vendorArrow(opts as never));
}

// Re-export option types for the public barrel.
export type {
  OffsetOptions,
  FlipOptions,
  ShiftOptions,
  ArrowOptions,
} from './types';
