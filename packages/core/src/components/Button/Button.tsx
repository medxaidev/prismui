import { factory } from '../../core/component';
import { ensureAllClasses } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import classes from './Button.module.css';

// 1. 定义 StylesNames
export type ButtonStylesNames = 'root' | 'inner' | 'label';

// 2. 定义组件专属 Props
export interface ButtonOwnProps {
  // Content
  children?: React.ReactNode;

  // Variants
  variant?: 'filled' | 'outline' | 'subtle' | 'transparent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'error' | 'success';

  // State
  disabled?: boolean;
}

// 3. 完整 Props = 组件 Props + 系统级 Styling Overrides
export type ButtonProps = ButtonOwnProps & StylesOverride<ButtonStylesNames>;

// 4. 定义 VarsResolver
const varsResolver: VarsResolver<ButtonOwnProps> = (props) => {
  const size = props.size || 'md';
  const variant = props.variant || 'filled';
  const color = props.color || 'primary';

  // Size mapping
  const sizeMap = {
    xs: { height: '24px', paddingX: '8px', fontSize: '12px' },
    sm: { height: '32px', paddingX: '12px', fontSize: '14px' },
    md: { height: '40px', paddingX: '16px', fontSize: '16px' },
    lg: { height: '48px', paddingX: '20px', fontSize: '18px' },
    xl: { height: '56px', paddingX: '24px', fontSize: '20px' },
  };

  // Color mapping (simplified, no theme yet)
  const colorMap = {
    primary: '#3b82f6',
    secondary: '#6b7280',
    error: '#ef4444',
    success: '#10b981',
  };

  const sizeVars = sizeMap[size];
  const colorValue = colorMap[color];

  // Variant-specific styles
  let bg = 'transparent';
  let textColor = colorValue;
  let border = 'none';

  if (variant === 'filled') {
    bg = colorValue;
    textColor = '#ffffff';
  } else if (variant === 'outline') {
    border = `1px solid ${colorValue}`;
  } else if (variant === 'subtle') {
    bg = `color-mix(in srgb, ${colorValue} 10%, transparent)`;
  }

  return {
    '--button-height': sizeVars.height,
    '--button-padding-x': sizeVars.paddingX,
    '--button-font-size': sizeVars.fontSize,
    '--button-bg': bg,
    '--button-color': textColor,
    '--button-border': border,
  };
};

// 5. 验证 CSS Modules 类型安全
const validatedClasses = ensureAllClasses<ButtonStylesNames, typeof classes>(classes);

// 6. 使用 Factory (核心组件 MUST 使用 factory，NOT useStyles)
export const Button = factory(
  {
    displayName: 'Button',
    defaultElement: 'button',
    componentPropKeys: ['size', 'variant', 'color'] as const,
    styling: {
      structure: {
        stylesNames: ['root', 'inner', 'label'] as const,
      },
      resources: {
        classes: validatedClasses,
      },
      logic: {
        varsResolver,
      },
    },
  },
  ({ Element, ref, domProps, styles }) => (
    <Element ref={ref} {...styles.getRootProps()} {...domProps}>
      <span {...styles.getStyles('inner')}>
        <span {...styles.getStyles('label')}>{domProps.children}</span>
      </span>
    </Element>
  ),
);

Button.displayName = 'Button';
