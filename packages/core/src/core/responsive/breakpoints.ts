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
