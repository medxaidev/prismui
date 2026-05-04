import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import type { SpacingScale } from '../../../core/theme/types/token-scale.types';
import classes from './Box.module.css';

/**
 * `<Box>` — Stage-15 Layout primitive · L0 base box.
 *
 * Contracts (see `@/devdocs/stage/STAGE-15-OVERVIEW.md` §3.1 + `@/devdocs/adr/ADR-006`):
 *
 *   - **LY-BOX-1** — default element is `<div>`, polymorphic via `component`
 *     prop (Stage-8 reserved keyword). No default `display` is injected; the
 *     element's natural display (block/inline/...) is preserved.
 *   - **LY-BOX-2** — spacing props accept ONLY the 8 `SpacingScale` keys; TS
 *     refuses px strings / numbers / other token families at compile time.
 *   - **LY-BOX-3** — Box is the ONLY Layout primitive that exposes
 *     `padding*` / `margin` props. Stack / Inline / Center / Grid / Divider
 *     MUST NOT accept them (compose: `<Box padding="md"><Stack>…</Stack></Box>`).
 *   - **LY-CORE-1** — zero-runtime styling: every spacing prop is forwarded
 *     to a `data-padding*` / `data-margin` attribute; the CSS Module resolves
 *     it to `var(--prismui-spacing-<key>)` via an attribute selector.
 *   - **LY-CORE-5** — data-attrs are DOM-bearing and conditionally spread;
 *     `undefined` props never reach the DOM, avoiding `data-padding="undefined"`
 *     artefacts and the React-string `"null"` footgun called out in ADR-006 R-3c.
 *   - **LY-CORE-7** — user-supplied `style` / `className` flow through; Box
 *     makes no attempt to block inline styles (documented in Round 1 Insight 2).
 */
export interface BoxOwnProps {
  /** Padding on all four sides (`SpacingScale` key). */
  padding?: SpacingScale;
  /** Inline-axis padding (`padding-inline`). */
  paddingX?: SpacingScale;
  /** Block-axis padding (`padding-block`). */
  paddingY?: SpacingScale;
  paddingTop?: SpacingScale;
  paddingRight?: SpacingScale;
  paddingBottom?: SpacingScale;
  paddingLeft?: SpacingScale;
  /** Margin on all four sides (`SpacingScale` key). */
  margin?: SpacingScale;
}

/**
 * Full Box prop type. `C` defaults to `'div'` (LY-BOX-1) and flows through
 * the shared polymorphic plumbing, which also guards against users defining a
 * `component` key inside `BoxOwnProps` (see `DisallowComponentProp`).
 */
export type BoxProps<C extends ElementType = 'div'> = PolymorphicProps<C, BoxOwnProps>;

/**
 * Type of the Box component. Separate from the implementation so we can
 * assert the polymorphic `<C extends ElementType>` generic through
 * `React.forwardRef` (which otherwise erases the generic).
 */
export type BoxComponent = <C extends ElementType = 'div'>(
  props: BoxProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

// ── impl ────────────────────────────────────────────────────────────────────

/**
 * Conditionally build the `data-*` payload. We only set an attribute when the
 * corresponding prop is defined; otherwise React would render the string
 * `"undefined"` into the DOM, which matches no CSS selector but pollutes the
 * inspector (ADR-006 R-3c). Return value is spread directly onto the element.
 */
function buildDataAttrs(props: BoxOwnProps): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (props.padding !== undefined) attrs['data-padding'] = props.padding;
  if (props.paddingX !== undefined) attrs['data-padding-x'] = props.paddingX;
  if (props.paddingY !== undefined) attrs['data-padding-y'] = props.paddingY;
  if (props.paddingTop !== undefined) attrs['data-padding-top'] = props.paddingTop;
  if (props.paddingRight !== undefined) attrs['data-padding-right'] = props.paddingRight;
  if (props.paddingBottom !== undefined) attrs['data-padding-bottom'] = props.paddingBottom;
  if (props.paddingLeft !== undefined) attrs['data-padding-left'] = props.paddingLeft;
  if (props.margin !== undefined) attrs['data-margin'] = props.margin;
  return attrs;
}

/**
 * Merge the CSS-Module scoped root class with any user-supplied `className`.
 * Uses a plain filter/join rather than pulling in `clsx` (ADR-006 R-3b — we
 * deliberately avoid new dependencies for such a trivial operation).
 */
function mergeClassName(userClassName: string | undefined): string {
  return userClassName ? `${classes.root} ${userClassName}` : classes.root;
}

/*
 * `React.forwardRef` erases the `<C extends ElementType>` generic, so the
 * inner function is typed against the *concrete* prop shape
 * (BoxOwnProps + a generic `component?: ElementType`). The public
 * `BoxComponent` cast below restores the polymorphic signature at the
 * export boundary. This is the same escape Mantine/Radix use for
 * polymorphic-forward-ref components.
 */
type BoxImplProps = BoxOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof BoxOwnProps> & {
    component?: ElementType;
  };

const BoxImpl = React.forwardRef<unknown, BoxImplProps>(function Box(props, ref) {
  const {
    component,
    className,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    margin,
    // Everything else (children, id, style, onClick, aria-*, …) flows through
    // untouched. This keeps Box transparent to host-element-specific APIs when
    // `component` is used to swap the element (e.g. `<Box component="a" href=…>`).
    ...rest
  } = props;

  const Element = (component ?? 'div') as React.ElementType;
  const dataAttrs = buildDataAttrs({
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    margin,
  });

  return (
    <Element
      ref={ref as React.Ref<HTMLElement>}
      className={mergeClassName(className)}
      {...dataAttrs}
      {...rest}
    />
  );
});

BoxImpl.displayName = 'Box';

/**
 * Public Box component, cast to the polymorphic signature so callers get full
 * `component`-aware prop inference (HTML attrs follow the element). The cast
 * is required because `React.forwardRef` erases the `<C>` generic.
 */
export const Box = BoxImpl as unknown as BoxComponent & { displayName?: string };
