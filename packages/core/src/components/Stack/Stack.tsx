import { Children, type ReactNode } from 'react';
import type * as React from 'react';
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
import type { PrismuiResponsiveValue } from '../../core/theme/types';
import { Box } from '../Box';
import type { BoxProps, ElementProps } from '../Box';
import { cx } from '../../core/styles-api/use-styles/get-class-name/get-class-name';
import { useTheme } from '../../core/PrismuiProvider/prismui-theme-context';
import { useStyleRegistry } from '../../core/style-engine';
import { resolveResponsiveVars } from '../../core/system/resolve-responsive-vars/resolve-responsive-vars';
import { spacingResolver } from '../../core/system/resolvers/spacing-resolver/spacing-resolver';
import { identityResolver } from '../../core/system/resolvers/identity-resolver/identity-resolver';
import classes from './Stack.module.css';

export type StackStylesNames = 'root';

export type StackCssVariables = {
  root: '--stack-gap' | '--stack-align' | '--stack-justify';
};

export interface StackProps extends BoxProps, StylesApiProps<StackFactory>, ElementProps<'div'> {
  /**
   * Controls `gap` CSS property.
   * Accepts theme spacing key (`'md'`), number (multiplied by `spacingUnit`),
   * CSS string (`'3px'`), or responsive object (`{ base: 'sm', md: 'lg' }`).
   * @default 'md'
   */
  gap?: PrismuiResponsiveValue<string | number>;

  /**
   * Controls `align-items` CSS property.
   * Supports responsive values: `{ base: 'stretch', md: 'center' }`.
   * @default 'stretch'
   */
  align?: PrismuiResponsiveValue<React.CSSProperties['alignItems']>;

  /**
   * Controls `justify-content` CSS property.
   * Supports responsive values: `{ base: 'flex-start', md: 'center' }`.
   * @default 'flex-start'
   */
  justify?: PrismuiResponsiveValue<React.CSSProperties['justifyContent']>;

  /**
   * Element inserted between each child.
   * When provided, `gap` is still applied between children and dividers.
   * Works well with `<Divider />` or any `ReactNode`.
   *
   * @example
   * ```tsx
   * <Stack divider={<Divider />}>
   *   <div>Item 1</div>
   *   <div>Item 2</div>
   * </Stack>
   * ```
   */
  divider?: ReactNode;
}

export type StackFactory = Factory<{
  props: StackProps;
  ref: HTMLDivElement;
  stylesNames: StackStylesNames;
  vars: StackCssVariables;
}>;

const defaultProps = {
  gap: 'md',
  align: 'stretch',
  justify: 'flex-start',
} satisfies Partial<StackProps>;

const varsResolver = createVarsResolver<StackFactory>(() => ({
  root: {
    '--stack-gap': undefined,
    '--stack-align': undefined,
    '--stack-justify': undefined,
  },
}));

export const Stack = factory<StackFactory>((_props, ref) => {
  const props = useProps('Stack', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    align,
    justify,
    gap,
    divider,
    variant,
    children,
    ...others
  } = props;

  const theme = useTheme();
  const registry = useStyleRegistry() ?? undefined;

  const responsive = resolveResponsiveVars({
    theme,
    registry,
    vars: [
      { cssVar: '--stack-gap', value: gap, resolver: spacingResolver },
      { cssVar: '--stack-align', value: align, resolver: identityResolver },
      { cssVar: '--stack-justify', value: justify, resolver: identityResolver },
    ],
  });

  const getStyles = useStyles<StackFactory>({
    name: 'Stack',
    props,
    classes,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  const rootStyles = getStyles('root');

  const content = divider ? interleaveChildren(children, divider) : children;

  return (
    <Box
      ref={ref}
      {...rootStyles}
      className={cx(rootStyles.className, responsive.className)}
      style={{ ...rootStyles.style, ...responsive.style }}
      variant={variant}
      {...others}
    >
      {content}
    </Box>
  );
});

Stack.classes = classes;
Stack.displayName = '@prismui/core/Stack';

/**
 * Interleaves divider elements between children.
 * Filters out null/undefined/boolean children (same as React rendering).
 */
function interleaveChildren(children: ReactNode, divider: ReactNode): ReactNode[] {
  const childArray = Children.toArray(children);
  if (childArray.length <= 1) return childArray;

  const result: ReactNode[] = [childArray[0]];
  for (let i = 1; i < childArray.length; i++) {
    result.push(
      <span key={`divider-${i}`} className="prismui-Stack-divider">
        {divider}
      </span>,
      childArray[i],
    );
  }
  return result;
}
