import { factory, ensureClasses } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import { withVariantColors } from '../../core/variant';
import type { Variant, ThemeColor } from '../../core/variant';
import classes from './Button.module.css';

// 1. 定义 StylesNames
export type ButtonStylesNames = 'root' | 'inner' | 'label';

// 2. 定义组件专属 Props
export interface ButtonOwnProps {
  // Content
  children?: React.ReactNode;

  // Variants
  variant?: Variant;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: ThemeColor;

  // State
  disabled?: boolean;
}

// 3. 完整 Props = 组件 Props + 系统级 Styling Overrides
export type ButtonProps = ButtonOwnProps & StylesOverride<ButtonStylesNames>;

// 4. 定义 VarsResolver (size only — color delegated to withVariantColors)
const sizeVarsResolver: VarsResolver<ButtonOwnProps> = (props) => {
  const size = props.size ?? 'md';

  const sizeMap = {
    xs: { height: '24px', paddingX: '8px', fontSize: '12px' },
    sm: { height: '32px', paddingX: '12px', fontSize: '14px' },
    md: { height: '40px', paddingX: '16px', fontSize: '16px' },
    lg: { height: '48px', paddingX: '20px', fontSize: '18px' },
    xl: { height: '56px', paddingX: '24px', fontSize: '20px' },
  };

  const sizeVars = sizeMap[size];

  return {
    '--button-height': sizeVars.height,
    '--button-padding-x': sizeVars.paddingX,
    '--button-font-size': sizeVars.fontSize,
  };
};

const varsResolver = withVariantColors(sizeVarsResolver);

const stylesNames = ['root', 'inner', 'label'] as const;

// 5. 验证 CSS Modules 类型安全（Names 从 stylesNames 自动推导，无需手动写泛型）
const validatedClasses = ensureClasses(stylesNames, classes);

// 6. 使用 Factory (核心组件 MUST 使用 factory，NOT useStyles)
export const Button = factory(
  {
    displayName: 'Button',
    defaultElement: 'button',
    componentPropKeys: ['size', 'variant', 'color'] as const,
    styling: {
      structure: {
        stylesNames,
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
