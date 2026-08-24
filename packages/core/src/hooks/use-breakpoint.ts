/**
 * Stage-16 · Phase 3 · `useBreakpoint` client hook
 *
 * Returns the largest currently-matching breakpoint tier, or `undefined`
 * when the tier cannot be determined yet:
 *   - SSR / no `matchMedia`   → `undefined` (honest · ADR-008 decision 6)
 *   - viewport `< 576px`      → `undefined` (no named tier below `xs`;
 *                               `xs` IS the narrowest defined tier)
 *   - otherwise               → `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
 *
 * Implementation calls `useMediaQuery` a FIXED five times (one per tier, in
 * `BREAKPOINT_ORDER`) so the hook count is stable across renders — no hooks
 * in a variable-length loop. Mobile-first: the highest matching tier wins.
 *
 * @example
 *   const bp = useBreakpoint();          // 'md' | undefined | ...
 *   if (bp === 'xl') { ... }
 */
import { up } from '../core/responsive';
import type { BreakpointScale } from '../core/responsive';
import { useMediaQuery } from './use-media-query';

export function useBreakpoint(): BreakpointScale | undefined {
  const xs = useMediaQuery(up('xs'));
  const sm = useMediaQuery(up('sm'));
  const md = useMediaQuery(up('md'));
  const lg = useMediaQuery(up('lg'));
  const xl = useMediaQuery(up('xl'));

  // `xs === undefined` means matchMedia is unavailable (SSR / non-browser).
  // All five share the same environment, so checking one is sufficient.
  if (xs === undefined) return undefined;

  if (xl) return 'xl';
  if (lg) return 'lg';
  if (md) return 'md';
  if (sm) return 'sm';
  if (xs) return 'xs';

  // Client, matchMedia works, but viewport is below the xs floor (< 576px).
  return undefined;
}
