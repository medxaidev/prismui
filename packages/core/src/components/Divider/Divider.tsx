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
import { getSize } from '../../core/theme/get-size';
import { getThemeColor } from '../../core/theme/get-theme-color';
import classes from './Divider.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DividerStylesNames = 'root' | 'label';

export type DividerVariant = 'fullWidth' | 'inset' | 'middle';

export type DividerCssVariables = {
  root: '--divider-color' | '--divider-border-style' | '--divider-size';
};

export interface DividerProps
  extends BoxProps,
  StylesApiProps<DividerFactory>,
  ElementProps<'div'> {
  /**
   * Key of `theme.colorFamilies`, semantic color name, or any valid CSS color.
   * @default `rgba(var(--prismui-color-gray-500Channel) / 0.2)`
   */
  color?: string;

  /**
   * Border width. Named size token or number (px) or CSS string.
   * @default 'xs' (1px)
   */
  size?: string | number;

  /**
   * Label displayed on the divider line.
   * Only visible when `orientation` is `'horizontal'`.
   */
  label?: React.ReactNode;

  /**
   * Controls label alignment.
   * @default 'center'
   */
  labelPosition?: 'left' | 'center' | 'right';

  /**
   * Controls orientation.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Border style.
   * @default 'solid'
   */
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  /**
   * MUI pattern: when `true`, the divider will have the correct height
   * when used in a flex container (sets `align-self: stretch`).
   * @default false
   */
  flexItem?: boolean;

  /**
   * Text alignment for the label content (MUI pattern).
   * Maps to `labelPosition` internally. If both are set, `labelPosition` wins.
   * @default 'center'
   */
  textAlign?: 'left' | 'center' | 'right';
}

export type DividerFactory = Factory<{
  props: DividerProps;
  ref: HTMLDivElement;
  stylesNames: DividerStylesNames;
  vars: DividerCssVariables;
  variant: DividerVariant;
}>;

// ---------------------------------------------------------------------------
// Defaults & varsResolver
// ---------------------------------------------------------------------------

const defaultProps = {
  orientation: 'horizontal',
  borderStyle: 'solid',
} satisfies Partial<DividerProps>;

const varsResolver = createVarsResolver<DividerFactory>(
  (theme, { color, borderStyle, size }) => ({
    root: {
      '--divider-color': color ? getThemeColor(color, theme) : undefined,
      '--divider-border-style': borderStyle ?? undefined,
      '--divider-size': getSize(size, 'divider-size'),
    },
  }),
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Divider = factory<DividerFactory>((_props, ref) => {
  const props = useProps('Divider', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    color,
    orientation,
    label,
    labelPosition,
    borderStyle,
    size,
    flexItem,
    textAlign,
    variant,
    mod,
    ...others
  } = props;

  const getStyles = useStyles<DividerFactory>({
    name: 'Divider',
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

  // Resolve label position: labelPosition takes priority over textAlign
  const resolvedLabelPosition = labelPosition ?? textAlign ?? 'center';

  return (
    <Box
      ref={ref}
      mod={[
        {
          orientation,
          'with-label': !!label && orientation === 'horizontal',
          'flex-item': flexItem,
          variant,
        },
        mod,
      ]}
      {...getStyles('root')}
      {...others}
      role="separator"
      aria-orientation={orientation}
    >
      {label && orientation === 'horizontal' && (
        <Box
          component="span"
          mod={{ position: resolvedLabelPosition }}
          {...getStyles('label')}
        >
          {label}
        </Box>
      )}
    </Box>
  );
});

Divider.classes = classes;
Divider.displayName = '@prismui/core/Divider';
