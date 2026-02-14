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
import { ButtonBase } from '../ButtonBase';
import { getRadius } from '../../core/theme/get-radius';
import { getSize } from '../../core/theme/get-size';
import { getFontSize } from '../../core/theme/get-font-size';
import type { PrismuiRadius } from '../../core/theme/types';
import type { PrismuiVariant, PrismuiVariantKey } from '../../core/theme/types/variant';
import { usePrismuiContext } from '../../core/PrismuiProvider/prismui-theme-context';
import classes from './Button.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ButtonStylesNames = 'root' | 'inner' | 'label' | 'section' | 'loader';

export type ButtonVariant = PrismuiVariant;

export type ButtonCssVariables = {
  root:
  | '--button-justify'
  | '--button-height'
  | '--button-padding-x'
  | '--button-fz'
  | '--button-radius'
  | '--button-bg'
  | '--button-hover'
  | '--button-hover-color'
  | '--button-hover-border'
  | '--button-hover-shadow'
  | '--button-color'
  | '--button-bd'
  | '--button-shadow';
};

export interface ButtonProps
  extends BoxProps,
  StylesApiProps<ButtonFactory>,
  ElementProps<'button', 'color'> {
  /** Controls button `height`, `font-size` and horizontal `padding` @default 'sm' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  | 'compact-xs' | 'compact-sm' | 'compact-md' | 'compact-lg' | 'compact-xl'
  | (string & {});

  /** Theme color key or CSS color @default 'primary' */
  color?: string;

  /** Sets `justify-content` of `inner` element @default 'center' */
  justify?: React.CSSProperties['justifyContent'];

  /** Content displayed on the left side of the button label */
  leftSection?: React.ReactNode;

  /** Content displayed on the right side of the button label */
  rightSection?: React.ReactNode;

  /** If set, the button takes 100% width of its parent container @default false */
  fullWidth?: boolean;

  /** Key of `theme.radius` or any valid CSS value to set border-radius @default theme.radius.md */
  radius?: PrismuiRadius;

  /** Sets `disabled` attribute and applies disabled styles @default false */
  disabled?: boolean;

  /** Button content */
  children?: React.ReactNode;

  /** If set, shows a loading indicator over the button @default false */
  loading?: boolean;

  /** If `true`, the ripple effect is disabled @default false */
  disableRipple?: boolean;

  /** If `true`, the ripple starts at the center @default false */
  centerRipple?: boolean;

  /** If `true`, shows a pulsating ripple on keyboard focus @default false */
  focusRipple?: boolean;
}

export type ButtonFactory = PolymorphicFactory<{
  props: ButtonProps;
  defaultRef: HTMLButtonElement;
  defaultComponent: 'button';
  stylesNames: ButtonStylesNames;
  vars: ButtonCssVariables;
  variant: ButtonVariant;
}>;

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaultProps: Partial<ButtonProps> = {
  size: 'sm',
  variant: 'solid',
};

// ---------------------------------------------------------------------------
// Vars resolver
// ---------------------------------------------------------------------------

const varsResolver = createVarsResolver<ButtonFactory>(
  (theme, { radius, color, variant, size, justify }) => {
    const ctx = usePrismuiContext();
    const scheme = ctx?.colorScheme ?? 'light';

    const resolvedColor = color || 'primary';
    const resolvedVariant = (variant || 'solid') as PrismuiVariantKey;

    const colors = theme.variantColorResolver({
      color: resolvedColor,
      theme,
      variant: resolvedVariant,
      scheme,
    });

    return {
      root: {
        '--button-justify': justify,
        '--button-height': getSize(size, 'button-height'),
        '--button-padding-x': getSize(size, 'button-padding-x'),
        '--button-fz': size?.includes('compact')
          ? getFontSize(size.replace('compact-', ''))
          : getFontSize(size),
        '--button-radius': radius === undefined ? undefined : getRadius(radius),
        '--button-bg': colors.background,
        '--button-hover': colors.hoverBackground,
        '--button-color': colors.color,
        '--button-bd': colors.border === 'none' ? undefined : colors.border,
        '--button-hover-color': colors.hoverColor || undefined,
        '--button-hover-border': colors.hoverBorder || undefined,
        '--button-hover-shadow': colors.hoverShadow === 'none' ? undefined : colors.hoverShadow,
        '--button-shadow': undefined,
      },
    };
  }
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Button = polymorphicFactory<ButtonFactory>((_props, ref) => {
  const props = useProps('Button', defaultProps, _props);
  const {
    style,
    vars,
    className,
    color,
    disabled,
    children,
    leftSection,
    rightSection,
    fullWidth,
    variant,
    radius,
    loading,
    classNames,
    styles,
    unstyled,
    size,
    justify,
    disableRipple,
    centerRipple,
    focusRipple,
    mod,
    ...others
  } = props;

  const getStyles = useStyles<ButtonFactory>({
    name: 'Button',
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

  const hasLeftSection = !!leftSection;
  const hasRightSection = !!rightSection;

  return (
    <ButtonBase
      ref={ref}
      {...getStyles('root')}
      __staticSelector="Button"
      unstyled={unstyled}
      variant={variant}
      disabled={disabled || loading}
      disableRipple={disableRipple || disabled || loading}
      centerRipple={centerRipple}
      focusRipple={focusRipple}
      mod={[
        {
          disabled: disabled,
          loading,
          block: fullWidth,
          'with-left-section': hasLeftSection,
          'with-right-section': hasRightSection,
        },
        mod,
      ]}
      {...others}
    >
      {loading && (
        <Box component="span" {...getStyles('loader')} aria-hidden>
          <LoadingDots />
        </Box>
      )}

      <span {...getStyles('inner')}>
        {leftSection && (
          <Box component="span" {...getStyles('section')} mod={{ position: 'left' }}>
            {leftSection}
          </Box>
        )}

        <Box component="span" mod={{ loading }} {...getStyles('label')}>
          {children}
        </Box>

        {rightSection && (
          <Box component="span" {...getStyles('section')} mod={{ position: 'right' }}>
            {rightSection}
          </Box>
        )}
      </span>
    </ButtonBase>
  );
});

Button.classes = classes;
Button.displayName = '@prismui/core/Button';

// ---------------------------------------------------------------------------
// Simple loading dots (no Loader component dependency)
// ---------------------------------------------------------------------------

function LoadingDots() {
  const dotStyle: React.CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'currentColor',
    display: 'inline-block',
    margin: '0 2px',
    animation: 'prismui-button-loading-dot 1.4s infinite ease-in-out both',
  };

  return (
    <>
      <style>{`
        @keyframes prismui-button-loading-dot {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <span style={{ ...dotStyle, animationDelay: '-0.32s' }} />
        <span style={{ ...dotStyle, animationDelay: '-0.16s' }} />
        <span style={dotStyle} />
      </span>
    </>
  );
}
