import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import type { SpacingScale } from '../../../core/theme/types/token-scale.types';
import classes from './Grid.module.css';

/**
 * `<Grid>` — Stage-15 Layout primitive · CSS Grid container.
 *
 * Contracts (see `@/devdocs/stage/STAGE-15-OVERVIEW.md` §3.5 + ADR-006):
 *
 *   - **LY-GRID-1** — `display: grid` semantic lock; consumes native CSS
 *     Grid (no JS row/column calculation).
 *   - **LY-GRID-2** — `columns` accepts either a `number` (1-12, soft
 *     range; expanded to `repeat(<n>, minmax(0, 1fr))`) or a `string`
 *     (any CSS `grid-template-columns` template, e.g. `"200px 1fr auto"`).
 *     Delivered via the `--prismui-grid-template-columns` CSS custom
 *     property on the `style` attribute — the only Stage-15 primitive
 *     that does this (value space is open-ended, attribute selectors
 *     cannot enumerate it). Prismui's own `style` injection is limited
 *     to this one custom property; user `style` still merges on top.
 *   - **LY-GRID-3** — `gap` (default `'md'`) / `rowGap` / `columnGap`
 *     accept `SpacingScale`. `rowGap` / `columnGap` beat `gap` per CSS
 *     cascade order.
 *   - **LY-GRID-4** — object-form responsive values (`columns={{ base: 1,
 *     md: 2 }}`) are rejected at the TS level AND emit a one-time
 *     DEV `console.warn` if forced through via `as unknown`. v1.x
 *     backlog trigger: ≥ 3 real business scenarios + SSR hydration
 *     scheme stable.
 *   - **LY-BOX-3** (reverse) — Grid does NOT accept `padding*` /
 *     `margin` props. Compose: `<Box padding="md"><Grid>…</Grid></Box>`.
 */
export interface GridOwnProps {
  /**
   * Number of equal-width columns (1-12 soft range · expanded to
   * `repeat(<n>, minmax(0, 1fr))`), OR a raw `grid-template-columns`
   * template string (e.g. `"200px 1fr auto"`).
   */
  columns?: number | string;
  /** Gap between tracks. `SpacingScale` key. Default `'md'`. */
  gap?: SpacingScale;
  /** Row gap. Overrides `gap` on the row axis when set. */
  rowGap?: SpacingScale;
  /** Column gap. Overrides `gap` on the column axis when set. */
  columnGap?: SpacingScale;
}

/** Full Grid prop type (polymorphic, defaults to `'div'`). */
export type GridProps<C extends ElementType = 'div'> = PolymorphicProps<C, GridOwnProps>;

/**
 * Polymorphic Grid component type — recovers the `<C>` generic that
 * `React.forwardRef` erases.
 */
export type GridComponent = <C extends ElementType = 'div'>(
  props: GridProps<C> & { ref?: PolymorphicRef<C> },
) => React.ReactElement | null;

// ── impl ────────────────────────────────────────────────────────────────────

export const GRID_DEFAULT_GAP: SpacingScale = 'md';

type GridImplProps = GridOwnProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof GridOwnProps> & {
    component?: ElementType;
  };

function mergeClassName(userClassName: string | undefined): string {
  return userClassName ? `${classes.root} ${userClassName}` : classes.root;
}

/**
 * Resolve `columns` into a CSS `grid-template-columns` value.
 *   - number → `repeat(<n>, minmax(0, 1fr))`
 *   - string → passthrough
 *
 * Invalid numbers (NaN / non-integer / < 1 / > 12) still produce a
 * CSS value (the browser will reject invalid values per the grammar),
 * but Grid.tsx emits a DEV warn before reaching this point.
 */
function resolveColumnsTemplate(columns: number | string): string {
  if (typeof columns === 'number') {
    return `repeat(${columns}, minmax(0, 1fr))`;
  }
  return columns;
}

const GridImpl = React.forwardRef<unknown, GridImplProps>(function Grid(props, ref) {
  const {
    component,
    className,
    style: userStyle,
    columns,
    gap = GRID_DEFAULT_GAP,
    rowGap,
    columnGap,
    ...rest
  } = props;

  const Element = (component ?? 'div') as React.ElementType;

  // ── LY-GRID-4 DEV rejection of responsive / invalid column values ──────
  /* eslint-disable react-hooks/rules-of-hooks */
  if (process.env.NODE_ENV !== 'production') {
    const warnedRef = React.useRef<string | null>(null);
    let offense: string | null = null;

    if (columns !== undefined && columns !== null) {
      // Object / array forms mean the user is attempting a responsive
      // value ({ base: 1, md: 2 }) or a typo — both rejected in v1.
      if (typeof columns === 'object') {
        offense =
          '<Grid> received a non-primitive `columns` value. Responsive ' +
          'object values (`{ base: 1, md: 2 }`) are OUT OF SCOPE in v1 ' +
          '(LY-GRID-4 / LY-CORE-6). Use a single `number` or ' +
          '`grid-template-columns` string instead.';
      } else if (typeof columns === 'number') {
        if (!Number.isInteger(columns) || columns < 1 || columns > 12) {
          offense =
            `<Grid columns={${columns}}> is outside the soft 1–12 integer range ` +
            '(LY-GRID-2). The value will still flow into ' +
            '`repeat(<n>, minmax(0, 1fr))`, but consider passing a ' +
            '`grid-template-columns` string for arbitrary layouts.';
        }
      }
    }

    if (offense && warnedRef.current !== offense) {
      warnedRef.current = offense;
      // eslint-disable-next-line no-console
      console.warn(`[PrismUI] ${offense}`);
    }
  }
  /* eslint-enable react-hooks/rules-of-hooks */

  // ── columns → CSS custom property ──────────────────────────────────────
  // The ONLY place a Stage-15 primitive injects a CSS value via the
  // `style` attribute. Justified because the value space is open-ended
  // (any CSS `grid-template-columns` template) and cannot be enumerated
  // by data-attr selectors. The rule in Grid.module.css reads this
  // custom property, keeping the declaration of *what* to style in CSS
  // (LY-CORE-1 spirit: "CSS var is the styling channel").
  const style: React.CSSProperties =
    columns !== undefined && typeof columns !== 'object'
      ? ({
          ...userStyle,
          // Cast: React.CSSProperties narrows known properties; custom
          // properties (starting with `--`) are perfectly valid but
          // require a cast.
          ['--prismui-grid-template-columns' as string]: resolveColumnsTemplate(
            columns as number | string,
          ),
        } as React.CSSProperties)
      : (userStyle ?? {});

  // ── data-attrs ─────────────────────────────────────────────────────────
  // data-columns is a valueless marker (presence-only) that activates the
  // custom-property rule in CSS — same boolean-attribute idiom as
  // Inline's `data-wrap`.
  const dataAttrs: Record<string, string> = { 'data-gap': gap };
  if (columns !== undefined && typeof columns !== 'object') {
    dataAttrs['data-columns'] = '';
  }
  if (rowGap !== undefined) dataAttrs['data-row-gap'] = rowGap;
  if (columnGap !== undefined) dataAttrs['data-column-gap'] = columnGap;

  return (
    <Element
      ref={ref as React.Ref<HTMLElement>}
      className={mergeClassName(className)}
      style={Object.keys(style).length > 0 ? style : undefined}
      {...dataAttrs}
      {...rest}
    />
  );
});

GridImpl.displayName = 'Grid';

/**
 * Public Grid — cast restores the polymorphic signature so callers get
 * full `component`-aware prop inference.
 */
export const Grid = GridImpl as unknown as GridComponent & { displayName?: string };
