import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import classes from './Center.module.css';

/**
 * `<Center>` — Stage-15 Layout primitive · single-child centering helper.
 *
 * Contracts (see `@/devdocs/stage/STAGE-15-OVERVIEW.md` §3.4 + ADR-006):
 *
 *   - **LY-CENTER-1** — Center renders a flex container with both axes
 *     centered (`display: flex; align-items: center; justify-content: center`).
 *     Designed for **a single child**. Does NOT accept `gap` (no
 *     inter-child gap exists with one child).
 *   - **LY-CENTER-2** — In DEV mode, when the Center has more than one
 *     child, a one-time `console.warn` is emitted advising migration to
 *     `<Stack>` / `<Inline>`. Render is **not** blocked — the contract is
 *     "centering of the flex container as a whole still works", just that
 *     this is no longer the primitive's intended use. **Prod builds are
 *     silent** (the entire branch is dead-code-eliminated by bundlers
 *     when `process.env.NODE_ENV === 'production'`).
 *   - **LY-BOX-3** (reverse) — Center does NOT accept `padding*` /
 *     `margin` props at the TS level. Compose: `<Box padding="md"><Center>…
 *     </Center></Box>`.
 *   - **LY-CORE-1** — zero-runtime style; the entire visual contract is
 *     the four declarations in `Center.module.css`.
 */
export interface CenterOwnProps {
  // Center has no own visual props — its semantic surface is the centering
  // contract itself (LY-CENTER-1). The polymorphic `component` prop and
  // standard React passthrough come from the polymorphic plumbing below.
}

/** Full Center prop type (polymorphic, defaults to `'div'`). */
export type CenterProps<C extends ElementType = 'div'> = PolymorphicProps<C, CenterOwnProps>;

/**
 * Polymorphic Center component type — recovers the `<C>` generic that
 * `React.forwardRef` erases.
 */
export type CenterComponent = <C extends ElementType = 'div'>(
  props: CenterProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

// ── impl ────────────────────────────────────────────────────────────────────

type CenterImplProps = CenterOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof CenterOwnProps> & {
    component?: ElementType;
  };

function mergeClassName(userClassName: string | undefined): string {
  return userClassName ? `${classes.root} ${userClassName}` : classes.root;
}

const CenterImpl = React.forwardRef<unknown, CenterImplProps>(function Center(props, ref) {
  const { component, className, children, ...rest } = props;
  const Element = (component ?? 'div') as React.ElementType;

  // ── LY-CENTER-2 · DEV multi-child advisory ─────────────────────────────
  // Per-instance latch via ref so a Center that re-renders with stable
  // multi-child content warns at most once (avoids console spam under
  // React.StrictMode double-render or unrelated parent updates).
  // The ENTIRE block — including the ref allocation — is gated by
  // `process.env.NODE_ENV !== 'production'`, so the bundler eliminates it
  // wholesale from prod builds.
  /* eslint-disable react-hooks/rules-of-hooks */
  if (process.env.NODE_ENV !== 'production') {
    // Note: hooks-in-DEV-only is a known acceptable pattern when the env
    // check is statically resolvable at build time. NODE_ENV is replaced
    // by every major bundler (Vite / webpack / esbuild) → the hook order
    // is stable per build, never per render.
    const warnedRef = React.useRef(false);
    const childCount = React.Children.count(children);
    if (childCount > 1 && !warnedRef.current) {
      warnedRef.current = true;
      // eslint-disable-next-line no-console
      console.warn(
        `[PrismUI] <Center> is designed for a single centred child but received ${childCount} ` +
          'children. Centering still works on the flex container as a whole, but for multiple ' +
          'items consider <Stack> (vertical) or <Inline> (horizontal) instead.',
      );
    }
  }
  /* eslint-enable react-hooks/rules-of-hooks */

  return (
    <Element
      ref={ref as React.Ref<HTMLElement>}
      className={mergeClassName(className)}
      {...rest}
    >
      {children}
    </Element>
  );
});

CenterImpl.displayName = 'Center';

/**
 * Public Center — cast restores the polymorphic signature so callers get
 * full `component`-aware prop inference.
 */
export const Center = CenterImpl as unknown as CenterComponent & { displayName?: string };
