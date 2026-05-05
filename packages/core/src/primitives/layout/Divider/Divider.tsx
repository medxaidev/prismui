import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import classes from './Divider.module.css';

/**
 * `<Divider>` — Stage-15 Layout primitive · thematic / orientation separator.
 *
 * Contracts (see `@/devdocs/stage/STAGE-15-OVERVIEW.md` §3.6 + ADR-006):
 *
 *   - **LY-DIV-1** (default element + a11y · v1.0 Round 1 F/Insight 1
 *     "honest default" refinement) — Divider renders `<hr>` by default,
 *     which carries native `role="separator"` semantics. When the
 *     consumer flips to a non-`<hr>` element via `component`, Divider
 *     adds `role="separator"` and `aria-orientation` **only if the
 *     consumer did not supply them**. This avoids Insight 1's "invisible
 *     keyboard contract conflict": if a user writes `role="presentation"`
 *     to strip the separator semantics, Divider must not silently
 *     override that back to `separator`.
 *   - **LY-DIV-2** (`orientation`) — accepts `'horizontal'` (default) or
 *     `'vertical'`. Consumed by CSS via `border-top` vs `border-left`.
 *     Divider does **not** introduce `margin` — adjacent spacing is the
 *     parent's responsibility (`<Stack gap="md">` / `<Inline gap="md">`).
 *   - **LY-BOX-3** (reverse) — Divider does NOT accept `padding*` /
 *     `margin` props. Wrap with `<Box>` for inset if needed.
 *   - **LY-CORE-1** — zero-runtime style; CSS Module owns every visual.
 */
export interface DividerOwnProps {
  /**
   * Divider orientation. Consumed by CSS to choose `border-top`
   * (horizontal · default) or `border-left` (vertical). ALSO written
   * into `aria-orientation` when the consumer did not supply their own
   * (LY-DIV-1).
   */
  orientation?: 'horizontal' | 'vertical';
}

/** Full Divider prop type (polymorphic, defaults to `'hr'`). */
export type DividerProps<C extends ElementType = 'hr'> = PolymorphicProps<C, DividerOwnProps>;

/**
 * Polymorphic Divider component type — recovers the `<C>` generic that
 * `React.forwardRef` erases.
 */
export type DividerComponent = <C extends ElementType = 'hr'>(
  props: DividerProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

// ── impl ────────────────────────────────────────────────────────────────────

export const DIVIDER_DEFAULT_ORIENTATION: 'horizontal' | 'vertical' = 'horizontal';

type DividerImplProps = DividerOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof DividerOwnProps> & {
    component?: ElementType;
  };

function mergeClassName(userClassName: string | undefined): string {
  return userClassName ? `${classes.root} ${userClassName}` : classes.root;
}

const DividerImpl = React.forwardRef<unknown, DividerImplProps>(function Divider(props, ref) {
  const {
    component,
    className,
    orientation = DIVIDER_DEFAULT_ORIENTATION,
    role: userRole,
    'aria-orientation': userAriaOrientation,
    ...rest
  } = props as DividerImplProps & {
    role?: string;
    'aria-orientation'?: 'horizontal' | 'vertical' | 'undefined';
  };

  const Element = (component ?? 'hr') as React.ElementType;

  // ── LY-DIV-1 · a11y honest-default layer ───────────────────────────────
  // Rules:
  //   1. If user supplied `role` explicitly → forward unchanged. This is
  //      the Round 1 Insight 1 refinement: `role="presentation"` must
  //      defuse the separator semantics, NOT get re-overridden.
  //   2. Else if element is `<hr>` → do NOT add role (native implicit
  //      `role="separator"` is the canonical a11y source; adding the
  //      explicit attribute is redundant and surfaces in snapshot
  //      tests as churn).
  //   3. Else (polymorphic to e.g. `<div>`) → add `role="separator"`.
  //
  //   4. `aria-orientation`: forward user value if present (same
  //      honest-default rule). Otherwise fill from the `orientation`
  //      prop so the rendered DOM is self-documenting (mirrors
  //      Stack/Inline's "always emit data-gap" honest-default pattern).
  const a11yAttrs: Record<string, string> = {};

  if (userRole !== undefined) {
    a11yAttrs.role = userRole;
  } else if (Element !== 'hr') {
    a11yAttrs.role = 'separator';
  }

  if (userAriaOrientation !== undefined) {
    a11yAttrs['aria-orientation'] = userAriaOrientation;
  } else {
    a11yAttrs['aria-orientation'] = orientation;
  }

  // ── data-attrs ─────────────────────────────────────────────────────────
  // `data-orientation` is always emitted (CSS needs it to choose
  // `border-top` vs `border-left`; rendered DOM honestly reflects the
  // resolved orientation · parallels Stack/Inline data-gap).
  const dataAttrs: Record<string, string> = { 'data-orientation': orientation };

  return (
    <Element
      ref={ref as React.Ref<HTMLElement>}
      className={mergeClassName(className)}
      {...dataAttrs}
      {...a11yAttrs}
      {...rest}
    />
  );
});

DividerImpl.displayName = 'Divider';

/**
 * Public Divider — cast restores the polymorphic signature so callers get
 * full `component`-aware prop inference.
 */
export const Divider = DividerImpl as unknown as DividerComponent & { displayName?: string };
