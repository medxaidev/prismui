/**
 * Stage-16 · Responsive system · public types
 *
 * The single canonical shape for any responsive prop in the v1 locked
 * enablement set (Stack `gap`/`align`/`justify` · Grid `gap`/`rowGap`/
 * `columnGap`/`columns` · Inline `gap`/`align`/`justify`/`wrap` per
 * ADR-008 v0.2 decision 2 (c.1 + c.2)).
 *
 * Cross-refs:
 *   - `@/devdocs/adr/ADR-008-stage-16-responsive-foundation.md` v0.2 decisions 2 + 3
 *   - `@/devdocs/stage/STAGE-16-OVERVIEW.md` v0.6 §3.2 RES-API-1
 */
import type { BreakpointScale } from '../theme/types/token-scale.types';

export type { BreakpointScale };

/**
 * The canonical responsive value shape:
 *
 *   - Scalar `T`                                 — single value applies at every viewport
 *   - `Partial<Record<BreakpointScale, T>>`      — per-breakpoint map (mobile-first)
 *
 * Cascade semantics (RES-BP-3 mobile-first):
 *   - Each provided breakpoint key generates a `@media (min-width: <bp>)`
 *     CSS rule (or `var()` fallback chain for open-ended values).
 *   - Missing breakpoints inherit from the next-lower defined one via the
 *     CSS cascade. Sub-`xs` viewports (`< 576px`) fall back to the
 *     component's scalar default (e.g. `Stack` default `gap: 'md'`).
 *   - There is NO `'base'` key — `xs` IS the narrowest defined tier
 *     (= 576 px floor per `theme.breakpoints.xs`).
 */
export type ResponsiveValue<T> = T | Partial<Record<BreakpointScale, T>>;
