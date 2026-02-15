import React from 'react';
import {
  factory,
  useProps,
} from '../../core/factory';
import type {
  Factory,
  StylesApiProps,
} from '../../core/factory';
import type { BoxProps, ElementProps } from '../Box';
import { Box } from '../Box';
import { useGridContext } from './Grid.context';
import classes from './Grid.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ColSpan = number | 'auto' | 'content';

export type GridColStylesNames = 'col';

export interface GridColProps
  extends BoxProps,
  StylesApiProps<GridColFactory>,
  ElementProps<'div'> {
  /** Column span @default 12 */
  span?: ColSpan;

  /** Column order */
  order?: number;

  /** Column offset — number of columns left empty before this column */
  offset?: number;
}

export type GridColFactory = Factory<{
  props: GridColProps;
  ref: HTMLDivElement;
  stylesNames: GridColStylesNames;
}>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getColumnFlexBasis(colSpan: ColSpan | undefined, columns: number): string | undefined {
  if (colSpan === 'content') return 'auto';
  if (colSpan === 'auto') return '0rem';
  return colSpan ? `${100 / (columns / colSpan)}%` : undefined;
}

function getColumnMaxWidth(
  colSpan: ColSpan | undefined,
  columns: number,
  grow: boolean | undefined,
): string | undefined {
  if (grow || colSpan === 'auto') return '100%';
  if (colSpan === 'content') return 'unset';
  return getColumnFlexBasis(colSpan, columns);
}

function getColumnFlexGrow(
  colSpan: ColSpan | undefined,
  grow: boolean | undefined,
): string | undefined {
  if (!colSpan) return undefined;
  return colSpan === 'auto' || grow ? '1' : 'auto';
}

function getColumnOffset(offset: number | undefined, columns: number): string | undefined {
  if (offset === 0) return '0';
  return offset ? `${100 / (columns / offset)}%` : undefined;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaultProps = {
  span: 12,
} satisfies Partial<GridColProps>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const GridCol = factory<GridColFactory>((_props, ref) => {
  const props = useProps('GridCol', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    vars,
    span,
    order,
    offset,
    ...others
  } = props;

  const ctx = useGridContext();

  const colVars: Record<string, string | undefined> = {
    '--col-order': order?.toString(),
    '--col-flex-grow': getColumnFlexGrow(span, ctx.grow),
    '--col-flex-basis': getColumnFlexBasis(span, ctx.columns),
    '--col-width': span === 'content' ? 'auto' : undefined,
    '--col-max-width': getColumnMaxWidth(span, ctx.columns, ctx.grow),
    '--col-offset': getColumnOffset(offset, ctx.columns),
  };

  // Filter out undefined values
  const colStyle: React.CSSProperties = {};
  for (const [key, value] of Object.entries(colVars)) {
    if (value !== undefined) {
      (colStyle as Record<string, string>)[key] = value;
    }
  }

  // Merge with user style
  const mergedStyle = typeof style === 'object' && style !== null
    ? { ...colStyle, ...style }
    : colStyle;

  return (
    <Box
      ref={ref}
      className={[classes.col, className].filter(Boolean).join(' ')}
      style={mergedStyle as any}
      {...others}
    />
  );
});

GridCol.classes = classes;
GridCol.displayName = '@prismui/core/Grid.Col';
