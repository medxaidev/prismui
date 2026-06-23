import * as React from 'react';
import type {
  ElementType,
  PolymorphicProps,
  PolymorphicRef,
} from '../../../core/polymorphic/types';
import {
  type ResponsiveValue,
  isResponsiveObject,
  resolveResponsiveCssVars,
  resolveResponsiveDataAttrs,
} from '../../../core/responsive';
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
 *     range; expanded to `repeat(<n>, minmax(0, 1fr))`), a `string`
 *     (any CSS `grid-template-columns` template, e.g. `"200px 1fr auto"`),
 *     or a `Partial<Record<BreakpointScale, number | string>>` responsive
 *     map (Stage-16 · ADR-008 v0.2 decision 2 c.2 · unlocked by Phase 1
 *     PoC 门槛-I).
 *     - Scalar form is delivered via the `--prismui-grid-template-columns`
 *       CSS custom property (`data-columns` presence marker activates
 *       the rule).
 *     - Responsive form is delivered as per-breakpoint custom properties
 *       (`--prismui-grid-template-columns-<bp>`) with `data-columns-responsive`
 *       marker; the CSS Module declares static `@media` blocks each reading
 *       the corresponding var with a `var()` fallback chain to the next
 *       lower tier (mobile-first cascade · RES-BP-3).
 *     This is the only Stage-15/16 primitive that injects CSS values via
 *     the `style` attribute; user `style` still merges on top.
 *   - **LY-GRID-3** — `gap` (default `'md'`) / `rowGap` / `columnGap`
 *     accept `SpacingScale` scalar OR responsive map. `rowGap` /
 *     `columnGap` beat `gap` per CSS cascade order at every breakpoint.
 *   - **LY-GRID-4** (Stage-16 amended-by) — the original v1 rejection of
 *     object-form `columns` is RESCINDED for the v1 locked enablement
 *     set per ADR-008 v0.2 decision 14. The DEV warn now only fires for
 *     non-numeric / non-string / non-plain-object values (e.g. arrays,
 *     functions, NaN), or for numbers outside the soft 1–12 integer range.
 *   - **LY-BOX-3** (reverse) — Grid does NOT accept `padding*` /
 *     `margin` props. Compose: `<Box padding="md"><Grid>…</Grid></Box>`.
 */
export interface GridOwnProps {
  /**
   * Column track template. Accepts:
   *   - `number` (1–12 soft range → `repeat(<n>, minmax(0, 1fr))`)
   *   - `string` (raw `grid-template-columns` template)
   *   - `Partial<Record<BreakpointScale, number | string>>` per-breakpoint map
   */
  columns?: ResponsiveValue<number | string>;
  /** Gap between tracks. `SpacingScale` scalar or responsive map. Default `'md'`. */
  gap?: ResponsiveValue<SpacingScale>;
  /** Row gap. Overrides `gap` on the row axis. Scalar or responsive map. */
  rowGap?: ResponsiveValue<SpacingScale>;
  /** Column gap. Overrides `gap` on the column axis. Scalar or responsive map. */
  columnGap?: ResponsiveValue<SpacingScale>;
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
 * Resolve a single `columns` value into a CSS `grid-template-columns`
 * declaration string.
 *   - number → `repeat(<n>, minmax(0, 1fr))`
 *   - string → passthrough
 */
function resolveColumnsTemplate(columns: number | string): string {
  if (typeof columns === 'number') {
    return `repeat(${columns}, minmax(0, 1fr))`;
  }
  return columns;
}

function isValidColumnsScalar(value: unknown): value is number | string {
  return typeof value === 'string' || typeof value === 'number';
}

const GridImpl = React.forwardRef<unknown, GridImplProps>(function Grid(props, ref) {
  const {
    component,
    className,
    style: userStyle,
    columns,
    gap,
    rowGap,
    columnGap,
    ...rest
  } = props;

  const Element = (component ?? 'div') as React.ElementType;

  // ── LY-GRID-4 (amended-by Stage-16) DEV warn for malformed columns ──────
  /* eslint-disable react-hooks/rules-of-hooks */
  if (process.env.NODE_ENV !== 'production') {
    const warnedRef = React.useRef<string | null>(null);
    let offense: string | null = null;

    if (columns !== undefined && columns !== null) {
      const responsive = isResponsiveObject(columns);
      if (!responsive && !isValidColumnsScalar(columns)) {
        offense =
          '<Grid> received an invalid `columns` value. Expected a number, ' +
          'a CSS `grid-template-columns` template string, or a ' +
          '`Partial<Record<BreakpointScale, number | string>>` responsive map.';
      } else if (!responsive && typeof columns === 'number') {
        if (!Number.isInteger(columns) || columns < 1 || columns > 12) {
          offense =
            `<Grid columns={${columns}}> is outside the soft 1–12 integer range ` +
            '(LY-GRID-2). The value will still flow into ' +
            '`repeat(<n>, minmax(0, 1fr))`, but consider passing a ' +
            '`grid-template-columns` string for arbitrary layouts.';
        }
      } else if (responsive) {
        // Validate per-breakpoint scalar entries; reject nested objects /
        // out-of-range numbers with the same rules as the scalar case.
        for (const key of Object.keys(columns) as string[]) {
          const v = (columns as Record<string, unknown>)[key];
          if (v === undefined) continue;
          if (!isValidColumnsScalar(v)) {
            offense =
              `<Grid columns={{ ${key}: … }}> contains a non-primitive entry. ` +
              'Each breakpoint value must be a number or template string.';
            break;
          }
          if (typeof v === 'number' && (!Number.isInteger(v) || v < 1 || v > 12)) {
            offense =
              `<Grid columns={{ ${key}: ${v} }}> is outside the soft 1–12 integer range.`;
            break;
          }
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

  // ── columns → inline CSS custom properties (open-ended value channel) ───
  // Two emission paths:
  //   - scalar  → `--prismui-grid-template-columns` + `data-columns` marker
  //   - object  → `--prismui-grid-template-columns-<bp>` + `data-columns-responsive`
  //               marker; CSS Module declares static `@media` blocks with
  //               `var()` fallback chains.
  // RES-RT-1 holds: the `style` attribute carries CSS VAR VALUES only;
  // CSS rule sets stay static at build time.
  const columnsResponsive = isResponsiveObject(columns);
  const columnsScalar = !columnsResponsive && isValidColumnsScalar(columns);
  const columnsVars: Record<string, string> =
    columnsScalar || columnsResponsive
      ? resolveResponsiveCssVars<number | string>(
          'prismui-grid-template-columns',
          columns as ResponsiveValue<number | string>,
          resolveColumnsTemplate,
        )
      : {};

  const style: React.CSSProperties = {
    ...userStyle,
    ...(columnsVars as React.CSSProperties),
  };

  // ── data-attrs ─────────────────────────────────────────────────────────
  // gap is ALWAYS emitted (LY-GRID-3 honest default); responsive object
  // form falls through to the scalar default if empty (matches Stack).
  // rowGap/columnGap are silent unless set (no scalar fallback).
  // data-columns / data-columns-responsive are presence-only markers that
  // activate the corresponding CSS rule blocks.
  const gapAttrs = resolveResponsiveDataAttrs<SpacingScale>('gap', gap);
  const dataAttrs: Record<string, string> = {
    ...(Object.keys(gapAttrs).length > 0
      ? gapAttrs
      : { 'data-gap': GRID_DEFAULT_GAP }),
    ...resolveResponsiveDataAttrs<SpacingScale>('row-gap', rowGap),
    ...resolveResponsiveDataAttrs<SpacingScale>('column-gap', columnGap),
  };
  if (columnsResponsive) {
    dataAttrs['data-columns-responsive'] = '';
  } else if (columnsScalar) {
    dataAttrs['data-columns'] = '';
  }

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
