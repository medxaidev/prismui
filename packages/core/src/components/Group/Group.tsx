import React, { Children, ReactElement, ReactNode } from 'react';
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
import classes from './Group.module.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function filterFalsyChildren(children: ReactNode) {
  return (Children.toArray(children) as ReactElement[]).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GroupStylesNames = 'root';

export type GroupCssVariables = {
  root:
  | '--group-gap'
  | '--group-align'
  | '--group-justify'
  | '--group-wrap'
  | '--group-child-width';
};

export interface GroupProps
  extends BoxProps,
  StylesApiProps<GroupFactory>,
  ElementProps<'div'> {
  /** Controls `justify-content` CSS property @default `'flex-start'` */
  justify?: React.CSSProperties['justifyContent'];

  /** Controls `align-items` CSS property @default `'center'` */
  align?: React.CSSProperties['alignItems'];

  /** Controls `flex-wrap` CSS property @default `'wrap'` */
  wrap?: React.CSSProperties['flexWrap'];

  /** Key of `theme.spacing` or any valid CSS value for `gap`, numbers are converted to rem @default `'md'` */
  gap?: string | number;

  /** Determines whether each child element should have `flex-grow: 1` style @default `false` */
  grow?: boolean;

  /** Determines whether children should take only dedicated amount of space (`max-width` style is set based on the number of children) @default `true` */
  preventGrowOverflow?: boolean;
}

export type GroupFactory = Factory<{
  props: GroupProps;
  ref: HTMLDivElement;
  stylesNames: GroupStylesNames;
  vars: GroupCssVariables;
}>;

// ---------------------------------------------------------------------------
// Defaults & varsResolver
// ---------------------------------------------------------------------------

const defaultProps = {
  preventGrowOverflow: true,
  gap: 'md',
  align: 'center',
  justify: 'flex-start',
  wrap: 'wrap',
} satisfies Partial<GroupProps>;

const varsResolver = createVarsResolver<GroupFactory>(
  (_, { grow, preventGrowOverflow, gap, align, justify, wrap }) => ({
    root: {
      '--group-child-width': undefined, // set dynamically below
      '--group-gap': getSpacing(gap),
      '--group-align': align,
      '--group-justify': justify,
      '--group-wrap': wrap,
    },
  }),
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Group = factory<GroupFactory>((_props, ref) => {
  const props = useProps('Group', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    children,
    gap,
    align,
    justify,
    wrap,
    grow,
    preventGrowOverflow,
    vars,
    variant,
    mod,
    ...others
  } = props;

  const filteredChildren = filterFalsyChildren(children);
  const childrenCount = filteredChildren.length;
  const resolvedGap = getSpacing(gap ?? 'md') ?? 'var(--prismui-spacing-md)';
  const childWidth = `calc(${100 / childrenCount
    }% - (${resolvedGap} - ${resolvedGap} / ${childrenCount}))`;

  // Merge --group-child-width into the style prop before passing to useStyles
  const childWidthStyle =
    grow && preventGrowOverflow
      ? { '--group-child-width': childWidth }
      : undefined;

  const combinedStyle = childWidthStyle
    ? typeof style === 'object' && style !== null
      ? { ...style, ...childWidthStyle }
      : childWidthStyle
    : style;

  const getStyles = useStyles<GroupFactory>({
    name: 'Group',
    props,
    className,
    style: combinedStyle as typeof style,
    classes,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  return (
    <Box
      {...getStyles('root')}
      ref={ref}
      variant={variant}
      mod={[{ grow }, mod]}
      {...others}
    >
      {filteredChildren}
    </Box>
  );
});

Group.classes = classes;
Group.displayName = '@prismui/core/Group';
