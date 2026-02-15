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
import { Box } from '../Box';
import { getThemeColor } from '../../core/theme/get-theme-color';
import classes from './Text.module.css';

// ---------------------------------------------------------------------------
// Typography variant definitions (ADR-010)
// ---------------------------------------------------------------------------

export type TextVariant =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'subtitle1' | 'subtitle2'
  | 'body1' | 'body2'
  | 'caption' | 'overline';

type TextTruncate = 'end' | 'start' | boolean;

interface TypographyConfig {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  element: string;
}

const TYPOGRAPHY_MAP: Record<TextVariant, TypographyConfig> = {
  h1: { fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.25', element: 'h1' },
  h2: { fontSize: '2rem', fontWeight: '800', lineHeight: '1.33', element: 'h2' },
  h3: { fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.5', element: 'h3' },
  h4: { fontSize: '1.25rem', fontWeight: '700', lineHeight: '1.5', element: 'h4' },
  h5: { fontSize: '1.125rem', fontWeight: '700', lineHeight: '1.5', element: 'h5' },
  h6: { fontSize: '1.0625rem', fontWeight: '600', lineHeight: '1.56', element: 'h6' },
  subtitle1: { fontSize: '1rem', fontWeight: '600', lineHeight: '1.5', element: 'p' },
  subtitle2: { fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.57', element: 'p' },
  body1: { fontSize: '1rem', fontWeight: '400', lineHeight: '1.5', element: 'p' },
  body2: { fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.57', element: 'p' },
  caption: { fontSize: '0.75rem', fontWeight: '400', lineHeight: '1.5', element: 'span' },
  overline: { fontSize: '0.75rem', fontWeight: '700', lineHeight: '1.5', element: 'span' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTextTruncate(truncate: TextTruncate | undefined) {
  if (truncate === 'start') return 'start';
  if (truncate === 'end' || truncate) return 'end';
  return undefined;
}

function getGradientCss(
  gradient: TextGradient | undefined,
): string | undefined {
  if (!gradient) return undefined;
  const { from, to, deg = 180 } = gradient;
  return `linear-gradient(${deg}deg, ${from} 0%, ${to} 100%)`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TextGradient {
  from: string;
  to: string;
  deg?: number;
}

export type TextStylesNames = 'root';

export type TextCssVariables = {
  root:
  | '--text-fz'
  | '--text-fw'
  | '--text-lh'
  | '--text-color'
  | '--text-align'
  | '--text-transform'
  | '--text-line-clamp'
  | '--text-gradient';
};

export interface TextProps
  extends BoxProps,
  StylesApiProps<TextFactory>,
  ElementProps<'p', 'color'> {
  /**
   * Typography variant controlling font-size, font-weight, line-height,
   * and the default rendered HTML element.
   * @default 'body1'
   */
  variant?: TextVariant;

  /**
   * Text color. Supports theme color keys ('primary', 'error'),
   * palette tokens ('text.primary', 'text.secondary'),
   * or any CSS color string.
   */
  color?: string;

  /** Text alignment. */
  align?: React.CSSProperties['textAlign'];

  /**
   * Truncate text with ellipsis.
   * - `true` or `'end'` — truncate at end
   * - `'start'` — truncate at start (RTL trick)
   */
  truncate?: TextTruncate;

  /** Number of lines after which text will be truncated. */
  lineClamp?: number;

  /** Sets `line-height: 1` for vertical centering. @default false */
  inline?: boolean;

  /** Inherit font properties from parent. @default false */
  inherit?: boolean;

  /** Add `margin-bottom: 0.35em`. @default false */
  gutterBottom?: boolean;

  /** CSS `text-transform` property. */
  textTransform?: React.CSSProperties['textTransform'];

  /** Gradient text configuration. */
  gradient?: TextGradient;

  /** Shorthand for `component="span"`. @default false */
  span?: boolean;
}

export type TextFactory = PolymorphicFactory<{
  props: TextProps;
  defaultComponent: 'p';
  defaultRef: HTMLParagraphElement;
  stylesNames: TextStylesNames;
  vars: TextCssVariables;
  variant: TextVariant;
}>;

// ---------------------------------------------------------------------------
// Defaults & varsResolver
// ---------------------------------------------------------------------------

const defaultProps = {
  variant: 'body1',
  inherit: false,
} satisfies Partial<TextProps>;

const varsResolver = createVarsResolver<TextFactory>(
  (theme, { variant, color, align, textTransform, lineClamp, gradient }) => {
    const config = variant ? TYPOGRAPHY_MAP[variant] : undefined;
    return {
      root: {
        '--text-fz': config?.fontSize,
        '--text-fw': config?.fontWeight,
        '--text-lh': config?.lineHeight,
        '--text-color': color ? getThemeColor(color, theme) : undefined,
        '--text-align': align ?? undefined,
        '--text-transform': textTransform ?? undefined,
        '--text-line-clamp':
          typeof lineClamp === 'number' ? lineClamp.toString() : undefined,
        '--text-gradient': getGradientCss(gradient),
      },
    };
  },
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Text = polymorphicFactory<TextFactory>((_props, ref) => {
  const props = useProps('Text', defaultProps, _props);
  const {
    variant,
    color,
    align,
    truncate,
    lineClamp,
    inline,
    inherit,
    gutterBottom,
    textTransform,
    gradient,
    span,
    className,
    style,
    classNames,
    styles,
    unstyled,
    vars,
    mod,
    ...others
  } = props;

  const getStyles = useStyles<TextFactory>({
    name: 'Text',
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

  // Determine the default element from the variant
  const config = variant ? TYPOGRAPHY_MAP[variant] : TYPOGRAPHY_MAP.body1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultElement = (span ? 'span' : config.element) as any;

  return (
    <Box
      {...getStyles('root')}
      ref={ref}
      component={defaultElement}
      variant={variant}
      mod={[
        {
          'data-truncate': getTextTruncate(truncate),
          'data-line-clamp': typeof lineClamp === 'number',
          'data-inline': inline,
          'data-inherit': inherit,
          'data-gutter-bottom': gutterBottom,
          'data-gradient': !!gradient,
        },
        mod,
      ]}
      {...others}
    />
  );
});

Text.classes = classes;
Text.displayName = '@prismui/core/Text';
