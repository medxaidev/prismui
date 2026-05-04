import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import type { SpacingScale } from '../../../core/theme/types/token-scale.types';
import classes from './Inline.module.css';

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
 *   - **LY-INLINE-2** — `gap` accepts ONLY the 8 `SpacingScale` keys (default
 *     `'md'`); `align` / `justify` are literal-union surfaces matching Stack;
 *     `wrap` is a boolean toggle for `flex-wrap` (default `false`).
 *   - **LY-BOX-3** (reverse) — Inline does NOT accept `padding*` / `margin`
 *     props at the TS level. Compose: `<Box padding="md"><Inline>…</Inline></Box>`.
 *   - **LY-CORE-1** — zero-runtime style; CSS Module + attribute selectors
 *     deliver every visual.
 *   - ~~**LY-INLINE-3**~~ — Inline ↔ Stack symmetry observation; demoted to
 *     a §10.2 design-algebra meta-statement in Round 1 (not a guarded
 *     invariant, but the prop surface here intentionally mirrors Stack
 *     except for `wrap`).
 */
export interface InlineOwnProps {
  /** Gap between children. `SpacingScale` key only. Default `'md'`. */
  gap?: SpacingScale;
  /** Cross-axis (vertical) alignment. Default `center` (LY-INLINE-1). */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Main-axis (horizontal) distribution. Default `flex-start`. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Allow children to wrap onto multiple lines. Default `false` (nowrap). */
  wrap?: boolean;
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

const InlineImpl = React.forwardRef<unknown, InlineImplProps>(function Inline(props, ref) {
  const {
    component,
    className,
    gap = INLINE_DEFAULT_GAP,
    align,
    justify,
    wrap,
    ...rest
  } = props;

  const Element = (component ?? 'div') as React.ElementType;

  // Attribute strategy (mirrors Stack):
  //   - data-gap is ALWAYS emitted (honest default value visible in DevTools).
  //   - data-align / data-justify are emitted only when user overrides.
  //   - data-wrap is emitted as a *valueless* boolean attribute when wrap=true,
  //     paired with the `[data-wrap]` selector in CSS — matches the native
  //     HTML boolean-attribute idiom (`disabled` / `hidden`) instead of
  //     stringifying `"true"`/`"false"` into the DOM.
  const dataAttrs: Record<string, string> = { 'data-gap': gap };
  if (align !== undefined) dataAttrs['data-align'] = align;
  if (justify !== undefined) dataAttrs['data-justify'] = justify;
  if (wrap === true) dataAttrs['data-wrap'] = '';

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
