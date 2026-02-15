import React from 'react';
import {
  polymorphicFactory,
  useProps,
  useStyles,
  createVarsResolver,
} from '../../core/factory';
import type {
  PolymorphicFactory,
  StylesApiProps,
} from '../../core/factory';
import type { BoxProps, ElementProps } from '../Box';
import { Text } from '../Text';
import type { TextVariant, TextGradient } from '../Text';
import { getThemeColor } from '../../core/theme/get-theme-color';
import classes from './Anchor.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnchorStylesNames = 'root';

export type AnchorCssVariables = {
  root: '--anchor-color' | '--anchor-hover-color';
};

export interface AnchorProps
  extends BoxProps,
  StylesApiProps<AnchorFactory>,
  ElementProps<'a', 'color'> {
  /**
   * Typography variant.
   * @default 'body1'
   */
  variant?: TextVariant;

  /**
   * Link color. Supports theme color keys, palette tokens, or CSS colors.
   * @default 'primary'
   */
  color?: string;

  /**
   * Controls when text-decoration underline is applied.
   * @default 'hover'
   */
  underline?: 'always' | 'hover' | 'never';

  /**
   * When true, adds `target="_blank"` and `rel="noopener noreferrer"`.
   * @default false
   */
  external?: boolean;

  /** Text alignment. */
  align?: React.CSSProperties['textAlign'];

  /** Truncate text with ellipsis. */
  truncate?: boolean | 'end' | 'start';

  /** Number of lines after which text will be truncated. */
  lineClamp?: number;

  /** Sets `line-height: 1` for vertical centering. */
  inline?: boolean;

  /** Inherit font properties from parent. */
  inherit?: boolean;

  /** Add `margin-bottom: 0.35em`. */
  gutterBottom?: boolean;

  /** CSS `text-transform` property. */
  textTransform?: React.CSSProperties['textTransform'];

  /** Gradient text configuration. */
  gradient?: TextGradient;
}

export type AnchorFactory = PolymorphicFactory<{
  props: AnchorProps;
  defaultComponent: 'a';
  defaultRef: HTMLAnchorElement;
  stylesNames: AnchorStylesNames;
  vars: AnchorCssVariables;
}>;

// ---------------------------------------------------------------------------
// Defaults & varsResolver
// ---------------------------------------------------------------------------

const defaultProps = {
  underline: 'hover',
  color: 'primary',
} satisfies Partial<AnchorProps>;

const varsResolver = createVarsResolver<AnchorFactory>(
  (theme, { color }) => ({
    root: {
      '--anchor-color': color ? getThemeColor(color, theme) : undefined,
      '--anchor-hover-color': color
        ? getThemeColor(color.includes('.') ? color : `${color}.dark`, theme)
        : undefined,
    },
  }),
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Anchor = polymorphicFactory<AnchorFactory>((_props, ref) => {
  const props = useProps('Anchor', defaultProps, _props);
  const {
    underline,
    external,
    color,
    variant,
    align,
    truncate,
    lineClamp,
    inline,
    inherit,
    gutterBottom,
    textTransform,
    gradient,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    mod,
    ...others
  } = props;

  const getStyles = useStyles<AnchorFactory>({
    name: 'Anchor',
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

  const externalProps = external
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <Text
      {...(others as any)}
      component="a"
      ref={ref as any}
      variant={variant}
      color={color}
      align={align}
      truncate={truncate}
      lineClamp={lineClamp}
      inline={inline}
      inherit={inherit}
      gutterBottom={gutterBottom}
      textTransform={textTransform}
      gradient={gradient}
      {...getStyles('root')}
      mod={[{ underline }, mod]}
      {...externalProps}
    />
  );
});

Anchor.classes = classes;
Anchor.displayName = '@prismui/core/Anchor';
