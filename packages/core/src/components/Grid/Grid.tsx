import React from 'react';
import {
  factory,
  useProps,
  useStyles,
  createVarsResolver,
} from '../../core/factory';
import type {
  Factory,
  StylesApiProps,
} from '../../core/factory';
import type { BoxProps, ElementProps } from '../Box';
import { Box } from '../Box';
import { getSpacing } from '../../core/theme/get-spacing';
import { GridProvider } from './Grid.context';
import { GridCol } from './GridCol';
import classes from './Grid.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GridStylesNames = 'root' | 'inner' | 'col';

export type GridCssVariables = {
  root: '--grid-gutter' | '--grid-justify' | '--grid-align' | '--grid-overflow';
};

export interface GridProps
  extends BoxProps,
  StylesApiProps<GridFactory>,
  ElementProps<'div'> {
  /** Gutter between columns, key of `theme.spacing` or any valid CSS value @default `'md'` */
  gutter?: string | number;

  /** If set, columns in the last row expand to fill all available space @default `false` */
  grow?: boolean;

  /** Sets `justify-content` @default `'flex-start'` */
  justify?: React.CSSProperties['justifyContent'];

  /** Sets `align-items` @default `'stretch'` */
  align?: React.CSSProperties['alignItems'];

  /** Number of columns in each row @default `12` */
  columns?: number;

  /** Sets `overflow` CSS property on the root element @default `'visible'` */
  overflow?: React.CSSProperties['overflow'];
}

export type GridFactory = Factory<{
  props: GridProps;
  ref: HTMLDivElement;
  stylesNames: GridStylesNames;
  vars: GridCssVariables;
  staticComponents: {
    Col: typeof GridCol;
  };
}>;

// ---------------------------------------------------------------------------
// Defaults & varsResolver
// ---------------------------------------------------------------------------

const defaultProps = {
  gutter: 'md',
  grow: false,
  columns: 12,
} satisfies Partial<GridProps>;

const varsResolver = createVarsResolver<GridFactory>(
  (_, { gutter, justify, align, overflow }) => ({
    root: {
      '--grid-gutter': getSpacing(gutter),
      '--grid-justify': justify,
      '--grid-align': align,
      '--grid-overflow': overflow,
    },
  }),
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Grid = factory<GridFactory>((_props, ref) => {
  const props = useProps('Grid', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    grow,
    gutter,
    columns,
    align,
    justify,
    children,
    overflow,
    mod,
    ...others
  } = props;

  const getStyles = useStyles<GridFactory>({
    name: 'Grid',
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  return (
    <GridProvider value={{ columns: columns ?? 12, grow, gutter }}>
      <Box ref={ref} {...getStyles('root')} {...others}>
        <div {...getStyles('inner')}>{children}</div>
      </Box>
    </GridProvider>
  );
});

Grid.classes = classes;
Grid.displayName = '@prismui/core/Grid';
Grid.Col = GridCol;
