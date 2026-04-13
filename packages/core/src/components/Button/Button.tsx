import { factory, ensureClasses } from '../../core/component';
import type { VarsResolver, StylesOverride } from '../../core/styles';
import type { PolymorphicSystemProps } from '../../core/props';
import classes from './Button.module.css';

// 1. 定义 StylesNames
export type ButtonStylesNames = 'root' | 'inner' | 'label';

// 2. 定义组件专属 Props（系统级 props 来自 Props Contract）
export interface ButtonOwnProps extends PolymorphicSystemProps {
  // Content
  children?: React.ReactNode;
}

// 3. 完整 Props = 组件 Props + 系统级 Styling Overrides
export type ButtonProps = ButtonOwnProps & StylesOverride<ButtonStylesNames>;

// 4. 定义 VarsResolver（只处理私有变量，桥接系统 CSS var）
//    --button-height / --button-padding-x 桥接自 Size System，保持向后兼容
//    --button-font-size 是组件私有（Size System 未覆盖 font-size）
const fontSizeMap: Record<string, string> = {
  xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px',
};

const varsResolver: VarsResolver<ButtonOwnProps> = (props) => ({
  '--button-height': 'var(--prismui-size-height)',
  '--button-padding-x': 'var(--prismui-size-padding-x)',
  '--button-font-size': fontSizeMap[props.size ?? 'md'],
});

const stylesNames = ['root', 'inner', 'label'] as const;

// 5. 验证 CSS Modules 类型安全（Names 从 stylesNames 自动推导，无需手动写泛型）
const validatedClasses = ensureClasses(stylesNames, classes);

// 6. 使用 Factory（声明式三轴系统注入）
export const Button = factory(
  {
    displayName: 'Button',
    componentName: 'Button',
    defaultElement: 'button',
    componentPropKeys: ['size', 'variant', 'color', 'disabled'] as const,
    systems: ['variant', 'size', 'state'],
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
  ({ Element, ref, domProps, componentProps, styles }) => (
    <Element ref={ref} {...styles.getRootProps()} {...domProps} disabled={componentProps.disabled}>
      <span {...styles.getStyles('inner')}>
        <span {...styles.getStyles('label')}>{domProps.children}</span>
      </span>
    </Element>
  ),
);

Button.displayName = 'Button';
