import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import type { SpacingScale } from '../../../core/theme/types/token-scale.types';
import classes from './Stack.module.css';

/**
 * `<Stack>` — Stage-15 Layout primitive · vertical flex container.
 *
 * Contracts (see `@/devdocs/stage/STAGE-15-OVERVIEW.md` §3.2 + ADR-006):
 *
 *   - **LY-STACK-1** — vertical flex semantic lock: `display: flex` +
 *     `flex-direction: column`. Cannot be flipped to row via prop. Use
 *     `<Inline>` for horizontal layouts.
 *   - **LY-STACK-2** — `gap` accepts ONLY the 8 `SpacingScale` keys; default
 *     `'md'`. Emits `data-gap` on every render so the resolved value is
 *     visible in DevTools (honesty over implicit fallback).
 *   - **LY-STACK-3** — `align` / `justify` are literal-union surfaces:
 *     `align`   ∈ `'start' | 'center' | 'end' | 'stretch' | 'baseline'`
 *     `justify` ∈ `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`
 *     Emitted as `data-align` / `data-justify` ONLY when set (defaults
 *     come from `.root` CSS — no attribute pollution at the default state).
 *   - **LY-BOX-3** (reverse) — Stack does **not** accept `padding*` /
 *     `margin` props at the TypeScript level. To pad a Stack:
 *     `<Box padding="md"><Stack>…</Stack></Box>`.
 *   - **LY-CORE-1** — zero-runtime style; CSS Module + attribute selectors
 *     deliver every visual.
 */
export interface StackOwnProps {
  /** Gap between children. `SpacingScale` key only. Default `'md'`. */
  gap?: SpacingScale;
  /** Cross-axis (horizontal) alignment. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Main-axis (vertical) distribution. */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
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
  const {
    component,
    className,
    gap = STACK_DEFAULT_GAP,
    align,
    justify,
    ...rest
  } = props;

  const Element = (component ?? 'div') as React.ElementType;

  // gap is ALWAYS emitted (LY-STACK-2: default 'md' is a real value users
  // should be able to inspect in DevTools, not a hidden CSS fallback).
  // align/justify are emitted only when user overrides — keeps the default
  // DOM minimal and signals "no override" to readers of the rendered HTML.
  const dataAttrs: Record<string, string> = { 'data-gap': gap };
  if (align !== undefined) dataAttrs['data-align'] = align;
  if (justify !== undefined) dataAttrs['data-justify'] = justify;

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
