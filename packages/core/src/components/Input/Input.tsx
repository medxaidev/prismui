'use client';

import {
  factory,
  useProps,
  useStyles,
  createVarsResolver,
} from '../../core/factory';
import type { Factory, StylesApiProps } from '../../core/factory';
import { getSize, getFontSize } from '../../core/theme';
import { getRadius } from '../../core/theme/get-radius';
import { usePrismuiContext } from '../../core/PrismuiProvider/prismui-theme-context';
import type { PrismuiRadius } from '../../core/theme/types';
import { InputBase, InputWrapper } from '../InputBase/InputBase';
import type { InputBaseProps, InputBaseSize, InputBaseVariant } from '../InputBase/InputBase';
import classes from './Input.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InputStylesNames =
  | 'root'
  | 'label'
  | 'required'
  | 'description'
  | 'error'
  | 'wrapper'
  | 'input'
  | 'section';

export type InputVariant = InputBaseVariant;
export type InputSize = InputBaseSize;

export type InputCssVariables = {
  wrapper:
  | '--input-height'
  | '--input-fz'
  | '--input-padding-x'
  | '--input-section-size'
  | '--input-radius'
  | '--input-focus-bd-color';
};

export interface InputProps
  extends Omit<InputBaseProps, 'wrapperClassName' | 'wrapperStyle'>,
  StylesApiProps<InputFactory> {
  /** Input size. @default 'sm' */
  size?: InputSize;

  /** Visual variant. @default 'outlined' */
  variant?: InputVariant;

  /** Theme color key for focus border. @default 'primary' */
  color?: string;

  /** Border radius. @default 'sm' */
  radius?: PrismuiRadius;
}

export type InputFactory = Factory<{
  props: InputProps;
  ref: HTMLInputElement;
  stylesNames: InputStylesNames;
  vars: InputCssVariables;
  variant: InputVariant;
  staticComponents: {
    Wrapper: typeof InputWrapper;
  };
}>;

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaultProps: Partial<InputProps> = {
  size: 'sm',
  variant: 'outlined',
  color: 'primary',
};

// ---------------------------------------------------------------------------
// Vars resolver — injects size tokens + focus border color
// ---------------------------------------------------------------------------

const varsResolver = createVarsResolver<InputFactory>(
  (theme, { size, radius, color }) => {
    const ctx = usePrismuiContext();
    const scheme = ctx?.colorScheme ?? 'light';

    // Resolve focus border color from theme palette
    const resolvedColor = color || 'primary';
    let focusBdColor = `var(--prismui-primary-main)`;
    if (resolvedColor !== 'primary') {
      const paletteColor = theme.colorSchemes?.[scheme]?.palette?.[resolvedColor as keyof typeof theme.colorSchemes.light.palette];
      if (paletteColor && typeof paletteColor === 'object' && 'main' in paletteColor) {
        focusBdColor = (paletteColor as { main: string }).main;
      }
    }

    return {
      wrapper: {
        '--input-height': getSize(size, 'input-height'),
        '--input-fz': getFontSize(size),
        '--input-padding-x': getSize(size, 'input-padding-x'),
        '--input-section-size': getSize(size, 'input-section-size'),
        '--input-radius': radius === undefined ? undefined : getRadius(radius),
        '--input-focus-bd-color': focusBdColor,
      },
    };
  },
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Input = factory<InputFactory>((_props, ref) => {
  const props = useProps('Input', defaultProps, _props);
  const {
    label,
    description,
    error,
    required,
    withAsterisk,
    size,
    variant,
    color: _color,
    radius: _radius,
    leftSection,
    leftSectionWidth,
    rightSection,
    rightSectionWidth,
    rightSectionPointerEvents,
    fullWidth,
    pointer,
    inputWrapperOrder,
    wrapperProps,
    style,
    className,
    classNames,
    styles,
    unstyled,
    vars,
    id,
    disabled,
    onFocus,
    onBlur,
    ...rest
  } = props;

  const getStyles = useStyles<InputFactory>({
    name: 'Input',
    props,
    classes,
    className,
    style: style as any,
    classNames,
    styles,
    unstyled,
    vars,
    varsResolver,
  });

  const wrapperStylesResult = getStyles('wrapper');

  return (
    <InputBase
      ref={ref}
      label={label}
      description={description}
      error={error}
      required={required}
      withAsterisk={withAsterisk}
      size={size}
      variant={variant}
      leftSection={leftSection}
      leftSectionWidth={leftSectionWidth}
      rightSection={rightSection}
      rightSectionWidth={rightSectionWidth}
      rightSectionPointerEvents={rightSectionPointerEvents}
      fullWidth={fullWidth}
      pointer={pointer}
      inputWrapperOrder={inputWrapperOrder}
      wrapperProps={wrapperProps}
      wrapperClassName={wrapperStylesResult.className}
      wrapperStyle={wrapperStylesResult.style}
      id={id}
      disabled={disabled}
      onFocus={onFocus}
      onBlur={onBlur}
      style={style}
      className={className}
      {...rest}
    />
  );
});

Input.Wrapper = InputWrapper;
Input.classes = classes;
Input.displayName = '@prismui/core/Input';
