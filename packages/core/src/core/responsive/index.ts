/**
 * Stage-16 · Responsive system · public barrel
 *
 * The single import surface for primitives that adopt responsive props.
 * Per ADR-008 v0.2 decision 2, the v1 locked enablement set is:
 *   - `<Stack>`  · `gap` / `align` / `justify`
 *   - `<Grid>`   · `gap` / `rowGap` / `columnGap` / `columns`
 *   - `<Inline>` · `gap` / `align` / `justify` / `wrap`
 * (Box/Center/Divider remain non-responsive in v1.)
 */
export type { BreakpointScale, ResponsiveValue } from './types';
export { BREAKPOINT_ORDER, isResponsiveObject } from './breakpoints';
export {
  resolveResponsiveDataAttrs,
  resolveResponsiveCssVars,
  listDefinedBreakpoints,
} from './resolve';
