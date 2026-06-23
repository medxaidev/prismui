/**
 * Stage-16 · Responsive system · resolution helpers
 *
 * Two emission channels (per ADR-008 v0.2 decision 3 · RES-SSR-1 mixed path):
 *
 *   1. **Data-attr enum channel** (`resolveResponsiveDataAttrs`)
 *      For props with a small enum value space (Stack/Inline `gap`,
 *      `align`, `justify` · Grid `gap`, `rowGap`, `columnGap`).
 *      Scalar  → `{ 'data-<prefix>': value }`
 *      Object  → `{ 'data-<prefix>-<bp>': value }` per provided breakpoint
 *      The CSS Module declares attribute selectors under `@media` blocks
 *      (`.root[data-gap-md='lg'] { gap: var(--prismui-spacing-lg); }`)
 *      so each tier resolves at compile time. Zero runtime CSS rule
 *      generation. Zero inline style.
 *
 *   2. **CSS custom property var channel** (`resolveResponsiveCssVars`)
 *      For props with an open-ended value space (Grid `columns`).
 *      Scalar  → `{ '--<prefix>': transform(value) }`
 *      Object  → `{ '--<prefix>-<bp>': transform(value) }` per breakpoint
 *      The CSS Module declares static `@media` blocks each reading the
 *      corresponding var with a fallback chain to the next lower tier
 *      (`var(--g-md, var(--g-sm, var(--g-xs)))`). Inline `style` carries
 *      VALUES only — never CSS rules. RES-RT-1 boundary preserved.
 *
 * Cross-refs:
 *   - `@/devdocs/adr/ADR-008-stage-16-responsive-foundation.md` v0.2 decisions 2 + 3
 *   - Validated by Phase 1 PoC (Stack.responsive.poc.* / Grid.responsive-columns.poc.*)
 */
import type { BreakpointScale, ResponsiveValue } from './types';
import { BREAKPOINT_ORDER, isResponsiveObject } from './breakpoints';

/**
 * Emit data-attr map for an enum-valued responsive prop.
 *
 * @param prefix     Attribute name segment (e.g. `'gap'` → `data-gap` /
 *                   `data-gap-md`). Must match the corresponding CSS
 *                   Module selector hooks.
 * @param value      The user-supplied prop value. `undefined` returns
 *                   `{}` so the consumer can apply its own scalar
 *                   default (which may also need to be emitted).
 *
 * Examples:
 *   resolveResponsiveDataAttrs('gap', 'md')               → { 'data-gap': 'md' }
 *   resolveResponsiveDataAttrs('gap', { xs: 'sm', md: 'lg' })
 *                                                         → { 'data-gap-xs': 'sm', 'data-gap-md': 'lg' }
 *   resolveResponsiveDataAttrs('gap', undefined)          → {}
 */
export function resolveResponsiveDataAttrs<T extends string>(
  prefix: string,
  value: ResponsiveValue<T> | undefined,
): Record<string, string> {
  if (value === undefined) {
    return {};
  }
  if (!isResponsiveObject(value)) {
    return { [`data-${prefix}`]: value as string };
  }
  const attrs: Record<string, string> = {};
  for (const bp of BREAKPOINT_ORDER) {
    const v = value[bp];
    if (v !== undefined) {
      attrs[`data-${prefix}-${bp}`] = v as unknown as string;
    }
  }
  return attrs;
}

/**
 * Default identity transform for CSS-var values. String values pass
 * through; numbers are rendered with `String()`.
 */
function defaultTransform<T>(v: T): string {
  return typeof v === 'string' ? v : String(v);
}

/**
 * Emit CSS custom property entries for an open-ended responsive prop.
 *
 * @param varName    The CSS custom property base name (without leading
 *                   `--`). The scalar form is written as `--<varName>`,
 *                   each breakpoint as `--<varName>-<bp>`.
 * @param value      The user-supplied prop value.
 * @param transform  Optional value transformer (e.g. Grid columns
 *                   number → `repeat(<n>, minmax(0, 1fr))`).
 *
 * Examples (with default transform):
 *   resolveResponsiveCssVars('prismui-grid-template-columns', '200px 1fr')
 *     → { '--prismui-grid-template-columns': '200px 1fr' }
 *   resolveResponsiveCssVars('prismui-grid-template-columns', { xs: 1, md: 4 }, gridColsTransform)
 *     → {
 *         '--prismui-grid-template-columns-xs': 'repeat(1, minmax(0, 1fr))',
 *         '--prismui-grid-template-columns-md': 'repeat(4, minmax(0, 1fr))',
 *       }
 */
export function resolveResponsiveCssVars<T>(
  varName: string,
  value: ResponsiveValue<T> | undefined,
  transform: (v: T) => string = defaultTransform,
): Record<string, string> {
  if (value === undefined) {
    return {};
  }
  if (!isResponsiveObject(value)) {
    return { [`--${varName}`]: transform(value as T) };
  }
  const vars: Record<string, string> = {};
  for (const bp of BREAKPOINT_ORDER) {
    const v = value[bp];
    if (v !== undefined) {
      vars[`--${varName}-${bp}`] = transform(v);
    }
  }
  return vars;
}

/**
 * Convenience: returns the full breakpoint set actually defined on the
 * value (excluding undefined entries). Used by tests + DEV warns to
 * cross-check user-provided keys against `BREAKPOINT_ORDER`.
 */
export function listDefinedBreakpoints<T>(
  value: ResponsiveValue<T> | undefined,
): BreakpointScale[] {
  if (!isResponsiveObject(value)) return [];
  return BREAKPOINT_ORDER.filter((bp) => value[bp] !== undefined);
}
