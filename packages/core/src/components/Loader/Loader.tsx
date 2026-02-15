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
import { getSize } from '../../core/theme/get-size';
import { getThemeColor } from '../../core/theme/get-theme-color';
import classes from './Loader.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LoaderStylesNames = 'root' | 'spinner' | 'circle';

export type LoaderCssVariables = {
  root: '--loader-size' | '--loader-color';
};

export interface LoaderProps
  extends BoxProps,
  StylesApiProps<LoaderFactory>,
  ElementProps<'span'> {
  /**
   * Controls `width` and `height` of the loader.
   * Named size token (xs–xl), number (px→rem), or CSS string.
   * @default 'md'
   */
  size?: string | number;

  /**
   * Loader color. Theme color key or any valid CSS color.
   * @default 'currentColor'
   */
  color?: string;
}

export type LoaderFactory = Factory<{
  props: LoaderProps;
  ref: HTMLSpanElement;
  stylesNames: LoaderStylesNames;
  vars: LoaderCssVariables;
}>;

// ---------------------------------------------------------------------------
// Defaults & varsResolver
// ---------------------------------------------------------------------------

const varsResolver = createVarsResolver<LoaderFactory>(
  (theme, { size, color }) => ({
    root: {
      '--loader-size': getSize(size, 'loader-size'),
      '--loader-color': color ? getThemeColor(color, theme) : undefined,
    },
  }),
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Loader = factory<LoaderFactory>((_props, ref) => {
  const props = useProps('Loader', null, _props);
  const {
    size,
    color,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    variant,
    mod,
    ...others
  } = props;

  const getStyles = useStyles<LoaderFactory>({
    name: 'Loader',
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
      component="span"
      ref={ref}
      role="status"
      aria-label="Loading"
      {...getStyles('root')}
      mod={mod}
      {...others}
    >
      <svg
        viewBox="22 22 44 44"
        {...getStyles('spinner')}
      >
        <circle
          {...getStyles('circle')}
        />
      </svg>
    </Box>
  );
});

Loader.classes = classes;
Loader.displayName = '@prismui/core/Loader';
