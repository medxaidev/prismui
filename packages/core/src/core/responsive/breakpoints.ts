/**
 * Stage-16 · Responsive system · breakpoint order constant + type guard
 *
 * The 5-tier breakpoint scale (xs / sm / md / lg / xl) is locked by
 * RES-BP-1 and ordered ascending by min-width (`theme.breakpoints` ·
 * `@/packages/core/src/core/theme/default-theme.ts:157-163`).
 */
import type { BreakpointScale, ResponsiveValue } from './types';

/**
 * Ascending breakpoint order. Iteration order MUST follow this so the
 * generated `@media (min-width: <bp>)` rules cascade correctly
 * (mobile-first · RES-BP-3).
 */
export const BREAKPOINT_ORDER: readonly BreakpointScale[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
] as const;

/**
 * Breakpoint min-width values (px), locked by RES-BP-1 and mirrored in
 * `theme.breakpoints` (`default-theme.ts:157-163`). These are the SAME
 * values baked into the static `@media` blocks of the responsive layout
 * primitives, so `up()` (below) and `useMediaQuery`/`useBreakpoint` stay
 * consistent with the CSS. v1 does NOT re-read `theme.breakpoints` at
 * runtime — the scale is a hard lock (RES-BP-1), matching the static CSS.
 */
export const BREAKPOINT_MIN_WIDTHS: Readonly<Record<BreakpointScale, number>> = {
  xs: 576,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1400,
} as const;

/**
 * `up(scale)` — build a mobile-first `min-width` media-query string for a
 * breakpoint tier. Pairs with `useMediaQuery`:
 *
 *   const isDesktop = useMediaQuery(up('lg')); // "(min-width: 1200px)"
 *
 * Pure + deterministic (no theme/runtime dependency) so it matches the
 * static CSS `@media` cascade exactly (ADR-008 · decision 5 helper API).
 */
export function up(scale: BreakpointScale): string {
  return `(min-width: ${BREAKPOINT_MIN_WIDTHS[scale]}px)`;
}

/**
 * Runtime type-guard distinguishing the responsive object form
 * (`{ md: 'lg' }`) from the scalar form (`'lg'`).
 *
 * Scalars in the v1 locked set are always strings (SpacingScale,
 * align/justify literals) or numbers (Grid columns count) — never
 * plain objects — so a `typeof === 'object'` check is sufficient.
 * `null` is treated as scalar (rare; not a responsive object).
 */
export function isResponsiveObject<T>(
  value: ResponsiveValue<T> | undefined,
): value is Partial<Record<BreakpointScale, T>> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}
