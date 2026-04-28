/**
 * Stage-11 · L0 Overlay Foundation · Floating · public types
 *
 * Contract: `@/devdocs/system/floating-primitive.md` v0.1.2 §2.3 + §2.4
 *
 * OV-FLOAT-1 compliance:
 *   · This file does NOT import `@floating-ui/react` (value or type).
 *   · `FloatingMiddleware` is a PrismUI-owned opaque brand interface.
 *   · `OffsetOptions / FlipOptions / ShiftOptions / ArrowOptions` are
 *     PrismUI-owned wrap option types · field-level mirror of vendor v0.27
 *     but NOT type-level equivalent (consumers MUST NOT `import type` vendor
 *     options and pass them to PrismUI factories — unsupported coincidence).
 *   · vendor swap path: public names stay stable · internal cast/runtime only.
 */

import type { RefObject } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Placement & strategy
// ─────────────────────────────────────────────────────────────────────────────

export type FloatingPlacement =
  | 'top'    | 'top-start'    | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left'   | 'left-start'   | 'left-end'
  | 'right'  | 'right-start'  | 'right-end';

export type FloatingStrategy = 'absolute' | 'fixed';

// ─────────────────────────────────────────────────────────────────────────────
// Reference (Element or virtual · OQ-OV-8 minimal API)
// ─────────────────────────────────────────────────────────────────────────────

export interface VirtualReferenceElement {
  /** Required · returns the bounding rect of the virtual reference. */
  getBoundingClientRect: () => DOMRect;
  /** Optional · vendor uses this to climb context for overflow detection. */
  contextElement?: Element;
}

export type FloatingReference = Element | VirtualReferenceElement;

// ─────────────────────────────────────────────────────────────────────────────
// FloatingMiddleware · opaque brand
// ─────────────────────────────────────────────────────────────────────────────

declare const __floatingMiddlewareBrand: unique symbol;

/**
 * Opaque brand type · NOT assignable from vendor `Middleware` directly.
 *
 * Consumers obtain values via PrismUI-owned factories (`offset` / `flip` /
 * `shift` / `arrow` / `buildDefaultMiddleware`). Internal code casts through
 * this brand into the vendor shape at the single `useFloating` call site.
 */
export interface FloatingMiddleware {
  readonly [__floatingMiddlewareBrand]: true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware wrap option types (§2.4 · field-level mirror of vendor v0.27)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `offset()` factory parameter.
 * Number = main-axis distance in px · object form for fine-grained control.
 */
export type OffsetOptions =
  | number
  | {
      /** Main-axis offset (reference ↔ floating direction). */
      mainAxis?: number;
      /** Cross-axis offset (perpendicular to main axis). */
      crossAxis?: number;
      /** Alignment-axis offset (-start / -end placements only). */
      alignmentAxis?: number | null;
    };

/** `flip()` factory parameter. */
export interface FlipOptions {
  /** Override default fallback placement chain. */
  fallbackPlacements?: FloatingPlacement[];
  /** Boundary inset in px. */
  padding?: number;
  /** Only flip on the cross axis (rare · default false). */
  crossAxis?: boolean;
}

/** `shift()` factory parameter. */
export interface ShiftOptions {
  /** Boundary inset in px. */
  padding?: number;
  /**
   * Limiter instance (advanced · Phase 2 transparently passes through to vendor).
   * Typed `unknown` to avoid leaking vendor `Middleware` shape.
   */
  limiter?: unknown;
}

/** `arrow()` factory parameter. */
export interface ArrowOptions {
  /** Arrow DOM node ref or Element. */
  element: RefObject<Element | null> | Element;
  /** Boundary inset in px. */
  padding?: number;
}
