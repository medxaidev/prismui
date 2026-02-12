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
import { Box } from '../Box';
import type { BoxProps, ElementProps } from '../Box';
import { getRadius } from '../../core/theme/get-radius';
import { getShadow } from '../../core/theme/get-shadow';
import type { PrismuiRadius, PrismuiShadow } from '../../core/theme/types';
import classes from './Paper.module.css';

export type PaperStylesNames = 'root';

export type PaperCssVariables = {
  root: '--paper-radius' | '--paper-shadow';
};

export interface PaperProps
  extends BoxProps,
  StylesApiProps<PaperFactory>,
  ElementProps<'div'> {
  /** Key of `theme.shadows` or any valid CSS value to set `box-shadow` */
  shadow?: PrismuiShadow;

  /** Key of `theme.radius` or any valid CSS value to set border-radius, numbers are converted to rem @default `theme.defaultRadius` */
  radius?: PrismuiRadius;

  /** Adds border to the root element via `data-with-border` attribute @default false */
  withBorder?: boolean;
}

export type PaperFactory = Factory<{
  props: PaperProps;
  ref: HTMLDivElement;
  stylesNames: PaperStylesNames;
  vars: PaperCssVariables;
}>;

const defaultProps = {} satisfies Partial<PaperProps>;

const varsResolver = createVarsResolver<PaperFactory>((_, { radius, shadow }) => ({
  root: {
    '--paper-radius': radius === undefined ? undefined : getRadius(radius),
    '--paper-shadow': getShadow(shadow),
  },
}));

export const Paper = factory<PaperFactory>((_props, ref) => {
  const props = useProps('Paper', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    withBorder,
    vars,
    radius,
    shadow,
    variant,
    mod,
    ...others
  } = props;

  const getStyles = useStyles<PaperFactory>({
    name: 'Paper',
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
    <Box
      ref={ref}
      mod={[{ 'data-with-border': withBorder }, mod]}
      {...getStyles('root')}
      variant={variant}
      {...others}
    />
  );
});

Paper.classes = classes;
Paper.displayName = '@prismui/core/Paper';
