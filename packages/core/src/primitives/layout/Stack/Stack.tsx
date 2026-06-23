import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import {
  type ResponsiveValue,
  resolveResponsiveDataAttrs,
} from '../../../core/responsive';
import type { SpacingScale } from '../../../core/theme/types/token-scale.types';
import classes from './Stack.module.css';

type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type StackJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly';

/**
 * `<Stack>` — Stage-15 Layout primitive · vertical flex container.
 *
 * Contracts (see `@/devdocs/stage/STAGE-15-OVERVIEW.md` §3.2 + ADR-006):
 *
 *   - **LY-STACK-1** — vertical flex semantic lock: `display: flex` +
 *     `flex-direction: column`. Cannot be flipped to row via prop. Use
 *     `<Inline>` for horizontal layouts.
 *   - **LY-STACK-2** — `gap` accepts the 8 `SpacingScale` keys (default
 *     `'md'`) OR a `Partial<Record<BreakpointScale, SpacingScale>>`
 *     responsive object (Stage-16 · ADR-008 v0.2 decision 2 c.1). The
 *     scalar default is emitted as `data-gap="md"`; responsive form
 *     emits `data-gap-<bp>="<scale>"` per provided breakpoint.
 *   - **LY-STACK-3** — `align` / `justify` are literal-union surfaces;
 *     each accepts the same scalar OR responsive object form. Both are
 *     emitted as `data-(align|justify)` (scalar) or
 *     `data-(align|justify)-<bp>` (responsive) ONLY when the user sets
 *     them — keeping the default DOM minimal and signalling "no
 *     override" to readers of the rendered HTML.
 *       align   ∈ `'start' | 'center' | 'end' | 'stretch' | 'baseline'`
 *       justify ∈ `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`
 *   - **LY-BOX-3** (reverse) — Stack does **not** accept `padding*` /
 *     `margin` props at the TypeScript level. To pad a Stack:
 *     `<Box padding="md"><Stack>…</Stack></Box>`.
 *   - **LY-CORE-1** — zero-runtime style; CSS Module + attribute
 *     selectors (under `@media (min-width: <bp>)` blocks for the
 *     responsive form) deliver every visual. No inline style. No
 *     runtime CSS rule generation (RES-RT-1).
 *   - Direction is locked (LY-STACK-1) and is therefore NOT
 *     responsive — see ADR-008 议题 D for rationale.
 */
export interface StackOwnProps {
  /**
   * Gap between children. Accepts a `SpacingScale` scalar OR a
   * `Partial<Record<BreakpointScale, SpacingScale>>` responsive map.
   * Default `'md'` applies only when `gap` is `undefined`.
   */
  gap?: ResponsiveValue<SpacingScale>;
  /** Cross-axis (horizontal) alignment. Scalar or responsive map. */
  align?: ResponsiveValue<StackAlign>;
  /** Main-axis (vertical) distribution. Scalar or responsive map. */
  justify?: ResponsiveValue<StackJustify>;
}

/** Full Stack prop type (polymorphic, defaults to `'div'`). */
export type StackProps<C extends ElementType = 'div'> = PolymorphicProps<C, StackOwnProps>;

/**
 * Polymorphic Stack component type — recovers the `<C>` generic that
 * `React.forwardRef` erases (same pattern as Box / Mantine / Radix).
 */
export type StackComponent = <C extends ElementType = 'div'>(
  props: StackProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

// ── impl ────────────────────────────────────────────────────────────────────

/** Default gap — exported so consumers / tests can reference the contract. */
export const STACK_DEFAULT_GAP: SpacingScale = 'md';

/**
 * Concrete impl-side prop shape (the public `StackComponent` cast restores
 * the polymorphic generic at the export boundary).
 */
type StackImplProps = StackOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof StackOwnProps> & {
    component?: ElementType;
  };

function mergeClassName(userClassName: string | undefined): string {
  return userClassName ? `${classes.root} ${userClassName}` : classes.root;
}

const StackImpl = React.forwardRef<unknown, StackImplProps>(function Stack(props, ref) {
  const { component, className, gap, align, justify, ...rest } = props;

  const Element = (component ?? 'div') as React.ElementType;

  // gap is ALWAYS emitted in the DOM (LY-STACK-2 honesty). Three branches:
  //   - undefined         → scalar default `data-gap="md"`
  //   - scalar value      → scalar `data-gap=<value>`
  //   - responsive object → per-breakpoint `data-gap-<bp>` attrs; if the
  //                         object is empty (no defined breakpoint) we
  //                         fall through to the scalar default so
  //                         DevTools always shows a resolved gap value.
  // align/justify follow the same emission pattern but are silent when
  // unset (no scalar fallback — see LY-CORE-5 default-omission).
  const gapAttrs = resolveResponsiveDataAttrs<SpacingScale>('gap', gap);
  const dataAttrs: Record<string, string> = {
    ...(Object.keys(gapAttrs).length > 0
      ? gapAttrs
      : { 'data-gap': STACK_DEFAULT_GAP }),
    ...resolveResponsiveDataAttrs<StackAlign>('align', align),
    ...resolveResponsiveDataAttrs<StackJustify>('justify', justify),
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

StackImpl.displayName = 'Stack';

/**
 * Public Stack — cast restores the polymorphic signature so callers get full
 * `component`-aware prop inference (HTML attrs follow the chosen element).
 */
export const Stack = StackImpl as unknown as StackComponent & { displayName?: string };
