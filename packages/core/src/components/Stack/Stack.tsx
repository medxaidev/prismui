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
import classes from './Stack.module.css';

export type StackStylesNames = 'root';

export type StackCssVariables = {
  root: '--stack-gap' | '--stack-align' | '--stack-justify';
};

export interface StackProps
  extends StylesApiProps<StackFactory>,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Controls `gap` CSS property, key of `theme.spacing` or any CSS value @default 'md' */
  gap?: string | number;

  /** Controls `align-items` CSS property @default 'stretch' */
  align?: React.CSSProperties['alignItems'];

  /** Controls `justify-content` CSS property @default 'flex-start' */
  justify?: React.CSSProperties['justifyContent'];

  /** Stack children */
  children?: React.ReactNode;

  /** Additional style */
  style?: React.CSSProperties;
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

const varsResolver = createVarsResolver<StackFactory>((_, { gap, align, justify }) => ({
  root: {
    '--stack-gap': typeof gap === 'number' ? `${gap}px` : gap,
    '--stack-align': align,
    '--stack-justify': justify,
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
    variant,
    children,
    ...others
  } = props;

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

  return (
    <div ref={ref} {...getStyles('root')} {...others}>
      {children}
    </div>
  );
});

Stack.classes = classes;
Stack.displayName = '@prismui/core/Stack';
