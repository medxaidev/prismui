import { RADIUS_SCALE, type PrismuiRadius, type Radius } from './types';

/**
 * Resolve a `Radius` value to a CSS expression suitable for `border-radius`.
 *
 * - Known scale key → `var(--prismui-radius-<scale>)` (theme-driven, overridable
 *   via `theme.radius.<scale>` or by a user-supplied top-level CSS var).
 * - Any other string → returned verbatim (treated as a CSS length such as
 *   '4px' / '0.5em' / 'calc(...)').
 *
 * Invariants:
 *   - Pure function. No side effects.
 *   - Does NOT fall back to a default; callers must pass a non-nullish value.
 *     (Components own their own default, applied at the factory defaultProps
 *     layer — Step 10 A-2 single-writer hierarchy.)
 *
 * @example
 *   resolveRadiusToken('md')     // 'var(--prismui-radius-md)'
 *   resolveRadiusToken('4px')    // '4px'
 *   resolveRadiusToken('full')   // 'var(--prismui-radius-full)'
 *   resolveRadiusToken('0.5em')  // '0.5em'
 */
export function resolveRadiusToken(r: Radius): string {
  return RADIUS_SCALE.has(r as PrismuiRadius) ? `var(--prismui-radius-${r})` : r;
}
