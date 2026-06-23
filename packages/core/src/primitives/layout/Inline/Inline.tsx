import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import {
  type ResponsiveValue,
  BREAKPOINT_ORDER,
  isResponsiveObject,
  resolveResponsiveDataAttrs,
} from '../../../core/responsive';
import type { SpacingScale } from '../../../core/theme/types/token-scale.types';
import classes from './Inline.module.css';

type InlineAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type InlineJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly';

/**
 * `<Inline>` — Stage-15 Layout primitive · horizontal flex container.
 *
 * Contracts (see `@/devdocs/stage/STAGE-15-OVERVIEW.md` §3.3 + ADR-006):
 *
 *   - **LY-INLINE-1** — horizontal flex semantic lock: `display: flex` +
 *     `flex-direction: row` · default `align-items: center` (note: differs
 *     from Stack's `stretch` because horizontal layouts most commonly
 *     vertically center their items) · `justify-content: flex-start` ·
 *     `flex-wrap: nowrap`. Cannot be flipped to column via prop. Use
 *     `<Stack>` for vertical layouts.
 *   - **LY-INLINE-2** — `gap` accepts the 8 `SpacingScale` keys (default
 *     `'md'`) OR a responsive map; `align` / `justify` are literal-union
 *     surfaces matching Stack and accept the same scalar/responsive form;
 *     `wrap` is a boolean toggle for `flex-wrap` (default `false`) and
 *     also accepts a responsive `Partial<Record<BreakpointScale, boolean>>`
 *     map (Stage-16 · ADR-008 v0.2 decision 2 c.1 · wrap unlocked because
 *     row layout commonly toggles wrap between mobile / tablet / desktop).
 *   - **LY-BOX-3** (reverse) — Inline does NOT accept `padding*` / `margin`
 *     props at the TS level. Compose: `<Box padding="md"><Inline>…</Inline></Box>`.
 *   - **LY-CORE-1** — zero-runtime style; CSS Module + attribute selectors
 *     (under `@media (min-width: <bp>)` blocks for the responsive form)
 *     deliver every visual. RES-RT-1 holds: no inline style, no runtime
 *     CSS rule generation.
 *   - ~~**LY-INLINE-3**~~ — Inline ↔ Stack symmetry observation; demoted to
 *     a §10.2 design-algebra meta-statement in Round 1 (not a guarded
 *     invariant, but the prop surface here intentionally mirrors Stack
 *     except for `wrap`).
 */
export interface InlineOwnProps {
  /**
   * Gap between children. `SpacingScale` scalar OR responsive map.
   * Default `'md'` applies only when `gap` is `undefined`.
   */
  gap?: ResponsiveValue<SpacingScale>;
  /** Cross-axis (vertical) alignment. Scalar or responsive map. */
  align?: ResponsiveValue<InlineAlign>;
  /** Main-axis (horizontal) distribution. Scalar or responsive map. */
  justify?: ResponsiveValue<InlineJustify>;
  /**
   * Allow children to wrap onto multiple lines. Default `false` (nowrap).
   * Accepts a boolean scalar OR a `Partial<Record<BreakpointScale, boolean>>`
   * responsive map (e.g. `{ xs: true, lg: false }`).
   */
  wrap?: ResponsiveValue<boolean>;
}

/** Full Inline prop type (polymorphic, defaults to `'div'`). */
export type InlineProps<C extends ElementType = 'div'> = PolymorphicProps<C, InlineOwnProps>;

/**
 * Polymorphic Inline component type — recovers the `<C>` generic that
 * `React.forwardRef` erases.
 */
export type InlineComponent = <C extends ElementType = 'div'>(
  props: InlineProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

// ── impl ────────────────────────────────────────────────────────────────────

/** Default gap — exported for contract reference (parallels Stack). */
export const INLINE_DEFAULT_GAP: SpacingScale = 'md';

type InlineImplProps = InlineOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof InlineOwnProps> & {
    component?: ElementType;
  };

function mergeClassName(userClassName: string | undefined): string {
  return userClassName ? `${classes.root} ${userClassName}` : classes.root;
}

/**
 * Resolve `wrap` (boolean | responsive boolean) into a data-attr map.
 *
 *   - undefined         → `{}` (CSS default `flex-wrap: nowrap` applies)
 *   - `true`            → `{ 'data-wrap': '' }` (valueless boolean attr,
 *                          matches native `disabled` / `hidden` idiom)
 *   - `false`           → `{}` (omit; default state)
 *   - responsive object → `{ 'data-wrap-<bp>': 'true' | 'false' }` per
 *                          provided breakpoint. Both states are emitted
 *                          as strings (`'true'`/`'false'`) so each `@media`
 *                          block can override the previous tier in either
 *                          direction (e.g. `{ xs: true, lg: false }` needs
 *                          `flex-wrap: nowrap` at lg to override xs).
 */
function resolveWrapAttrs(
  wrap: ResponsiveValue<boolean> | undefined,
): Record<string, string> {
  if (wrap === undefined) return {};
  if (typeof wrap === 'boolean') return wrap ? { 'data-wrap': '' } : {};
  if (!isResponsiveObject(wrap)) return {};
  const attrs: Record<string, string> = {};
  for (const bp of BREAKPOINT_ORDER) {
    const v = wrap[bp];
    if (v !== undefined) attrs[`data-wrap-${bp}`] = v ? 'true' : 'false';
  }
  return attrs;
}

const InlineImpl = React.forwardRef<unknown, InlineImplProps>(function Inline(props, ref) {
  const { component, className, gap, align, justify, wrap, ...rest } = props;

  const Element = (component ?? 'div') as React.ElementType;

  // gap is ALWAYS emitted (honest default visible in DevTools); responsive
  // empty object falls through to scalar default. align/justify silent
  // when unset (no scalar fallback). wrap uses its own boolean-aware helper.
  const gapAttrs = resolveResponsiveDataAttrs<SpacingScale>('gap', gap);
  const dataAttrs: Record<string, string> = {
    ...(Object.keys(gapAttrs).length > 0
      ? gapAttrs
      : { 'data-gap': INLINE_DEFAULT_GAP }),
    ...resolveResponsiveDataAttrs<InlineAlign>('align', align),
    ...resolveResponsiveDataAttrs<InlineJustify>('justify', justify),
    ...resolveWrapAttrs(wrap),
  };

  return (
    <Element
      ref={ref as React.Ref<HTMLElement>}
      className={mergeClassName(className)}
      {...dataAttrs}
      {...rest}
    />
  );
});

InlineImpl.displayName = 'Inline';

/**
 * Public Inline — cast restores the polymorphic signature so callers get
 * full `component`-aware prop inference (HTML attrs follow the chosen
 * element).
 */
export const Inline = InlineImpl as unknown as InlineComponent & { displayName?: string };
