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
import classes from './Container.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ContainerStylesNames = 'root';

export type ContainerCssVariables = {
  root: '--container-size';
};

export interface ContainerProps
  extends BoxProps,
  StylesApiProps<ContainerFactory>,
  ElementProps<'div'> {
  /**
   * `max-width` of the container. Named size token, number (px→rem), or CSS string.
   * Ignored when `fluid` is set.
   * @default 'lg'
   */
  size?: string | number;

  /**
   * If set, the container takes 100% width and `size` prop is ignored.
   * @default false
   */
  fluid?: boolean;

  /**
   * MUI pattern: if true, left and right padding is removed.
   * @default false
   */
  disableGutters?: boolean;

  /**
   * MUI pattern: if true, max-width is set as both max-width AND width
   * (the container does not grow beyond the size, useful for fixed layouts).
   * @default false
   */
  fixed?: boolean;
}

export type ContainerFactory = Factory<{
  props: ContainerProps;
  ref: HTMLDivElement;
  stylesNames: ContainerStylesNames;
  vars: ContainerCssVariables;
}>;

// ---------------------------------------------------------------------------
// Defaults & varsResolver
// ---------------------------------------------------------------------------

const varsResolver = createVarsResolver<ContainerFactory>(
  (_, { size, fluid }) => ({
    root: {
      '--container-size': fluid ? undefined : getSize(size, 'container-size'),
    },
  }),
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Container = factory<ContainerFactory>((_props, ref) => {
  const props = useProps('Container', null, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    fluid,
    disableGutters,
    fixed,
    mod,
    ...others
  } = props;

  const getStyles = useStyles<ContainerFactory>({
    name: 'Container',
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
    <Box
      ref={ref}
      mod={[
        {
          fluid,
          'disable-gutters': disableGutters,
          fixed,
        },
        mod,
      ]}
      {...getStyles('root')}
      {...others}
    />
  );
});

Container.classes = classes;
Container.displayName = '@prismui/core/Container';
